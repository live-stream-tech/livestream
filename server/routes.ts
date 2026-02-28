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
} from "./schema";
import { eq, asc, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // ── Video single ──────────────────────────────────────────────────
  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return res.status(404).json({ error: "Not found" });
    res.json(video);
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

  const httpServer = createServer(app);
  return httpServer;
}
