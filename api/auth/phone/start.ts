/**
 * POST /api/auth/phone/start — ログイン済みユーザー向け電話番号認証コード送信。
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

