var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// server/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookingSessions: () => bookingSessions,
  communities: () => communities,
  creators: () => creators,
  dmConversationMessages: () => dmConversationMessages,
  dmMessages: () => dmMessages,
  earnings: () => earnings,
  jukeboxChat: () => jukeboxChat,
  jukeboxQueue: () => jukeboxQueue,
  jukeboxState: () => jukeboxState,
  liveStreamChat: () => liveStreamChat,
  liveStreams: () => liveStreams,
  notifications: () => notifications,
  twoshotBookings: () => twoshotBookings,
  userAccounts: () => userAccounts,
  videos: () => videos,
  withdrawals: () => withdrawals
});
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  real,
  timestamp
} from "drizzle-orm/pg-core";
var communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  members: integer("members").notNull().default(0),
  thumbnail: text("thumbnail").notNull(),
  online: boolean("online").notNull().default(false),
  category: text("category").notNull()
});
var videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creator: text("creator").notNull(),
  community: text("community").notNull(),
  views: integer("views").notNull().default(0),
  timeAgo: text("time_ago").notNull(),
  duration: text("duration").notNull(),
  price: integer("price"),
  thumbnail: text("thumbnail").notNull(),
  avatar: text("avatar").notNull(),
  rank: integer("rank"),
  isRanked: boolean("is_ranked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creator: text("creator").notNull(),
  community: text("community").notNull(),
  viewers: integer("viewers").notNull().default(0),
  thumbnail: text("thumbnail").notNull(),
  avatar: text("avatar").notNull(),
  timeAgo: text("time_ago").notNull(),
  isLive: boolean("is_live").notNull().default(true)
});
var creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  community: text("community").notNull(),
  avatar: text("avatar").notNull(),
  rank: integer("rank").notNull(),
  heatScore: real("heat_score").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  revenue: integer("revenue").notNull().default(0),
  streamCount: integer("stream_count").notNull().default(0),
  followers: integer("followers").notNull().default(0),
  revenueShare: integer("revenue_share").notNull().default(80)
});
var bookingSessions = pgTable("booking_sessions", {
  id: serial("id").primaryKey(),
  creator: text("creator").notNull(),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  title: text("title").notNull(),
  avatar: text("avatar").notNull(),
  thumbnail: text("thumbnail").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(),
  spotsTotal: integer("spots_total").notNull(),
  spotsLeft: integer("spots_left").notNull(),
  rating: real("rating").notNull().default(5),
  reviewCount: integer("review_count").notNull().default(0),
  tag: text("tag")
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  amount: integer("amount"),
  avatar: text("avatar"),
  thumbnail: text("thumbnail"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  timeAgo: text("time_ago").notNull()
});
var liveStreamChat = pgTable("live_stream_chat", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  message: text("message").notNull(),
  isGift: boolean("is_gift").default(false),
  giftAmount: integer("gift_amount"),
  createdAt: timestamp("created_at").defaultNow()
});
var dmConversationMessages = pgTable("dm_conversation_messages", {
  id: serial("id").primaryKey(),
  dmId: integer("dm_id").notNull(),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var jukeboxState = pgTable("jukebox_state", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().unique(),
  currentVideoId: integer("current_video_id"),
  currentVideoTitle: text("current_video_title"),
  currentVideoThumbnail: text("current_video_thumbnail"),
  currentVideoDurationSecs: integer("current_video_duration_secs").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  isPlaying: boolean("is_playing").default(true),
  watchersCount: integer("watchers_count").default(1)
});
var jukeboxQueue = pgTable("jukebox_queue", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  videoId: integer("video_id"),
  videoTitle: text("video_title").notNull(),
  videoThumbnail: text("video_thumbnail").notNull(),
  videoDurationSecs: integer("video_duration_secs").default(0),
  addedBy: text("added_by").notNull().default("\u3042\u306A\u305F"),
  addedByAvatar: text("added_by_avatar"),
  position: integer("position").notNull().default(0),
  isPlayed: boolean("is_played").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var jukeboxChat = pgTable("jukebox_chat", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var dmMessages = pgTable("dm_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  lastMessage: text("last_message").notNull(),
  time: text("time").notNull(),
  unread: integer("unread").notNull().default(0),
  online: boolean("online").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0)
});
var userAccounts = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("\u30E6\u30FC\u30B6\u30FC"),
  bio: text("bio").notNull().default(""),
  avatar: text("avatar"),
  lineId: text("line_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest-001"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  revenueShare: integer("revenue_share").notNull().default(80),
  netAmount: integer("net_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest-001"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  bankName: text("bank_name").notNull(),
  bankBranch: text("bank_branch").notNull(),
  accountType: text("account_type").notNull().default("\u666E\u901A"),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  note: text("note"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at")
});
var twoshotBookings = pgTable("twoshot_bookings", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull(),
  userId: text("user_id").notNull().default("guest"),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"),
  queuePosition: integer("queue_position").notNull().default(0),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  agreedAt: timestamp("agreed_at"),
  notifiedAt: timestamp("notified_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  refundable: boolean("refundable").notNull().default(false),
  evaluationScore: integer("evaluation_score"),
  createdAt: timestamp("created_at").defaultNow()
});

// server/db.ts
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });

