import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { COMMUNITIES, VIDEOS } from "@/constants/data";
import { apiRequest } from "@/lib/query-client";

type AdData = { title: string; sub: string; cta: string; bg: string; accent: string; thumb: string };

const COMMUNITY_ADS: Record<string, AdData> = {
  "地下アイドル": {
    title: "チェキ撮影会 開催中！",
    sub: "3/15 渋谷WWW • 先着50名限定",
    cta: "予約する",
    bg: "#2a0a18",
    accent: "#FF4081",
    thumb: "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=120&h=80&fit=crop",
  },
  "キャバ": {
    title: "VIPナイトイベント開催",
    sub: "今月限定 特別ご招待プラン",
    cta: "詳細を見る",
    bg: "#1a0830",
    accent: "#CE93D8",
    thumb: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=120&h=80&fit=crop",
  },
  "VTuber": {
    title: "3Dライブ配信チケット",
    sub: "4/1 超次元ライブ • 先行販売中",
    cta: "購入する",
    bg: "#08122a",
    accent: "#29B6CF",
    thumb: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=80&fit=crop",
  },
  "インフル": {
    title: "コラボ限定グッズ販売",
    sub: "今だけ送料無料 • 数量限定品",
    cta: "ショップへ",
    bg: "#0a1f10",
    accent: "#69F0AE",
    thumb: "https://images.unsplash.com/photo-1522682078546-47888fe04e81?w=120&h=80&fit=crop",
  },
  "アニソン": {
    title: "アニソンフェス2026",
    sub: "5/3 幕張メッセ • S席好評発売",
    cta: "チケット",
    bg: "#1a0828",
    accent: "#E040FB",
    thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=80&fit=crop",
  },
};

const DEFAULT_AD: AdData = {
  title: "プレミアム配信チケット発売中",
  sub: "今すぐ購入で会員10%OFF",
  cta: "購入する",
  bg: "#0a1520",
  accent: C.accent,
  thumb: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=80&fit=crop",
};

function getAd(name: string): AdData {
  const key = Object.keys(COMMUNITY_ADS).find((k) => name.includes(k));
  return key ? COMMUNITY_ADS[key] : DEFAULT_AD;
}

type BoardPost = {
  id: string;
  type: "event" | "live" | "notice";
  tag: string;
  title: string;
  detail: string;
  date: string;
  icon: string;
  color: string;
};

const BOARD_POSTS: BoardPost[] = [
  {
    id: "bd1",
    type: "live",
    tag: "ライブ告知",
    title: "ワンマンライブ 先行チケット開始",
    detail: "4/20（土）Zepp Tokyo • OPEN 17:00 / START 18:00",
    date: "3/3",
    icon: "musical-notes",
    color: C.accent,
  },
  {
    id: "bd2",
    type: "event",
    tag: "イベント",
    title: "チェキ＆握手会 参加者募集",
    detail: "3/22（土）渋谷WWW • 定員50名 先着順",
    date: "3/2",
    icon: "camera",
    color: "#FF4081",
  },
  {
    id: "bd3",
    type: "notice",
    tag: "お知らせ",
    title: "コミュニティメンバー限定 配信スケジュール",
    detail: "毎週木曜 22:00〜 メンバー向けトーク配信を予定",
    date: "3/1",
    icon: "megaphone",
    color: C.orange,
  },
  {
    id: "bd4",
    type: "live",
    tag: "生配信",
    title: "アニバーサリーライブ配信",
    detail: "3/30（日）21:00〜 コミュニティ限定アーカイブあり",
    date: "2/28",
    icon: "radio",
    color: "#29B6CF",
  },
  {
    id: "bd5",
    type: "event",
    tag: "オフ会",
    title: "春のオフ会 企画中！参加者募集",
    detail: "4/5（土）新宿 • 参加費無料",
    date: "2/26",
    icon: "people",
    color: C.green,
  },
];

type JukeboxState = {
  communityId: number;
  currentVideoTitle: string | null;
  currentVideoThumbnail: string | null;
  currentVideoDurationSecs: number;
  startedAt: string;
  isPlaying: boolean;
  watchersCount: number;
};

