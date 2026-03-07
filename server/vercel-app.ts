/**
 * Vercel Serverless 用の API 専用 Express アプリ。
 * 静的配信・Expo プロキシは含めず、/api ルートのみを提供する。
 */
import "dotenv/config";
import express from "express";
import {
  setupCors,
  setupBodyParsing,
  setupRequestLogging,
  setupErrorHandler,
} from "./middleware";
import { registerRoutes } from "./routes";

export async function createApiApp(): Promise<express.Express> {
  const app = express();

  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  app.get("/healthcheck", (_req, res) => res.status(200).send("OK"));

  await registerRoutes(app);
  setupErrorHandler(app);

  return app;
}
