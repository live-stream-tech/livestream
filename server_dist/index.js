"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express = __toESM(require("express"));

// server/routes.ts
var import_node_http = require("node:http");

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

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
  liverAvailability: () => liverAvailability,
  liverReviews: () => liverReviews,
  notifications: () => notifications,
  twoshotBookings: () => twoshotBookings,
  userAccounts: () => userAccounts,
  videos: () => videos,
  withdrawals: () => withdrawals
});
var import_pg_core = require("drizzle-orm/pg-core");
var communities = (0, import_pg_core.pgTable)("communities", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  members: (0, import_pg_core.integer)("members").notNull().default(0),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  online: (0, import_pg_core.boolean)("online").notNull().default(false),
  category: (0, import_pg_core.text)("category").notNull()
});
var videos = (0, import_pg_core.pgTable)("videos", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  creator: (0, import_pg_core.text)("creator").notNull(),
  community: (0, import_pg_core.text)("community").notNull(),
  views: (0, import_pg_core.integer)("views").notNull().default(0),
  timeAgo: (0, import_pg_core.text)("time_ago").notNull(),
  duration: (0, import_pg_core.text)("duration").notNull(),
  price: (0, import_pg_core.integer)("price"),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  avatar: (0, import_pg_core.text)("avatar").notNull(),
  rank: (0, import_pg_core.integer)("rank"),
  isRanked: (0, import_pg_core.boolean)("is_ranked").notNull().default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var liveStreams = (0, import_pg_core.pgTable)("live_streams", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  creator: (0, import_pg_core.text)("creator").notNull(),
  community: (0, import_pg_core.text)("community").notNull(),
  viewers: (0, import_pg_core.integer)("viewers").notNull().default(0),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  avatar: (0, import_pg_core.text)("avatar").notNull(),
  timeAgo: (0, import_pg_core.text)("time_ago").notNull(),
  isLive: (0, import_pg_core.boolean)("is_live").notNull().default(true)
});
var creators = (0, import_pg_core.pgTable)("creators", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  community: (0, import_pg_core.text)("community").notNull(),
  avatar: (0, import_pg_core.text)("avatar").notNull(),
  rank: (0, import_pg_core.integer)("rank").notNull(),
  heatScore: (0, import_pg_core.real)("heat_score").notNull().default(0),
  totalViews: (0, import_pg_core.integer)("total_views").notNull().default(0),
  revenue: (0, import_pg_core.integer)("revenue").notNull().default(0),
  streamCount: (0, import_pg_core.integer)("stream_count").notNull().default(0),
  followers: (0, import_pg_core.integer)("followers").notNull().default(0),
  revenueShare: (0, import_pg_core.integer)("revenue_share").notNull().default(80),
  satisfactionScore: (0, import_pg_core.real)("satisfaction_score").notNull().default(0),
  attendanceRate: (0, import_pg_core.real)("attendance_rate").notNull().default(0),
  bio: (0, import_pg_core.text)("bio").notNull().default(""),
  category: (0, import_pg_core.text)("category").notNull().default("idol")
});
var bookingSessions = (0, import_pg_core.pgTable)("booking_sessions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  creator: (0, import_pg_core.text)("creator").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  categoryLabel: (0, import_pg_core.text)("category_label").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  avatar: (0, import_pg_core.text)("avatar").notNull(),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  time: (0, import_pg_core.text)("time").notNull(),
  duration: (0, import_pg_core.text)("duration").notNull(),
  price: (0, import_pg_core.integer)("price").notNull(),
  spotsTotal: (0, import_pg_core.integer)("spots_total").notNull(),
  spotsLeft: (0, import_pg_core.integer)("spots_left").notNull(),
  rating: (0, import_pg_core.real)("rating").notNull().default(5),
  reviewCount: (0, import_pg_core.integer)("review_count").notNull().default(0),
  tag: (0, import_pg_core.text)("tag")
});
var notifications = (0, import_pg_core.pgTable)("notifications", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  type: (0, import_pg_core.text)("type").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  body: (0, import_pg_core.text)("body").notNull(),
  amount: (0, import_pg_core.integer)("amount"),
  avatar: (0, import_pg_core.text)("avatar"),
  thumbnail: (0, import_pg_core.text)("thumbnail"),
  isRead: (0, import_pg_core.boolean)("is_read").notNull().default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  timeAgo: (0, import_pg_core.text)("time_ago").notNull()
});
var liveStreamChat = (0, import_pg_core.pgTable)("live_stream_chat", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  streamId: (0, import_pg_core.integer)("stream_id").notNull(),
  username: (0, import_pg_core.text)("username").notNull(),
  avatar: (0, import_pg_core.text)("avatar"),
  message: (0, import_pg_core.text)("message").notNull(),
  isGift: (0, import_pg_core.boolean)("is_gift").default(false),
  giftAmount: (0, import_pg_core.integer)("gift_amount"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var dmConversationMessages = (0, import_pg_core.pgTable)("dm_conversation_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  dmId: (0, import_pg_core.integer)("dm_id").notNull(),
  sender: (0, import_pg_core.text)("sender").notNull(),
  text: (0, import_pg_core.text)("text").notNull(),
  isRead: (0, import_pg_core.boolean)("is_read").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var jukeboxState = (0, import_pg_core.pgTable)("jukebox_state", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  communityId: (0, import_pg_core.integer)("community_id").notNull().unique(),
  currentVideoId: (0, import_pg_core.integer)("current_video_id"),
  currentVideoTitle: (0, import_pg_core.text)("current_video_title"),
  currentVideoThumbnail: (0, import_pg_core.text)("current_video_thumbnail"),
  currentVideoDurationSecs: (0, import_pg_core.integer)("current_video_duration_secs").default(0),
  startedAt: (0, import_pg_core.timestamp)("started_at").defaultNow(),
  isPlaying: (0, import_pg_core.boolean)("is_playing").default(true),
  watchersCount: (0, import_pg_core.integer)("watchers_count").default(1)
});
var jukeboxQueue = (0, import_pg_core.pgTable)("jukebox_queue", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  communityId: (0, import_pg_core.integer)("community_id").notNull(),
  videoId: (0, import_pg_core.integer)("video_id"),
  videoTitle: (0, import_pg_core.text)("video_title").notNull(),
  videoThumbnail: (0, import_pg_core.text)("video_thumbnail").notNull(),
  videoDurationSecs: (0, import_pg_core.integer)("video_duration_secs").default(0),
  addedBy: (0, import_pg_core.text)("added_by").notNull().default("\u3042\u306A\u305F"),
  addedByAvatar: (0, import_pg_core.text)("added_by_avatar"),
  position: (0, import_pg_core.integer)("position").notNull().default(0),
  isPlayed: (0, import_pg_core.boolean)("is_played").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var jukeboxChat = (0, import_pg_core.pgTable)("jukebox_chat", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  communityId: (0, import_pg_core.integer)("community_id").notNull(),
  username: (0, import_pg_core.text)("username").notNull(),
  avatar: (0, import_pg_core.text)("avatar"),
  message: (0, import_pg_core.text)("message").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var dmMessages = (0, import_pg_core.pgTable)("dm_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  avatar: (0, import_pg_core.text)("avatar").notNull(),
  lastMessage: (0, import_pg_core.text)("last_message").notNull(),
  time: (0, import_pg_core.text)("time").notNull(),
  unread: (0, import_pg_core.integer)("unread").notNull().default(0),
  online: (0, import_pg_core.boolean)("online").notNull().default(false),
  sortOrder: (0, import_pg_core.integer)("sort_order").notNull().default(0)
});
var userAccounts = (0, import_pg_core.pgTable)("user_accounts", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  email: (0, import_pg_core.text)("email").unique().notNull(),
  passwordHash: (0, import_pg_core.text)("password_hash").notNull(),
  name: (0, import_pg_core.text)("name").notNull().default("\u30E6\u30FC\u30B6\u30FC"),
  bio: (0, import_pg_core.text)("bio").notNull().default(""),
  avatar: (0, import_pg_core.text)("avatar"),
  lineId: (0, import_pg_core.text)("line_id").unique(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var earnings = (0, import_pg_core.pgTable)("earnings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull().default("guest-001"),
  type: (0, import_pg_core.text)("type").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  revenueShare: (0, import_pg_core.integer)("revenue_share").notNull().default(80),
  netAmount: (0, import_pg_core.integer)("net_amount").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var withdrawals = (0, import_pg_core.pgTable)("withdrawals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull().default("guest-001"),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  bankName: (0, import_pg_core.text)("bank_name").notNull(),
  bankBranch: (0, import_pg_core.text)("bank_branch").notNull(),
  accountType: (0, import_pg_core.text)("account_type").notNull().default("\u666E\u901A"),
  accountNumber: (0, import_pg_core.text)("account_number").notNull(),
  accountName: (0, import_pg_core.text)("account_name").notNull(),
  note: (0, import_pg_core.text)("note"),
  requestedAt: (0, import_pg_core.timestamp)("requested_at").defaultNow(),
  processedAt: (0, import_pg_core.timestamp)("processed_at")
});
var twoshotBookings = (0, import_pg_core.pgTable)("twoshot_bookings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  streamId: (0, import_pg_core.integer)("stream_id").notNull(),
  userId: (0, import_pg_core.text)("user_id").notNull().default("guest"),
  userName: (0, import_pg_core.text)("user_name").notNull(),
  userAvatar: (0, import_pg_core.text)("user_avatar"),
  stripeSessionId: (0, import_pg_core.text)("stripe_session_id"),
  stripePaymentIntentId: (0, import_pg_core.text)("stripe_payment_intent_id"),
  price: (0, import_pg_core.integer)("price").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  queuePosition: (0, import_pg_core.integer)("queue_position").notNull().default(0),
  agreedToTerms: (0, import_pg_core.boolean)("agreed_to_terms").notNull().default(false),
  agreedAt: (0, import_pg_core.timestamp)("agreed_at"),
  notifiedAt: (0, import_pg_core.timestamp)("notified_at"),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  cancelledAt: (0, import_pg_core.timestamp)("cancelled_at"),
  cancelReason: (0, import_pg_core.text)("cancel_reason"),
  refundable: (0, import_pg_core.boolean)("refundable").notNull().default(false),
  evaluationScore: (0, import_pg_core.integer)("evaluation_score"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var liverReviews = (0, import_pg_core.pgTable)("liver_reviews", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  liverId: (0, import_pg_core.integer)("liver_id").notNull(),
  userId: (0, import_pg_core.text)("user_id").notNull().default("guest"),
  userName: (0, import_pg_core.text)("user_name").notNull(),
  userAvatar: (0, import_pg_core.text)("user_avatar"),
  satisfactionScore: (0, import_pg_core.integer)("satisfaction_score").notNull().default(5),
  streamCountScore: (0, import_pg_core.integer)("stream_count_score").notNull().default(5),
  attendanceScore: (0, import_pg_core.integer)("attendance_score").notNull().default(5),
  overallScore: (0, import_pg_core.real)("overall_score").notNull().default(5),
  comment: (0, import_pg_core.text)("comment").notNull().default(""),
  sessionDate: (0, import_pg_core.text)("session_date").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var liverAvailability = (0, import_pg_core.pgTable)("liver_availability", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  liverId: (0, import_pg_core.integer)("liver_id").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  startTime: (0, import_pg_core.text)("start_time").notNull(),
  endTime: (0, import_pg_core.text)("end_time").notNull(),
  maxSlots: (0, import_pg_core.integer)("max_slots").notNull().default(3),
  bookedSlots: (0, import_pg_core.integer)("booked_slots").notNull().default(0),
  note: (0, import_pg_core.text)("note").notNull().default(""),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});

// server/db.ts
var pool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/routes.ts
var import_drizzle_orm = require("drizzle-orm");

// server/stripeClient.ts
var import_stripe = __toESM(require("stripe"));
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
  return new import_stripe.default(secretKey, { apiVersion: "2025-08-27.basil" });
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// server/routes.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var JWT_SECRET = process.env.SESSION_SECRET ?? "livestock-dev-secret";
function makeToken(userId) {
  return import_jsonwebtoken.default.sign({ sub: userId }, JWT_SECRET, { expiresIn: "90d" });
}
async function getAuthUser(req) {
  const auth = req.headers?.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const payload = import_jsonwebtoken.default.verify(auth.slice(7), JWT_SECRET);
    const [user] = await db.select().from(userAccounts).where((0, import_drizzle_orm.eq)(userAccounts.id, payload.sub));
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
    const existing = await db.select().from(userAccounts).where((0, import_drizzle_orm.eq)(userAccounts.email, email.toLowerCase()));
    if (existing.length > 0) return res.status(409).json({ error: "\u3053\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u3059\u3067\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059" });
    const passwordHash = await import_bcryptjs.default.hash(password, 10);
    const [user] = await db.insert(userAccounts).values({ email: email.toLowerCase(), passwordHash, name }).returning();
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar: user.avatar } });
  });
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
    const [user] = await db.select().from(userAccounts).where((0, import_drizzle_orm.eq)(userAccounts.email, email.toLowerCase()));
    if (!user) return res.status(401).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
    const ok = await import_bcryptjs.default.compare(password, user.passwordHash);
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
    const [updated] = await db.update(userAccounts).set({ name: name ?? user.name, bio: bio ?? user.bio, avatar: avatar !== void 0 ? avatar : user.avatar, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(userAccounts.id, user.id)).returning();
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
      let [existing] = await db.select().from(userAccounts).where((0, import_drizzle_orm.eq)(userAccounts.lineId, lineId));
      if (!existing) {
        [existing] = await db.insert(userAccounts).values({ email: lineEmail, passwordHash: "line-oauth", name: lineName, avatar: lineAvatar, lineId }).onConflictDoUpdate({ target: userAccounts.email, set: { lineId, name: lineName, avatar: lineAvatar, updatedAt: /* @__PURE__ */ new Date() } }).returning();
      } else {
        [existing] = await db.update(userAccounts).set({ name: lineName, avatar: lineAvatar, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(userAccounts.id, existing.id)).returning();
      }
      const jwtToken = makeToken(existing.id);
      res.redirect(`/?line_token=${encodeURIComponent(jwtToken)}`);
    } catch (err) {
      console.error("LINE callback error:", err);
      res.redirect("/?line_error=server_error");
    }
  });
  app2.get("/api/communities", async (_req, res) => {
    const rows = await db.select().from(communities).orderBy((0, import_drizzle_orm.desc)(communities.members));
    res.json(rows);
  });
  app2.get("/api/communities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(communities).where((0, import_drizzle_orm.eq)(communities.id, id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });
  app2.get("/api/videos", async (_req, res) => {
    const rows = await db.select().from(videos).where((0, import_drizzle_orm.eq)(videos.isRanked, false)).orderBy((0, import_drizzle_orm.desc)(videos.createdAt));
    res.json(rows);
  });
  app2.get("/api/videos/ranked", async (_req, res) => {
    const rows = await db.select().from(videos).where((0, import_drizzle_orm.eq)(videos.isRanked, true)).orderBy((0, import_drizzle_orm.asc)(videos.rank));
    res.json(rows);
  });
  app2.get("/api/videos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(videos).where((0, import_drizzle_orm.eq)(videos.id, id));
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
    const rows = await db.select().from(liveStreams).where((0, import_drizzle_orm.eq)(liveStreams.isLive, true)).orderBy((0, import_drizzle_orm.desc)(liveStreams.viewers));
    res.json(rows);
  });
  app2.get("/api/creators", async (_req, res) => {
    const rows = await db.select().from(creators).orderBy((0, import_drizzle_orm.asc)(creators.rank));
    res.json(rows);
  });
  app2.get("/api/booking-sessions", async (req, res) => {
    const { category } = req.query;
    const rows = category && category !== "all" ? await db.select().from(bookingSessions).where((0, import_drizzle_orm.eq)(bookingSessions.category, category)) : await db.select().from(bookingSessions);
    res.json(rows);
  });
  app2.post("/api/booking-sessions/:id/book", async (req, res) => {
    const id = parseInt(req.params.id);
    const [session] = await db.select().from(bookingSessions).where((0, import_drizzle_orm.eq)(bookingSessions.id, id));
    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.spotsLeft <= 0) return res.status(400).json({ message: "\u6E80\u5E2D\u3067\u3059" });
    const [updated] = await db.update(bookingSessions).set({ spotsLeft: session.spotsLeft - 1 }).where((0, import_drizzle_orm.eq)(bookingSessions.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/dm-messages", async (_req, res) => {
    const rows = await db.select().from(dmMessages).orderBy((0, import_drizzle_orm.asc)(dmMessages.sortOrder));
    res.json(rows);
  });
  app2.post("/api/dm-messages/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(dmMessages).set({ unread: 0 }).where((0, import_drizzle_orm.eq)(dmMessages.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/notifications", async (req, res) => {
    const { type } = req.query;
    const rows = type && type !== "all" ? await db.select().from(notifications).where((0, import_drizzle_orm.eq)(notifications.type, type)).orderBy((0, import_drizzle_orm.desc)(notifications.createdAt)) : await db.select().from(notifications).orderBy((0, import_drizzle_orm.desc)(notifications.createdAt));
    res.json(rows);
  });
  app2.post("/api/notifications/read-all", async (_req, res) => {
    await db.update(notifications).set({ isRead: true });
    res.json({ ok: true });
  });
  app2.post("/api/notifications/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm.eq)(notifications.id, id)).returning();
    res.json(updated);
  });
  app2.get("/api/live-streams/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [stream] = await db.select().from(liveStreams).where((0, import_drizzle_orm.eq)(liveStreams.id, id));
    if (!stream) return res.status(404).json({ error: "Not found" });
    res.json(stream);
  });
  app2.get("/api/live-streams/:id/chat", async (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(liveStreamChat).where((0, import_drizzle_orm.eq)(liveStreamChat.streamId, id)).orderBy((0, import_drizzle_orm.asc)(liveStreamChat.createdAt));
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
    const msgs = await db.select().from(dmConversationMessages).where((0, import_drizzle_orm.eq)(dmConversationMessages.dmId, id)).orderBy((0, import_drizzle_orm.asc)(dmConversationMessages.createdAt));
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
    await db.update(dmMessages).set({ lastMessage: text2, unread: 0 }).where((0, import_drizzle_orm.eq)(dmMessages.id, id));
    res.json(msg);
  });
  app2.get("/api/jukebox/:communityId", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const [state] = await db.select().from(jukeboxState).where((0, import_drizzle_orm.eq)(jukeboxState.communityId, communityId));
    const queue = await db.select().from(jukeboxQueue).where((0, import_drizzle_orm.eq)(jukeboxQueue.communityId, communityId)).orderBy((0, import_drizzle_orm.asc)(jukeboxQueue.position));
    const chat = await db.select().from(jukeboxChat).where((0, import_drizzle_orm.eq)(jukeboxChat.communityId, communityId)).orderBy((0, import_drizzle_orm.asc)(jukeboxChat.createdAt));
    res.json({ state: state ?? null, queue, chat });
  });
  app2.post("/api/jukebox/:communityId/add", async (req, res) => {
    const communityId = parseInt(req.params.communityId);
    const { videoId, videoTitle, videoThumbnail, videoDurationSecs, addedBy, addedByAvatar } = req.body;
    const existing = await db.select().from(jukeboxQueue).where((0, import_drizzle_orm.eq)(jukeboxQueue.communityId, communityId)).orderBy((0, import_drizzle_orm.desc)(jukeboxQueue.position));
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
    const queue = await db.select().from(jukeboxQueue).where((0, import_drizzle_orm.eq)(jukeboxQueue.communityId, communityId)).orderBy((0, import_drizzle_orm.asc)(jukeboxQueue.position));
    const next = queue.find((q) => !q.isPlayed);
    if (next) {
      await db.update(jukeboxQueue).set({ isPlayed: true }).where((0, import_drizzle_orm.eq)(jukeboxQueue.id, next.id));
      await db.update(jukeboxState).set({
        currentVideoId: next.videoId,
        currentVideoTitle: next.videoTitle,
        currentVideoThumbnail: next.videoThumbnail,
        currentVideoDurationSecs: next.videoDurationSecs ?? 0,
        startedAt: /* @__PURE__ */ new Date(),
        isPlaying: true,
        watchersCount: Math.floor(Math.random() * 80) + 20
      }).where((0, import_drizzle_orm.eq)(jukeboxState.communityId, communityId));
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
    const rows = await db.select().from(twoshotBookings).where((0, import_drizzle_orm.eq)(twoshotBookings.streamId, streamId)).orderBy((0, import_drizzle_orm.asc)(twoshotBookings.queuePosition));
    res.json(rows);
  });
  app2.get("/api/twoshot/:streamId/queue-count", async (req, res) => {
    const streamId = parseInt(req.params.streamId);
    const [{ total }] = await db.select({ total: (0, import_drizzle_orm.count)() }).from(twoshotBookings).where(import_drizzle_orm.sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
    res.json({ count: Number(total) });
  });
  app2.post("/api/twoshot/:streamId/checkout", async (req, res) => {
    const streamId = parseInt(req.params.streamId);
    const { userName, userAvatar, price = 3e3 } = req.body;
    if (!userName) return res.status(400).json({ error: "userName required" });
    try {
      const stripe = await getUncachableStripeClient();
      const [{ total }] = await db.select({ total: (0, import_drizzle_orm.count)() }).from(twoshotBookings).where(import_drizzle_orm.sql`stream_id = ${streamId} AND status IN ('paid','waiting','notified')`);
      const queuePos = Number(total) + 1;
      const [stream] = await db.select().from(liveStreams).where((0, import_drizzle_orm.eq)(liveStreams.id, streamId));
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
      }).where((0, import_drizzle_orm.eq)(twoshotBookings.stripeSessionId, sessionId));
      const [booking] = await db.select().from(twoshotBookings).where((0, import_drizzle_orm.eq)(twoshotBookings.stripeSessionId, sessionId));
      res.json({ ok: true, booking });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/twoshot/:bookingId/notify", async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    await db.update(twoshotBookings).set({ status: "notified", notifiedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });
  app2.post("/api/twoshot/:bookingId/complete", async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    await db.update(twoshotBookings).set({ status: "completed", completedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(twoshotBookings.id, bookingId));
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
    }).where((0, import_drizzle_orm.eq)(twoshotBookings.id, bookingId));
    res.json({ ok: true });
  });
  app2.get("/api/revenue/summary", async (_req, res) => {
    const userId = "guest-001";
    const earningRows = await db.select().from(earnings).where((0, import_drizzle_orm.eq)(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where((0, import_drizzle_orm.eq)(withdrawals.userId, userId));
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
    const rows = await db.select().from(earnings).where((0, import_drizzle_orm.eq)(earnings.userId, userId)).orderBy((0, import_drizzle_orm.desc)(earnings.createdAt));
    res.json(rows);
  });
  app2.get("/api/revenue/withdrawals", async (_req, res) => {
    const userId = "guest-001";
    const rows = await db.select().from(withdrawals).where((0, import_drizzle_orm.eq)(withdrawals.userId, userId)).orderBy((0, import_drizzle_orm.desc)(withdrawals.requestedAt));
    res.json(rows);
  });
  app2.post("/api/revenue/withdraw", async (req, res) => {
    const userId = "guest-001";
    const { amount, bankName, bankBranch, accountType, accountNumber, accountName } = req.body;
    if (!amount || amount < 1e3) {
      return res.status(400).json({ error: "\u6700\u4F4E\u5F15\u304D\u51FA\u3057\u984D\u306F\xA51,000\u3067\u3059" });
    }
    const earningRows = await db.select().from(earnings).where((0, import_drizzle_orm.eq)(earnings.userId, userId));
    const withdrawalRows = await db.select().from(withdrawals).where((0, import_drizzle_orm.eq)(withdrawals.userId, userId));
    const totalEarned = earningRows.reduce((s, e) => s + e.netAmount, 0);
    const totalUsed = withdrawalRows.filter((w) => w.status !== "failed").reduce((s, w) => s + w.amount, 0);
    const available = totalEarned - totalUsed;
    if (amount > available) {
      return res.status(400).json({ error: "\u5F15\u304D\u51FA\u3057\u53EF\u80FD\u6B8B\u9AD8\u3092\u8D85\u3048\u3066\u3044\u307E\u3059" });
    }
    const [row] = await db.insert(withdrawals).values({ userId, amount, bankName, bankBranch, accountType, accountNumber, accountName, status: "pending" }).returning();
    res.json(row);
  });
  app2.get("/api/livers", async (req, res) => {
    const { name, minScore, category, date } = req.query;
    let rows = await db.select().from(creators).orderBy((0, import_drizzle_orm.asc)(creators.rank));
    if (name) {
      const q = name.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (category && category !== "all") {
      rows = rows.filter((r) => r.category === category);
    }
    if (minScore) {
      const ms = parseFloat(minScore);
      rows = rows.filter((r) => r.satisfactionScore >= ms);
    }
    if (date) {
      const avail = await db.select().from(liverAvailability).where((0, import_drizzle_orm.eq)(liverAvailability.date, date));
      const availIds = new Set(avail.map((a) => a.liverId));
      rows = rows.filter((r) => availIds.has(r.id));
    }
    res.json(rows);
  });
  app2.get("/api/livers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [liver] = await db.select().from(creators).where((0, import_drizzle_orm.eq)(creators.id, id));
    if (!liver) return res.status(404).json({ error: "Not found" });
    res.json(liver);
  });
  app2.get("/api/livers/:id/reviews", async (req, res) => {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(liverReviews).where((0, import_drizzle_orm.eq)(liverReviews.liverId, id)).orderBy((0, import_drizzle_orm.desc)(liverReviews.createdAt));
    res.json(rows);
  });
  app2.post("/api/livers/:id/reviews", async (req, res) => {
    const id = parseInt(req.params.id);
    const { userId, userName, userAvatar, satisfactionScore, streamCountScore, attendanceScore, comment, sessionDate } = req.body;
    if (!userName || !comment) return res.status(400).json({ error: "\u5FC5\u9808\u9805\u76EE\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
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
      sessionDate: sessionDate ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    }).returning();
    const allReviews = await db.select().from(liverReviews).where((0, import_drizzle_orm.eq)(liverReviews.liverId, id));
    const avgOverall = allReviews.reduce((s, r) => s + r.overallScore, 0) / allReviews.length;
    const avgSatisfaction = allReviews.reduce((s, r) => s + r.satisfactionScore, 0) / allReviews.length;
    const avgAttendance = allReviews.reduce((s, r) => s + r.attendanceScore, 0) / allReviews.length;
    await db.update(creators).set({
      heatScore: parseFloat(avgOverall.toFixed(1)),
      satisfactionScore: parseFloat(avgSatisfaction.toFixed(1)),
      attendanceRate: parseFloat(avgAttendance.toFixed(1))
    }).where((0, import_drizzle_orm.eq)(creators.id, id));
    res.status(201).json(row);
  });
  app2.get("/api/livers/:id/availability", async (req, res) => {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(liverAvailability).where((0, import_drizzle_orm.eq)(liverAvailability.liverId, id)).orderBy((0, import_drizzle_orm.asc)(liverAvailability.date), (0, import_drizzle_orm.asc)(liverAvailability.startTime));
    res.json(rows);
  });
  app2.post("/api/livers/:id/availability", async (req, res) => {
    const id = parseInt(req.params.id);
    const { date, startTime, endTime, maxSlots, note } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).json({ error: "\u65E5\u4ED8\u3068\u6642\u9593\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
    const [row] = await db.insert(liverAvailability).values({
      liverId: id,
      date,
      startTime,
      endTime,
      maxSlots: maxSlots ?? 3,
      bookedSlots: 0,
      note: note ?? ""
    }).returning();
    res.status(201).json(row);
  });
  app2.delete("/api/livers/:id/availability/:slotId", async (req, res) => {
    const slotId = parseInt(req.params.slotId);
    await db.delete(liverAvailability).where((0, import_drizzle_orm.eq)(liverAvailability.id, slotId));
    res.json({ ok: true });
  });
  app2.post("/api/seed", async (_req, res) => {
    const existingCreators = await db.select().from(creators);
    if (existingCreators.length >= 10) {
      return res.json({ ok: true, message: "Already seeded" });
    }
    const existingNames = new Set(existingCreators.map((c) => c.name));
    const demoCreators = [
      {
        name: "\u661F\u7A7A\u307F\u3086",
        community: "\u5730\u4E0B\u30A2\u30A4\u30C9\u30EB\u754C\u9688",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rank: 1,
        heatScore: 1090.1,
        totalViews: 185320,
        revenue: 173e3,
        streamCount: 34,
        followers: 48e3,
        revenueShare: 80,
        satisfactionScore: 4.5,
        attendanceRate: 4.3,
        bio: "\u5730\u4E0B\u30A2\u30A4\u30C9\u30EB\u754C\u9688\u306E\u30C8\u30C3\u30D7\u30E9\u30F3\u30AB\u30FC\u3002\u6B4C\u3068\u30C0\u30F3\u30B9\u3067\u6BCE\u56DE\u8996\u8074\u8005\u3092\u9B45\u4E86\u3059\u308B\u5B9F\u529B\u6D3E\u30E9\u30A4\u30D0\u30FC\u3002",
        category: "idol"
      },
      {
        name: "\u30B3\u30F3\u30D3\u82B8\u4EBA\u300C\u30C0\u30D6\u30EB\u30D1\u30F3\u30C1\u300D",
        community: "\u304A\u7B11\u3044\u82B8\u4EBA\u754C\u9688",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        rank: 2,
        heatScore: 923.5,
        totalViews: 172450,
        revenue: 119e3,
        streamCount: 45,
        followers: 92e3,
        revenueShare: 80,
        satisfactionScore: 4.2,
        attendanceRate: 4.1,
        bio: "\u304A\u7B11\u3044\u30B3\u30F3\u30D3\u3068\u3057\u3066\u6D3B\u52D5\u4E2D\u3002\u30E9\u30A4\u30D6\u914D\u4FE1\u3067\u3082\u606F\u306E\u5408\u3063\u305F\u30C8\u30FC\u30AF\u3067\u7B11\u3044\u3092\u5C4A\u3051\u307E\u3059\u3002",
        category: "idol"
      },
      {
        name: "\u9E97\u83EF -REIKA-",
        community: "\u30AD\u30E3\u30D0\u5B22\u30FB\u30DB\u30B9\u30C8\u754C\u9688",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop",
        rank: 3,
        heatScore: 1414,
        totalViews: 164800,
        revenue: 165e3,
        streamCount: 52,
        followers: 67e3,
        revenueShare: 80,
        satisfactionScore: 4.6,
        attendanceRate: 4.8,
        bio: "\u30AD\u30E3\u30D0\u5B22\xD7\u30E9\u30A4\u30D0\u30FC\u3068\u3057\u3066\u5927\u4EBA\u6C17\u3002\u30C8\u30FC\u30AF\u529B\u3068\u7F8E\u8C8C\u3067\u591A\u304F\u306E\u30D5\u30A1\u30F3\u3092\u7372\u5F97\u3002",
        category: "idol"
      },
      {
        name: "\u307E\u3044\u307E\u304417\u6B73",
        community: "JK\u65E5\u5E38\u754C\u9688",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        rank: 4,
        heatScore: 865.7,
        totalViews: 148900,
        revenue: 85500,
        streamCount: 68,
        followers: 52e3,
        revenueShare: 80,
        satisfactionScore: 4.3,
        attendanceRate: 4.5,
        bio: "JK\u306E\u30EA\u30A2\u30EB\u306A\u65E5\u5E38\u3092\u767A\u4FE1\u4E2D\u3002\u7D20\u6734\u3067\u89AA\u3057\u307F\u3084\u3059\u3044\u30AD\u30E3\u30E9\u304C\u4EBA\u6C17\u306E\u79D8\u5BC6\u3002",
        category: "idol"
      },
      {
        name: "\u685C\u4E95 \u307F\u306A\u307F",
        community: "\u30A2\u30A4\u30C9\u30EB\u90E8",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        rank: 1,
        heatScore: 4.8,
        totalViews: 125e3,
        revenue: 98e4,
        streamCount: 87,
        followers: 15200,
        revenueShare: 80,
        satisfactionScore: 4.9,
        attendanceRate: 4.7,
        bio: "\u6BCE\u65E5\u5143\u6C17\u306B\u914D\u4FE1\u4E2D\uFF01\u307F\u3093\u306A\u3068\u4E00\u7DD2\u306B\u697D\u3057\u3044\u6642\u9593\u3092\u904E\u3054\u3057\u305F\u3044\u3067\u3059\u266A",
        category: "idol"
      },
      {
        name: "\u7530\u4E2D \u3086\u3046\u304D",
        community: "\u82F1\u4F1A\u8A71\u30AF\u30E9\u30D6",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        rank: 2,
        heatScore: 4.6,
        totalViews: 89e3,
        revenue: 65e4,
        streamCount: 62,
        followers: 9800,
        revenueShare: 80,
        satisfactionScore: 4.7,
        attendanceRate: 4.5,
        bio: "TOEIC 990\u70B9\u53D6\u5F97\u3002\u30D3\u30B8\u30CD\u30B9\u82F1\u8A9E\u304B\u3089\u65E5\u5E38\u4F1A\u8A71\u307E\u3067\u4E01\u5BE7\u306B\u6559\u3048\u307E\u3059\uFF01",
        category: "english"
      },
      {
        name: "\u795E\u5D0E \u30EA\u30CA",
        community: "\u5360\u3044\u30B5\u30ED\u30F3",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        rank: 3,
        heatScore: 4.5,
        totalViews: 73e3,
        revenue: 52e4,
        streamCount: 45,
        followers: 7600,
        revenueShare: 80,
        satisfactionScore: 4.6,
        attendanceRate: 4.3,
        bio: "\u30BF\u30ED\u30C3\u30C8\u30FB\u897F\u6D0B\u5360\u661F\u8853\u30FB\u6570\u79D8\u8853\u3092\u7D44\u307F\u5408\u308F\u305B\u305F\u72EC\u81EA\u306E\u30EA\u30FC\u30C7\u30A3\u30F3\u30B0\u3067\u3001\u3042\u306A\u305F\u306E\u672A\u6765\u3092\u7167\u3089\u3057\u307E\u3059\u3002",
        category: "fortune"
      },
      {
        name: "\u677E\u672C \u3053\u3046\u305F",
        community: "\u30D5\u30A3\u30C3\u30C8\u30CD\u30B9\u90E8",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        rank: 4,
        heatScore: 4.3,
        totalViews: 58e3,
        revenue: 42e4,
        streamCount: 38,
        followers: 5400,
        revenueShare: 80,
        satisfactionScore: 4.4,
        attendanceRate: 4.8,
        bio: "\u5143\u30D7\u30ED\u30B5\u30C3\u30AB\u30FC\u9078\u624B\u3002\u30C0\u30A4\u30A8\u30C3\u30C8\u30FB\u7B4B\u30C8\u30EC\u30FB\u30E1\u30F3\u30BF\u30EB\u30B3\u30FC\u30C1\u30F3\u30B0\u3092\u5C02\u9580\u3068\u3059\u308B\u30D1\u30FC\u30BD\u30CA\u30EB\u30C8\u30EC\u30FC\u30CA\u30FC\u3002",
        category: "coaching"
      },
      {
        name: "\u4F0A\u85E4 \u3055\u3084\u304B",
        community: "\u30AB\u30A6\u30F3\u30BB\u30EA\u30F3\u30B0\u30EB\u30FC\u30E0",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        rank: 5,
        heatScore: 4.7,
        totalViews: 41e3,
        revenue: 38e4,
        streamCount: 29,
        followers: 4200,
        revenueShare: 80,
        satisfactionScore: 4.8,
        attendanceRate: 4.9,
        bio: "\u81E8\u5E8A\u5FC3\u7406\u58EB\u30FB\u516C\u8A8D\u5FC3\u7406\u5E2B\u3002\u60A9\u307F\u3092\u62B1\u3048\u305F\u65B9\u306E\u8A71\u3092\u4E01\u5BE7\u306B\u8074\u304D\u3001\u4E00\u7DD2\u306B\u89E3\u6C7A\u7B56\u3092\u63A2\u3057\u307E\u3059\u3002",
        category: "counselor"
      },
      {
        name: "\u4E2D\u6751 \u3042\u304A\u3044",
        community: "\u6599\u7406\u6559\u5BA4",
        avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=150&h=150&fit=crop",
        rank: 6,
        heatScore: 4.4,
        totalViews: 33e3,
        revenue: 29e4,
        streamCount: 24,
        followers: 3100,
        revenueShare: 80,
        satisfactionScore: 4.5,
        attendanceRate: 4.6,
        bio: "\u30D5\u30E9\u30F3\u30B9\u6599\u7406\u5B66\u6821\u5352\u696D\u3002\u5BB6\u5EAD\u3067\u672C\u683C\u7684\u306A\u30EC\u30B7\u30D4\u3092\u697D\u3057\u304F\u5B66\u3079\u308B\u6599\u7406\u6559\u5BA4\u3092\u958B\u50AC\u4E2D\u3002",
        category: "cooking"
      }
    ];
    const toInsert = demoCreators.filter((c) => !existingNames.has(c.name));
    if (toInsert.length === 0) {
      return res.json({ ok: true, message: "Already seeded" });
    }
    const insertedCreators = await db.insert(creators).values(toInsert).returning();
    const today = /* @__PURE__ */ new Date();
    const availData = [];
    for (const c of insertedCreators) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + d);
        const dateStr = dt.toISOString().slice(0, 10);
        availData.push({ liverId: c.id, date: dateStr, startTime: "19:00", endTime: "21:00", maxSlots: 3, bookedSlots: Math.floor(Math.random() * 2), note: "" });
        if (d % 2 === 0) {
          availData.push({ liverId: c.id, date: dateStr, startTime: "13:00", endTime: "15:00", maxSlots: 2, bookedSlots: 0, note: "\u5348\u5F8C\u306E\u90E8" });
        }
      }
    }
    await db.insert(liverAvailability).values(availData);
    const reviewAuthors = [
      { name: "\u3086\u304D", avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop" },
      { name: "\u305F\u304B\u3057", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop" },
      { name: "\u306F\u308B\u304B", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop" },
      { name: "\u3051\u3093\u3058", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop" }
    ];
    const comments = [
      "\u3068\u3066\u3082\u697D\u3057\u3044\u6642\u9593\u3067\u3057\u305F\uFF01\u307E\u305F\u4E88\u7D04\u3057\u305F\u3044\u3067\u3059\u3002",
      "\u4E01\u5BE7\u306A\u5BFE\u5FDC\u3067\u5927\u6E80\u8DB3\u3067\u3059\u3002\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u901A\u308A\u306B\u9032\u3093\u3067\u304F\u308C\u307E\u3057\u305F\u3002",
      "\u7D20\u6674\u3089\u3057\u3044\u914D\u4FE1\u3067\u3057\u305F\u3002\u307E\u305F\u53C2\u52A0\u3057\u305F\u3044\u3068\u601D\u3044\u307E\u3059\uFF01",
      "\u671F\u5F85\u4EE5\u4E0A\u306E\u5185\u5BB9\u3067\u3057\u305F\u3002\u6BCE\u56DE\u6765\u308B\u306E\u304C\u697D\u3057\u307F\u3067\u3059\u3002",
      "\u6642\u9593\u3092\u5B88\u3063\u3066\u304F\u308C\u3066\u4FE1\u983C\u3067\u304D\u307E\u3059\u3002\u6B21\u56DE\u3082\u4E88\u7D04\u3057\u307E\u3059\uFF01"
    ];
    const reviewData = [];
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
          sessionDate: dt.toISOString().slice(0, 10)
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
        const labels = ["\u30A2\u30A4\u30C9\u30EB", "\u82F1\u4F1A\u8A71", "\u5360\u3044", "\u30B3\u30FC\u30C1\u30F3\u30B0", "\u30AB\u30A6\u30F3\u30BB\u30E9\u30FC"];
        const prices = [3e3, 5e3, 4e3, 6e3, 4500];
        const cat = categories[i % categories.length];
        return {
          creator: c.name,
          category: cat,
          categoryLabel: labels[i % labels.length],
          title: `${c.name}\u3068\u306E1\u5BFE1\u30BB\u30C3\u30B7\u30E7\u30F3`,
          avatar: c.avatar,
          thumbnail: `https://images.unsplash.com/photo-151645036045${i}-9312f5e86fc7?w=400&h=250&fit=crop`,
          date: dt.toISOString().slice(0, 10),
          time: "19:00",
          duration: "30\u5206",
          price: prices[i % prices.length],
          spotsTotal: 5,
          spotsLeft: 2 + i,
          rating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)),
          reviewCount: 10 + i * 5,
          tag: i === 0 ? "\u4EBA\u6C17" : null
        };
      });
      await db.insert(bookingSessions).values(bookingData);
    }
    res.json({ ok: true, created: insertedCreators.length });
  });
  const httpServer = (0, import_node_http.createServer)(app2);
  return httpServer;
}

// server/index.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_http_proxy_middleware = require("http-proxy-middleware");
var app = (0, import_express.default)();
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
    import_express.default.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(import_express.default.urlencoded({ extended: false }));
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
    const expoProxy = (0, import_http_proxy_middleware.createProxyMiddleware)({
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
    const distPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      log(`Serving Expo web export from: ${distPath}`);
      app2.use(import_express.default.static(distPath));
      app2.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    } else {
      log("WARNING: dist/ directory not found. Run 'npx expo export --platform web' to build.");
      app2.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.status(404).send("Web app not built. Please run the build command.");
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
  app.get("/healthcheck", (_req, res) => res.status(200).send("OK"));
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
