import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { C } from "@/constants/colors";
import { COMMUNITIES, VIDEOS, CREATORS } from "@/constants/data";

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

const TABS = ["新着順", "クリエイター", "掲示板"] as const;
type Tab = typeof TABS[number];

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("新着順");
  const [following, setFollowing] = useState(false);

  const community = COMMUNITIES.find((c) => c.id === id) ?? COMMUNITIES[0];
  const ad = getAd(community.name);

  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image — shorter */}
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

        {/* Ad Banner */}
        <TouchableOpacity activeOpacity={0.85} style={[styles.adBanner, { backgroundColor: ad.bg }]}>
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
        </TouchableOpacity>

        {/* Profile */}
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

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing(!following)}
            >
              <Text style={styles.followBtnText}>
                {following ? "フォロー中" : "フォロー"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.jukeboxBtn}
              onPress={() => router.push(`/jukebox/${id}`)}
            >
              <Ionicons name="musical-notes" size={14} color={C.orange} />
              <Text style={styles.jukeboxBtnText}>ジュークボックス</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
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

        {/* Content */}
        {activeTab === "新着順" && (
          <View>
            {/* Video request card */}
            <View style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Ionicons name="videocam" size={20} color={C.accent} />
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

            {/* Posts */}
            {VIDEOS.slice(0, 3).map((video) => (
              <Pressable key={video.id} style={styles.postCard} onPress={() => router.push(`/video/${video.id}`)}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: video.avatar }} style={styles.postAvatar} contentFit="cover" />
                  <View>
                    <Text style={styles.postCreator}>{video.creator}</Text>
                    <Text style={styles.postTime}>{video.timeAgo}</Text>
                  </View>
                </View>
                <Image source={{ uri: video.thumbnail }} style={styles.postImage} contentFit="cover" />
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === "クリエイター" && (
          <View style={styles.creatorList}>
            {CREATORS.slice(0, 3).map((creator) => (
              <View key={creator.id} style={styles.creatorItem}>
                <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} contentFit="cover" />
                <View style={styles.creatorInfo}>
                  <Text style={styles.creatorName}>{creator.name}</Text>
                  <Text style={styles.creatorCommunity}>{creator.community}</Text>
                  <View style={styles.creatorStats}>
                    <Text style={styles.creatorStat}>
                      <Ionicons name="people-outline" size={11} /> {(creator.followers / 1000).toFixed(0)}千フォロワー
                    </Text>
                    <Text style={styles.creatorStat}>配信{creator.streamCount}回</Text>
                  </View>
                </View>
                <Pressable style={styles.followSmallBtn}>
                  <Text style={styles.followSmallText}>フォロー</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {activeTab === "掲示板" && (
          <View style={styles.boardEmpty}>
            <Ionicons name="chatbubbles-outline" size={48} color={C.textMuted} />
            <Text style={styles.emptyText}>掲示板の投稿はまだありません</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  coverContainer: {
    height: 130,
    position: "relative",
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
  adThumb: {
    width: 80,
    height: 54,
    borderRadius: 6,
  },
  adBody: {
    flex: 1,
    gap: 4,
  },
  adTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  adSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },
  adCtaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  adCtaText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
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
  profileSection: {
    padding: 16,
    gap: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  communityAvatarContainer: {
    position: "relative",
  },
  communityAvatar: {
    width: 64,
    height: 64,
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
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  communityName: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
  },
  officialBadge: {
    backgroundColor: C.surface3,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  officialText: {
    color: C.textSec,
    fontSize: 9,
    fontWeight: "700",
  },
  categoryText: {
    color: C.textSec,
    fontSize: 12,
  },
  description: {
    color: C.textSec,
    fontSize: 13,
    lineHeight: 19,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    color: C.textSec,
    fontSize: 12,
  },
  statNumber: {
    color: C.text,
    fontWeight: "700",
  },
  statDivider: {
    color: C.textMuted,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  followBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  followBtnActive: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  jukeboxBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.orange + "55",
  },
  jukeboxBtnText: {
    color: C.orange,
    fontSize: 13,
    fontWeight: "700",
  },
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
  tabItemActive: {
    borderBottomColor: C.accent,
  },
  tabText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: C.text,
    fontWeight: "700",
  },
  requestCard: {
    margin: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
  },
  requestDesc: {
    color: C.textSec,
    fontSize: 12,
    lineHeight: 18,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  requestPrimaryBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  requestPrimaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  requestSecondaryBtn: {
    backgroundColor: C.surface3,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  requestSecondaryText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  postCreator: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  postTime: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  creatorList: {
    padding: 16,
    gap: 14,
  },
  creatorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.accent,
  },
  creatorInfo: {
    flex: 1,
    gap: 3,
  },
  creatorName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  creatorCommunity: {
    color: C.textSec,
    fontSize: 11,
  },
  creatorStats: {
    flexDirection: "row",
    gap: 10,
  },
  creatorStat: {
    color: C.textMuted,
    fontSize: 11,
  },
  followSmallBtn: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  followSmallText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  boardEmpty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: C.textSec,
    fontSize: 14,
  },
});
