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
  const [communityId, setCommunityId] = useState<number | null>(() =>
    parseCommunityId(pathname)
  );
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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
      setCommunityId(next);
      setDismissed(false);
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
      (query.state.data as JukeboxData)?.state?.isPlaying ? 3000 : false,
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

  // YouTube IFrame プレイヤー（Webのみ）
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!communityId) return;

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

    ensureYouTubeApi()
      .then((YT: any) => {
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
          youtubePlayerRef.current = new YT.Player(containerId, {
            videoId: state.currentVideoYoutubeId,
            playerVars: {
              autoplay: 1,
              mute: 1,
              rel: 0,
              controls: 1,
              disablekb: 0,
              playsinline: 1,
            },
            events: {
              onStateChange: (event: any) => {
                try {
                  const w = window as any;
                  if (event.data === w.YT?.PlayerState?.ENDED) {
                    handleNext();
                  }
                } catch {
                  // ignore
                }
              },
            },
          });
        }
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
  // 依存は currentVideoYoutubeId のみ。elapsedSecs/startedAt を入れると3秒ポーリングのたびに
  // プレイヤーが破棄・再作成され、再生が不安定になる
  }, [communityId, state?.currentVideoYoutubeId, handleNext]);

  if (!communityId || !state || dismissed) return null;

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

  return (
    <View pointerEvents="box-none" style={[styles.root, { left: 0, right: 0, top: 0, bottom: 0 }]}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          minimized ? styles.cardMinimized : styles.cardExpanded,
          { left: posX, top: posY },
        ]}
      >
        <Pressable
          style={styles.mainRow}
          onPress={() => setMinimized((v) => !v)}
        >
          <View style={styles.thumbWrap}>
            {Platform.OS === "web" && state.currentVideoYoutubeId ? (
              <View style={styles.youtubeContainer} nativeID={containerIdRef.current} />
            ) : state.currentVideoThumbnail ? (
              <Image
                source={{ uri: state.currentVideoThumbnail }}
                style={styles.thumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumb, { backgroundColor: C.surface3 }]} />
            )}
          </View>
          <View style={styles.info}>
            <Text
              style={styles.title}
              numberOfLines={minimized ? 1 : 2}
            >
              {state.currentVideoTitle ?? "同時視聴中の動画"}
            </Text>
            {!minimized && addedBy ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {addedBy} が選曲
              </Text>
            ) : null}
            {!minimized && (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.progressTime}>
                  {Math.floor(elapsed)}s
                </Text>
              </View>
            )}
          </View>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push(`/jukebox/${communityId}`)}
          >
            <Ionicons name="expand" size={16} color="#fff" />
          </Pressable>
          <Pressable
            style={styles.closeBtn}
            onPress={() => setDismissed(true)}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </Pressable>
        </Pressable>
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
});

