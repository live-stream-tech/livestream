import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Dimensions,
} from "react-native";
import { usePathname, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
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
  // /jukebox/[id]
  const jb = pathname.match(/^\/jukebox\/(\d+)/);
  if (jb) return parseInt(jb[1], 10);
  // /community/[id]
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

export function GlobalJukeboxPlayer() {
  const { width: SCREEN_W, height: SCREEN_H } = useScreenSize();
  const pathname = usePathname();
  const { setJukeboxIsActive, playing: videoPlaying } = usePlayingVideo();
  const [communityId, setCommunityId] = useState<number | null>(() =>
    parseCommunityId(pathname)
  );
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(true); // デフォルト非表示、タップで表示
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const posRef = useRef({ x: 0, y: 0 });
  const dragBaseRef = useRef({ x: 0, y: 0 });
  const youtubePlayerRef = useRef<any | null>(null);
  const containerIdRef = useRef<string>(
    `global-jb-${Math.random().toString(36).slice(2)}`
  );

  const defaultX = SCREEN_W - CARD_W - 16;
  const defaultY = SCREEN_H - CARD_H - 80;
  const posX = position?.x ?? defaultX;
  const posY = position?.y ?? defaultY;
  posRef.current = { x: posX, y: posY };

  useEffect(() => {
    const next = parseCommunityId(pathname);
    if (next !== null) {
      const isJukebox = pathname?.match(/^\/jukebox\/\d+/) != null;
      setCommunityId((prev) => {
        if (isJukebox) return next;
        if (prev === null) return next;
        return prev;
      });
    }
  }, [pathname]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        dragBaseRef.current = { ...posRef.current };
      },
      onPanResponderMove: (_, g) => {
        const minX = 16;
        const minY = 60;
        const maxX = SCREEN_W - CARD_W - 16;
        const maxY = SCREEN_H - CARD_H - 80;
        const base = dragBaseRef.current;
        setPosition({
          x: Math.max(minX, Math.min(maxX, base.x + g.dx)),
          y: Math.max(minY, Math.min(maxY, base.y + g.dy)),
        });
      },
      onPanResponderRelease: (_, g) => {
        const minX = 16;
        const minY = 60;
        const maxX = SCREEN_W - CARD_W - 16;
        const maxY = SCREEN_H - CARD_H - 80;
        const base = dragBaseRef.current;
        const next = {
          x: Math.max(minX, Math.min(maxX, base.x + g.dx)),
          y: Math.max(minY, Math.min(maxY, base.y + g.dy)),
        };
        posRef.current = next;
        setPosition(next);
      },
    })
  ).current;

  const { data } = useQuery<JukeboxData>({
    queryKey: communityId ? [`/api/jukebox/${communityId}`] : ["jukebox:none"],
    enabled: !!communityId,
    refetchInterval: (query) =>
      (query.state.data as JukeboxData)?.state?.isPlaying ? 15000 : false,
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

  // YouTube IFrame プレイヤー（Webのみ）。jukebox ページでは NowPlaying が再生するため、ここでは作らない
  const isOnJukeboxPage = pathname?.match(/^\/jukebox\/\d+/) != null;

  // jukebox ページから離脱したらミニプレイヤーを自動表示（Spotify 風）
  const prevIsOnJukeboxPageRef = useRef(isOnJukeboxPage);
  useEffect(() => {
    const wasOnJukebox = prevIsOnJukeboxPageRef.current;
    prevIsOnJukeboxPageRef.current = isOnJukeboxPage;
    if (wasOnJukebox && !isOnJukeboxPage && state?.isPlaying) {
      setDismissed(false);
    }
  }, [isOnJukeboxPage, state?.isPlaying]);

  // jukeboxIsActive をコンテキストに反映（MyListPlayer との位置調整用）
  useEffect(() => {
    const isActive = !dismissed && !isOnJukeboxPage && !!state?.isPlaying;
    setJukeboxIsActive(isActive);
  }, [dismissed, isOnJukeboxPage, state?.isPlaying, setJukeboxIsActive]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!communityId) return;
    if (isOnJukeboxPage) return;

    // 再生対象がない場合はプレイヤー破棄
    if (!state?.currentVideoYoutubeId) {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {
          // ignore
        }
        youtubePlayerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    function ensureYouTubeApi(): Promise<any> {
      return new Promise((resolve) => {
        const w = window as any;
        if (w.YT && w.YT.Player) {
          resolve(w.YT);
          return;
        }

        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
          if (prev) prev();
          resolve(w.YT);
        };

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
      const startSeconds =
        state.elapsedSecs && state.elapsedSecs > 0
          ? state.elapsedSecs
          : Math.max(
              0,
              (Date.now() - new Date(state.startedAt).getTime()) / 1000
            );

      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.loadVideoById({
            videoId: state.currentVideoYoutubeId,
            startSeconds,
          });
        } catch {
          try {
            youtubePlayerRef.current.destroy();
          } catch {
            // ignore
          }
          youtubePlayerRef.current = null;
        }
      }

      if (!youtubePlayerRef.current) {
        const startSec = state.elapsedSecs && state.elapsedSecs > 0
          ? state.elapsedSecs
          : Math.max(0, (Date.now() - new Date(state.startedAt).getTime()) / 1000);
        youtubePlayerRef.current = new YT.Player(containerId, {
          videoId: state.currentVideoYoutubeId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            controls: 1,
            disablekb: 0,
            playsinline: 1,
            start: Math.floor(startSec),
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target?.unMute?.();
              } catch {
                // ignore
              }
            },
            onStateChange: (event: any) => {
              try {
                const w = window as any;
                if (event.data === w.YT?.PlayerState?.ENDED) {
                  handleNextRef.current();
                }
              } catch {
                // ignore
              }
            },
          },
        });
      }
    };

    ensureYouTubeApi()
      .then((YT: any) => {
        if (cancelled) return;
        const containerId = containerIdRef.current;
        if (!containerId) return;
        if (!document.getElementById(containerId)) {
          requestAnimationFrame(() => {
            if (cancelled) return;
            initPlayer(YT);
          });
          return;
        }
        initPlayer(YT);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {
          // ignore
        }
        youtubePlayerRef.current = null;
      }
    };
  // 依存は currentVideoYoutubeId のみ。handleNext を入れるとポーリングのたびにプレイヤー再作成→カクつき
  }, [communityId, state?.currentVideoYoutubeId, isOnJukeboxPage]);

  // コミュニティ/jukebox ページ以外では何も表示しない
  if (!communityId) return null;

  // 再生中でない場合は何も表示しない（jukebox ページで直接視聴）
  if (!state) return null;

  // jukebox ページ上は表示しない（ページ自体にプレイヤーがある）
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

  const addedBy =
    queue.find((q) => !q.isPlayed)?.addedBy ?? "";

  // dismissed 時: 隠しプレイヤーのみ維持（音声継続）
  if (dismissed) {
    return (
      <View pointerEvents="box-none" style={[styles.root, { left: 0, right: 0, top: 0, bottom: 0 }]}>
        {Platform.OS === "web" && state.currentVideoYoutubeId ? (
          <View
            style={{
              position: "absolute",
              width: 320,
              height: 180,
              opacity: 0,
              overflow: "hidden",
              left: -9999,
              top: 0,
            }}
            pointerEvents="none"
            nativeID={containerIdRef.current}
          />
        ) : null}
      </View>
    );
  }

  // Spotify 風画面下部固定バー
  return (
    <View pointerEvents="box-none" style={[styles.root, { left: 0, right: 0, top: 0, bottom: 0 }]}>
      {/* 音声継続用の隠しプレイヤーコンテナ */}
      {Platform.OS === "web" && state.currentVideoYoutubeId ? (
        <View
          style={{
            position: "absolute",
            width: 320,
            height: 180,
            opacity: 0,
            overflow: "hidden",
            left: -9999,
            top: 0,
          }}
          pointerEvents="none"
          nativeID={containerIdRef.current}
        />
      ) : null}

      {/* Spotify 風バー */}
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
            onPress={() => setDismissed(true)}
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
  card: {
    position: "absolute",
    borderRadius: 16,
    backgroundColor: "rgba(7,15,24,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  cardExpanded: {
    minWidth: 260,
    maxWidth: 360,
  },
  cardMinimized: {
    minWidth: 200,
    maxWidth: 260,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 8,
    backgroundColor: C.surface2,
  },
  youtubeContainer: {
    width: "100%",
    height: "100%",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.accent,
  },
  progressTime: {
    color: C.textMuted,
    fontSize: 9,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  fab: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(7,15,24,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  fabText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  // Spotify 風バースタイル
  bar: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 68, // タブバーの上（60px + マージン8px）
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
    flexShrink: 0,
  },
});

