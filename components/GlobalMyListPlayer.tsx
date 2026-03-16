import React, { useEffect, useRef, useState } from "react";
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
import { C } from "@/constants/colors";
import { usePlayingVideo } from "@/lib/playing-video-context";

const CARD_W = 260;
const CARD_H = 72;

function useScreenSize() {
  const [size, setSize] = useState(() => Dimensions.get("window"));
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => setSize(window));
    return () => sub?.remove();
  }, []);
  return size;
}

export function GlobalMyListPlayer() {
  const { width: SCREEN_W, height: SCREEN_H } = useScreenSize();
  const pathname = usePathname();
  const { playing, stopPlaying } = usePlayingVideo();
  const [dismissed, setDismissed] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const youtubePlayerRef = useRef<any | null>(null);
  const containerIdRef = useRef<string>(`global-ml-${Math.random().toString(36).slice(2)}`).current;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isOnVideoPage = pathname?.match(/\/video\/(\d+)/) != null;
  const match = pathname?.match(/\/video\/(\d+)/);
  const currentVideoId = match ? parseInt(match[1], 10) : null;
  const isCurrentVideo = isOnVideoPage && playing && currentVideoId === playing.videoId;
  const defaultX = SCREEN_W - CARD_W - 16;
  const defaultY = SCREEN_H - CARD_H - 80;

  // YouTube IFrame（Web）
  useEffect(() => {
    if (Platform.OS !== "web" || !playing?.youtubeId) return;
    const vid = playing.youtubeId;
    let cancelled = false;

    function ensureYT(): Promise<any> {
      return new Promise((resolve) => {
        const w = window as any;
        if (w.YT?.Player) {
          resolve(w.YT);
          return;
        }
        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
          if (prev) prev();
          resolve(w.YT);
        };
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const s = document.createElement("script");
          s.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(s);
        }
      });
    }

    ensureYT().then((YT: any) => {
      if (cancelled) return;
      const el = document.getElementById(containerIdRef);
      if (!el) return;

      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.loadVideoById(vid);
        } catch {
          try {
            youtubePlayerRef.current.destroy();
          } catch {}
          youtubePlayerRef.current = null;
        }
      }

      if (!youtubePlayerRef.current) {
        youtubePlayerRef.current = new YT.Player(containerIdRef, {
          videoId: vid,
          playerVars: {
            autoplay: 1,
            rel: 0,
            controls: 1,
            playsinline: 1,
          },
          events: {
            onReady: (e: any) => {
              try {
                e.target?.unMute?.();
              } catch {}
            },
          },
        });
      }
    });

    return () => {
      cancelled = true;
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {}
        youtubePlayerRef.current = null;
      }
    };
  }, [playing?.youtubeId, containerIdRef]);

  // HTML5 video（videoUrl）
  useEffect(() => {
    if (Platform.OS !== "web" || !playing?.videoUrl) return;
    const el = document.getElementById(`ml-video-${containerIdRef}`) as HTMLVideoElement | null;
    if (el) {
      videoRef.current = el;
      el.src = playing.videoUrl;
      el.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
    };
  }, [playing?.videoUrl, containerIdRef]);

  if (!playing) return null;
  if (!playing.youtubeId && !playing.videoUrl) return null;

  const hasYoutube = !!playing.youtubeId;

  return (
    <View pointerEvents="box-none" style={[styles.root, StyleSheet.absoluteFill]}>
      {/* 単一プレイヤー要素（常にマウント、位置のみ変更で音切れ防止） */}
      <View
        style={[
          styles.playerShell,
          isCurrentVideo && styles.playerShellFull,
          !isCurrentVideo && !dismissed && [styles.playerShellMini, { left: defaultX + 10, top: defaultY + 8 }],
          !isCurrentVideo && dismissed && styles.playerShellHidden,
        ]}
        pointerEvents="none"
      >
        {Platform.OS === "web" && hasYoutube ? (
          <View style={styles.ytWrap} nativeID={containerIdRef} />
        ) : null}
        {Platform.OS === "web" && playing.videoUrl ? (
          <video
            id={`ml-video-${containerIdRef}`}
            src={playing.videoUrl}
            style={isCurrentVideo ? styles.fullVideoEl : styles.hiddenVideo}
            playsInline
            muted={false}
            controls={isCurrentVideo}
          />
        ) : null}
      </View>

      {isCurrentVideo && (
        <View style={[styles.fullOverlay, StyleSheet.absoluteFill]} pointerEvents="box-none">
          <Pressable style={styles.fullCloseBtn} onPress={() => stopPlaying()}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
      )}

      {!isCurrentVideo && (
        <>
          {dismissed ? (
            <Pressable style={[styles.fab, { right: 16, bottom: 80 }]} onPress={() => setDismissed(false)}>
              <Ionicons name="bookmark" size={20} color="#fff" />
              <Text style={styles.fabText}>マイリスト</Text>
            </Pressable>
          ) : (
            <View style={[styles.card, minimized ? styles.cardMinimized : styles.cardExpanded, { left: defaultX, top: defaultY }]}>
              <Pressable style={styles.mainRow} onPress={() => setMinimized((v) => !v)}>
                <View style={styles.thumbWrap}>
                  {hasYoutube ? (
                    <View style={styles.thumbPlaceholder} />
                  ) : playing.thumbnail ? (
                    <Image source={{ uri: playing.thumbnail }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: C.surface3 }]} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={minimized ? 1 : 2}>
                    {playing.title}
                  </Text>
                </View>
                <Pressable style={styles.iconBtn} onPress={() => router.push(`/video/${playing.videoId}`)}>
                  <Ionicons name="expand" size={16} color="#fff" />
                </Pressable>
                <Pressable style={styles.closeBtn} onPress={() => setDismissed(true)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", pointerEvents: "box-none" },
  playerShell: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 999,
  },
  playerShellFull: {
    left: "50%",
    top: "50%",
    width: "100%",
    maxWidth: 800,
    height: 450,
    marginLeft: -400,
    marginTop: -225,
  },
  playerShellMini: {
    width: 52,
    height: 52,
  },
  playerShellHidden: {
    left: -9999,
    top: 0,
    width: 320,
    height: 180,
    opacity: 0,
  },
  ytWrap: { width: "100%", height: "100%" },
  hiddenVideo: { position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 },
  fullVideoEl: { width: "100%", height: "100%", objectFit: "contain" },
  fullOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1001,
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: C.surface2,
  },
  fullCloseBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    borderRadius: 0,
    backgroundColor: "rgba(7,15,24,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  cardExpanded: { minWidth: 220, maxWidth: 320 },
  cardMinimized: { minWidth: 180, maxWidth: 260 },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 0,
    overflow: "hidden",
    marginRight: 8,
    backgroundColor: C.surface2,
  },
  youtubeContainer: { width: "100%", height: "100%" },
  thumb: { width: "100%", height: "100%" },
  info: { flex: 1 },
  title: { color: "#fff", fontSize: 12, fontWeight: "700" },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 0,
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
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
