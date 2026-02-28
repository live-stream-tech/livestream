import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { C } from "@/constants/colors";

type Notif = { id: number; isRead: boolean };

function useUnreadCount() {
  const { data = [] } = useQuery<Notif[]>({ queryKey: ["/api/notifications"] });
  return (data as Notif[]).filter((n) => !n.isRead).length;
}

const CATEGORIES = ["すべて", "音楽", "アート", "スポーツ", "ゲーム", "ライフスタイル"];
const CATEGORY_ICONS: Record<string, string> = {
  すべて: "trending-up",
  音楽: "musical-notes",
  アート: "color-palette",
  スポーツ: "football",
  ゲーム: "game-controller",
  ライフスタイル: "heart",
};

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

const COMMUNITY_RANK_COLORS = [C.orange, C.textSec, "#CD7F32", C.surface3, C.surface3, C.surface3];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchText, setSearchText] = useState("");
  const [rankingExpanded, setRankingExpanded] = useState(false);

  const { data: allCommunities = [] } = useQuery<any[]>({ queryKey: ["/api/communities"] });
  const { data: rankedVideos = [] } = useQuery<any[]>({ queryKey: ["/api/videos/ranked"] });
  const unreadCount = useUnreadCount();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const myCommunities = allCommunities.filter((c: any) =>
    selectedCategory === "すべて" ? true : c.category === selectedCategory
  );

  const communityRanking = [...allCommunities].sort((a: any, b: any) => b.members - a.members);
  const visibleRanking = rankingExpanded ? communityRanking : communityRanking.slice(0, 3);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stock</Text>
        </Text>
        <Pressable style={styles.notifButton} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={22} color={C.text} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="コミュニティ、動画を検索..."
            placeholderTextColor={C.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <Pressable style={styles.createBtn}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.createBtnText}>作成</Text>
        </Pressable>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryScrollView}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Ionicons
              name={CATEGORY_ICONS[cat] as any}
              size={13}
              color={selectedCategory === cat ? "#fff" : C.textSec}
            />
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ① マイコミュニティ — 1行横スワイプ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>マイコミュニティ</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myCommunityScroll}
        >
          {myCommunities.map((community) => (
            <Pressable
              key={community.id}
              style={styles.myCommunityCard}
              onPress={() => router.push(`/community/${community.id}`)}
            >
              <View style={styles.myCommunityThumbContainer}>
                <Image
                  source={{ uri: community.thumbnail }}
                  style={styles.myCommunityThumb}
                  contentFit="cover"
                />
                {community.online && <View style={styles.onlineDot} />}
              </View>
              <Text style={styles.myCommunityName} numberOfLines={2}>{community.name}</Text>
              <Text style={styles.myCommunityMembers}>{formatNumber(community.members)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ② コミュニティ人数ランキング */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>コミュニティ人数ランキング</Text>
        </View>

        <View style={styles.communityRankList}>
          {visibleRanking.map((community, index) => {
            const rank = index + 1;
            const rankColor = COMMUNITY_RANK_COLORS[index] ?? C.surface3;
            return (
              <Pressable
                key={community.id}
                style={styles.communityRankItem}
                onPress={() => router.push(`/community/${community.id}`)}
              >
                <View style={[styles.communityRankCircle, { backgroundColor: rankColor }]}>
                  <Text style={styles.communityRankNumber}>{rank}</Text>
                </View>

                <Image
                  source={{ uri: community.thumbnail }}
                  style={styles.communityRankThumb}
                  contentFit="cover"
                />

                <View style={styles.communityRankInfo}>
                  <Text style={styles.communityRankName} numberOfLines={1}>{community.name}</Text>
                  <View style={styles.communityRankMeta}>
                    <Text style={styles.communityRankCategory}>{community.category}</Text>
                    {community.online && (
                      <View style={styles.communityOnlineBadge}>
                        <View style={styles.communityOnlineDot} />
                        <Text style={styles.communityOnlineText}>配信中</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.communityRankRight}>
                  <Ionicons name="people" size={13} color={C.textMuted} />
                  <Text style={styles.communityRankMembers}>{formatNumber(community.members)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {communityRanking.length > 3 && (
          <Pressable
            style={styles.expandBtn}
            onPress={() => setRankingExpanded((v) => !v)}
          >
            <Text style={styles.expandBtnText}>
              {rankingExpanded ? "閉じる" : `もっと見る（残り${communityRanking.length - 3}件）`}
            </Text>
            <Ionicons
              name={rankingExpanded ? "chevron-up" : "chevron-down"}
              size={14}
              color={C.accent}
            />
          </Pressable>
        )}

        {/* ③ 有料動画ランキング — 横スワイプ */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>有料動画ランキング</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoRankScroll}
        >
          {rankedVideos.map((video: any) => (
            <Pressable
              key={video.id}
              style={styles.videoRankCard}
              onPress={() => router.push(`/video/${video.id}`)}
            >
              <View style={styles.videoRankThumbContainer}>
                <Image source={{ uri: video.thumbnail }} style={styles.videoRankThumb} contentFit="cover" />
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{video.rank}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>

              <View style={styles.videoRankInfo}>
                <View style={styles.videoRankCreatorRow}>
                  <Image source={{ uri: video.avatar }} style={styles.tinyAvatar} contentFit="cover" />
                  <Text style={styles.videoRankCommunity} numberOfLines={1}>{video.community}</Text>
                </View>
                <Text style={styles.videoRankTitle} numberOfLines={2}>{video.title}</Text>
                <View style={styles.videoRankMeta}>
                  <Ionicons name="eye-outline" size={11} color={C.textMuted} />
                  <Text style={styles.videoMetaText}>{formatNumber(video.views)}</Text>
                  <Ionicons name="time-outline" size={11} color={C.textMuted} />
                  <Text style={styles.videoMetaText}>{video.timeAgo}</Text>
                </View>
                <Text style={styles.videoRankPrice}>¥{video.price?.toLocaleString()}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logo: { fontSize: 22, fontWeight: "800" },
  logoLive: { color: C.text },
  logoStock: { color: C.accent },
  notifButton: { position: "relative" },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.live,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryScrollView: {
    flexGrow: 0,
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryPillActive: {
    backgroundColor: C.accent,
  },
  categoryText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  scroll: { flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },

  /* マイコミュニティ — 横1行スクロール */
  myCommunityScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  myCommunityCard: {
    width: 90,
    alignItems: "center",
    gap: 6,
  },
  myCommunityThumbContainer: {
    position: "relative",
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
  },
  myCommunityThumb: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: "#1B2838",
  },
  myCommunityName: {
    color: C.text,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  myCommunityMembers: {
    color: C.textMuted,
    fontSize: 10,
    textAlign: "center",
  },

  /* コミュニティ人数ランキング */
  communityRankList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  communityRankItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 10,
  },
  communityRankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  communityRankNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  communityRankThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    flexShrink: 0,
  },
  communityRankInfo: {
    flex: 1,
    gap: 4,
  },
  communityRankName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  communityRankMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  communityRankCategory: {
    color: C.textMuted,
    fontSize: 11,
  },
  communityOnlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 200, 83, 0.15)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  communityOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  communityOnlineText: {
    color: C.green,
    fontSize: 10,
    fontWeight: "700",
  },
  communityRankRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  communityRankMembers: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },

  /* 有料動画ランキング — 横スクロール */
  videoRankScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  videoRankCard: {
    width: 180,
  },
  videoRankThumbContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  videoRankThumb: {
    width: 180,
    height: 101,
    borderRadius: 8,
  },
  rankBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  durationBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  videoRankInfo: {
    marginTop: 8,
    gap: 3,
  },
  videoRankCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tinyAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  videoRankCommunity: {
    color: C.textSec,
    fontSize: 11,
    flex: 1,
  },
  videoRankTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  videoRankMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  videoMetaText: {
    color: C.textMuted,
    fontSize: 10,
    marginRight: 4,
  },
  videoRankPrice: {
    color: C.accent,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 1,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  expandBtnText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
