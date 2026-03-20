import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn("[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. SSE pub/sub will be disabled.");
}

export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

/** ジュークボックスのSSEチャンネルキー */
export function jukeboxChannel(communityId: number): string {
  return `jukebox:${communityId}`;
}

/**
 * ジュークボックスのイベントをRedisに publish する。
 * Upstash Redis REST API は Pub/Sub をサポートしていないため、
 * List (LPUSH) + SSEポーリング方式を採用する。
 * - サーバーは LPUSH でイベントをリストに追加（最大100件保持）
 * - SSEエンドポイントはロングポーリングで BLPOP の代わりに定期的に LRANGE で読む
 */
export async function publishJukeboxEvent(
  communityId: number,
  event: JukeboxSSEEvent
): Promise<void> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return;
  try {
    const key = jukeboxChannel(communityId);
    const payload = JSON.stringify({ ...event, ts: Date.now() });
    // リストの先頭に追加（最新イベントが先頭）
    await redis.lpush(key, payload);
    // リストを最大100件に制限
    await redis.ltrim(key, 0, 99);
    // TTL 1時間（使われていないチャンネルの自動削除）
    await redis.expire(key, 3600);
  } catch (e) {
    console.error("[Redis] publishJukeboxEvent error:", e);
  }
}

export type JukeboxSSEEvent =
  | { type: "state_update"; data: Record<string, unknown> }
  | { type: "queue_update"; data: Record<string, unknown>[] }
  | { type: "chat"; data: Record<string, unknown> }
  | { type: "ping" };
