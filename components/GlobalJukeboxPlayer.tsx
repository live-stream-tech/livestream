import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { usePathname, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { usePlayingVideo } from "@/lib/playing-video-context";

type JukeboxState = {
  communityId: number;
  currentVideoTitle: string | null;
  currentVideoThumbnail: string | null;
  currentVideoDurationSecs: number;
  currentVideoYoutubeId?: string | null;
  startedAt: string;
  isPlaying: boolean;
  watchersCount: number;
  elapsedSecs?: number;
};

type QueueItem = {
  id: number;
  videoTitle: string;
  videoThumbnail: string;
  videoDurationSecs: number;
  youtubeId?: string | null;
  addedBy: string;
  addedByAvatar: string | null;
  isPlayed: boolean;
};

type ChatMsg = {
  id: number;
  username: string;
  avatar: string | null;
  message: string;
  createdAt: string;
};

type JukeboxData = {
  state: JukeboxState | null;
  queue: QueueItem[];
  chat: ChatMsg[];
};

function parseCommunityId(pathname: string | null): number | null {
  if (!pathname) return null;
  const jb = pathname.match(/^\/jukebox\/(\d+)/);
  if (jb) return parseInt(jb[1], 10);
  const cm = pathname.match(/^\/community\/(\d+)/);
  if (cm) return parseInt(cm[1], 10);
  return null;
}

const CARD_W = 280;
const CARD_H = 72;

function useScreenSize() {
  const [size, setSize] = useState(() => Dimensions.get("window"));
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => setSize(window));
    return () => sub?.remove();
  }, []);
  return size;
}

