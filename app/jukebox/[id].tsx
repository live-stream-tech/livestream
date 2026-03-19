import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { C } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useAuth } from "@/lib/auth";
import { Linking } from "react-native";
import { getApiUrl } from "@/lib/query-client";
import { saveLoginReturn } from "@/lib/login-return";

type JukeboxState = {
  communityId: number;
  currentVideoTitle: string | null;
  currentVideoThumbnail: string | null;
  currentVideoDurationSecs: number;
  currentVideoYoutubeId?: string | null;
  startedAt: string;
  isPlaying: boolean;
  watchersCount: number;
  /** サーバーが計算した経過秒数（放送位置）。存在しない場合は startedAt から計算 */
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

type Video = {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  price?: number | null;
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      const idx = parts.indexOf("embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function fmtSecs(s: number): string {
  if (!s || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function calcProgress(startedAt: string, durationSecs: number): number {
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  if (durationSecs <= 0) return 0;
  return Math.min(elapsed / durationSecs, 1);
}

function NowPlaying({
  state,
  onNext,
}: {
  state: JukeboxState | null;
  onNext: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ytContainerId = useRef(`jukebox-yt-${Math.random().toString(36).slice(2)}`).current;
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  // Web: YouTube IFrame プレイヤー（メイン再生エリア）
  // コンテナを React 外で作成し、再レンダー時の iframe 破棄を防ぐ（カクつき対策）
  // 依存は currentVideoYoutubeId のみ。onNext を入れるとポーリングのたびにプレイヤー再作成→カクつき・音声途切れ
  useEffect(() => {
    if (Platform.OS !== "web" || !state?.currentVideoYoutubeId) return;
    const vid = state.currentVideoYoutubeId;
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
      const startSec = state.elapsedSecs && state.elapsedSecs > 0
        ? state.elapsedSecs
        : Math.max(0, (Date.now() - new Date(state.startedAt).getTime()) / 1000);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById({ videoId: vid, startSeconds: startSec });
        } catch {
          try { ytPlayerRef.current.destroy(); } catch {}
          ytPlayerRef.current = null;
        }
      }
      if (!ytPlayerRef.current) {
        const anchor = document.getElementById("jukebox-yt-holder");
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const container = document.createElement("div");
        container.id = ytContainerId;
        container.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;z-index:10;`;
        document.body.appendChild(container);
        ytContainerRef.current = container;

        const syncPosition = () => {
          const a = document.getElementById("jukebox-yt-holder");
          if (a && container.parentNode) {
            const r = a.getBoundingClientRect();
            container.style.left = `${r.left}px`;
            container.style.top = `${r.top}px`;
            container.style.width = `${r.width}px`;
            container.style.height = `${r.height}px`;
          }
        };
        window.addEventListener("resize", syncPosition);
        // スクロール時も位置を同期（resize だけではスクロールでずれる）
        window.addEventListener("scroll", syncPosition, true);
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncPosition) : null;
        ro?.observe(anchor);
        resizeCleanupRef.current = () => {
          window.removeEventListener("resize", syncPosition);
          window.removeEventListener("scroll", syncPosition, true);
          ro?.disconnect();
        };

        ytPlayerRef.current = new YT.Player(ytContainerId, {
          videoId: vid,
          playerVars: {
            autoplay: 1,
            rel: 0,
            controls: 1,
            playsinline: 1,
            start: Math.floor(startSec),
          },
          events: {
            onReady: (e: any) => {
              try {
                e.target?.unMute?.();
              } catch {}
            },
            onStateChange: (e: any) => {
              try {
                if (e.data === (window as any).YT?.PlayerState?.ENDED) onNextRef.current();
              } catch {}
            },
          },
        });
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
      const c = ytContainerRef.current;
      if (c && c.parentNode) c.parentNode.removeChild(c);
      ytContainerRef.current = null;
    };
  }, [state?.currentVideoYoutubeId, ytContainerId]);

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

  // LIVE ラベルのパルスアニメーション
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  if (!state) {
    return (
      <View style={styles.nowPlayingEmpty}>
        <Ionicons name="musical-notes-outline" size={40} color={C.textMuted} />
        <Text style={styles.emptyText}>再生中の動画はありません</Text>
      </View>
    );
  }

  const fallbackElapsed =
    typeof state.elapsedSecs === "number"
      ? state.elapsedSecs
      : (Date.now() - new Date(state.startedAt).getTime()) / 1000;
  const elapsed = Math.min(
    state.isPlaying ? (elapsedDisplay || fallbackElapsed) : fallbackElapsed,
    state.currentVideoDurationSecs
  );
  const progress =
    state.currentVideoDurationSecs > 0
      ? Math.min(elapsed / state.currentVideoDurationSecs, 1)
      : 0;

  const hasYoutube = !!state.currentVideoYoutubeId;

  return (
    <View style={styles.nowPlaying}>
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === "web" && hasYoutube ? (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]} nativeID="jukebox-yt-holder" />
        ) : state.currentVideoThumbnail ? (
          <Image
            source={{ uri: state.currentVideoThumbnail }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        ) : null}
        {!hasYoutube && <View style={styles.nowPlayingOverlay} />}
      </View>

      <View style={styles.nowPlayingTop}>
        <View style={styles.liveChip}>
          <Animated.View style={[styles.liveChipDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveChipText}>同時視聴中</Text>
        </View>
        <View style={styles.watchersChip}>
          <Ionicons name="people" size={12} color="#fff" />
          <Text style={styles.watchersText}>{state.watchersCount}</Text>
        </View>
      </View>

      <View style={styles.nowPlayingBottom}>
        {!hasYoutube && (
          <View style={styles.nowPlayingCenter}>
            <View style={styles.playIcon}>
              <Ionicons name="play" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
        )}

        <Text style={styles.nowPlayingTitle} numberOfLines={2}>
          {state.currentVideoTitle ?? ""}
        </Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressTime}>{fmtSecs(elapsed)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressTime}>{fmtSecs(state.currentVideoDurationSecs)}</Text>
        </View>

        <View style={styles.nextRow}>
          <Pressable style={styles.nextBtn} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={14} color={C.textMuted} />
            <Text style={styles.nextBtnText}>次へスキップ</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function QueueRow({
  items,
  state,
  onAdd,
}: {
  items: QueueItem[];
  state: JukeboxState | null;
  onAdd: () => void;
}) {
  // 再生済みを除外し、再生中の曲もキュー表示から除外（Now Playing と重複しないように）
  const upcoming = items.filter(
    (q) =>
      !q.isPlayed &&
      !(state?.currentVideoId != null && q.videoId === state.currentVideoId) &&
      !(state?.currentVideoYoutubeId && (q.youtubeId ?? null) === state.currentVideoYoutubeId)
  );
  return (
    <View style={styles.queueSection}>
      <View style={styles.queueHeader}>
        <Ionicons name="list" size={14} color={C.accent} />
        <Text style={styles.queueHeaderText}>UP NEXT</Text>
        <Text style={styles.queueCount}>{upcoming.length}件</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.queueScroll}
      >
        {upcoming.map((item) => (
          <View key={item.id} style={styles.queueItem}>
            <Image
              source={{ uri: item.videoThumbnail }}
              style={styles.queueThumb}
              contentFit="cover"
            />
            <View style={styles.queueItemOverlay} />
            <Text style={styles.queueItemTitle} numberOfLines={2}>
              {item.videoTitle}
            </Text>
            <View style={styles.queueItemByRow}>
              {item.addedByAvatar ? (
                <Image source={{ uri: item.addedByAvatar }} style={styles.queueItemAvatar} contentFit="cover" />
              ) : null}
              <Text style={styles.queueItemBy}>{item.addedBy}</Text>
            </View>
          </View>
        ))}
        <Pressable
          style={styles.addQueueBtn}
          onPress={onAdd}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="add" size={24} color={C.accent} />
          <Text style={styles.addQueueText}>動画を追加</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default function JukeboxScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const communityId = parseInt(id ?? "1");
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  const [chatInput, setChatInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState<
    { videoId: string; title: string; thumbnail: string }[]
  >([]);
  const [ytSearching, setYtSearching] = useState(false);
  const [ytPlaylists, setYtPlaylists] = useState<
    { id: string; title: string; thumbnail: string }[]
  >([]);
  const [ytPlaylistItems, setYtPlaylistItems] = useState<
    { videoId: string; title: string; thumbnail: string }[]
  >([]);
  const [ytPlaylistsLoading, setYtPlaylistsLoading] = useState(false);
  const [ytPlaylistsNeedGoogle, setYtPlaylistsNeedGoogle] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const jukeboxKey = [`/api/jukebox/${communityId}`] as const;

  const { data } = useQuery<JukeboxData>({
    queryKey: jukeboxKey,
    refetchInterval: (query) =>
      (query.state.data as JukeboxData)?.state?.isPlaying ? 5000 : 10000,
  });

  const { data: myVideos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos/my"],
    enabled: !!user,
  });

  const state = data?.state ?? null;
  const queue = data?.queue ?? [];
  const chat = data?.chat ?? [];

  const uploadedVideos: Video[] = myVideos;
  const purchasedVideos: Video[] = (myVideos as any[]).filter((v) => v.price && v.price > 0);

  const chatMutation = useMutation({
    mutationFn: (msg: string) =>
      apiRequest("POST", `/api/jukebox/${communityId}/chat`, {
        username: user?.name ?? "ゲスト",
        avatar:
          user?.avatar ??
          "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop",
        message: msg,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: jukeboxKey }),
  });

  const nextMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/jukebox/${communityId}/next`),
    onSuccess: () => qc.invalidateQueries({ queryKey: jukeboxKey }),
  });

  const addMutation = useMutation({
    mutationFn: (video: Video) =>
      apiRequest("POST", `/api/jukebox/${communityId}/add`, {
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnail,
        videoDurationSecs: 900,
        youtubeId: (video as any).youtubeId ?? null,
        addedBy: user?.name ?? "ゲスト",
        addedByAvatar:
          user?.avatar ??
          "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop",
      }),
    onSuccess: () => {
      setYtUrl("");
      setShowAddModal(false);
      qc.invalidateQueries({ queryKey: jukeboxKey });
    },
  });

  const handleAddYouTube = () => {
    const url = ytUrl.trim();
    if (!url) return;
    const idPart = extractYouTubeId(url);
    if (!idPart) {
      alert("有効なYouTubeのURLを入力してください");
      return;
    }
    const video: Video & { youtubeId: string } = {
      id: Math.floor(Math.random() * 2000000),
      title: "YouTube リクエスト",
      thumbnail: `https://img.youtube.com/vi/${idPart}/hqdefault.jpg`,
      duration: "0:00",
      category: "YouTube",
      price: null,
      youtubeId: idPart,
    };
    addMutation.mutate(video);
  };

  const handleSearchYouTube = async () => {
    const q = ytQuery.trim();
    if (!q || ytSearching) return;
    setYtSearching(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/youtube/search?q=${encodeURIComponent(q)}`,
      );
      const data = (await res.json()) as {
        videoId: string;
        title: string;
        thumbnail: string;
      }[];
      setYtResults(data);
    } catch (e: any) {
      alert("YouTube 検索に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setYtSearching(false);
    }
  };

  const sendChat = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput("");
    chatMutation.mutate(msg);
  }, [chatInput]);

  const handleNext = useCallback(() => {
    nextMutation.mutate();
  }, [nextMutation]);

  useEffect(() => {
    if (chat.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chat.length]);

  // プレイリスト取得（モーダル表示時・ログイン済み）
  useEffect(() => {
    if (!showAddModal || !user) {
      setYtPlaylists([]);
      setYtPlaylistsNeedGoogle(false);
      setSelectedPlaylistId(null);
      setYtPlaylistItems([]);
      return;
    }
    let cancelled = false;
    setYtPlaylistsLoading(true);
    setYtPlaylistsNeedGoogle(false);
    apiRequest("GET", "/api/youtube/playlists")
      .then((res) => res.json())
      .then((data: { id: string; title: string; thumbnail: string }[]) => {
        if (!cancelled) setYtPlaylists(Array.isArray(data) ? data : []);
      })
      .catch((e: any) => {
        if (!cancelled && (e?.status === 403 || e?.body)) {
          try {
            const parsed = e?.body ? JSON.parse(e.body) : {};
            if (parsed?.needsGoogleLogin) setYtPlaylistsNeedGoogle(true);
          } catch {}
        }
        if (!cancelled) setYtPlaylists([]);
      })
      .finally(() => {
        if (!cancelled) setYtPlaylistsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showAddModal, user?.id]);

  // プレイリスト内の動画取得
  useEffect(() => {
    if (!selectedPlaylistId || !user) {
      setYtPlaylistItems([]);
      return;
    }
    let cancelled = false;
    apiRequest("GET", `/api/youtube/playlists/${selectedPlaylistId}/items`)
      .then((res) => res.json())
      .then((data: { videoId: string; title: string; thumbnail: string }[]) => {
        if (!cancelled) setYtPlaylistItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setYtPlaylistItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPlaylistId, user?.id]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 8 }]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => state?.isPlaying ? setShowLeaveModal(true) : router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.jukeboxBadge}>
              <Ionicons name="musical-notes" size={11} color="#fff" />
              <Text style={styles.jukeboxBadgeText}>JUKEBOX</Text>
            </View>
            <Text style={styles.headerTitle}>コミュニティ同時視聴</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Now Playing */}
        <NowPlaying state={state} onNext={handleNext} />

        {/* Queue */}
        <QueueRow items={queue} state={state} onAdd={() => setShowAddModal(true)} />

        {/* Chat */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <Ionicons name="chatbubbles" size={14} color={C.accent} />
            <Text style={styles.chatHeaderText}>みんなのコメント</Text>
          </View>
          <FlatList
            ref={flatListRef}
            data={chat}
            keyExtractor={(item) => item.id.toString()}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.chatMsg, item.username === "あなた" && styles.chatMsgMine]}>
                {item.username !== "あなた" && (
                  item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.chatAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.chatAvatar, { backgroundColor: C.surface3, alignItems: "center", justifyContent: "center" }]}>
                      <Ionicons name="person" size={12} color={C.textMuted} />
                    </View>
                  )
                )}
                <View style={[styles.chatBubble, item.username === "あなた" && styles.chatBubbleMine]}>
                  {item.username !== "あなた" && (
                    <Text style={styles.chatUsername}>{item.username}</Text>
                  )}
                  <Text style={[styles.chatText, item.username === "あなた" && styles.chatTextMine]}>
                    {item.message}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: bottomInset + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="コメントを入力..."
            placeholderTextColor={C.textMuted}
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendChat}
            returnKeyType="send"
          />
          <Pressable style={[styles.sendBtn, !chatInput.trim() && styles.sendBtnDisabled]} onPress={sendChat}>
            <Ionicons name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Add Video Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <Pressable style={styles.modalBg} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Jukeboxに動画を追加</Text>

            {/* YouTube 検索 */}
            <View style={styles.ytInputSection}>
              <Text style={styles.ytLabel}>YouTube で検索</Text>
              <View style={styles.ytRow}>
                <TextInput
                  style={styles.ytInput}
                  placeholder="曲名・チャンネル名などで検索"
                  placeholderTextColor={C.textMuted}
                  value={ytQuery}
                  onChangeText={setYtQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  style={[
                    styles.ytSearchButton,
                    (ytSearching || !ytQuery.trim()) && styles.ytSearchButtonDisabled,
                  ]}
                  onPress={handleSearchYouTube}
                  disabled={ytSearching || !ytQuery.trim()}
                >
                  <Ionicons name="search" size={16} color="#fff" />
                  <Text style={styles.ytSearchButtonText}>
                    {ytSearching ? "検索中..." : "検索"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* YouTube URL input（直接貼り付けたい人向け） */}
            <View style={styles.ytInputSection}>
              <Text style={styles.ytLabel}>YouTube のURLから追加</Text>
              <View style={styles.ytRow}>
                <TextInput
                  style={styles.ytInput}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={C.textMuted}
                  value={ytUrl}
                  onChangeText={setYtUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  style={[styles.ytAddButton, !ytUrl.trim() && styles.ytAddButtonDisabled]}
                  onPress={handleAddYouTube}
                  disabled={!ytUrl.trim()}
                >
                  <Ionicons name="logo-youtube" size={16} color="#fff" />
                  <Text style={styles.ytAddButtonText}>このURLで追加</Text>
                </Pressable>
              </View>
            </View>

            {/* 自分のプレイリスト */}
            {user && (
              <View style={styles.ytInputSection}>
                <Text style={styles.ytLabel}>自分のプレイリスト（Googleログイン）</Text>
                {ytPlaylistsNeedGoogle ? (
                  <Pressable
                    style={styles.ytPlaylistLoginHint}
                    onPress={() => {
                      if (Platform.OS === "web" && typeof window !== "undefined") {
                        const returnTo = window.location.pathname + window.location.search;
                        saveLoginReturn(returnTo);
                        const url = new URL("/api/auth/google", getApiUrl()).toString();
                        (window.top || window).location.replace(url);
                      } else {
                        router.push("/auth/login");
                      }
                    }}
                  >
                    <Ionicons name="logo-youtube" size={18} color="#FF0000" />
                    <Text style={styles.ytPlaylistLoginText}>
                      Googleでログインするとプレイリストを表示
                    </Text>
                  </Pressable>
                ) : ytPlaylistsLoading ? (
                  <Text style={styles.ytPlaylistLoading}>読み込み中...</Text>
                ) : selectedPlaylistId ? (
                  <View>
                    <Pressable
                      style={styles.ytPlaylistBack}
                      onPress={() => setSelectedPlaylistId(null)}
                    >
                      <Ionicons name="chevron-back" size={16} color={C.accent} />
                      <Text style={styles.ytPlaylistBackText}>プレイリスト一覧へ</Text>
                    </Pressable>
                    <ScrollView style={styles.ytPlaylistItemsScroll} showsVerticalScrollIndicator={false}>
                    {ytPlaylistItems.map((item) => {
                      const video: Video & { youtubeId: string } = {
                        id: Math.floor(Math.random() * 2000000),
                        title: item.title,
                        thumbnail: item.thumbnail,
                        duration: "0:00",
                        category: "YouTube",
                        price: null,
                        youtubeId: item.videoId,
                      };
                      return (
                        <Pressable
                          key={item.videoId}
                          style={styles.modalItem}
                          onPress={() => addMutation.mutate(video)}
                        >
                          <Image source={{ uri: item.thumbnail }} style={styles.modalThumb} contentFit="cover" />
                          <View style={styles.modalItemInfo}>
                            <Text style={styles.modalItemTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={styles.modalItemMeta}>
                              <Ionicons name="list" size={12} color={C.accent} />
                              <Text style={styles.modalItemMetaText}>プレイリストから追加</Text>
                            </View>
                          </View>
                          <Ionicons name="add-circle" size={24} color={C.accent} />
                        </Pressable>
                      );
                    })}
                    </ScrollView>
                  </View>
                ) : ytPlaylists.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ytPlaylistRow}>
                    {ytPlaylists.map((pl) => (
                      <Pressable
                        key={pl.id}
                        style={styles.ytPlaylistChip}
                        onPress={() => setSelectedPlaylistId(pl.id)}
                      >
                        {pl.thumbnail ? (
                          <Image source={{ uri: pl.thumbnail }} style={styles.ytPlaylistChipThumb} contentFit="cover" />
                        ) : (
                          <View style={[styles.ytPlaylistChipThumb, { backgroundColor: C.surface3 }]} />
                        )}
                        <Text style={styles.ytPlaylistChipTitle} numberOfLines={2}>{pl.title}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.ytPlaylistEmpty}>プレイリストがありません</Text>
                )}
              </View>
            )}

            {/* List */}
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {/* YouTube 検索結果 */}
              {ytResults.length > 0 && (
                <>
                  <Text style={styles.modalSubtitle}>YouTube 検索結果</Text>
                  {ytResults.map((r) => {
                    const video: Video & { youtubeId: string } = {
                      id: Math.floor(Math.random() * 2000000),
                      title: r.title,
                      thumbnail: r.thumbnail,
                      duration: "0:00",
                      category: "YouTube",
                      price: null,
                      youtubeId: r.videoId,
                    };
                    return (
                      <Pressable
                        key={r.videoId}
                        style={styles.modalItem}
                        onPress={() => addMutation.mutate(video)}
                      >
                        <Image
                          source={{ uri: r.thumbnail }}
                          style={styles.modalThumb}
                          contentFit="cover"
                        />
                        <View style={styles.modalItemInfo}>
                          <Text style={styles.modalItemTitle} numberOfLines={2}>
                            {r.title}
                          </Text>
                          <View style={styles.modalItemMeta}>
                            <Ionicons name="logo-youtube" size={12} color="#FF0000" />
                            <Text style={styles.modalItemMetaText}>
                              YouTube から追加
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="add-circle" size={24} color={C.accent} />
                      </Pressable>
                    );
                  })}
                </>
              )}

              {/* Purchased videos */}
              <Text style={styles.modalSubtitle}>自分の購入済み動画</Text>
              {purchasedVideos.length === 0 && (
                <Text style={styles.emptyPurchasedText}>まだ購入済み動画がありません</Text>
              )}
              {purchasedVideos.map((video) => (
                <Pressable
                  key={video.id}
                  style={styles.modalItem}
                  onPress={() => addMutation.mutate(video)}
                >
                  <Image source={{ uri: video.thumbnail }} style={styles.modalThumb} contentFit="cover" />
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemTitle} numberOfLines={2}>{video.title}</Text>
                    <View style={styles.modalItemMeta}>
                      <Ionicons name="checkmark-circle" size={12} color={C.green} />
                      <Text style={styles.modalItemMetaText}>
                        購入済み動画 · ¥{video.price?.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="add-circle" size={24} color={C.accent} />
                </Pressable>
              ))}

              {/* Uploaded videos */}
              {uploadedVideos.length > 0 && (
                <>
                  <Text style={styles.modalSubtitle}>自分がアップした動画</Text>
                  {uploadedVideos.map((video) => (
                    <Pressable
                      key={`u-${video.id}`}
                      style={styles.modalItem}
                      onPress={() => addMutation.mutate(video)}
                    >
                      <Image source={{ uri: video.thumbnail }} style={styles.modalThumb} contentFit="cover" />
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemTitle} numberOfLines={2}>{video.title}</Text>
                        <View style={styles.modalItemMeta}>
                          <Ionicons name="person-circle" size={12} color={C.accent} />
                          <Text style={styles.modalItemMetaText}>
                            自分の投稿 · {video.price ? `¥${video.price.toLocaleString()}` : "無料"}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="add-circle" size={24} color={C.accent} />
                    </Pressable>
                  ))}
                </>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ページ離脱確認モーダル */}
      <Modal visible={showLeaveModal} animationType="fade" transparent>
        <View style={styles.leaveModalBg}>
          <View style={styles.leaveModalCard}>
            <View style={styles.leaveModalIconRow}>
              <Ionicons name="musical-notes" size={28} color={C.accent} />
            </View>
            <Text style={styles.leaveModalTitle}>再生中です</Text>
            <Text style={styles.leaveModalMsg}>
              ページを移動しても再生を続けますか？{"\n"}
              画面下部にミニプレイヤーが表示されます。
            </Text>
            <View style={styles.leaveModalBtns}>
              <Pressable
                style={[styles.leaveModalBtn, styles.leaveModalBtnSecondary]}
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
              >
                <Text style={styles.leaveModalBtnSecondaryText}>停止して移動</Text>
              </Pressable>
              <Pressable
                style={[styles.leaveModalBtn, styles.leaveModalBtnPrimary]}
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
              >
                <Ionicons name="play" size={14} color={C.bg} />
                <Text style={styles.leaveModalBtnPrimaryText}>続けて再生</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", gap: 2 },
  jukeboxBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  jukeboxBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  headerTitle: { color: C.textSec, fontSize: 12 },

  nowPlaying: {
    height: 200,
    position: "relative",
    overflow: "hidden",
    justifyContent: "space-between",
  },
  nowPlayingEmpty: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    gap: 8,
  },
  emptyText: { color: C.textMuted, fontSize: 13 },
  nowPlayingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,18,28,0.55)",
  },
  nowPlayingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveChipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.live,
  },
  liveChipText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  watchersChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  watchersText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  nowPlayingCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  nowPlayingBottom: {
    padding: 12,
    gap: 6,
  },
  nowPlayingTitle: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 19 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTime: { color: "rgba(255,255,255,0.6)", fontSize: 10, width: 32 },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    position: "relative",
    overflow: "visible",
  },
  progressFill: {
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: C.accent,
    marginLeft: -5,
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextBtnText: { color: C.textMuted, fontSize: 11 },

  queueSection: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  queueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  queueHeaderText: { color: C.accent, fontSize: 11, fontWeight: "800", flex: 1 },
  queueCount: { color: C.textMuted, fontSize: 11 },
  queueScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  queueItem: {
    width: 110,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: C.surface,
  },
  queueThumb: { ...StyleSheet.absoluteFillObject as any },
  queueItemOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(10,18,28,0.5)",
  },
  queueItemTitle: {
    position: "absolute",
    bottom: 18,
    left: 6,
    right: 6,
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 13,
  },
  queueItemByRow: {
    position: "absolute",
    bottom: 5,
    left: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  queueItemAvatar: { width: 12, height: 12, borderRadius: 6 },
  queueItemBy: { color: "rgba(255,255,255,0.6)", fontSize: 9 },
  addQueueBtn: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.accent + "66",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addQueueText: { color: C.accent, fontSize: 10, fontWeight: "600" },

  chatSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  chatHeaderText: { color: C.accent, fontSize: 11, fontWeight: "700" },
  chatList: { flex: 1 },
  chatListContent: { paddingHorizontal: 12, gap: 8, paddingVertical: 6 },
  chatMsg: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    maxWidth: "85%",
  },
  chatMsgMine: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  chatAvatar: { width: 24, height: 24, borderRadius: 12, flexShrink: 0 },
  chatBubble: {
    backgroundColor: C.surface2,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 1,
  },
  chatBubbleMine: {
    backgroundColor: C.accentDark,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
  },
  chatUsername: { color: C.accent, fontSize: 10, fontWeight: "700" },
  chatText: { color: C.text, fontSize: 13, lineHeight: 18 },
  chatTextMine: { color: "#fff" },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: C.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: C.surface2 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: Platform.OS === "web" ? 560 : "65%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: C.textSec,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 12,
  },
  ytInputSection: {
    marginBottom: 8,
    gap: 6,
  },
  ytLabel: {
    color: C.textSec,
    fontSize: 12,
  },
  ytRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ytInput: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: C.text,
    fontSize: 12,
  },
  ytAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ff0000",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ytAddButtonDisabled: {
    opacity: 0.4,
  },
  ytAddButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  ytSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ytSearchButtonDisabled: {
    opacity: 0.4,
  },
  ytSearchButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalThumb: { width: 64, height: 40, borderRadius: 6 },
  modalItemInfo: { flex: 1, gap: 3 },
  modalItemTitle: { color: C.text, fontSize: 13, fontWeight: "600", lineHeight: 17 },
  modalItemMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  modalItemMetaText: { color: C.textMuted, fontSize: 11 },
  emptyPurchasedText: {
    color: C.textMuted,
    fontSize: 12,
    paddingVertical: 8,
  },
  ytPlaylistLoginHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,0,0,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.3)",
  },
  ytPlaylistLoginText: { color: C.text, fontSize: 12 },
  ytPlaylistLoading: { color: C.textMuted, fontSize: 12, paddingVertical: 8 },
  ytPlaylistBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ytPlaylistBackText: { color: C.accent, fontSize: 12 },
  ytPlaylistItemsScroll: { maxHeight: 200 },
  ytPlaylistRow: { marginBottom: 8 },
  ytPlaylistChip: {
    width: 100,
    marginRight: 8,
    backgroundColor: C.surface2,
    borderRadius: 8,
    overflow: "hidden",
  },
  ytPlaylistChipThumb: { width: "100%", height: 56, borderRadius: 6 },
  ytPlaylistChipTitle: {
    color: C.text,
    fontSize: 11,
    padding: 6,
    marginTop: 2,
  },
  ytPlaylistEmpty: { color: C.textMuted, fontSize: 12, paddingVertical: 8 },
  leaveModalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  leaveModalCard: {
    backgroundColor: C.surface2,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    gap: 12,
  },
  leaveModalIconRow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,255,204,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  leaveModalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  leaveModalMsg: {
    color: C.textSec,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  leaveModalBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    width: "100%",
  },
  leaveModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  leaveModalBtnPrimary: {
    backgroundColor: C.accent,
  },
  leaveModalBtnSecondary: {
    backgroundColor: C.surface3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  leaveModalBtnPrimaryText: {
    color: C.bg,
    fontSize: 14,
    fontWeight: "700",
  },
  leaveModalBtnSecondaryText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "600",
  },
});