type QueueItem = {
  id: number;
  videoTitle: string;
  videoThumbnail: string;
  videoDurationSecs: number;
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

type VideoEditor = {
  id: number;
  name: string;
  avatar: string;
  bio: string;
  communityId: number;
  genres: string;
  deliveryDays: number;
  priceType: "per_minute" | "revenue_share";
  pricePerMinute: number | null;
  revenueSharePercent: number | null;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
};

function calcProgress(startedAt: string, durationSecs: number): number {
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  if (durationSecs <= 0) return 0;
  return Math.min(elapsed / durationSecs, 1);
}

function fmtSecs(s: number): string {
  if (!s || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EmbeddedJukebox({ communityId }: { communityId: number }) {
  const qc = useQueryClient();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(0);

  const { data } = useQuery<JukeboxData>({
    queryKey: [`/api/jukebox/${communityId}`],
    refetchInterval: 5000,
  });

  const state = data?.state ?? null;
  const queue = data?.queue ?? [];
  const chat = (data?.chat ?? []).slice(-3);
  const upcoming = queue.filter((q) => !q.isPlayed);

  useEffect(() => {
    if (!state?.isPlaying) return;
    const iv = setInterval(() => {
      setProgress(calcProgress(state.startedAt, state.currentVideoDurationSecs));
    }, 1000);
    return () => clearInterval(iv);
  }, [state?.startedAt, state?.currentVideoDurationSecs, state?.isPlaying]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const chatMutation = useMutation({
    mutationFn: (msg: string) =>
      apiRequest("POST", `/api/jukebox/${communityId}/chat`, {
        username: "あなた",
        avatar: null,
        message: msg,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/jukebox/${communityId}`] }),
  });

  const sendComment = useCallback(() => {
    const msg = comment.trim();
    if (!msg) return;
    setComment("");
    chatMutation.mutate(msg);
  }, [comment]);

  const addedByItem = upcoming[0];

  return (
    <View style={jukeStyles.container}>
      <View style={jukeStyles.header}>
        <View style={jukeStyles.badge}>
          <Animated.View style={[jukeStyles.badgeDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={jukeStyles.badgeText}>JUKEBOX</Text>
        </View>
        <View style={jukeStyles.watchersChip}>
          <Ionicons name="people" size={11} color="rgba(255,255,255,0.7)" />
          <Text style={jukeStyles.watchersText}>{state?.watchersCount ?? 0}人視聴中</Text>
        </View>
        <Pressable style={jukeStyles.fullBtn} onPress={() => router.push(`/jukebox/${communityId}`)}>
          <Ionicons name="expand" size={13} color={C.textMuted} />
        </Pressable>
      </View>

      {state ? (
        <View style={jukeStyles.playerRow}>
          <View style={jukeStyles.thumbWrap}>
            {state.currentVideoThumbnail ? (
              <Image source={{ uri: state.currentVideoThumbnail }} style={jukeStyles.thumb} contentFit="cover" />
            ) : (
              <View style={[jukeStyles.thumb, { backgroundColor: C.surface3 }]} />
            )}
            <View style={jukeStyles.thumbOverlay} />
            <View style={jukeStyles.playCircle}>
              <Ionicons name="play" size={14} color="#fff" />
            </View>
          </View>
          <View style={jukeStyles.playerInfo}>
            <Text style={jukeStyles.nowPlayingTitle} numberOfLines={2}>
              {state.currentVideoTitle}
            </Text>
            {addedByItem && (
              <Text style={jukeStyles.addedBy} numberOfLines={1}>
                {addedByItem.addedBy} が選んだ
              </Text>
            )}
            <View style={jukeStyles.progressRow}>
              <View style={jukeStyles.progressTrack}>
                <View style={[jukeStyles.progressFill, { width: `${progress * 100}%` as any }]} />
              </View>
              <Text style={jukeStyles.progressTime}>
                {fmtSecs(state.currentVideoDurationSecs)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={jukeStyles.emptyPlayer}>
          <Ionicons name="musical-notes-outline" size={24} color={C.textMuted} />
          <Text style={jukeStyles.emptyText}>再生中の動画なし</Text>
        </View>
      )}

      {chat.length > 0 && (
        <View style={jukeStyles.commentsWrap}>
          {chat.map((msg) => (
            <View key={msg.id} style={jukeStyles.commentRow}>
              <Text style={jukeStyles.commentUser}>{msg.username}</Text>
              <Text style={jukeStyles.commentText} numberOfLines={1}>{msg.message}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={jukeStyles.commentInput}>
        <TextInput
          style={jukeStyles.input}
          placeholder="コメント（保存されません）"
          placeholderTextColor={C.textMuted}
          value={comment}
          onChangeText={setComment}
          onSubmitEditing={sendComment}
          returnKeyType="send"
        />
        <Pressable
          style={[jukeStyles.sendBtn, !comment.trim() && jukeStyles.sendBtnDisabled]}
          onPress={sendComment}
        >
          <Ionicons name="send" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const TABS = ["新着順", "動画編集クリエイター", "掲示板"] as const;
type Tab = typeof TABS[number];

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("新着順");
  const [following, setFollowing] = useState(false);
  const [requestEditor, setRequestEditor] = useState<VideoEditor | null>(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestPriceType, setRequestPriceType] = useState<"per_minute" | "revenue_share">("per_minute");
  const [requestBudget, setRequestBudget] = useState("");
  const [requestDeadline, setRequestDeadline] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  const community = COMMUNITIES.find((c) => c.id === id) ?? COMMUNITIES[0];
  const communityId = parseInt(community.id);
  const ad = getAd(community.name);

  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const { data: editors = [], isLoading: editorsLoading } = useQuery<VideoEditor[]>({
    queryKey: [`/api/communities/${communityId}/editors`],
  });

  const topEditors = [...editors].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const openRequestModal = (editor: VideoEditor) => {
    setRequestEditor(editor);
    setRequestTitle("");
    setRequestDescription("");
    setRequestPriceType("per_minute");
    setRequestBudget("");
    setRequestDeadline("");
  };

  const closeRequestModal = () => {
    if (sendingRequest) return;
    setRequestEditor(null);
  };

  const handleSendRequest = async () => {
    if (!requestEditor) return;
    const title = requestTitle.trim();
    const description = requestDescription.trim();
    if (!title || !description) {
      Alert.alert("エラー", "依頼タイトルと内容を入力してください。");
      return;
    }

    const budgetNumber = requestBudget ? Number(requestBudget.replace(/[^0-9]/g, "")) : undefined;

    setSendingRequest(true);
    try {
      await apiRequest("POST", `/api/editors/${requestEditor.id}/request`, {
        requesterName: "ゲストユーザー",
        title,
        description,
        priceType: requestPriceType,
        budget: budgetNumber,
        deadline: requestDeadline.trim() || undefined,
      });
      Alert.alert("送信完了", "依頼を送りました！");
      setRequestEditor(null);
    } catch (e: any) {
      console.error(e);
      Alert.alert("エラー", "依頼の送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: community.thumbnail }} style={styles.coverImage} contentFit="cover" />
          <View style={styles.coverOverlay} />
          <Pressable
            style={[styles.backBtn, { top: (Platform.OS === "web" ? 67 : insets.top) + 12 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </View>

        <Pressable activeOpacity={0.85} style={[styles.adBanner, { backgroundColor: ad.bg }]}>
          <View style={styles.adPrBadge}>
            <Text style={styles.adPrText}>PR</Text>
          </View>
          <Image source={{ uri: ad.thumb }} style={styles.adThumb} contentFit="cover" />
          <View style={styles.adBody}>
            <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
            <Text style={styles.adSub} numberOfLines={1}>{ad.sub}</Text>
          </View>
          <View style={[styles.adCtaBtn, { backgroundColor: ad.accent }]}>
            <Text style={styles.adCtaText}>{ad.cta}</Text>
          </View>
        </Pressable>

        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.communityAvatarContainer}>
              <Image source={{ uri: community.thumbnail }} style={styles.communityAvatar} contentFit="cover" />
              {community.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.communityName}>{community.name}</Text>
                <View style={styles.officialBadge}>
                  <Text style={styles.officialText}>OFFICIAL</Text>
                </View>
              </View>
              <Text style={styles.categoryText}>{community.category}</Text>
            </View>
          </View>

          <Text style={styles.description}>ライブとチェキで繋がる{community.name}応援コミュニティ</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{(community.members / 1000).toFixed(0)}千</Text>
              {" "}フォロワー
            </Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>2</Text>
              {" "}クリエイター
            </Text>
          </View>

          <Pressable
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={() => setFollowing(!following)}
          >
            <Ionicons
              name={following ? "checkmark" : "add"}
              size={16}
              color={following ? C.textSec : "#fff"}
            />
            <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
              {following ? "フォロー中" : "フォローする"}
            </Text>
          </Pressable>
        </View>

        {/* Jukebox CTA */}
        <Pressable
          style={styles.jukeboxCta}
          onPress={() => router.push(`/jukebox/${communityId}`)}
        >
          <View style={styles.jukeboxCtaLeft}>
            <View style={styles.jukeboxCtaBadge}>
              <Ionicons name="musical-notes" size={14} color="#fff" />
              <Text style={styles.jukeboxCtaBadgeText}>JUKEBOX</Text>
            </View>
            <Text style={styles.jukeboxCtaTitle} numberOfLines={2}>
              このコミュニティで同時視聴をはじめる
            </Text>
            <Text style={styles.jukeboxCtaSub} numberOfLines={1}>
              YouTubeや投稿動画をキューに追加
            </Text>
          </View>
          <View style={styles.jukeboxCtaRight}>
            <Ionicons name="play-circle" size={26} color="#fff" />
          </View>
        </Pressable>

        <EmbeddedJukebox communityId={communityId} />

        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "新着順" && (
          <View>
            <View style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Ionicons name="videocam" size={18} color={C.accent} />
                <Text style={styles.requestTitle}>動画投稿を依頼する</Text>
              </View>
              <Text style={styles.requestDesc}>
                プロの編集者に依頼して、あなたの活動をハイクオリティな動画としてコミュニティに届けましょう。
              </Text>
              <View style={styles.requestActions}>
                <Pressable style={styles.requestPrimaryBtn}>
                  <Text style={styles.requestPrimaryText}>依頼を作成</Text>
                </Pressable>
                <Pressable style={styles.requestSecondaryBtn}>
                  <Text style={styles.requestSecondaryText}>編集者リスト</Text>
                </Pressable>
              </View>
            </View>

            {VIDEOS.slice(0, 4).map((video) => (
              <Pressable key={video.id} style={styles.postCard} onPress={() => router.push(`/video/${video.id}`)}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: video.avatar }} style={styles.postAvatar} contentFit="cover" />
                  <View style={styles.postMeta}>
                    <Text style={styles.postCreator}>{video.creator}</Text>
                    <Text style={styles.postTime}>{video.timeAgo}</Text>
                  </View>
                  {video.price && (
                    <View style={styles.pricePill}>
                      <Text style={styles.pricePillText}>¥{video.price}</Text>
                    </View>
                  )}
                </View>
                <Image source={{ uri: video.thumbnail }} style={styles.postImage} contentFit="cover" />
                <Text style={styles.postTitle} numberOfLines={1}>{video.title}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === "動画編集クリエイター" && (
          <View style={styles.editorTab}>
            {/* ランキング（上位3名） */}
            <Text style={styles.editorSectionTitle}>ランキング</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.editorRankingScroll}
            >
              {topEditors.map((editor, index) => {
                const mainGenre = editor.genres.split(",")[0]?.trim() || "マルチジャンル";
                return (
                  <Pressable
                    key={editor.id}
                    style={styles.editorRankCard}
                    onPress={() => openRequestModal(editor)}
                  >
                    <View style={styles.editorRankBadge}>
                      <Text style={styles.editorRankBadgeText}>#{index + 1}</Text>
                    </View>
                    <Image source={{ uri: editor.avatar }} style={styles.editorRankAvatar} contentFit="cover" />
                    <Text style={styles.editorRankName} numberOfLines={1}>{editor.name}</Text>
                    <View style={styles.editorRatingRow}>
                      <Ionicons name="star" size={12} color={C.orange} />
                      <Text style={styles.editorRatingText}>{editor.rating.toFixed(1)}</Text>
                      <Text style={styles.editorReviewText}>({editor.reviewCount})</Text>
                    </View>
                    <Text style={styles.editorGenreText} numberOfLines={1}>{mainGenre}</Text>
                    <View style={[styles.editorAvailabilityBadge, editor.isAvailable ? styles.editorAvailable : styles.editorMaybe]}>
                      <Text style={[styles.editorAvailabilityText, editor.isAvailable ? styles.editorAvailableText : styles.editorMaybeText]}>
                        {editor.isAvailable ? "空きあり" : "応相談"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              {!editorsLoading && topEditors.length === 0 && (
                <View style={styles.editorEmptyRanking}>
                  <Text style={styles.editorEmptyText}>まだ登録された編集者がいません</Text>
                </View>
              )}
            </ScrollView>

            {/* 一覧リスト */}
            <View style={styles.editorList}>
              {editorsLoading && editors.length === 0 ? (
                <Text style={styles.editorEmptyText}>読み込み中...</Text>
              ) : editors.length === 0 ? (
                <Text style={styles.editorEmptyText}>このコミュニティにはまだ動画編集クリエイターがいません</Text>
              ) : (
                editors.map((editor) => {
                  const genres = editor.genres.split(",").map((g) => g.trim()).filter(Boolean);
                  return (
                    <View key={editor.id} style={styles.editorCard}>
                      <Image source={{ uri: editor.avatar }} style={styles.editorAvatar} contentFit="cover" />
                      <View style={styles.editorBody}>
                        <View style={styles.editorHeaderRow}>
                          <Text style={styles.editorName} numberOfLines={1}>{editor.name}</Text>
                          <View style={[styles.editorAvailabilityBadge, editor.isAvailable ? styles.editorAvailable : styles.editorMaybe]}>
                            <Text style={[styles.editorAvailabilityText, editor.isAvailable ? styles.editorAvailableText : styles.editorMaybeText]}>
                              {editor.isAvailable ? "空きあり" : "応相談"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.editorRatingRow}>
                          <Ionicons name="star" size={12} color={C.orange} />
                          <Text style={styles.editorRatingText}>{editor.rating.toFixed(1)}</Text>
                          <Text style={styles.editorReviewText}>({editor.reviewCount})</Text>
                        </View>
                        {genres.length > 0 && (
                          <View style={styles.editorGenresRow}>
                            {genres.map((g) => (
                              <View key={g} style={styles.editorGenreTag}>
                                <Text style={styles.editorGenreTagText}>{g}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        <View style={styles.editorMetaRow}>
                          <Text style={styles.editorMetaText}>納期目安: {editor.deliveryDays}日</Text>
                          <Text style={styles.editorMetaText}>
                            料金:{" "}
                            {editor.priceType === "per_minute" && editor.pricePerMinute
                              ? `¥${editor.pricePerMinute.toLocaleString()}/分`
                              : editor.priceType === "revenue_share" && editor.revenueSharePercent
                              ? `${editor.revenueSharePercent}%レベニューシェア`
                              : "要相談"}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.editorRequestBtn}
                        onPress={() => openRequestModal(editor)}
                      >
                        <Text style={styles.editorRequestBtnText}>依頼する</Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {activeTab === "掲示板" && (
          <View style={styles.boardList}>
            {BOARD_POSTS.map((post) => (
              <Pressable key={post.id} style={styles.boardCard}>
                <View style={[styles.boardIconWrap, { backgroundColor: post.color + "22" }]}>
                  <Ionicons name={post.icon as any} size={20} color={post.color} />
                </View>
                <View style={styles.boardBody}>
                  <View style={styles.boardTagRow}>
                    <View style={[styles.boardTag, { backgroundColor: post.color + "33" }]}>
                      <Text style={[styles.boardTagText, { color: post.color }]}>{post.tag}</Text>
                    </View>
                    <Text style={styles.boardDate}>{post.date}</Text>
                  </View>
                  <Text style={styles.boardTitle}>{post.title}</Text>
                  <Text style={styles.boardDetail} numberOfLines={1}>{post.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 編集依頼モーダル */}
      <Modal
        visible={!!requestEditor}
        transparent
        animationType="slide"
        onRequestClose={closeRequestModal}
      >
        <Pressable style={styles.requestModalOverlay} onPress={closeRequestModal}>
          <Pressable
            style={styles.requestModalSheet}
            onPress={() => {}}
          >
            <View style={styles.requestModalHandle} />
            {requestEditor && (
              <>
                <View style={styles.requestModalHeader}>
                  <View style={styles.requestModalEditorRow}>
                    <Image source={{ uri: requestEditor.avatar }} style={styles.requestModalAvatar} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestModalTitle}>{requestEditor.name} に依頼する</Text>
                      <View style={styles.editorRatingRow}>
                        <Ionicons name="star" size={12} color={C.orange} />
                        <Text style={styles.editorRatingText}>{requestEditor.rating.toFixed(1)}</Text>
                        <Text style={styles.editorReviewText}>({requestEditor.reviewCount})</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <ScrollView
                  style={styles.requestModalScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.requestLabel}>依頼タイトル</Text>
                  <TextInput
                    style={styles.requestInput}
                    placeholder="例: 毎週のゲーム配信ハイライト編集"
                    placeholderTextColor={C.textMuted}
                    value={requestTitle}
                    onChangeText={setRequestTitle}
                  />

                  <Text style={styles.requestLabel}>依頼内容</Text>
                  <TextInput
                    style={[styles.requestInput, styles.requestInputMultiline]}
                    placeholder="チャンネルの雰囲気や、尺・テイスト・参考URLなどを記載してください。"
                    placeholderTextColor={C.textMuted}
                    value={requestDescription}
                    onChangeText={setRequestDescription}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.requestLabel}>料金形式</Text>
                  <View style={styles.requestPriceTypeRow}>
                    <Pressable
                      style={[
                        styles.requestPriceTypePill,
                        requestPriceType === "per_minute" && styles.requestPriceTypePillActive,
                      ]}
                      onPress={() => setRequestPriceType("per_minute")}
                    >
                      <Text
                        style={[
                          styles.requestPriceTypeText,
                          requestPriceType === "per_minute" && styles.requestPriceTypeTextActive,
                        ]}
                      >
                        1分あたり
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.requestPriceTypePill,
                        requestPriceType === "revenue_share" && styles.requestPriceTypePillActive,
                      ]}
                      onPress={() => setRequestPriceType("revenue_share")}
                    >
                      <Text
                        style={[
                          styles.requestPriceTypeText,
                          requestPriceType === "revenue_share" && styles.requestPriceTypeTextActive,
                        ]}
                      >
                        レベニューシェア
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.requestLabel}>
                    {requestPriceType === "per_minute" ? "希望単価（¥/分）" : "希望レベニューシェア（%）"}
                  </Text>
                  <TextInput
                    style={styles.requestInput}
                    placeholder={requestPriceType === "per_minute" ? "例: 1500" : "例: 40"}
                    placeholderTextColor={C.textMuted}
                    value={requestBudget}
                    onChangeText={setRequestBudget}
                    keyboardType="numeric"
                  />

                  <Text style={styles.requestLabel}>納期希望</Text>
                  <TextInput
                    style={styles.requestInput}
                    placeholder="例: 初回納品は3月末まで"
                    placeholderTextColor={C.textMuted}
                    value={requestDeadline}
                    onChangeText={setRequestDeadline}
                  />

                  <Pressable
                    style={[styles.requestSubmitBtn, sendingRequest && styles.requestSubmitBtnDisabled]}
                    onPress={handleSendRequest}
                    disabled={sendingRequest}
                  >
                    <Text style={styles.requestSubmitBtnText}>
                      {sendingRequest ? "送信中..." : "依頼を送信"}
                    </Text>
                  </Pressable>
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const jukeStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accentDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
  },
  badgeText: {
    color: C.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  watchersChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  watchersText: {
    color: C.textSec,
    fontSize: 11,
  },
  fullBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  playerRow: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  thumbWrap: {
    width: 90,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: C.surface3,
  },
  thumb: {
    width: 90,
    height: 60,
    borderRadius: 8,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  playerInfo: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  nowPlayingTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  addedBy: {
    color: C.accent,
    fontSize: 11,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: C.surface3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  progressTime: {
    color: C.textMuted,
    fontSize: 10,
  },
  emptyPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 12,
  },
  commentsWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentUser: {
    color: C.accent,
    fontSize: 11,
    fontWeight: "700",
    minWidth: 40,
  },
  commentText: {
    color: C.textSec,
    fontSize: 11,
    flex: 1,
  },
  commentInput: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  input: {
    flex: 1,
    height: 34,
    backgroundColor: C.surface2,
    borderRadius: 17,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 13,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: C.surface3,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  coverContainer: { height: 130, position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    height: 76,
    paddingHorizontal: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  adPrBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  adPrText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  adThumb: { width: 80, height: 54, borderRadius: 6 },
  adBody: { flex: 1, gap: 4 },
  adTitle: { color: "#fff", fontSize: 13, fontWeight: "700" },
  adSub: { color: "rgba(255,255,255,0.55)", fontSize: 11 },
  adCtaBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  adCtaText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  profileSection: { padding: 16, gap: 10 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  communityAvatarContainer: { position: "relative" },
  communityAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.accent,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.bg,
  },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  communityName: { color: C.text, fontSize: 17, fontWeight: "800" },
  officialBadge: {
    backgroundColor: C.surface3,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  officialText: { color: C.textSec, fontSize: 9, fontWeight: "700" },
  categoryText: { color: C.textSec, fontSize: 12 },
  description: { color: C.textSec, fontSize: 13, lineHeight: 19 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: { color: C.textSec, fontSize: 12 },
  statNumber: { color: C.text, fontWeight: "700" },
  statDivider: { color: C.textMuted },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 11,
  },
  followBtnActive: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  followBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  followBtnTextActive: { color: C.textSec },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: C.accent },
  tabText: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: C.text, fontWeight: "700" },
  requestCard: {
    margin: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  requestTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  requestDesc: { color: C.textSec, fontSize: 12, lineHeight: 17 },
  requestActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  requestPrimaryBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  requestPrimaryText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  requestSecondaryBtn: {
    backgroundColor: C.surface3,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  requestSecondaryText: { color: C.text, fontSize: 13, fontWeight: "700" },
  postCard: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: 14,
    gap: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  postMeta: { flex: 1 },
  postCreator: { color: C.text, fontSize: 13, fontWeight: "700" },
  postTime: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  pricePill: {
    backgroundColor: C.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pricePillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  postImage: {
    width: "100%",
    height: 190,
    borderRadius: 10,
  },
  postTitle: { color: C.textSec, fontSize: 13, lineHeight: 18 },
  creatorList: { padding: 16, gap: 12 },
  creatorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
  },
  creatorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: C.accent,
  },
  creatorInfo: { flex: 1, gap: 3 },
  creatorName: { color: C.text, fontSize: 13, fontWeight: "700" },
  creatorCommunity: { color: C.textSec, fontSize: 11 },
  creatorStats: { flexDirection: "row", gap: 10 },
  creatorStat: { color: C.textMuted, fontSize: 11 },
  followSmallBtn: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  followSmallText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  /* Video editors */
  editorTab: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  editorSectionTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  editorRankingScroll: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 8,
  },
  editorRankCard: {
    width: 140,
    padding: 10,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  editorRankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editorRankBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  editorRankAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
  },
  editorRankName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  editorGenreText: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  editorRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  editorRatingText: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "700",
  },
  editorReviewText: {
    color: C.textMuted,
    fontSize: 11,
  },
  editorAvailabilityBadge: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editorAvailabilityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  editorAvailable: {
    backgroundColor: "#1B5E20",
  },
  editorAvailableText: {
    color: "#C8E6C9",
  },
  editorMaybe: {
    backgroundColor: "#263238",
  },
  editorMaybeText: {
    color: C.textSec,
  },
  editorEmptyRanking: {
    paddingVertical: 16,
  },
  editorEmptyText: {
    color: C.textMuted,
    fontSize: 13,
  },
  editorList: {
    marginTop: 16,
    gap: 10,
  },
  editorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  editorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  editorBody: {
    flex: 1,
    gap: 4,
  },
  editorHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  editorName: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  editorGenresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  editorGenreTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.surface3,
  },
  editorGenreTagText: {
    color: C.textSec,
    fontSize: 11,
  },
  editorMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  editorMetaText: {
    color: C.textMuted,
    fontSize: 11,
  },
  editorRequestBtn: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.accent,
  },
  editorRequestBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  boardList: { padding: 16, gap: 10 },
  boardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  boardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boardBody: { flex: 1, gap: 4 },
  boardTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boardTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  boardTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  boardDate: {
    color: C.textMuted,
    fontSize: 10,
  },
  boardTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  boardDetail: {
    color: C.textSec,
    fontSize: 11,
  },
  jukeboxCta: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.accentDark,
    borderWidth: 1,
    borderColor: C.accent,
    gap: 10,
  },
  jukeboxCtaLeft: {
    flex: 1,
    gap: 4,
  },
  jukeboxCtaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jukeboxCtaBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  jukeboxCtaTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  jukeboxCtaSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  jukeboxCtaRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  requestModalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  requestModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 8,
  },
  requestModalHeader: {
    marginBottom: 8,
  },
  requestModalEditorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  requestModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  requestModalTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
  },
  requestModalScroll: {
    marginTop: 8,
  },
  requestLabel: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  requestInput: {
    backgroundColor: C.surface2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: C.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: C.border,
  },
  requestInputMultiline: {
    height: 90,
  },
  requestPriceTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  requestPriceTypePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: C.surface2,
  },
  requestPriceTypePillActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(41,182,207,0.1)",
  },
  requestPriceTypeText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "700",
  },
  requestPriceTypeTextActive: {
    color: C.text,
  },
  requestSubmitBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  requestSubmitBtnDisabled: {
    opacity: 0.6,
  },
  requestSubmitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
