import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  members: integer("members").notNull().default(0),
  thumbnail: text("thumbnail").notNull(),
  online: boolean("online").notNull().default(false),
  category: text("category").notNull(),
});

export const videos = pgTable("videos", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creator: text("creator").notNull(),
  community: text("community").notNull(),
  viewers: integer("viewers").notNull().default(0),
  thumbnail: text("thumbnail").notNull(),
  avatar: text("avatar").notNull(),
  timeAgo: text("time_ago").notNull(),
  isLive: boolean("is_live").notNull().default(true),
});

export const creators = pgTable("creators", {
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
  revenueShare: integer("revenue_share").notNull().default(80),
  satisfactionScore: real("satisfaction_score").notNull().default(0),
  attendanceRate: real("attendance_rate").notNull().default(0),
  bio: text("bio").notNull().default(""),
  category: text("category").notNull().default("idol"),
});

export const bookingSessions = pgTable("booking_sessions", {
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
  rating: real("rating").notNull().default(5.0),
  reviewCount: integer("review_count").notNull().default(0),
  tag: text("tag"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  amount: integer("amount"),
  avatar: text("avatar"),
  thumbnail: text("thumbnail"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  timeAgo: text("time_ago").notNull(),
});

export const liveStreamChat = pgTable("live_stream_chat", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  message: text("message").notNull(),
  isGift: boolean("is_gift").default(false),
  giftAmount: integer("gift_amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dmConversationMessages = pgTable("dm_conversation_messages", {
  id: serial("id").primaryKey(),
  dmId: integer("dm_id").notNull(),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jukeboxState = pgTable("jukebox_state", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().unique(),
  currentVideoId: integer("current_video_id"),
  currentVideoTitle: text("current_video_title"),
  currentVideoThumbnail: text("current_video_thumbnail"),
  currentVideoDurationSecs: integer("current_video_duration_secs").default(0),
  // YouTubeなど外部動画のID（任意）
  currentVideoYoutubeId: text("current_video_youtube_id"),
  startedAt: timestamp("started_at").defaultNow(),
  isPlaying: boolean("is_playing").default(true),
  watchersCount: integer("watchers_count").default(1),
});

export const jukeboxQueue = pgTable("jukebox_queue", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  videoId: integer("video_id"),
  videoTitle: text("video_title").notNull(),
  videoThumbnail: text("video_thumbnail").notNull(),
  videoDurationSecs: integer("video_duration_secs").default(0),
  youtubeId: text("youtube_id"),
  addedBy: text("added_by").notNull().default("あなた"),
  addedByAvatar: text("added_by_avatar"),
  position: integer("position").notNull().default(0),
  isPlayed: boolean("is_played").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jukeboxChat = pgTable("jukebox_chat", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dmMessages = pgTable("dm_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  lastMessage: text("last_message").notNull(),
  time: text("time").notNull(),
  unread: integer("unread").notNull().default(0),
  online: boolean("online").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userAccounts = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("ユーザー"),
  bio: text("bio").notNull().default(""),
  avatar: text("avatar"),
  lineId: text("line_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest-001"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  revenueShare: integer("revenue_share").notNull().default(80),
  netAmount: integer("net_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest-001"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  bankName: text("bank_name").notNull(),
  bankBranch: text("bank_branch").notNull(),
  accountType: text("account_type").notNull().default("普通"),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  note: text("note"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const twoshotBookings = pgTable("twoshot_bookings", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const liverReviews = pgTable("liver_reviews", {
  id: serial("id").primaryKey(),
  liverId: integer("liver_id").notNull(),
  userId: text("user_id").notNull().default("guest"),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  satisfactionScore: integer("satisfaction_score").notNull().default(5),
  streamCountScore: integer("stream_count_score").notNull().default(5),
  attendanceScore: integer("attendance_score").notNull().default(5),
  overallScore: real("overall_score").notNull().default(5.0),
  comment: text("comment").notNull().default(""),
  sessionDate: text("session_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liverAvailability = pgTable("liver_availability", {
  id: serial("id").primaryKey(),
  liverId: integer("liver_id").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  maxSlots: integer("max_slots").notNull().default(3),
  bookedSlots: integer("booked_slots").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
