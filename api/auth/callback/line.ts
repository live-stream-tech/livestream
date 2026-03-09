/**
 * GET /api/auth/callback/line — LINE OAuth コールバック。
 * Vercel でこのパスが確実に存在するように明示的なエントリを用意。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp, normalizeReqUrl } from "../../_shared";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  normalizeReqUrl(req);
  const app = await getApp();
  app(req, res);
}