// server/routes.ts
import { eq, asc, desc, count, sql } from "drizzle-orm";

// server/stripeClient.ts
import Stripe from "stripe";
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) throw new Error("X-Replit-Token not found");
  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json", "X-Replit-Token": xReplitToken }
  });
  const data = await response.json();
  const connectionSettings = data.items?.[0];
  if (!connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret
  };
}
async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// server/routes.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.SESSION_SECRET ?? "livestock-dev-secret";
function makeToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "90d" });
}
async function getAuthUser(req) {
  const auth = req.headers?.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.id, payload.sub));
    return user ?? null;
  } catch {
    return null;
  }
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "\u5FC5\u9808\u9805\u76EE\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
    if (password.length < 6) return res.status(400).json({ error: "\u30D1\u30B9\u30EF\u30FC\u30C9\u306F6\u6587\u5B57\u4EE5\u4E0A\u3067\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044" });
    const existing = await db.select().from(userAccounts).where(eq(userAccounts.email, email.toLowerCase()));
    if (existing.length > 0) return res.status(409).json({ error: "\u3053\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u3059\u3067\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059" });
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(userAccounts).values({ email: email.toLowerCase(), passwordHash, name }).returning();
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar } });
  });
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.email, email.toLowerCase()));
    if (!user) return res.status(401).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar } });
  });
  app2.get("/api/auth/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "\u672A\u8A8D\u8A3C\u3067\u3059" });
    res.json({ id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar });
  });
  app2.put("/api/auth/profile", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "\u672A\u8A8D\u8A3C\u3067\u3059" });
    const { name, bio, avatar } = req.body;
    const [updated] = await db.update(userAccounts).set({ name: name ?? user.name, bio: bio ?? user.bio, avatar: avatar !== void 0 ? avatar : user.avatar, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userAccounts.id, user.id)).returning();
    res.json({ id: updated.id, email: updated.email, name: updated.name, bio: updated.bio, avatar: updated.avatar });
  });
  const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID ?? "";
  const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
  const LINE_CALLBACK_URL = process.env.LINE_CALLBACK_URL ?? "https://livestock.replit.app/api/auth/callback/line";
  const LINE_STATE = "livestock-line-state";
  app2.get("/api/auth/line", (_req, res) => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINE_CHANNEL_ID,
      redirect_uri: LINE_CALLBACK_URL,
      state: LINE_STATE,
      scope: "profile openid email"
    });
    res.redirect(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
  });
  app2.get("/api/auth/callback/line", async (req, res) => {
    const { code, state } = req.query;
    if (!code || state !== LINE_STATE) {
      return res.redirect("/?line_error=invalid_state");
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
          client_secret: LINE_CHANNEL_SECRET
        }).toString()
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.redirect("/?line_error=token_failed");
      }
      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const profile = await profileRes.json();
      if (!profile.userId) {
        return res.redirect("/?line_error=profile_failed");
      }
      const lineId = profile.userId;
      const lineName = profile.displayName ?? "LINE\u30E6\u30FC\u30B6\u30FC";
      const lineAvatar = profile.pictureUrl ?? null;
      const lineEmail = `line_${lineId}@line.local`;
      let [existing] = await db.select().from(userAccounts).where(eq(userAccounts.lineId, lineId));
      if (!existing) {
        [existing] = await db.insert(userAccounts).values({ email: lineEmail, passwordHash: "line-oauth", name: lineName, avatar: lineAvatar, lineId }).onConflictDoUpdate({ target: userAccounts.email, set: { lineId, name: lineName, avatar: lineAvatar, updatedAt: /* @__PURE__ */ new Date() } }).returning();
      } else {
        [existing] = await db.update(userAccounts).set({ name: lineName, avatar: lineAvatar, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userAccounts.id, existing.id)).returning();
      }
      const jwtToken = makeToken(existing.id);
      res.redirect(`/?line_token=${encodeURIComponent(jwtToken)}`);
    } catch (err) {
      console.error("LINE callback error:", err);
      res.redirect("/?line_error=server_error");
    }
  });
  app2.get("/api/communities", async (_req, res) => {
    const rows = await db.select().from(communities).orderBy(desc(communities.members));
    res.json(rows);
  });
  app2.get("/api/communities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(communities).where(eq(communities.id, id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });
  app2.get("/api/videos", async (_req, res) => {
    const rows = await db.select().from(videos).where(eq(videos.isRanked, false)).orderBy(desc(videos.createdAt));
    res.json(rows);
  });
  app2.get("/api/videos/ranked", async (_req, res) => {
    const rows = await db.select().from(videos).where(eq(videos.isRanked, true)).orderBy(asc(videos.rank));
    res.json(rows);
  });
  app2.get("/api/videos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(videos).where(eq(videos.id, id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });
  app2.post("/api/videos", async (req, res) => {
    const { title, creator, community, duration, price, thumbnail, avatar } = req.body;
    if (!title || !creator || !community || !duration || !thumbnail || !avatar) {
      return res.status(400).json({ message: "\u5FC5\u9808\u30D5\u30A3\u30FC\u30EB\u30C9\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" });
    }
    const [row] = await db.insert(videos).values({
      title,
      creator,
      community,
      views: 0,
      timeAgo: "\u305F\u3063\u305F\u4ECA",
      duration,
      price: price ?? null,
      thumbnail,
      avatar,
      isRanked: false
    }).returning();
    res.status(201).json(row);
  });
  app2.get("/api/live-streams", async (_req, res) => {
    const rows = await db.select().from(liveStreams).where(eq(liveStreams.isLive, true)).orderBy(desc(liveStreams.viewers));
    res.json(rows);
  });
  app2.get("/api/creators", async (_req, res) => {
    const rows = await db.select().from(creators).orderBy(asc(creators.rank));
    res.json(rows);
  });
  app2.get("/api/booking-sessions", async (req, res) => {
    const { category } = req.query;
    const rows = category && category !== "all" ? await db.select().from(bookingSessions).where(eq(bookingSessions.category, category)) : await db.select().from(bookingSessions);
    res.json(rows);
  });
  app2.post("/api/booking-sessions/:id/book", async (req, res) => {
    const id = parseInt(req.params.id);
    const [session] = await db.select().from(bookingSessions).where(eq(bookingSessions.id, id));
    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.spotsLeft <= 0) return res.status(400).json({ message: "\u6E80\u5E2D\u3067\u3059" });
    const [updated] = await db.update(bookingSessions).set({ spotsLeft: session.spotsLeft - 1 }).where(eq(bookingSessions.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/dm-messages", async (_req, res) => {
    const rows = await db.select().from(dmMessages).orderBy(asc(dmMessages.sortOrder));
    res.json(rows);
  });
  app2.post("/api/dm-messages/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(dmMessages).set({ unread: 0 }).where(eq(dmMessages.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/notifications", async (req, res) => {
    const { type } = req.query;
    const rows = type && type !== "all" ? await db.select().from(notifications).where(eq(notifications.type, type)).orderBy(desc(notifications.createdAt)) : await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    res.json(rows);
  });
  app2.post("/api/notifications/read-all", async (_req, res) => {
    await db.update(notifications).set({ isRead: true });
    res.json({ ok: true });
  });
  app2.post("/api/notifications/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/live-streams/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, id));
    if (!stream) return res.status(404).json({ error: "Not found" });
    res.json(stream);
  });
  app2.get("/api/live-streams/:id/chat", async (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(liveStreamChat).where(eq(liveStreamChat.streamId, id)).orderBy(asc(liveStreamChat.createdAt));
    res.json(msgs);
  });
  app2.post("/api/live-streams/:id/chat", async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, avatar, message, isGift, giftAmount } = req.body;
    const [msg] = await db.insert(liveStreamChat).values({
      streamId: id,
      username: username ?? "\u3042\u306A\u305F",
      avatar,
      message,
      isGift: isGift ?? false,
      giftAmount: giftAmount ?? null
    }).returning();
    res.json(msg);
  });
  app2.get("/api/dm-messages/:id/conversation", async (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(dmConversationMessages).where(eq(dmConversationMessages.dmId, id)).orderBy(asc(dmConversationMessages.createdAt));
    res.json(msgs);
  });
  app2.post("/api/dm-messages/:id/conversation", async (req, res) => {
    const id = parseInt(req.params.id);
    const { text: text2 } = req.body;
    const [msg] = await db.insert(dmConversationMessages).values({
      dmId: id,
      sender: "me",
      text: text2,
      isRead: true
    }).returning();
    await db.update(dmMessages).set({ lastMessage: text2, unread: 0 }).where(eq(dmMessages.id, id));
    res.json(msg);
  });
  app2.get("/api/jukebox/:communityId", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const [state] = await db.select().from(jukeboxState).where(eq(jukeboxState.communityId, communityId));
    const queue = await db.select().from(jukeboxQueue).where(eq(jukeboxQueue.communityId, communityId)).orderBy(asc(jukeboxQueue.position));
    const chat = await db.select().from(jukeboxChat).where(eq(jukeboxChat.communityId, communityId)).orderBy(asc(jukeboxChat.createdAt));
    res.json({ state: state ?? null, queue, chat });
  });
  app2.post("/api/jukebox/:communityId/add", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const { videoId, videoTitle, videoThumbnail, videoDurationSecs, addedBy, addedByAvatar } = req.body;
    const existing = await db.select().from(jukeboxQueue).where(eq(jukeboxQueue.communityId, communityId)).orderBy(desc(jukeboxQueue.position));
    const nextPos = existing.length > 0 ? existing[0].position + 1 : 1;
    const [item] = await db.insert(jukeboxQueue).values({
      communityId,
      videoId,
      videoTitle,
      videoThumbnail,
      videoDurationSecs: videoDurationSecs ?? 0,
      addedBy: addedBy ?? "\u3042\u306A\u305F",
      addedByAvatar,
      position: nextPos,
      isPlayed: false
    }).returning();
    res.json(item);
  });
  app2.post("/api/jukebox/:communityId/next", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const queue = await db.select().from(jukeboxQueue).where(eq(jukeboxQueue.communityId, communityId)).orderBy(asc(jukeboxQueue.position));
    const next = queue.find((q) => !q.isPlayed);
    if (next) {
      await db.update(jukeboxQueue).set({ isPlayed: true }).where(eq(jukeboxQueue.id, next.id));
      await db.update(jukeboxState).set({
        currentVideoId: next.videoId,
        currentVideoTitle: next.videoTitle,
        currentVideoThumbnail: next.videoThumbnail,
        currentVideoDurationSecs: next.videoDurationSecs ?? 0,
        startedAt: /* @__PURE__ */ new Date(),
        isPlaying: true,
        watchersCount: Math.floor(Math.random() * 80) + 20
      }).where(eq(jukeboxState.communityId, communityId));
    }
    res.json({ ok: true });
  });
  app2.post("/api/jukebox/:communityId/chat", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const { username, avatar, message } = req.body;
    const [msg] = await db.insert(jukeboxChat).values({
      communityId,
      username: username ?? "\u3042\u306A\u305F",
      avatar,
      message
    }).returning();
    res.json(msg);
  });
  app2.get("/api/twoshot/publishable-key", async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.get("/api/twoshot/:streamId/bookings", async (req, res) => {
    const streamId = parseInt(req.params.streamId);
    const rows = await db.select().from(twoshotBookings).where(eq(twoshotBookings.streamId, streamId)).orderBy(asc(twoshotBookings.queuePosition));
    res.json(rows);
  });
  app2.get("/api/twoshot/:streamId/queue-count", async (req, res) => {
    const streamId = parseInt(req.params.streamId);
    const [{ total }] = await db.select({ total: count() }).from(twoshotBookings).where(sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
    res.json({ count: Number(total) });
  });
  app2.post("/api/twoshot/:streamId/checkout", async (req, res) => {
    const streamId = parseInt(req.params.streamId);
    const { userName, userAvatar, price = 3e3 } = req.body;
    if (!userName) return res.status(400).json({ error: "userName required" });
    try {
      const stripe = await getUncachableStripeClient();
      const [{ total }] = await db.select({ total: count() }).from(twoshotBookings).where(sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
      const queuePos = Number(total) + 1;
      const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, streamId));
      const streamTitle = stream?.title ?? "\u30C4\u30FC\u30B7\u30E7\u30C3\u30C8\u64AE\u5F71";
      const creatorName = stream?.creator ?? "\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC";
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:8081";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "jpy",
              unit_amount: price,
              product_data: {
                name: `\u30C4\u30FC\u30B7\u30E7\u30C3\u30C8\u64AE\u5F71 with ${creatorName}`,
                description: `${streamTitle} | \u6574\u7406\u756A\u53F7${queuePos}\u756A`
              }
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: `${baseUrl}/twoshot-success?session_id={CHECKOUT_SESSION_ID}&stream=${streamId}`,
        cancel_url: `${baseUrl}/live/${streamId}`,
        metadata: {
          streamId: streamId.toString(),
          userName,
          userAvatar: userAvatar ?? "",
          queuePosition: queuePos.toString(),
          price: price.toString()
        }
      });
      const [booking] = await db.insert(twoshotBookings).values({
        streamId,
        userName,
        userAvatar,
        stripeSessionId: session.id,
        price,
        status: "pending",
        queuePosition: queuePos,
        agreedToTerms: true,
        agreedAt: /* @__PURE__ */ new Date(),
        refundable: false
      }).returning();
      res.json({ checkoutUrl: session.url, bookingId: booking.id, queuePosition: queuePos });
    } catch (e) {
      console.error("Stripe checkout error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/twoshot/confirm-payment", async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }
      await db.update(twoshotBookings).set({
        status: "paid",
        stripePaymentIntentId: session.payment_intent
      }).where(eq(twoshotBookings.stripeSessionId, sessionId));
      const [booking] = await db.select().from(twoshotBookings).where(eq(twoshotBookings.stripeSessionId, sessionId));
      res.json({ ok: true, booking });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/twoshot/:bookingId/notify", async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    await db.update(twoshotBookings).set({ status: "notified", notifiedAt: /* @__PURE__ */ new Date() }).where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });
  app2.post("/api/twoshot/:bookingId/complete", async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    await db.update(twoshotBookings).set({ status: "completed", completedAt: /* @__PURE__ */ new Date() }).where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });
  app2.post("/api/twoshot/:bookingId/cancel", async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    const { reason, isSelfCancel } = req.body;
    await db.update(twoshotBookings).set({
      status: "cancelled",
      cancelledAt: /* @__PURE__ */ new Date(),
      cancelReason: reason ?? "\u30E6\u30FC\u30B6\u30FC\u30AD\u30E3\u30F3\u30BB\u30EB",
      refundable: !isSelfCancel
    }).where(eq(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });
  app2.get("/api/revenue/summary", async (_req, res) => {
    const userId = "guest-001";
    const earningRows = await db.select().from(earnings).where(eq(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
    const totalEarned = earningRows.reduce((s, e) => s + e.netAmount, 0);
    const totalWithdrawn = withdrawalRows.filter((w) => w.status === "completed").reduce((s, w) => s + w.amount, 0);
    const pendingWithdrawal = withdrawalRows.filter((w) => w.status === "pending" || w.status === "processing").reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalWithdrawn - pendingWithdrawal;
    const now = /* @__PURE__ */ new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}\u6708`;
      const monthTotal = earningRows.filter((e) => {
        const ed = new Date(e.createdAt);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      }).reduce((s, e) => s + e.netAmount, 0);
      monthly.push({ month: label, amount: monthTotal });
    }
    res.json({ totalEarned, totalWithdrawn, pendingWithdrawal, available, monthly });
  });
  app2.get("/api/revenue/earnings", async (_req, res) => {
    const userId = "guest-001";
    const rows = await db.select().from(earnings).where(eq(earnings.userId, userId)).orderBy(desc(earnings.createdAt));
    res.json(rows);
  });
  app2.get("/api/revenue/withdrawals", async (_req, res) => {
    const userId = "guest-001";
    const rows = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.requestedAt));
    res.json(rows);
  });
  app2.post("/api/revenue/withdraw", async (req, res) => {
    const userId = "guest-001";
    const { amount, bankName, bankBranch, accountType, accountNumber, accountName } = req.body;
    if (!amount || amount < 1e3) {
      return res.status(400).json({ error: "\u6700\u4F4E\u5F15\u304D\u51FA\u3057\u984D\u306F\xA51,000\u3067\u3059" });
    }
    const earningRows = await db.select().from(earnings).where(eq(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
    const totalEarned = earningRows.reduce((s, e) => s + e.netAmount, 0);
    const totalUsed = withdrawalRows.filter((w) => w.status !== "failed").reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalUsed;
    if (amount > available) {
      return res.status(400).json({ error: "\u5F15\u304D\u51FA\u3057\u53EF\u80FD\u6B8B\u9AD8\u3092\u8D85\u3048\u3066\u3044\u307E\u3059" });
    }
    const [row] = await db.insert(withdrawals).values({ userId, amount, bankName, bankBranch, accountType, accountNumber, accountName, status: "pending" }).returning();
    res.json(row);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const isDev = process.env.NODE_ENV === "development";
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      if (req.path === "/" || req.path === "/manifest") {
        return serveExpoManifest(platform, res);
      }
    }
    next();
  });
  if (isDev) {
    const expoDevPort = 8081;
    log(`Dev mode: proxying web requests to Expo dev server on port ${expoDevPort}`);
    const expoProxy = createProxyMiddleware({
      target: `http://localhost:${expoDevPort}`,
      changeOrigin: true,
      ws: true,
      on: {
        error: (_err, _req, res) => {
          const r = res;
          if (r && typeof r.status === "function") {
            r.status(502).send("Expo dev server not ready yet. Please wait a moment and refresh.");
          }
        }
      }
    });
    app2.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) return next();
      return expoProxy(req, res, next);
    });
  } else {
    app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
    app2.use(express.static(path.resolve(process.cwd(), "static-build")));
    app2.use(express.static(path.resolve(process.cwd(), "public"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("sw.js")) {
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Service-Worker-Allowed", "/");
          res.setHeader("Cache-Control", "no-cache");
        }
        if (filePath.endsWith("manifest.json")) {
          res.setHeader("Content-Type", "application/manifest+json");
        }
      }
    }));
    const landingPageTemplatePath = path.resolve(process.cwd(), "server", "templates", "landing-page.html");
    if (fs.existsSync(landingPageTemplatePath)) {
      const landingPageTemplate = fs.readFileSync(landingPageTemplatePath, "utf-8");
      const appName = getAppName();
      app2.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        const platform = req.header("expo-platform");
        if (platform && (platform === "ios" || platform === "android")) return next();
        serveLandingPage({ req, res, landingPageTemplate, appName });
      });
    }
  }
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
