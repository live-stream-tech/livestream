/**
 * GET /api/healthcheck — ヘルスチェック用。Vercel で確実に応答するよう専用エントリを用意。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.status(200).send("OK");
}
