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
