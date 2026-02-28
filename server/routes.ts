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

  const httpServer = createServer(app);
  return httpServer;
}