// ============================================================
// GlobalJukeboxPlayer
// 役割: 音声マスター（常に left:-9999px に固定）
// 映像表示は jukebox/[id].tsx の映像専用IFrameが担当
// ============================================================
export function GlobalJukeboxPlayer() {
  const { width: SCREEN_W, height: SCREEN_H } = useScreenSize();
  const pathname = usePathname();
  const { setJukeboxIsActive, ytPlayerRef: youtubePlayerRef } = usePlayingVideo();
  const [communityId, setCommunityId] = useState<number | null>(() =>
    parseCommunityId(pathname)
  );
  const [dismissed, setDismissed] = useState(true);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);

  // IFrame コンテナ（document.body に常駐・常に left:-9999px 固定）
  const containerIdRef = useRef<string>(
    `global-jb-${Math.random().toString(36).slice(2)}`
  );
  const ytBodyContainerRef = useRef<HTMLDivElement | null>(null);
  const ytSyncCleanupRef = useRef<(() => void) | null>(null);

  const isOnJukeboxPage = pathname?.match(/^\/jukebox\/\d+/) != null;

  // ============================================================
  // IFrame コンテナは常に left:-9999px 固定（音声専用・画面外）
  // ============================================================
  const AUDIO_CONTAINER_STYLE =
    "position:fixed;display:block;left:-9999px;top:0;width:320px;height:180px;z-index:0;pointer-events:none;";

  useEffect(() => {
    const next = parseCommunityId(pathname);
    if (next !== null) {
      const isJukebox = pathname?.match(/^\/jukebox\/\d+/) != null;
      setCommunityId((prev) => {
        if (isJukebox && prev !== null && prev !== next) {
          // 別の部屋に入室 → 前の部屋のYouTubeプレイヤーを停止して切り替え
          if (Platform.OS === 'web' && youtubePlayerRef.current) {
            try { youtubePlayerRef.current.stopVideo(); } catch {}
            try { youtubePlayerRef.current.destroy(); } catch {}
            youtubePlayerRef.current = null;
          }
          setDismissed(true);
          return next;
        }
        if (isJukebox) return next;
        if (prev === null) return next;
        return prev;
      });
    }
  }, [pathname]);

  const qc = useQueryClient();

  // SSE でリアルタイム更新（Web のみ、jukebox ページ以外で接続）
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!communityId) return;
    if (isOnJukeboxPage) return; // jukebox ページ自体が SSE を持つため重複接続しない

    const baseUrl = getApiUrl().replace(/\/$/, "");
    const sseUrl = `${baseUrl}/api/jukebox/${communityId}/stream`;
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;
    let retryCount = 0;
    const connect = () => {
      if (closed) return;
      es = new EventSource(sseUrl);
      es.addEventListener("state_update", (e: MessageEvent) => {
        try {
          retryCount = 0;
          const payload = JSON.parse(e.data) as { data: JukeboxState };
          qc.setQueryData<JukeboxData>([`/api/jukebox/${communityId}`], (prev) =>
            prev ? { ...prev, state: payload.data } : prev
          );
        } catch {}
      });
      es.addEventListener("queue_update", (e: MessageEvent) => {
        try {
          retryCount = 0;
          const payload = JSON.parse(e.data) as { data: QueueItem[] };
          qc.setQueryData<JukeboxData>([`/api/jukebox/${communityId}`], (prev) =>
            prev ? { ...prev, queue: payload.data } : prev
          );
        } catch {}
      });
      es.onerror = () => {
        es?.close();
        if (!closed) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          retryCount++;
          retryTimer = setTimeout(connect, delay);
        }
      };
    };

    connect();
    return () => {
      closed = true;
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [communityId, isOnJukeboxPage]);

  const { data } = useQuery<JukeboxData>({
    queryKey: communityId ? [`/api/jukebox/${communityId}`] : ["jukebox:none"],
    enabled: !!communityId,
    staleTime: 0,
    refetchInterval: (query) =>
      (query.state.data as JukeboxData)?.state?.isPlaying ? 10000 : 30000,
  });

  const nextMutation = useMutation({
    mutationFn: async () => {
      if (!communityId) return;
      await apiRequest("POST", `/api/jukebox/${communityId}/next`);
    },
  });

  const state = data?.state ?? null;
  const queue = data?.queue ?? [];

  // 表示用の経過時間を1秒ごとに更新（再生中のみ）
  useEffect(() => {
    if (!state) return;
    const calcElapsed = () => {
      const base =
        !state.isPlaying && typeof state.elapsedSecs === "number"
          ? state.elapsedSecs
          : (Date.now() - new Date(state.startedAt).getTime()) / 1000;
      return Math.min(base, state.currentVideoDurationSecs);
    };
    setElapsedDisplay(calcElapsed());
    if (state.isPlaying) {
      const iv = setInterval(() => setElapsedDisplay(calcElapsed()), 1000);
      return () => clearInterval(iv);
    }
  }, [
    state?.isPlaying,
    state?.startedAt,
    state?.currentVideoDurationSecs,
    state?.currentVideoYoutubeId,
    state?.elapsedSecs,
  ]);

  const handleNext = useCallback(() => {
    nextMutation.mutate();
  }, [nextMutation]);
  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // jukebox ページから離脱したらミニプレイヤーを自動表示
  const hasVisitedJukeboxRef = useRef(isOnJukeboxPage);
  const prevIsOnJukeboxPageRef = useRef(isOnJukeboxPage);
  useEffect(() => {
    if (isOnJukeboxPage) hasVisitedJukeboxRef.current = true;
    const wasOnJukebox = prevIsOnJukeboxPageRef.current;
    prevIsOnJukeboxPageRef.current = isOnJukeboxPage;
    if (wasOnJukebox && !isOnJukeboxPage && state?.isPlaying) {
      setDismissed(false);
    }
  }, [isOnJukeboxPage, state?.isPlaying]);

  // 再生終了 → ミニプレイヤーを隠す
  const prevIsPlayingRef = useRef(state?.isPlaying);
  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = state?.isPlaying;
    if (wasPlaying && !state?.isPlaying && !state?.currentVideoTitle) {
      setDismissed(true);
    }
  }, [state?.isPlaying, state?.currentVideoTitle]);

  // jukeboxIsActive をコンテキストに反映
  useEffect(() => {
    const isActive = !dismissed && !isOnJukeboxPage && !!state?.isPlaying;
    setJukeboxIsActive(isActive);
  }, [dismissed, isOnJukeboxPage, state?.isPlaying, setJukeboxIsActive]);

  // ============================================================
  // 音声専用 IFrame 生成・管理（document.body に常駐・常に left:-9999px）
  // ============================================================
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!communityId) return;
    if (!state?.currentVideoYoutubeId) {
      if (youtubePlayerRef.current) {
        try { youtubePlayerRef.current.destroy(); } catch { /* ignore */ }
        youtubePlayerRef.current = null;
      }
      if (ytBodyContainerRef.current) {
        ytSyncCleanupRef.current?.();
        ytSyncCleanupRef.current = null;
        ytBodyContainerRef.current.remove();
        ytBodyContainerRef.current = null;
      }
      return;
    }

    // コンテナが未作成なら document.body に追加（常に left:-9999px 固定）
    if (!ytBodyContainerRef.current) {
      const container = document.createElement("div");
      container.id = containerIdRef.current;
      container.style.cssText = AUDIO_CONTAINER_STYLE;
      document.body.appendChild(container);
      ytBodyContainerRef.current = container;
    }

    let cancelled = false;
    function ensureYouTubeApi(): Promise<any> {
      return new Promise((resolve) => {
        const w = window as any;
        if (w.YT && w.YT.Player) { resolve(w.YT); return; }
        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(w.YT); };
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }
      });
    }

    const initPlayer = (YT: any) => {
      if (cancelled) return;
      const containerId = containerIdRef.current;
      if (!containerId) return;
      const startSec = state.elapsedSecs && state.elapsedSecs > 0
        ? state.elapsedSecs
        : Math.max(0, (Date.now() - new Date(state.startedAt).getTime()) / 1000);

      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.loadVideoById({
            videoId: state.currentVideoYoutubeId,
            startSeconds: startSec,
          });
          youtubePlayerRef.current.unMute?.();
          youtubePlayerRef.current.setVolume?.(100);
          youtubePlayerRef.current.playVideo?.();
        } catch {
          try { youtubePlayerRef.current.destroy(); } catch { /* ignore */ }
          youtubePlayerRef.current = null;
        }
      }

      if (!youtubePlayerRef.current) {
        youtubePlayerRef.current = new YT.Player(containerId, {
          videoId: state.currentVideoYoutubeId,
          width: 320,
          height: 180,
          playerVars: {
            autoplay: 1,
            rel: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            start: Math.floor(startSec),
            mute: 0, // 音声マスター: ミュートなし
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target?.unMute?.();
                event.target?.setVolume?.(100);
                event.target?.playVideo?.();
                // videoDurationSecs が未設定の場合、実際の動画長をサーバーに反映
                const actualDuration = event.target?.getDuration?.();
                if (actualDuration && actualDuration > 0 && state.currentVideoDurationSecs <= 0) {
                  apiRequest("PATCH", `/api/jukebox/${communityId}/duration`, {
                    durationSecs: Math.floor(actualDuration),
                  }).catch(() => {});
                }
              } catch { /* ignore */ }
            },
            onStateChange: (event: any) => {
              try {
                const w = window as any;
                if (event.data === w.YT?.PlayerState?.ENDED) {
                  handleNextRef.current();
                }
              } catch { /* ignore */ }
            },
          },
        });
      }
    };

    ensureYouTubeApi()
      .then((YT: any) => {
        if (cancelled) return;
        initPlayer(YT);
      })
      .catch(() => { /* ignore */ });

    return () => { cancelled = true; };
  }, [communityId, state?.currentVideoYoutubeId]);

  // GlobalJukeboxPlayer アンマウント時にコンテナを破棄
  useEffect(() => {
    return () => {
      if (Platform.OS !== "web") return;
      ytSyncCleanupRef.current?.();
      ytSyncCleanupRef.current = null;
      if (youtubePlayerRef.current) {
        try { youtubePlayerRef.current.destroy(); } catch { /* ignore */ }
        youtubePlayerRef.current = null;
      }
      if (ytBodyContainerRef.current) {
        ytBodyContainerRef.current.remove();
        ytBodyContainerRef.current = null;
      }
    };
  }, []);

  // コミュニティ/jukebox ページ以外では何も表示しない
  if (!communityId) return null;
  if (!state) return null;

  // jukebox ページ上は JSX を返さない（映像は jukebox/[id].tsx の専用IFrameが担当）
  if (isOnJukeboxPage) {
    return null;
  }

  const fallbackElapsed =
    typeof state.elapsedSecs === "number"
      ? state.elapsedSecs
      : (Date.now() - new Date(state.startedAt).getTime()) / 1000;
  const elapsed = state.isPlaying ? (elapsedDisplay || fallbackElapsed) : fallbackElapsed;
  const progress =
    state.currentVideoDurationSecs > 0
      ? Math.min(elapsed / state.currentVideoDurationSecs, 1)
      : 0;

  const addedBy = queue.find((q) => !q.isPlayed)?.addedBy ?? "";

  if (dismissed) {
    return null;
  }

  // Spotify 風画面下部固定バー
  return (
    <View pointerEvents="box-none" style={[styles.root, { left: 0, right: 0, top: 0, bottom: 0 }]}>
      <View style={styles.bar}>
        {/* プログレスバー（バー上部） */}
        <View style={styles.barProgress}>
          <View style={[styles.barProgressFill, { width: `${progress * 100}%` as any }]} />
        </View>

        <View style={styles.barRow}>
          {/* サムネイル */}
          <Pressable
            style={styles.barThumbWrap}
            onPress={() => router.push(`/jukebox/${communityId}`)}
          >
            {state.currentVideoThumbnail ? (
              <Image
                source={{ uri: state.currentVideoThumbnail }}
                style={styles.barThumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.barThumb, { backgroundColor: C.surface3 }]}>
                <Ionicons name="musical-notes" size={16} color={C.accent} />
              </View>
            )}
          </Pressable>

          {/* タイトル・情報 */}
          <Pressable
            style={styles.barInfo}
            onPress={() => router.push(`/jukebox/${communityId}`)}
          >
            <Text style={styles.barTitle} numberOfLines={1}>
              {state.currentVideoTitle ?? "同時視聴中"}
            </Text>
            {addedBy ? (
              <Text style={styles.barSubtitle} numberOfLines={1}>
                {addedBy} が選曲
              </Text>
            ) : null}
          </Pressable>

          {/* ジュークボックスページへのリンク */}
          <Pressable
            style={styles.barIconBtn}
            onPress={() => router.push(`/jukebox/${communityId}`)}
          >
            <Ionicons name="musical-notes" size={18} color={C.accent} />
          </Pressable>

          {/* 閉じる */}
          <Pressable
            style={styles.barIconBtn}
            onPress={() => {
              if (Platform.OS === "web") {
                if (youtubePlayerRef.current) {
                  try { youtubePlayerRef.current.stopVideo?.(); } catch {}
                  try { youtubePlayerRef.current.destroy?.(); } catch {}
                  youtubePlayerRef.current = null;
                }
                if (ytBodyContainerRef.current) {
                  ytSyncCleanupRef.current?.();
                  ytSyncCleanupRef.current = null;
                  ytBodyContainerRef.current.remove();
                  ytBodyContainerRef.current = null;
                }
              }
              setDismissed(true);
            }}
          >
            <Ionicons name="close" size={18} color={C.textSec} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    right: 16,
    bottom: 16,
    left: 16,
    pointerEvents: "box-none",
  },
  bar: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 68,
    backgroundColor: "rgba(18,18,18,0.97)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 20,
    overflow: "hidden",
  },
  barProgress: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  barProgressFill: {
    height: "100%",
    backgroundColor: C.accent,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  barThumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  barThumb: {
    width: "100%",
    height: "100%",
  },
  barInfo: {
    flex: 1,
    gap: 2,
  },
  barTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  barSubtitle: {
    color: C.textMuted,
    fontSize: 11,
  },
  barIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
