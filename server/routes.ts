import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import {
  communities,
  videos,
  liveStreams,
  creators,
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
  userAccounts,
} from "./schema";
import { eq, asc, desc, count, sql } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "livestock-dev-secret";

function makeToken(userId: number) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "90d" });
}

async function getAuthUser(req: Request): Promise<{ id: number; email: string; name: string; bio: string; avatar: string | null } | null> {
  const auth = (req as any).headers?.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { sub: number };
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.id, payload.sub));
    return user ?? null;
  } catch {
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ── Auth ──────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "必須項目を入力してください" });
    if (password.length < 6) return res.status(400).json({ error: "パスワードは6文字以上で設定してください" });
    const existing = await db.select().from(userAccounts).where(eq(userAccounts.email, email.toLowerCase()));
    if (existing.length > 0) return res.status(409).json({ error: "このメールアドレスはすでに登録されています" });
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(userAccounts).values({ email: email.toLowerCase(), passwordHash, name }).returning();
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar } });
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "メールアドレスとパスワードを入力してください" });
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.email, email.toLowerCase()));
    if (!user) return res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar } });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });
    res.json({ id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar });
  });

  app.put("/api/auth/profile", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "未認証です" });
    const { name, bio, avatar } = req.body;
    const [updated] = await db
      .update(userAccounts)
      .set({ name: name ?? user.name, bio: bio ?? user.bio, avatar: avatar !== undefined ? avatar : user.avatar, updatedAt: new Date() })
      .where(eq(userAccounts.id, user.id))
      .returning();
    res.json({ id: updated.id, email: updated.email, name: updated.name, bio: updated.bio, avatar: updated.avatar });
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

  // ── Videos ───────────────────────────────────────────────────────
  app.get("/api/videos", async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.isRanked, false))
      .orderBy(desc(videos.createdAt));
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
    const { videoId, videoTitle, videoThumbnail, videoDurationSecs, addedBy, addedByAvatar } = req.body;
    const existing = await db.select().from(jukeboxQueue)
      .where(eq(jukeboxQueue.communityId, communityId))
      .orderBy(desc(jukeboxQueue.position));
    const nextPos = existing.length > 0 ? existing[0].position + 1 : 1;
    const [item] = await db.insert(jukeboxQueue).values({
      communityId, videoId, videoTitle, videoThumbnail, videoDurationSecs: videoDurationSecs ?? 0,
      addedBy: addedBy ?? "あなた", addedByAvatar, position: nextPos, isPlayed: false,
    }).returning();
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
      await db.update(jukeboxState).set({
        currentVideoId: next.videoId,
        currentVideoTitle: next.videoTitle,
        currentVideoThumbnail: next.videoThumbnail,
        currentVideoDurationSecs: next.videoDurationSecs ?? 0,
        startedAt: new Date(),
        isPlaying: true,
        watchersCount: Math.floor(Math.random() * 80) + 20,
      }).where(eq(jukeboxState.communityId, communityId));
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

      await db
        .update(twoshotBookings)
        .set({
          status: "paid",
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(twoshotBookings.stripeSessionId, sessionId));

      const [booking] = await db
        .select()
        .from(twoshotBookings)
        .where(eq(twoshotBookings.stripeSessionId, sessionId));

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

  // ── Revenue ───────────────────────────────────────────────────────
  app.get("/api/revenue/summary", async (_req: Request, res: Response) => {
    const userId = "guest-001";
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

  app.get("/api/revenue/earnings", async (_req: Request, res: Response) => {
    const userId = "guest-001";
    const rows = await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, userId))
      .orderBy(desc(earnings.createdAt));
    res.json(rows);
  });

  app.get("/api/revenue/withdrawals", async (_req: Request, res: Response) => {
    const userId = "guest-001";
    const rows = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
    res.json(rows);
  });

  app.post("/api/revenue/withdraw", async (req: Request, res: Response) => {
    const userId = "guest-001";
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

  const httpServer = createServer(app);
  return httpServer;
}
