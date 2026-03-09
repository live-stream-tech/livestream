/**
 * POST /api/auth/phone/verify — ログイン済みユーザー向け電話番号認証コード検証。
 * Vercel から Express API へフォワードする薄いラッパー。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp, normalizeReqUrl } from "../../_shared";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  normalizeReqUrl(req);
  const app = await getApp();
  app(req, res);
}

