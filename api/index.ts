/**
 * /api へのリクエストを Express API に転送する。
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { getApp, normalizeReqUrl } from "./_shared";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  normalizeReqUrl(req);
  const app = await getApp();
  app(req, res);
}
