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
import { C } from "@/constants/colors";
import { COMMUNITIES, RANKED_VIDEOS } from "@/constants/data";

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
  if (n >= 10000) return (n / 10000).toFixed(0) + "万";
  return n.toLocaleString();
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchText, setSearchText] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const filtered = COMMUNITIES.filter((c) =>
    selectedCategory === "すべて" ? true : c.category === selectedCategory
  );

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stock</Text>
        </Text>
        <View style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={22} color={C.text} />
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>3</Text>
          </View>
        </View>
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
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* マイコミュニティ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>マイコミュニティ</Text>
        </View>

        <View style={styles.communityGrid}>
          {filtered.map((community) => (
            <Pressable
              key={community.id}
              style={styles.communityCard}
              onPress={() => router.push(`/community/${community.id}`)}
            >
              <View style={styles.communityThumbContainer}>
                <Image
                  source={{ uri: community.thumbnail }}
                  style={styles.communityThumb}
                  contentFit="cover"
                />
                {community.online && <View style={styles.onlineDot} />}
                <View style={styles.communityOverlay}>
                  <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
                  <Text style={styles.communityMembers}>{formatNumber(community.members)}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* 動画視聴ランキング */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>動画視聴ランキング</Text>
        </View>

        <View style={styles.rankList}>
          {RANKED_VIDEOS.map((video) => (
            <Pressable
              key={video.id}
              style={styles.rankListItem}
              onPress={() => router.push(`/video/${video.id}`)}
            >
              <View style={styles.rankNumberContainer}>
                <View style={[styles.rankCircle, { backgroundColor: video.rank === 1 ? C.orange : video.rank === 2 ? C.surface3 : C.surface3 }]}>
                  <Text style={styles.rankNumber}>{video.rank}</Text>
                </View>
              </View>
              {video.price && (
                <View style={styles.priceBadgeSmall}>
                  <Text style={styles.priceBadgeText}>¥{video.price}</Text>
                </View>
              )}
              <View style={styles.rankThumbContainer}>
                <Image source={{ uri: video.thumbnail }} style={styles.rankThumb} contentFit="cover" />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>
              <View style={styles.rankItemInfo}>
                <Text style={styles.rankItemTitle} numberOfLines={2}>{video.title}</Text>
                <View style={styles.rankCreatorRow}>
                  <Image source={{ uri: video.avatar }} style={styles.tinyAvatar} contentFit="cover" />
                  <Text style={styles.rankCreatorName}>{video.creator}</Text>
                </View>
                <Text style={styles.rankMeta}>
                  {video.views.toLocaleString()}視聴 · {video.timeAgo} · {video.community}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

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
  communityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  communityCard: {
    width: "31%",
    aspectRatio: 0.85,
  },
  communityThumbContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  communityThumb: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.bg,
  },
  communityOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 6,
  },
  communityName: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  communityMembers: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginTop: 1,
  },
  rankList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  rankListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 10,
  },
  rankNumberContainer: {
    width: 28,
    alignItems: "center",
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  priceBadgeSmall: {
    position: "absolute",
    top: 10,
    left: 48,
    backgroundColor: C.accent,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 1,
  },
  priceBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  rankThumbContainer: {
    position: "relative",
  },
  rankThumb: {
    width: 80,
    height: 52,
    borderRadius: 6,
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  rankItemInfo: {
    flex: 1,
    gap: 4,
  },
  rankItemTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  rankCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tinyAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  rankCreatorName: {
    color: C.textSec,
    fontSize: 11,
  },
  rankMeta: {
    color: C.textMuted,
    fontSize: 10,
  },
});
