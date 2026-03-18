/**
 * GET /api/auth/google-callback — Google OAuth コールバック。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp, normalizeReqUrl } from "../_shared";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  normalizeReqUrl(req);
  const app = await getApp();
  app(req, res);
}
