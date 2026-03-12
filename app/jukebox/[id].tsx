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

  // Web: YouTube IFrame プレイヤー（メイン再生エリア）
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
        ytPlayerRef.current = new YT.Player(ytContainerId, {
          videoId: vid,
          playerVars: {
            autoplay: 1,
            mute: 1,
            rel: 0,
            controls: 1,
            playsinline: 1,
          },
          events: {
            onStateChange: (e: any) => {
              try {
                if (e.data === (window as any).YT?.PlayerState?.ENDED) onNext();
              } catch {}
            },
          },
        });
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  // 依存は currentVideoYoutubeId のみ。elapsedSecs/startedAt を入れると3秒ポーリングのたびに
  // プレイヤーが破棄・再作成され、再生が不安定になる
  }, [state?.currentVideoYoutubeId, onNext, ytContainerId]);

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

  const elapsedSource =
    typeof state.elapsedSecs === "number"
      ? state.elapsedSecs
      : (Date.now() - new Date(state.startedAt).getTime()) / 1000;
  const elapsed = Math.min(elapsedSource, state.currentVideoDurationSecs);
  const progress =
    state.currentVideoDurationSecs > 0
      ? Math.min(elapsed / state.currentVideoDurationSecs, 1)
      : 0;

  const hasYoutube = !!state.currentVideoYoutubeId;

  return (
    <View style={styles.nowPlaying}>
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === "web" && hasYoutube ? (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]} nativeID={ytContainerId} />
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

        <Pressable style={styles.nextBtn} onPress={onNext}>
          <Ionicons name="play-skip-forward" size={14} color={C.textMuted} />
          <Text style={styles.nextBtnText}>次へスキップ</Text>
        </Pressable>
      </View>
    </View>
  );
}

function QueueRow({
  items,
  onAdd,
}: {
  items: QueueItem[];
  onAdd: () => void;
}) {
  const upcoming = items.filter((q) => !q.isPlayed);
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
        <Pressable style={styles.addQueueBtn} onPress={onAdd}>
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

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const jukeboxKey = [`/api/jukebox/${communityId}`] as const;

  const { data } = useQuery<JukeboxData>({
    queryKey: jukeboxKey,
    refetchInterval: 3000,
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
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
        <QueueRow items={queue} onAdd={() => setShowAddModal(true)} />

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
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
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
    maxHeight: "75%",
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
  modalList: {},
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
});
