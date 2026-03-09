/**
 * POST /api/auth/phone/login/verify — 未ログインユーザー向け電話番号＋コードログイン。
 * Vercel から Express API へフォワードする薄いラッパー。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp, normalizeReqUrl } from "../../../../_shared";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  normalizeReqUrl(req);
  const app = await getApp();
  app(req, res);
}

