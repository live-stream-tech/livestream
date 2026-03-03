import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";
import { COMMUNITIES, RANKED_VIDEOS } from "@/constants/data";

const GENRES = [
  { id: "anime", name: "アニメ", icon: "tv-outline" as const, count: 1204, color: "#E91E8C" },
  { id: "band", name: "バンド", icon: "musical-notes-outline" as const, count: 876, color: C.accent },
  { id: "subcul", name: "サブカル", icon: "sparkles-outline" as const, count: 642, color: C.orange },
  { id: "english", name: "英会話", icon: "language-outline" as const, count: 531, color: C.green },
  { id: "fortune", name: "占い", icon: "moon-outline" as const, count: 389, color: "#9C27B0" },
];

const PURCHASE_TABS = ["週間", "月間", "全期間"] as const;
type PurchaseTab = typeof PURCHASE_TABS[number];

const PURCHASE_EXTRAS = [
  {
    id: "p4",
    rank: 4,
    title: "地下アイドルライブ完全版",
    creator: "地下アイドル界隈",
    community: "地下アイドル界隈",
    views: 28100,
    timeAgo: "2日前",
    duration: "52:10",
    price: 1500,
    thumbnail: "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
  },
  {
    id: "p5",
    rank: 5,
    title: "プロ直伝 ホスト話術講座",
    creator: "キャバ嬢・ホスト界隈",
    community: "キャバ嬢・ホスト界隈",
    views: 19870,
    timeAgo: "4日前",
    duration: "35:44",
    price: 2000,
    thumbnail: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=50&h=50&fit=crop",
  },
];

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const bg = colors[rank] ?? C.surface3;
  const textColor = rank <= 3 ? "#000" : C.textSec;
  return (
    <View style={[styles.rankBadge, { backgroundColor: bg }]}>
      <Text style={[styles.rankBadgeText, { color: textColor }]}>{rank}</Text>
    </View>
  );
}

function CommunityRankCard({ item, index }: { item: typeof COMMUNITIES[0]; index: number }) {
  return (
    <Pressable
      style={styles.rankCard}
      onPress={() => router.push(`/community/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.rankCardImage} contentFit="cover" />
      <View style={styles.rankCardOverlay} />
      <RankBadge rank={index + 1} />
      {item.online && (
        <View style={styles.onlineChip}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>LIVE</Text>
        </View>
      )}
      <View style={styles.rankCardBottom}>
        <Text style={styles.rankCardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.rankCardMeta}>
          <Ionicons name="people" size={11} color="rgba(255,255,255,0.7)" />
          <Text style={styles.rankCardMembers}>{formatNum(item.members)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function PurchaseRankCard({ item }: { item: (typeof RANKED_VIDEOS[0]) | (typeof PURCHASE_EXTRAS[0]) }) {
  return (
    <Pressable
      style={styles.purchaseCard}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.purchaseCardImage} contentFit="cover" />
      <View style={styles.purchaseCardOverlay} />
      {item.rank && <RankBadge rank={item.rank} />}
      {item.price && (
        <View style={styles.priceChip}>
          <Text style={styles.priceChipText}>¥{item.price.toLocaleString()}</Text>
        </View>
      )}
      <View style={styles.purchaseCardBottom}>
        <Text style={styles.purchaseCardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.purchaseCardMeta}>
          <Image source={{ uri: item.avatar }} style={styles.purchaseCardAvatar} contentFit="cover" />
          <Text style={styles.purchaseCardCreator} numberOfLines={1}>{item.creator}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;
  const [search, setSearch] = useState("");
  const [purchaseTab, setPurchaseTab] = useState<PurchaseTab>("週間");

  const sortedCommunities = [...COMMUNITIES].sort((a, b) => b.members - a.members);

  const purchaseData = purchaseTab === "全期間"
    ? [...RANKED_VIDEOS, ...PURCHASE_EXTRAS]
    : purchaseTab === "月間"
    ? [...RANKED_VIDEOS.slice(1), PURCHASE_EXTRAS[0], RANKED_VIDEOS[0]]
    : [...RANKED_VIDEOS, PURCHASE_EXTRAS[1]];

  const filteredGenres = search
    ? GENRES.filter((g) => g.name.includes(search))
    : GENRES;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={C.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="コミュニティを検索"
              placeholderTextColor={C.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Pressable style={styles.createBtn} onPress={() => {}}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createBtnText}>作成</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>ジャンルから検索</Text>
          </View>
          <View style={styles.genreGrid}>
            {filteredGenres.map((genre) => (
              <Pressable
                key={genre.id}
                style={[styles.genreChip, { borderColor: genre.color + "55" }]}
                onPress={() => router.push(`/community/genre/${genre.id}`)}
              >
                <Ionicons name={genre.icon} size={18} color={genre.color} />
                <Text style={[styles.genreChipText, { color: genre.color }]}>{genre.name}</Text>
                <Text style={styles.genreChipCount}>{formatNum(genre.count)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>コミュニティ人数ランキング</Text>
          </View>
          <FlatList
            data={sortedCommunities}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item, index }) => (
              <CommunityRankCard item={item} index={index} />
            )}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>購入ランキング</Text>
            </View>
            <View style={styles.tabPills}>
              {PURCHASE_TABS.map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tabPill, purchaseTab === tab && styles.tabPillActive]}
                  onPress={() => setPurchaseTab(tab)}
                >
                  <Text style={[styles.tabPillText, purchaseTab === tab && styles.tabPillTextActive]}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <FlatList
            data={purchaseData}
            keyExtractor={(item) => item.id + purchaseTab}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => <PurchaseRankCard item={item} />}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    height: 42,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  scroll: { flex: 1 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 16,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: "700" },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  genreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  genreChipCount: {
    color: C.textMuted,
    fontSize: 11,
  },
  hList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  rankCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: C.surface,
  },
  rankCardImage: {
    ...StyleSheet.absoluteFillObject as any,
  },
  rankCardOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  onlineChip: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
  onlineText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rankCardBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 4,
  },
  rankCardName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  rankCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rankCardMembers: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  purchaseCard: {
    width: 160,
    height: 210,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: C.surface,
  },
  purchaseCardImage: {
    ...StyleSheet.absoluteFillObject as any,
  },
  purchaseCardOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  priceChip: {
    position: "absolute",
    top: 36,
    left: 8,
    backgroundColor: C.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priceChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  purchaseCardBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 6,
  },
  purchaseCardTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  purchaseCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  purchaseCardAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  purchaseCardCreator: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    flex: 1,
  },
  tabPills: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  tabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabPillActive: {
    backgroundColor: C.accent,
  },
  tabPillText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
});
