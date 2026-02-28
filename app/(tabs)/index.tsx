import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

function VideoCard({ item }: { item: any }) {
  return (
    <Pressable style={styles.videoCard} onPress={() => router.push(`/video/${item.id}`)}>
      <View style={styles.videoThumbContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumb} contentFit="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.videoMeta}>
          <Ionicons name="eye-outline" size={11} color={C.textMuted} />
          <Text style={styles.metaText}>{formatNumber(item.views)}</Text>
          <Ionicons name="time-outline" size={11} color={C.textMuted} />
          <Text style={styles.metaText}>{item.timeAgo}</Text>
        </View>
        {item.price !== null ? (
          <Text style={styles.priceText}>¥{item.price.toLocaleString()}</Text>
        ) : (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>無料</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function LiveCard({ item }: { item: any }) {
  return (
    <Pressable style={styles.liveCard}>
      <View style={styles.liveThumbContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.liveThumb} contentFit="cover" />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Ionicons name="eye-outline" size={11} color="#fff" />
          <Text style={styles.viewerText}>{formatNumber(item.viewers)}</Text>
        </View>
      </View>
      <View style={styles.liveInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.metaTextSingle}>{item.timeAgo}</Text>
      </View>
    </Pressable>
  );
}

function RankedVideoCard({ item }: { item: any }) {
  return (
    <Pressable style={styles.rankedCard} onPress={() => router.push(`/video/${item.id}`)}>
      <View style={styles.videoThumbContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.rankedThumb} contentFit="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
      </View>
      <View style={styles.creatorRow}>
        <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
        <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.videoMeta}>
        <Ionicons name="eye-outline" size={11} color={C.textMuted} />
        <Text style={styles.metaText}>{formatNumber(item.views)}</Text>
        <Ionicons name="time-outline" size={11} color={C.textMuted} />
        <Text style={styles.metaText}>{item.timeAgo}</Text>
      </View>
      <Text style={styles.priceText}>¥{item.price?.toLocaleString()}</Text>
    </Pressable>
  );
}

function CreatorRankCard({ item }: { item: any }) {
  const borderColor =
    item.rank === 1 ? C.orange : item.rank === 2 ? C.textSec : item.rank === 3 ? C.orangeLight : C.border;
  return (
    <View style={[styles.creatorCard, { borderColor }]}>
      <View style={styles.creatorHeader}>
        <View style={[styles.rankCircle, { backgroundColor: item.rank <= 3 ? C.orange : C.surface3 }]}>
          <Text style={styles.rankCircleText}>{item.rank}</Text>
        </View>
        <Image source={{ uri: item.avatar }} style={styles.creatorAvatar} contentFit="cover" />
        <View style={styles.creatorNameBlock}>
          <Text style={styles.creatorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.creatorCommunity} numberOfLines={1}>{item.community}</Text>
        </View>
      </View>
      <View style={styles.heatRow}>
        <Ionicons name="flame" size={13} color={C.orange} />
        <Text style={styles.heatLabel}>経済的熱量</Text>
        <Text style={styles.heatValue}>{item.heatScore}B</Text>
      </View>
      <View style={styles.creatorStats}>
        <View style={styles.statRow}>
          <Ionicons name="radio-outline" size={13} color={C.textSec} />
          <Text style={styles.statLabel}>累計視聴数</Text>
          <Text style={styles.statValue}>{item.totalViews.toLocaleString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="cash-outline" size={13} color={C.textSec} />
          <Text style={styles.statLabel}>総収益</Text>
          <Text style={styles.statValue}>¥{item.revenue.toLocaleString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="trending-up-outline" size={13} color={C.textSec} />
          <Text style={styles.statLabel}>配信回数</Text>
          <Text style={styles.statValue}>{item.streamCount}回</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="people-outline" size={13} color={C.textSec} />
          <Text style={styles.statLabel}>フォロワー</Text>
          <Text style={styles.statValue}>{formatNumber(item.followers)}</Text>
        </View>
      </View>
      <View style={styles.revenueShareRow}>
        <Text style={styles.revenueShareLabel}>レベニューシェア</Text>
        <Text style={styles.revenueShareValue}>{item.revenueShare}%</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [rankFilter, setRankFilter] = useState<"WEEKLY" | "MONTHLY" | "ALL">("ALL");
  const [creatorFilter, setCreatorFilter] = useState<"WEEKLY" | "MONTHLY" | "ALL">("MONTHLY");

  const { data: videos = [] } = useQuery<any[]>({ queryKey: ["/api/videos"] });
  const { data: liveStreams = [] } = useQuery<any[]>({ queryKey: ["/api/live-streams"] });
  const { data: rankedVideos = [] } = useQuery<any[]>({ queryKey: ["/api/videos/ranked"] });
  const { data: creators = [] } = useQuery<any[]>({ queryKey: ["/api/creators"] });
  const unreadCount = useUnreadCount();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stock</Text>
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.liveButton}>
            <Ionicons name="radio-outline" size={14} color={C.accent} />
            <Text style={styles.liveButtonText}>LIVE</Text>
          </View>
          <Pressable style={styles.notifButton} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Banner */}
        <Pressable style={styles.premiumBanner}>
          <View style={styles.premiumLeft}>
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
            <View>
              <Text style={styles.premiumTitle}>LiveStock Premium</Text>
              <Text style={styles.premiumSub}>30日間の無料トライアル実施中。すべての機能を解放。</Text>
            </View>
          </View>
          <Pressable style={styles.detailButton}>
            <Text style={styles.detailButtonText}>詳細</Text>
          </Pressable>
        </Pressable>

        {/* 新着動画 */}
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={16} color={C.accent} />
          <Text style={styles.sectionTitle}>新着動画</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {videos.map((v) => <VideoCard key={v.id} item={v} />)}
        </ScrollView>

        {/* 現在ライブ中 */}
        <View style={styles.sectionHeader}>
          <View style={styles.liveDotInline} />
          <Text style={styles.sectionTitle}>現在ライブ中</Text>
          <Pressable style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {liveStreams.map((s) => <LiveCard key={s.id} item={s} />)}
        </ScrollView>

        {/* 有料動画ランキング */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.liveDotInline, { backgroundColor: C.accent }]} />
            <Text style={styles.sectionTitle}>有料動画ランキング</Text>
          </View>
          <View style={styles.filterPills}>
            {(["WEEKLY", "MONTHLY", "ALL"] as const).map((f) => (
              <Pressable
                key={f}
                style={[styles.filterPill, rankFilter === f && styles.filterPillActive]}
                onPress={() => setRankFilter(f)}
              >
                <Text style={[styles.filterPillText, rankFilter === f && styles.filterPillTextActive]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {rankedVideos.map((v) => <RankedVideoCard key={v.id} item={v} />)}
        </ScrollView>

        {/* 配信者ランキング */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.liveDotInline, { backgroundColor: C.orange }]} />
            <Text style={styles.sectionTitle}>配信者ランキング</Text>
          </View>
          <View style={styles.filterPills}>
            {(["WEEKLY", "MONTHLY", "ALL"] as const).map((f) => (
              <Pressable
                key={f}
                style={[styles.filterPill, creatorFilter === f && styles.filterPillActive]}
                onPress={() => setCreatorFilter(f)}
              >
                <Text style={[styles.filterPillText, creatorFilter === f && styles.filterPillTextActive]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {creators.map((c) => <CreatorRankCard key={c.id} item={c} />)}
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
    backgroundColor: C.bg,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
  },
  logoLive: {
    color: C.text,
  },
  logoStock: {
    color: C.accent,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: C.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveButtonText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  notifButton: {
    position: "relative",
  },
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
  notifBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.premium,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2A5FA5",
  },
  premiumLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  proBadge: {
    backgroundColor: C.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  premiumTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  premiumSub: {
    color: C.textSec,
    fontSize: 11,
    marginTop: 2,
  },
  detailButton: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
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
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },
  liveDotInline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.live,
  },
  viewAllBtn: {
    marginLeft: "auto",
  },
  viewAllText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  filterPills: {
    flexDirection: "row",
    gap: 4,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.surface2,
  },
  filterPillActive: {
    backgroundColor: C.accent,
  },
  filterPillText: {
    color: C.textSec,
    fontSize: 10,
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#fff",
  },
  hScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  videoCard: {
    width: 180,
  },
  videoThumbContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  videoThumb: {
    width: 180,
    height: 101,
    borderRadius: 8,
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  videoInfo: {
    marginTop: 8,
    gap: 3,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  communityText: {
    color: C.textSec,
    fontSize: 11,
    flex: 1,
  },
  videoTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    color: C.textMuted,
    fontSize: 10,
    marginRight: 4,
  },
  metaTextSingle: {
    color: C.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  priceText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: C.green,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  freeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  liveCard: {
    width: 180,
  },
  liveThumbContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  liveThumb: {
    width: 180,
    height: 101,
    borderRadius: 8,
  },
  liveBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: C.live,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  viewerBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  liveInfo: {
    marginTop: 8,
    gap: 3,
  },
  rankedCard: {
    width: 180,
  },
  rankedThumb: {
    width: 180,
    height: 101,
    borderRadius: 8,
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.orange,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  creatorCard: {
    width: 220,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  creatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankCircleText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: C.accent,
  },
  creatorNameBlock: {
    flex: 1,
  },
  creatorName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  creatorCommunity: {
    color: C.textSec,
    fontSize: 11,
    marginTop: 2,
  },
  heatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface2,
    borderRadius: 8,
    padding: 10,
  },
  heatLabel: {
    color: C.textSec,
    fontSize: 11,
    flex: 1,
  },
  heatValue: {
    color: C.orange,
    fontSize: 18,
    fontWeight: "800",
  },
  creatorStats: {
    gap: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    color: C.textSec,
    fontSize: 12,
    flex: 1,
  },
  statValue: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  revenueShareRow: {
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  revenueShareLabel: {
    color: C.textSec,
    fontSize: 11,
  },
  revenueShareValue: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
  },
});
