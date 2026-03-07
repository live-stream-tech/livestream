import type { Express, Request, Response } from "express";
import { db } from "./db";
import {
  communities,
  videos,
  liveStreams,
  creators,
  videoEditors,
  videoEditRequests,
  bookingSessions,
  dmMessages,
  notifications,
  jukeboxState,
  jukeboxQueue,
  jukeboxChat,
  liveStreamChat,
  dmConversationMessages,
  twoshotBookings,
  earnings,
  withdrawals,
  users,
  wallets,
  transactions,
  liverReviews,
  liverAvailability,
  announcements,
} from "./schema";
import { eq, asc, desc, count, sql, and, gte, lte, isNull } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey, createConnectExpressAccount, createConnectAccountLink, getConnectAccount, createBannerPaymentIntent, getPaymentIntentStatus } from "./stripeClient";
import { getMonthlyRevenueRank } from "./aggregateRevenue";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "livestage-dev-secret";

function makeToken(userId: number) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "90d" });
}

async function getAuthUser(req: Request): Promise<{ id: number; displayName: string; profileImageUrl: string | null; role: string; bio: string; stripeConnectId: string | null } | null> {
  const auth = (req as any).headers?.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { sub: number };
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
    return user ?? null;
  } catch {
    return null;
  }
}

const SYSTEM_WALLET_KINDS = ["MODERATOR", "ADMIN", "EVENT_RESERVE", "PLATFORM"] as const;

/** システムウォレットを取得。なければ作成する */
async function getOrCreateSystemWallets(): Promise<Record<(typeof SYSTEM_WALLET_KINDS)[number], number>> {
  const result = {} as Record<(typeof SYSTEM_WALLET_KINDS)[number], number>;
  for (const kind of SYSTEM_WALLET_KINDS) {
    const [w] = await db.select().from(wallets).where(eq(wallets.kind, kind));
    if (w) {
      result[kind] = w.id;
    } else {
      const [created] = await db.insert(wallets).values({ kind, userId: null }).returning();
      result[kind] = created.id;
    }
  }
  return result;
}

/** ユーザー用ウォレットを取得。なければ作成する */
async function getOrCreateUserWallet(userId: number): Promise<number> {
  const [w] = await db.select().from(wallets).where(and(eq(wallets.userId, userId), isNull(wallets.kind)));
  if (w) return w.id;
  const [created] = await db.insert(wallets).values({ userId, kind: null }).returning();
  return created.id;
}

/** 収益を transactions に type: 'REVENUE' で記録（月末ランク集計用） */
async function recordRevenue(walletId: number, amount: number, source: string, referenceId: string | null) {
  await db.insert(transactions).values({
    walletId,
    amount,
    type: "REVENUE",
    status: "PENDING",
    referenceId,
  });
}

export async function registerRoutes(app: Express): Promise<void> {
  // ── Auth（LINEログインのみ。メール/パスワードは廃止）──────────────────────────────────
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });
    res.json({
      id: user.id,
      name: user.displayName,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      avatar: user.profileImageUrl,
      role: user.role,
      bio: user.bio,
      stripeConnectId: user.stripeConnectId ?? null,
    });
  });

  // ── Stripe Connect（出金先連携）────────────────────────────────────────
  app.post("/api/connect/onboard", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    try {
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : process.env.APP_URL ?? "http://localhost:8081";
      const returnUrl = `${baseUrl}/payout-settings?connect=return`;
      const refreshUrl = `${baseUrl}/payout-settings?connect=refresh`;

      let accountId = user.stripeConnectId;
      if (!accountId) {
        accountId = await createConnectExpressAccount({ country: "JP" });
        await db.update(users).set({ stripeConnectId: accountId, updatedAt: new Date() }).where(eq(users.id, user.id));
      }

      const url = await createConnectAccountLink({ accountId, returnUrl, refreshUrl });
      res.json({ url, accountId });
    } catch (e: any) {
      console.error("Connect onboard error:", e);
      res.status(500).json({ error: e.message ?? "Stripe Connect の準備に失敗しました" });
    }
  });

  app.get("/api/connect/status", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    if (!user.stripeConnectId) {
      return res.json({ connected: false, stripeConnectId: null, chargesEnabled: false });
    }
    const account = await getConnectAccount(user.stripeConnectId);
    const chargesEnabled = account?.charges_enabled ?? false;
    res.json({
      connected: !!account,
      stripeConnectId: user.stripeConnectId,
      chargesEnabled,
      detailsSubmitted: account?.details_submitted ?? false,
    });
  });

  // ── バナー広告：決済・分配（人数×5円×日数、最低15,000円）────────────────────
  const BANNER_MIN_AMOUNT = 15_000;
  const BANNER_RATE_MODERATOR = 0.2;
  const BANNER_RATE_ADMIN = 0.2;
  const BANNER_RATE_EVENT = 0.1;
  const BANNER_RATE_PLATFORM = 0.5;

  app.post("/api/banner/checkout", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    const { people, days } = req.body as { people?: number; days?: number };
    const p = Math.max(1, Number(people) || 1);
    const d = Math.max(1, Number(days) || 1);
    const amountYen = Math.max(BANNER_MIN_AMOUNT, p * 5 * d);

    try {
      const { clientSecret, paymentIntentId } = await createBannerPaymentIntent({
        amountYen,
        metadata: { userId: String(user.id), people: String(p), days: String(d), type: "banner_ad" },
      });
      res.json({ clientSecret, paymentIntentId, amountYen });
    } catch (e: any) {
      console.error("Banner checkout error:", e);
      res.status(500).json({ error: e.message ?? "決済の準備に失敗しました" });
    }
  });

  app.post("/api/banner/confirm", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    const { paymentIntentId } = req.body as { paymentIntentId?: string };
    if (!paymentIntentId) return res.status(400).json({ error: "paymentIntentId が必要です" });

    const status = await getPaymentIntentStatus(paymentIntentId);
    if (status !== "succeeded") {
      return res.status(400).json({ error: "決済が完了していません" });
    }

    const stripe = await getUncachableStripeClient();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const amountYen = pi.amount;

    const sys = await getOrCreateSystemWallets();
    const amountMod = Math.floor(amountYen * BANNER_RATE_MODERATOR);
    const amountAdmin = Math.floor(amountYen * BANNER_RATE_ADMIN);
    const amountEvent = Math.floor(amountYen * BANNER_RATE_EVENT);
    const amountPlatform = amountYen - amountMod - amountAdmin - amountEvent;

    await db.insert(transactions).values([
      { walletId: sys.MODERATOR, amount: amountMod, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
      { walletId: sys.ADMIN, amount: amountAdmin, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
      { walletId: sys.EVENT_RESERVE, amount: amountEvent, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
      { walletId: sys.PLATFORM, amount: amountPlatform, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
    ]);

    res.json({ ok: true, amountYen, split: { moderator: amountMod, admin: amountAdmin, eventReserve: amountEvent, platform: amountPlatform } });
  });

  // コミュニティ広告バナー用 Stripe Checkout（3日間 15,000円）
  const BANNER_CHECKOUT_DAYS = 3;
  const BANNER_CHECKOUT_AMOUNT_YEN = 15_000;

  app.post("/api/banner/checkout-session", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    try {
      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : process.env.APP_URL ?? "http://localhost:8081";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "jpy",
              unit_amount: BANNER_CHECKOUT_AMOUNT_YEN,
              product_data: {
                name: "コミュニティ広告バナー（3日間）",
                description: `コミュニティページの広告バナー枠 3日間出稿（¥${BANNER_CHECKOUT_AMOUNT_YEN.toLocaleString()}）`,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/community`,
        metadata: {
          type: "banner_ad",
          days: String(BANNER_CHECKOUT_DAYS),
          userId: String(user.id),
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (e: any) {
      console.error("Banner checkout session error:", e);
      res.status(500).json({ error: e.message ?? "決済の準備に失敗しました" });
    }
  });

  app.post("/api/banner/confirm-session", async (req: Request, res: Response) => {
    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) return res.status(400).json({ error: "sessionId が必要です" });

    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "決済が完了していません" });
      }

      const amountYen = session.amount_total ?? BANNER_CHECKOUT_AMOUNT_YEN;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;

      const sys = await getOrCreateSystemWallets();
      const amountMod = Math.floor(amountYen * BANNER_RATE_MODERATOR);
      const amountAdmin = Math.floor(amountYen * BANNER_RATE_ADMIN);
      const amountEvent = Math.floor(amountYen * BANNER_RATE_EVENT);
      const amountPlatform = amountYen - amountMod - amountAdmin - amountEvent;

      await db.insert(transactions).values([
        { walletId: sys.MODERATOR, amount: amountMod, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
        { walletId: sys.ADMIN, amount: amountAdmin, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
        { walletId: sys.EVENT_RESERVE, amount: amountEvent, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
        { walletId: sys.PLATFORM, amount: amountPlatform, type: "banner_ad", status: "PENDING", referenceId: paymentIntentId },
      ]);

      res.json({
        ok: true,
        amountYen,
        split: { moderator: amountMod, admin: amountAdmin, eventReserve: amountEvent, platform: amountPlatform },
      });
    } catch (e: any) {
      console.error("Banner confirm-session error:", e);
      res.status(500).json({ error: e.message ?? "決済の確認に失敗しました" });
    }
  });

  app.put("/api/auth/profile", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });
    const { name, displayName, bio, avatar, profileImageUrl } = req.body;
    const newName = name ?? displayName ?? user.displayName;
    const newBio = bio ?? user.bio;
    const newAvatar = avatar ?? profileImageUrl ?? user.profileImageUrl;
    const [updated] = await db
      .update(users)
      .set({ displayName: newName, bio: newBio, profileImageUrl: newAvatar !== undefined ? newAvatar : null, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    res.json({
      id: updated.id,
      name: updated.displayName,
      displayName: updated.displayName,
      profileImageUrl: updated.profileImageUrl,
      avatar: updated.profileImageUrl,
      role: updated.role,
      bio: updated.bio,
    });
  });

  // ── LINE OAuth ────────────────────────────────────────────────────
  // LINE_CALLBACK_URL: LINE Developers に登録するコールバックURL（本番: https://<APIのドメイン>/api/auth/callback/line）
  // FRONTEND_URL: ログイン完了後のリダイレクト先。同一オリジン（フロントとAPIが同じVercelドメイン）なら未設定でOK（相対パスでリダイレクト）。別ドメインの場合は https://フロントのドメイン を指定（末尾スラッシュなし）。
  const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID ?? "";
  const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
  const LINE_CALLBACK_URL = process.env.LINE_CALLBACK_URL ?? "";
  const FRONTEND_URL = (process.env.FRONTEND_URL ?? "").replace(/\/$/, "");
  const lineRedirect = (path: string) => (FRONTEND_URL ? `${FRONTEND_URL}${path}` : path);
  const LINE_STATE = "livestage-line-state";

  app.get("/api/auth/line", (_req: Request, res: Response) => {
    if (!LINE_CALLBACK_URL) {
      return res.status(500).json({ error: "LINE_CALLBACK_URL is not configured" });
    }
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINE_CHANNEL_ID,
      redirect_uri: LINE_CALLBACK_URL,
      state: LINE_STATE,
      scope: "profile openid email",
    });
    res.redirect(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
  });

  app.get("/api/auth/callback/line", async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || state !== LINE_STATE) {
      return res.redirect(lineRedirect("/?line_error=invalid_state"));
    }
    try {
      const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: LINE_CALLBACK_URL,
          client_id: LINE_CHANNEL_ID,
          client_secret: LINE_CHANNEL_SECRET,
        }).toString(),
      });
      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        return res.redirect(lineRedirect("/?line_error=token_failed"));
      }

      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json() as { userId?: string; displayName?: string; pictureUrl?: string };
      if (!profile.userId) {
        return res.redirect(lineRedirect("/?line_error=profile_failed"));
      }

      const lineId = profile.userId;
      const lineName = profile.displayName ?? "LINEユーザー";
      const lineAvatar = profile.pictureUrl ?? null;

      let [existing] = await db.select().from(users).where(eq(users.lineId, lineId));
      if (!existing) {
        [existing] = await db
          .insert(users)
          .values({
            lineId,
            displayName: lineName,
            profileImageUrl: lineAvatar,
            role: "USER",
          })
          .returning();
      } else {
        [existing] = await db
          .update(users)
          .set({ displayName: lineName, profileImageUrl: lineAvatar, updatedAt: new Date() })
          .where(eq(users.id, existing.id))
          .returning();
      }

      const jwtToken = makeToken(existing.id);
      res.redirect(lineRedirect(`/?line_token=${encodeURIComponent(jwtToken)}`));
    } catch (err) {
      console.error("LINE callback error:", err);
      res.redirect(lineRedirect("/?line_error=server_error"));
    }
  });

  // ── Communities ───────────────────────────────────────────────────
  app.get("/api/communities", async (_req: Request, res: Response) => {
    const rows = await db.select().from(communities).orderBy(desc(communities.members));
    res.json(rows);
  });

  app.get("/api/communities/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(communities).where(eq(communities.id, id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // ── Video Editors ───────────────────────────────────────────────────
  app.get("/api/communities/:id/editors", async (req: Request, res: Response) => {
    const communityId = parseInt(req.params.id);
    const rows = await db
      .select()
      .from(videoEditors)
      .where(eq(videoEditors.communityId, communityId))
      .orderBy(desc(videoEditors.isAvailable), desc(videoEditors.rating));
    res.json(rows);
  });

  app.get("/api/editors/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [editor] = await db.select().from(videoEditors).where(eq(videoEditors.id, id));
    if (!editor) return res.status(404).json({ error: "Not found" });
    res.json(editor);
  });

  app.post("/api/editors/:id/request", async (req: Request, res: Response) => {
    const editorId = parseInt(req.params.id);
    const { requesterName, title, description, priceType, budget, deadline } = req.body as {
      requesterName?: string;
      title?: string;
      description?: string;
      priceType?: string;
      budget?: number;
      deadline?: string;
    };

    if (!title || !description || !priceType) {
      return res.status(400).json({ error: "必須項目を入力してください" });
    }
    if (priceType !== "per_minute" && priceType !== "revenue_share") {
      return res.status(400).json({ error: "不正な料金形式です" });
    }

    const [editor] = await db.select().from(videoEditors).where(eq(videoEditors.id, editorId));
    if (!editor) {
      return res.status(404).json({ error: "Editor not found" });
    }

    const user = await getAuthUser(req);
    const requestUserId = user ? `user-${user.id}` : "guest";
    const requestUserName = requesterName ?? user?.displayName ?? "ゲストユーザー";

    const [requestRow] = await db
      .insert(videoEditRequests)
      .values({
        editorId,
        requesterId: requestUserId,
        requesterName: requestUserName,
        title,
        description,
        priceType,
        budget: budget ?? null,
        deadline: deadline ?? null,
      })
      .returning();

    // 通知テーブルに編集者向けの通知を追加（エディタIDはタイトル/本文に含める）
    await db.insert(notifications).values({
      type: "editor_request",
      title: `${requestUserName} から編集依頼`,
      body: `${title}（編集者ID: ${editorId}）`,
      amount: budget ?? null,
      avatar: editor.avatar,
      thumbnail: null,
      timeAgo: "たった今",
    });

    res.status(201).json(requestRow);
  });

  app.post("/api/communities", async (req: Request, res: Response) => {
    const { name, description, bannerUrl, iconUrl, categories } = req.body as {
      name?: string;
      description?: string;
      bannerUrl?: string;
      iconUrl?: string;
      categories?: string[] | string;
    };

    const trimmedName = (name ?? "").trim();
    const trimmedDescription = (description ?? "").trim();
    const banner = (bannerUrl ?? "").trim();
    const icon = (iconUrl ?? "").trim();

    const categoryList =
      Array.isArray(categories)
        ? categories.map((c) => String(c).trim()).filter(Boolean)
        : typeof categories === "string"
        ? categories
            .split(/[,\s]+/)
            .map((c) => c.trim())
            .filter(Boolean)
        : [];

    if (!trimmedName || !trimmedDescription || !banner || !icon || categoryList.length === 0) {
      return res.status(400).json({ error: "必須項目をすべて入力してください" });
    }

    if (trimmedDescription.length < 100) {
      return res.status(400).json({ error: "説明文は100文字以上で入力してください" });
    }

    try {
      const primaryCategory = categoryList[0];
      const [row] = await db
        .insert(communities)
        .values({
          name: trimmedName,
          members: 0,
          thumbnail: banner,
          online: false,
          category: primaryCategory,
        })
        .returning();

      // フロントで扱いやすいよう、リクエスト情報もそのまま返す
      res.status(201).json({
        ...row,
        description: trimmedDescription,
        bannerUrl: banner,
        iconUrl: icon,
        categories: categoryList,
      });
    } catch (e) {
      console.error("Create community error:", e);
      res.status(500).json({ error: "コミュニティの作成に失敗しました" });
    }
  });

  // ── Videos ───────────────────────────────────────────────────────
  app.get("/api/videos", async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.isRanked, false))
      .orderBy(desc(videos.createdAt));
    res.json(rows);
  });

  app.get("/api/videos/my", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });
    const rows = await db.select().from(videos).where(eq(videos.creator, user.displayName)).orderBy(desc(videos.createdAt));
    res.json(rows);
  });

  app.get("/api/videos/ranked", async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.isRanked, true))
      .orderBy(asc(videos.rank));
    res.json(rows);
  });

  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(videos).where(eq(videos.id, id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  app.post("/api/videos", async (req: Request, res: Response) => {
    const { title, creator, community, duration, price, thumbnail, avatar } = req.body;
    if (!title || !creator || !community || !duration || !thumbnail || !avatar) {
      return res.status(400).json({ message: "必須フィールドが不足しています" });
    }
    const [row] = await db
      .insert(videos)
      .values({
        title,
        creator,
        community,
        views: 0,
        timeAgo: "たった今",
        duration,
        price: price ?? null,
        thumbnail,
        avatar,
        isRanked: false,
      })
      .returning();
    res.status(201).json(row);
  });

  // ── Live Streams ──────────────────────────────────────────────────
  app.get("/api/live-streams", async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.isLive, true))
      .orderBy(desc(liveStreams.viewers));
    res.json(rows);
  });

  // ── Creators ──────────────────────────────────────────────────────
  app.get("/api/creators", async (_req: Request, res: Response) => {
    const rows = await db.select().from(creators).orderBy(asc(creators.rank));
    res.json(rows);
  });

  // ── Booking Sessions ──────────────────────────────────────────────
  app.get("/api/booking-sessions", async (req: Request, res: Response) => {
    const { category } = req.query;
    const rows = category && category !== "all"
      ? await db.select().from(bookingSessions).where(eq(bookingSessions.category, category as string))
      : await db.select().from(bookingSessions);
    res.json(rows);
  });

  app.post("/api/booking-sessions/:id/book", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [session] = await db.select().from(bookingSessions).where(eq(bookingSessions.id, id));
    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.spotsLeft <= 0) return res.status(400).json({ message: "満席です" });
    const [updated] = await db
      .update(bookingSessions)
      .set({ spotsLeft: session.spotsLeft - 1 })
      .where(eq(bookingSessions.id, id))
      .returning();
    res.json(updated);
  });

  // ── DM Messages ───────────────────────────────────────────────────
  app.get("/api/dm-messages", async (_req: Request, res: Response) => {
    const rows = await db.select().from(dmMessages).orderBy(asc(dmMessages.sortOrder));
    res.json(rows);
  });

  app.post("/api/dm-messages/:id/read", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(dmMessages)
      .set({ unread: 0 })
      .where(eq(dmMessages.id, id))
      .returning();
    res.json(updated);
  });

  // ── Notifications ─────────────────────────────────────────────────
  app.get("/api/notifications", async (req: Request, res: Response) => {
    const { type } = req.query;
    const rows = type && type !== "all"
      ? await db.select().from(notifications).where(eq(notifications.type, type as string)).orderBy(desc(notifications.createdAt))
      : await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    res.json(rows);
  });

  app.post("/api/notifications/read-all", async (_req: Request, res: Response) => {
    await db.update(notifications).set({ isRead: true });
    res.json({ ok: true });
  });

  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    res.json(updated);
  });

  // ── Live Stream single + chat ─────────────────────────────────────
  app.get("/api/live-streams/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, id));
    if (!stream) return res.status(404).json({ error: "Not found" });
    res.json(stream);
  });

  app.get("/api/live-streams/:id/chat", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(liveStreamChat)
      .where(eq(liveStreamChat.streamId, id))
      .orderBy(asc(liveStreamChat.createdAt));
    res.json(msgs);
  });

  app.post("/api/live-streams/:id/chat", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { username, avatar, message, isGift, giftAmount } = req.body;
    const [msg] = await db.insert(liveStreamChat).values({
      streamId: id, username: username ?? "あなた", avatar, message,
      isGift: isGift ?? false, giftAmount: giftAmount ?? null,
    }).returning();
    res.json(msg);
  });

  // ── DM Conversations ──────────────────────────────────────────────
  app.get("/api/dm-messages/:id/conversation", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(dmConversationMessages)
      .where(eq(dmConversationMessages.dmId, id))
      .orderBy(asc(dmConversationMessages.createdAt));
    res.json(msgs);
  });

  app.post("/api/dm-messages/:id/conversation", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { text } = req.body;
    const [msg] = await db.insert(dmConversationMessages).values({
      dmId: id, sender: "me", text, isRead: true,
    }).returning();
    // Update last message in dm_messages
    await db.update(dmMessages).set({ lastMessage: text, unread: 0 }).where(eq(dmMessages.id, id));
    res.json(msg);
  });

  // ── Jukebox ───────────────────────────────────────────────────────
  app.get("/api/jukebox/:communityId", async (req: Request, res: Response) => {
    const communityId = parseInt(req.params.communityId);
    const [state] = await db.select().from(jukeboxState).where(eq(jukeboxState.communityId, communityId));
    const queue = await db.select().from(jukeboxQueue)
      .where(eq(jukeboxQueue.communityId, communityId))
      .orderBy(asc(jukeboxQueue.position));
    const chat = await db.select().from(jukeboxChat)
      .where(eq(jukeboxChat.communityId, communityId))
      .orderBy(asc(jukeboxChat.createdAt));
    res.json({ state: state ?? null, queue, chat });
  });

  app.post("/api/jukebox/:communityId/add", async (req: Request, res: Response) => {
    const communityId = parseInt(req.params.communityId);
    const { videoId, videoTitle, videoThumbnail, videoDurationSecs, addedBy, addedByAvatar, youtubeId } = req.body;
    const existing = await db.select().from(jukeboxQueue)
      .where(eq(jukeboxQueue.communityId, communityId))
      .orderBy(desc(jukeboxQueue.position));
    const nextPos = existing.length > 0 ? existing[0].position + 1 : 1;
    const [item] = await db.insert(jukeboxQueue).values({
      communityId,
      videoId,
      videoTitle,
      videoThumbnail,
      videoDurationSecs: videoDurationSecs ?? 0,
      youtubeId: youtubeId ?? null,
      addedBy: addedBy ?? "あなた", addedByAvatar, position: nextPos, isPlayed: false,
    }).returning();

    // 最初の1件が追加されたときは自動で再生を開始する
    if (existing.length === 0) {
      const watchers = Math.floor(Math.random() * 80) + 20;
      await db
        .insert(jukeboxState)
        .values({
          communityId,
          currentVideoId: item.videoId,
          currentVideoTitle: item.videoTitle,
          currentVideoThumbnail: item.videoThumbnail,
          currentVideoDurationSecs: item.videoDurationSecs ?? 0,
          currentVideoYoutubeId: (item as any).youtubeId ?? null,
          startedAt: new Date(),
          isPlaying: true,
          watchersCount: watchers,
        })
        .onConflictDoUpdate({
          target: jukeboxState.communityId,
          set: {
            currentVideoId: item.videoId,
            currentVideoTitle: item.videoTitle,
            currentVideoThumbnail: item.videoThumbnail,
            currentVideoDurationSecs: item.videoDurationSecs ?? 0,
            currentVideoYoutubeId: (item as any).youtubeId ?? null,
            startedAt: new Date(),
            isPlaying: true,
            watchersCount: watchers,
          },
        });
    }

    res.json(item);
  });

  app.post("/api/jukebox/:communityId/next", async (req: Request, res: Response) => {
    const communityId = parseInt(req.params.communityId);
    const queue = await db.select().from(jukeboxQueue)
      .where(eq(jukeboxQueue.communityId, communityId))
      .orderBy(asc(jukeboxQueue.position));
    const next = queue.find((q) => !q.isPlayed);
    if (next) {
      await db.update(jukeboxQueue).set({ isPlayed: true }).where(eq(jukeboxQueue.id, next.id));
      const watchers = Math.floor(Math.random() * 80) + 20;
      await db
        .insert(jukeboxState)
        .values({
          communityId,
          currentVideoId: next.videoId,
          currentVideoTitle: next.videoTitle,
          currentVideoThumbnail: next.videoThumbnail,
          currentVideoDurationSecs: next.videoDurationSecs ?? 0,
          currentVideoYoutubeId: (next as any).youtubeId ?? null,
          startedAt: new Date(),
          isPlaying: true,
          watchersCount: watchers,
        })
        .onConflictDoUpdate({
          target: jukeboxState.communityId,
          set: {
            currentVideoId: next.videoId,
            currentVideoTitle: next.videoTitle,
            currentVideoThumbnail: next.videoThumbnail,
            currentVideoDurationSecs: next.videoDurationSecs ?? 0,
            currentVideoYoutubeId: (next as any).youtubeId ?? null,
            startedAt: new Date(),
            isPlaying: true,
            watchersCount: watchers,
          },
        });
    } else {
      // 再生キューが空になった場合は再生状態をリセット
      await db
        .update(jukeboxState)
        .set({
          currentVideoId: null,
          currentVideoTitle: null,
          currentVideoThumbnail: null,
          currentVideoDurationSecs: 0,
          currentVideoYoutubeId: null,
          isPlaying: false,
        })
        .where(eq(jukeboxState.communityId, communityId));
    }
    res.json({ ok: true });
  });

  app.post("/api/jukebox/:communityId/chat", async (req: Request, res: Response) => {
    const communityId = parseInt(req.params.communityId);
    const { username, avatar, message } = req.body;
    const [msg] = await db.insert(jukeboxChat).values({
      communityId, username: username ?? "あなた", avatar, message,
    }).returning();
    res.json(msg);
  });

  // ── Twoshot Booking ───────────────────────────────────────────────

  app.get("/api/twoshot/publishable-key", async (_req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twoshot/:streamId/bookings", async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.streamId);
    const rows = await db
      .select()
      .from(twoshotBookings)
      .where(eq(twoshotBookings.streamId, streamId))
      .orderBy(asc(twoshotBookings.queuePosition));
    res.json(rows);
  });

  app.get("/api/twoshot/:streamId/queue-count", async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.streamId);
    const [{ total }] = await db
      .select({ total: count() })
      .from(twoshotBookings)
      .where(sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
    res.json({ count: Number(total) });
  });

  app.post("/api/twoshot/:streamId/checkout", async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.streamId);
    const { userName, userAvatar, price = 3000 } = req.body;

    if (!userName) return res.status(400).json({ error: "userName required" });

    try {
      const stripe = await getUncachableStripeClient();

      const [{ total }] = await db
        .select({ total: count() })
        .from(twoshotBookings)
        .where(sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
      const queuePos = Number(total) + 1;

      const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, streamId));
      const streamTitle = stream?.title ?? "ツーショット撮影";
      const creatorName = stream?.creator ?? "クリエイター";

      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:8081";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "jpy",
              unit_amount: price,
              product_data: {
                name: `ツーショット撮影 with ${creatorName}`,
                description: `${streamTitle} | 整理番号${queuePos}番`,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/twoshot-success?session_id={CHECKOUT_SESSION_ID}&stream=${streamId}`,
        cancel_url: `${baseUrl}/live/${streamId}`,
        metadata: {
          streamId: streamId.toString(),
          userName,
          userAvatar: userAvatar ?? "",
          queuePosition: queuePos.toString(),
          price: price.toString(),
        },
      });

      const [booking] = await db
        .insert(twoshotBookings)
        .values({
          streamId,
          userName,
          userAvatar,
          stripeSessionId: session.id,
          price,
          status: "pending",
          queuePosition: queuePos,
          agreedToTerms: true,
          agreedAt: new Date(),
          refundable: false,
        })
        .returning();

      res.json({ checkoutUrl: session.url, bookingId: booking.id, queuePosition: queuePos });
    } catch (e: any) {
      console.error("Stripe checkout error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/twoshot/confirm-payment", async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const [booking] = await db
        .select()
        .from(twoshotBookings)
        .where(eq(twoshotBookings.stripeSessionId, sessionId));
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      await db
        .update(twoshotBookings)
        .set({
          status: "paid",
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(twoshotBookings.stripeSessionId, sessionId));

      // 共通スコア集計用：REVENUE を transactions に記録（ライバー＝配信者に紐づくウォレット）
      const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, booking.streamId));
      if (stream) {
        const [creatorUser] = await db.select().from(users).where(eq(users.displayName, stream.creator));
        if (creatorUser) {
          const walletId = await getOrCreateUserWallet(creatorUser.id);
          await recordRevenue(walletId, booking.price, "twoshot", String(booking.id));
        }
      }

      res.json({ ok: true, booking });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/twoshot/:bookingId/notify", async (req: Request, res: Response) => {
    const bookingId = parseInt(req.params.bookingId);
    await db
      .update(twoshotBookings)
      .set({ status: "notified", notifiedAt: new Date() })
      .where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });

  app.post("/api/twoshot/:bookingId/complete", async (req: Request, res: Response) => {
    const bookingId = parseInt(req.params.bookingId);
    await db
      .update(twoshotBookings)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });

  app.post("/api/twoshot/:bookingId/cancel", async (req: Request, res: Response) => {
    const bookingId = parseInt(req.params.bookingId);
    const { reason, isSelfCancel } = req.body;
    await db
      .update(twoshotBookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason ?? "ユーザーキャンセル",
        refundable: !isSelfCancel,
      })
      .where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });

  // ── 収益記録（投げ銭・有料ライブ・個別セッション → type: REVENUE、月末ランク集計用）
  app.post("/api/revenue/record", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "ログインが必要です" });

    const { amount, source, referenceId } = req.body as { amount?: number; source?: string; referenceId?: string };
    if (!amount || amount <= 0) return res.status(400).json({ error: "amount は正の数で指定してください" });
    const src = source ?? "tip"; // tip | paid_live | twoshot

    const walletId = await getOrCreateUserWallet(user.id);
    await recordRevenue(walletId, amount, src, referenceId ?? null);
    res.status(201).json({ ok: true, amount, source: src });
  });

  // ── Revenue（ログイン必須）──────────────────────────────────────────
  app.get("/api/revenue/summary", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "ログインが必要です" });
    const userId = `user-${user.id}`;
    const earningRows = await db.select().from(earnings).where(eq(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));

    const totalEarned = earningRows.reduce((s, e) => s + e.netAmount, 0);
    const totalWithdrawn = withdrawalRows
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + w.amount, 0);
    const pendingWithdrawal = withdrawalRows
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalWithdrawn - pendingWithdrawal;

    // monthly breakdown (last 6 months)
    const now = new Date();
    const monthly: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}月`;
      const monthTotal = earningRows
        .filter((e) => {
          const ed = new Date(e.createdAt!);
          return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
        })
        .reduce((s, e) => s + e.netAmount, 0);
      monthly.push({ month: label, amount: monthTotal });
    }

    res.json({ totalEarned, totalWithdrawn, pendingWithdrawal, available, monthly });
  });

  app.get("/api/revenue/earnings", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "ログインが必要です" });
    const userId = `user-${user.id}`;
    const rows = await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, userId))
      .orderBy(desc(earnings.createdAt));
    res.json(rows);
  });

  /** 月末ランク集計用クエリの雛形（バッチの土台）。?month=YYYY-MM で指定月の REVENUE 合計ランキングを返す */
  app.get("/api/revenue/monthly-rank", async (req: Request, res: Response) => {
    const month = (req.query.month as string) ?? "";
    const match = /^(\d{4})-(\d{2})$/.exec(month);
    if (!match) {
      return res.status(400).json({ error: "month は YYYY-MM 形式で指定してください" });
    }
    const rankings = await getMonthlyRevenueRank(month);
    res.json({ month, rankings });
  });

  app.get("/api/revenue/withdrawals", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "ログインが必要です" });
    const userId = `user-${user.id}`;
    const rows = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
    res.json(rows);
  });

  app.post("/api/revenue/withdraw", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "ログインが必要です" });
    const userId = `user-${user.id}`;
    const { amount, bankName, bankBranch, accountType, accountNumber, accountName } = req.body;
    if (!amount || amount < 1000) {
      return res.status(400).json({ error: "最低引き出し額は¥1,000です" });
    }
    // check available balance
    const earningRows = await db.select().from(earnings).where(eq(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
    const totalEarned = earningRows.reduce((s, e) => s + e.netAmount, 0);
    const totalUsed = withdrawalRows
      .filter((w) => w.status !== "failed")
      .reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalUsed;
    if (amount > available) {
      return res.status(400).json({ error: "引き出し可能残高を超えています" });
    }
    const [row] = await db
      .insert(withdrawals)
      .values({ userId, amount, bankName, bankBranch, accountType, accountNumber, accountName, status: "pending" })
      .returning();
    res.json(row);
  });

  // ── Announcements ───────────────────────────────────────────────────
  app.get("/api/announcements", async (_req: Request, res: Response) => {
    // 現在日時が startAt〜endAt の範囲内のもののみ取得（endAt が NULL の場合は無期限）
    const rows = await db
      .select()
      .from(announcements)
      .where(
        sql`(start_at IS NULL OR start_at <= now()) AND (end_at IS NULL OR end_at >= now())`,
      )
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
    res.json(rows);
  });

  // ── Livers (Creators extended) ────────────────────────────────────
  app.get("/api/livers", async (req: Request, res: Response) => {
    const { name, minScore, category, date } = req.query;
    let rows = await db.select().from(creators).orderBy(asc(creators.rank));
    if (name) {
      const q = (name as string).toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (category && category !== "all") {
      rows = rows.filter((r) => r.category === category);
    }
    if (minScore) {
      const ms = parseFloat(minScore as string);
      rows = rows.filter((r) => r.satisfactionScore >= ms);
    }
    if (date) {
      const avail = await db.select().from(liverAvailability).where(eq(liverAvailability.date, date as string));
      const availIds = new Set(avail.map((a) => a.liverId));
      rows = rows.filter((r) => availIds.has(r.id));
    }
    res.json(rows);
  });

  app.get("/api/livers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [liver] = await db.select().from(creators).where(eq(creators.id, id));
    if (!liver) return res.status(404).json({ error: "Not found" });
    res.json(liver);
  });

  // ── Profile Roles (Creator / Twoshot Liver) ────────────────────────
  app.get("/api/profile/roles", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    const rows = await db.select().from(creators).where(eq(creators.name, user.displayName));
    const isEditor = rows.some((r) => r.category === "editor");
    const isTwoshot = rows.some((r) => r.category === "twoshot");

    res.json({ isEditor, isTwoshot });
  });

  app.post("/api/profile/register-role", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });

    const { role } = req.body as { role?: "editor" | "twoshot" };
    if (role !== "editor" && role !== "twoshot") {
      return res.status(400).json({ error: "role は editor か twoshot を指定してください" });
    }

    const category = role === "editor" ? "editor" : "twoshot";
    const communityLabel = role === "editor" ? "動画編集クリエイター" : "ツーショットライバー";

    const existing = await db
      .select()
      .from(creators)
      .where(
        and(
          eq(creators.name, user.displayName),
          eq(creators.category, category),
        ),
      );
    if (existing.length > 0) {
      return res.json({ ok: true, alreadyRegistered: true });
    }

    const avatar =
      user.avatar ??
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

    const [created] = await db
      .insert(creators)
      .values({
        name: user.displayName,
        community: communityLabel,
        avatar,
        rank: 999,
        heatScore: 0,
        totalViews: 0,
        revenue: 0,
        streamCount: 0,
        followers: 0,
        revenueShare: 80,
        satisfactionScore: 5,
        attendanceRate: 5,
        bio: user.bio ?? "",
        category,
      })
      .returning();

    res.status(201).json({ ok: true, creator: created });
  });

  // ── Liver Reviews ─────────────────────────────────────────────────
  app.get("/api/livers/:id/reviews", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(liverReviews)
      .where(eq(liverReviews.liverId, id))
      .orderBy(desc(liverReviews.createdAt));
    res.json(rows);
  });

  app.post("/api/livers/:id/reviews", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { userId, userName, userAvatar, satisfactionScore, streamCountScore, attendanceScore, comment, sessionDate } = req.body;
    if (!userName || !comment) return res.status(400).json({ error: "必須項目を入力してください" });
    const overall = ((satisfactionScore ?? 5) + (streamCountScore ?? 5) + (attendanceScore ?? 5)) / 3;
    const [row] = await db.insert(liverReviews).values({
      liverId: id,
      userId: userId ?? "guest",
      userName,
      userAvatar: userAvatar ?? null,
      satisfactionScore: satisfactionScore ?? 5,
      streamCountScore: streamCountScore ?? 5,
      attendanceScore: attendanceScore ?? 5,
      overallScore: parseFloat(overall.toFixed(1)),
      comment,
      sessionDate: sessionDate ?? new Date().toISOString().slice(0, 10),
    }).returning();
    const allReviews = await db.select().from(liverReviews).where(eq(liverReviews.liverId, id));
    const avgOverall = allReviews.reduce((s, r) => s + r.overallScore, 0) / allReviews.length;
    const avgSatisfaction = allReviews.reduce((s, r) => s + r.satisfactionScore, 0) / allReviews.length;
    const avgAttendance = allReviews.reduce((s, r) => s + r.attendanceScore, 0) / allReviews.length;
    await db.update(creators).set({
      heatScore: parseFloat(avgOverall.toFixed(1)),
      satisfactionScore: parseFloat(avgSatisfaction.toFixed(1)),
      attendanceRate: parseFloat(avgAttendance.toFixed(1)),
    }).where(eq(creators.id, id));
    res.status(201).json(row);
  });

  // ── Liver Availability ────────────────────────────────────────────
  app.get("/api/livers/:id/availability", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(liverAvailability)
      .where(eq(liverAvailability.liverId, id))
      .orderBy(asc(liverAvailability.date), asc(liverAvailability.startTime));
    res.json(rows);
  });

  app.post("/api/livers/:id/availability", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { date, startTime, endTime, maxSlots, note } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).json({ error: "日付と時間を入力してください" });
    const [row] = await db.insert(liverAvailability).values({
      liverId: id,
      date,
      startTime,
      endTime,
      maxSlots: maxSlots ?? 3,
      bookedSlots: 0,
      note: note ?? "",
    }).returning();
    res.status(201).json(row);
  });

  app.delete("/api/livers/:id/availability/:slotId", async (req: Request, res: Response) => {
    const slotId = parseInt(req.params.slotId);
    await db.delete(liverAvailability).where(eq(liverAvailability.id, slotId));
    res.json({ ok: true });
  });

  // ── Seed Demo Data ────────────────────────────────────────────────
  app.post("/api/seed", async (_req: Request, res: Response) => {
    // ユーザーはLINEログインでのみ作成。メール/パスワードのシードは廃止。

    // Seed creators / livers -------------------------------------------------
    const existingCreators = await db.select().from(creators);
    if (existingCreators.length >= 10) {
      return res.json({ ok: true, message: "Already seeded" });
    }

    const existingNames = new Set(existingCreators.map((c: any) => c.name));

    const demoCreators = [
      {
        name: "星空みゆ",
        community: "地下アイドル界隈",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rank: 1,
        heatScore: 1090.1,
        totalViews: 185320,
        revenue: 173000,
        streamCount: 34,
        followers: 48000,
        revenueShare: 80,
        satisfactionScore: 4.5,
        attendanceRate: 4.3,
        bio: "地下アイドル界隈のトップランカー。歌とダンスで毎回視聴者を魅了する実力派ライバー。",
        category: "idol",
      },
      {
        name: "コンビ芸人「ダブルパンチ」",
        community: "お笑い芸人界隈",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        rank: 2,
        heatScore: 923.5,
        totalViews: 172450,
        revenue: 119000,
        streamCount: 45,
        followers: 92000,
        revenueShare: 80,
        satisfactionScore: 4.2,
        attendanceRate: 4.1,
        bio: "お笑いコンビとして活動中。ライブ配信でも息の合ったトークで笑いを届けます。",
        category: "idol",
      },
      {
        name: "麗華 -REIKA-",
        community: "キャバ嬢・ホスト界隈",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop",
        rank: 3,
        heatScore: 1414,
        totalViews: 164800,
        revenue: 165000,
        streamCount: 52,
        followers: 67000,
        revenueShare: 80,
        satisfactionScore: 4.6,
        attendanceRate: 4.8,
        bio: "キャバ嬢×ライバーとして大人気。トーク力と美貌で多くのファンを獲得。",
        category: "idol",
      },
      {
        name: "まいまい17歳",
        community: "JK日常界隈",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        rank: 4,
        heatScore: 865.7,
        totalViews: 148900,
        revenue: 85500,
        streamCount: 68,
        followers: 52000,
        revenueShare: 80,
        satisfactionScore: 4.3,
        attendanceRate: 4.5,
        bio: "JKのリアルな日常を発信中。素朴で親しみやすいキャラが人気の秘密。",
        category: "idol",
      },
      {
        name: "桜井 みなみ",
        community: "アイドル部",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        rank: 1,
        heatScore: 4.8,
        totalViews: 125000,
        revenue: 980000,
        streamCount: 87,
        followers: 15200,
        revenueShare: 80,
        satisfactionScore: 4.9,
        attendanceRate: 4.7,
        bio: "毎日元気に配信中！みんなと一緒に楽しい時間を過ごしたいです♪",
        category: "idol",
      },
      {
        name: "田中 ゆうき",
        community: "英会話クラブ",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        rank: 2,
        heatScore: 4.6,
        totalViews: 89000,
        revenue: 650000,
        streamCount: 62,
        followers: 9800,
        revenueShare: 80,
        satisfactionScore: 4.7,
        attendanceRate: 4.5,
        bio: "TOEIC 990点取得。ビジネス英語から日常会話まで丁寧に教えます！",
        category: "english",
      },
      {
        name: "神崎 リナ",
        community: "占いサロン",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        rank: 3,
        heatScore: 4.5,
        totalViews: 73000,
        revenue: 520000,
        streamCount: 45,
        followers: 7600,
        revenueShare: 80,
        satisfactionScore: 4.6,
        attendanceRate: 4.3,
        bio: "タロット・西洋占星術・数秘術を組み合わせた独自のリーディングで、あなたの未来を照らします。",
        category: "fortune",
      },
      {
        name: "松本 こうた",
        community: "フィットネス部",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        rank: 4,
        heatScore: 4.3,
        totalViews: 58000,
        revenue: 420000,
        streamCount: 38,
        followers: 5400,
        revenueShare: 80,
        satisfactionScore: 4.4,
        attendanceRate: 4.8,
        bio: "元プロサッカー選手。ダイエット・筋トレ・メンタルコーチングを専門とするパーソナルトレーナー。",
        category: "coaching",
      },
      {
        name: "伊藤 さやか",
        community: "カウンセリングルーム",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        rank: 5,
        heatScore: 4.7,
        totalViews: 41000,
        revenue: 380000,
        streamCount: 29,
        followers: 4200,
        revenueShare: 80,
        satisfactionScore: 4.8,
        attendanceRate: 4.9,
        bio: "臨床心理士・公認心理師。悩みを抱えた方の話を丁寧に聴き、一緒に解決策を探します。",
        category: "counselor",
      },
      {
        name: "中村 あおい",
        community: "料理教室",
        avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=150&h=150&fit=crop",
        rank: 6,
        heatScore: 4.4,
        totalViews: 33000,
        revenue: 290000,
        streamCount: 24,
        followers: 3100,
        revenueShare: 80,
        satisfactionScore: 4.5,
        attendanceRate: 4.6,
        bio: "フランス料理学校卒業。家庭で本格的なレシピを楽しく学べる料理教室を開催中。",
        category: "cooking",
      },
    ];

    const toInsert = demoCreators.filter((c) => !existingNames.has(c.name));
    if (toInsert.length === 0) {
      return res.json({ ok: true, message: "Already seeded" });
    }
    const insertedCreators = await db.insert(creators).values(toInsert).returning();

    const today = new Date();
    const availData: { liverId: number; date: string; startTime: string; endTime: string; maxSlots: number; bookedSlots: number; note: string }[] = [];
    for (const c of insertedCreators) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + d);
        const dateStr = dt.toISOString().slice(0, 10);
        availData.push({ liverId: c.id, date: dateStr, startTime: "19:00", endTime: "21:00", maxSlots: 3, bookedSlots: Math.floor(Math.random() * 2), note: "" });
        if (d % 2 === 0) {
          availData.push({ liverId: c.id, date: dateStr, startTime: "13:00", endTime: "15:00", maxSlots: 2, bookedSlots: 0, note: "午後の部" });
        }
      }
    }
    await db.insert(liverAvailability).values(availData);

    const reviewAuthors = [
      { name: "ゆき", avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop" },
      { name: "たかし", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop" },
      { name: "はるか", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop" },
      { name: "けんじ", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop" },
    ];
    const comments = [
      "とても楽しい時間でした！また予約したいです。",
      "丁寧な対応で大満足です。スケジュール通りに進んでくれました。",
      "素晴らしい配信でした。また参加したいと思います！",
      "期待以上の内容でした。毎回来るのが楽しみです。",
      "時間を守ってくれて信頼できます。次回も予約します！",
    ];
    const reviewData: { liverId: number; userId: string; userName: string; userAvatar: string; satisfactionScore: number; streamCountScore: number; attendanceScore: number; overallScore: number; comment: string; sessionDate: string }[] = [];
    for (const c of insertedCreators) {
      for (let i = 0; i < 4; i++) {
        const author = reviewAuthors[i % reviewAuthors.length];
        const sat = 4 + Math.floor(Math.random() * 2);
        const str = 4 + Math.floor(Math.random() * 2);
        const att = 4 + Math.floor(Math.random() * 2);
        const overall = parseFloat(((sat + str + att) / 3).toFixed(1));
        const dt = new Date(today);
        dt.setDate(today.getDate() - (i + 1) * 7);
        reviewData.push({
          liverId: c.id,
          userId: `user-${i}`,
          userName: author.name,
          userAvatar: author.avatar,
          satisfactionScore: sat,
          streamCountScore: str,
          attendanceScore: att,
          overallScore: overall,
          comment: comments[i % comments.length],
          sessionDate: dt.toISOString().slice(0, 10),
        });
      }
    }
    await db.insert(liverReviews).values(reviewData);

    const existingBookings = await db.select().from(bookingSessions);
    if (existingBookings.length === 0) {
      const bookingData = insertedCreators.slice(0, 5).map((c, i) => {
        const dt = new Date(today);
        dt.setDate(today.getDate() + i + 1);
        const categories = ["idol", "english", "fortune", "coaching", "counselor"];
        const labels = ["アイドル", "英会話", "占い", "コーチング", "カウンセラー"];
        const prices = [3000, 5000, 4000, 6000, 4500];
        const cat = categories[i % categories.length];
        return {
          creator: c.name,
          category: cat,
          categoryLabel: labels[i % labels.length],
          title: `${c.name}との1対1セッション`,
          avatar: c.avatar,
          thumbnail: `https://images.unsplash.com/photo-151645036045${i}-9312f5e86fc7?w=400&h=250&fit=crop`,
          date: dt.toISOString().slice(0, 10),
          time: "19:00",
          duration: "30分",
          price: prices[i % prices.length],
          spotsTotal: 5,
          spotsLeft: 2 + i,
          rating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)),
          reviewCount: 10 + i * 5,
          tag: i === 0 ? "人気" : null,
        };
      });
      await db.insert(bookingSessions).values(bookingData);
    }

    res.json({ ok: true, created: insertedCreators.length });
  });

  app.post("/api/seed-editors", async (_req: Request, res: Response) => {
    const existing = await db.select().from(videoEditors);
    if (existing.length >= 5) {
      return res.json({ ok: true, message: "Already seeded" });
    }

    const demoEditors = [
      {
        name: "映像編集マン",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop",
        bio: "テロップ・カット・サムネまでワンストップで対応する動画編集クリエイター。",
        communityId: 1,
        genres: "YouTube,バラエティ,ゲーム",
        deliveryDays: 3,
        priceType: "per_minute",
        pricePerMinute: 1500,
        revenueSharePercent: null,
        rating: 4.9,
        reviewCount: 128,
        isAvailable: true,
      },
      {
        name: "シネマ編集スタジオ",
        avatar: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&h=150&fit=crop",
        bio: "映画風のシネマティックなMV制作が得意です。",
        communityId: 1,
        genres: "MV,アーティスト,シネマティック",
        deliveryDays: 7,
        priceType: "revenue_share",
        pricePerMinute: null,
        revenueSharePercent: 40,
        rating: 4.8,
        reviewCount: 76,
        isAvailable: false,
      },
      {
        name: "ショート動画職人",
        avatar: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=150&h=150&fit=crop",
        bio: "TikTok・YouTubeショートの伸びる構成を提案します。",
        communityId: 1,
        genres: "ショート動画,縦型,SNS運用",
        deliveryDays: 2,
        priceType: "per_minute",
        pricePerMinute: 2000,
        revenueSharePercent: null,
        rating: 5.0,
        reviewCount: 54,
        isAvailable: true,
      },
      {
        name: "ゲーム実況エディター",
        avatar: "https://images.unsplash.com/photo-1533236897111-3e94666b2dde?w=150&h=150&fit=crop",
        bio: "APEX/VALORANTなどFPS系実況の編集が中心です。",
        communityId: 1,
        genres: "ゲーム実況,FPS,切り抜き",
        deliveryDays: 4,
        priceType: "per_minute",
        pricePerMinute: 1200,
        revenueSharePercent: null,
        rating: 4.6,
        reviewCount: 90,
        isAvailable: false,
      },
      {
        name: "教育チャンネル編集室",
        avatar: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=150&h=150&fit=crop",
        bio: "ビジネス・教育系の分かりやすい図解動画を制作します。",
        communityId: 1,
        genres: "ビジネス,教育,セミナー",
        deliveryDays: 5,
        priceType: "revenue_share",
        pricePerMinute: null,
        revenueSharePercent: 30,
        rating: 4.7,
        reviewCount: 33,
        isAvailable: true,
      },
    ];

    await db.insert(videoEditors).values(demoEditors);
    res.json({ ok: true, count: demoEditors.length });
  });
}
