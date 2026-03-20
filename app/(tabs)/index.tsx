import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { F } from "@/constants/fonts";
import { getTabTopInset, getTabBottomInset } from "@/constants/layout";
import { getApiUrl } from "@/lib/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppLogo } from "@/components/AppLogo";
import { useAuth } from "@/lib/auth";

const { width: SCREEN_W } = Dimensions.get("window");
const PANEL_W = Math.round(SCREEN_W * 0.72);
const HERO_H = Math.round(SCREEN_W * 0.56);
const MENTOR_W = 200;

type FeedTab = "all" | "following" | "recommended";

function useUnreadCount() {
  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30_000,
  });
  return data?.count ?? 0;
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

// ─── Live Dot ────────────────────────────────────────────────────────────────
function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.liveDotAnim, { opacity: pulse }]} />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  accent,
  right,
}: {
  title: string;
  accent?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={[styles.sectionAccentBar, { backgroundColor: accent ? C.live : C.accent }]} />
        <Text style={[styles.sectionTitle, accent && { color: C.live }]}>{title}</Text>
      </View>
      {right && <View style={styles.sectionHeaderRight}>{right}</View>}
    </View>
  );
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────
function HeroCard({ item, isDemo }: { item: any; isDemo: boolean }) {
  return (
    <Pressable
      style={[styles.heroCard, { width: SCREEN_W }]}
      onPress={() =>
        router.push(isDemo ? (`/video/${item.id}?demo=1` as any) : (`/video/${item.id}` as any))
      }
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.heroThumb} contentFit="cover" />
      ) : (
        <View style={[styles.heroThumb, { backgroundColor: C.surface2 }]} />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
        style={styles.heroGradient}
      />
      <View style={styles.heroInfo}>
        <View style={styles.heroMeta}>
          <Image source={{ uri: item.avatar }} style={styles.heroAvatar} contentFit="cover" />
          <Text style={styles.heroCommunity} numberOfLines={1}>{item.community}</Text>
          {item.price != null && item.price > 0 ? (
            <View style={styles.heroPriceBadge}>
              <Text style={styles.heroPriceText}>¥{item.price.toLocaleString()}</Text>
            </View>
          ) : (
            <View style={[styles.heroPriceBadge, { backgroundColor: C.green }]}>
              <Text style={styles.heroPriceText}>FREE</Text>
            </View>
          )}
        </View>
        <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.heroStats}>
          <Ionicons name="eye-outline" size={11} color="rgba(255,255,255,0.6)" />
          <Text style={styles.heroStatText}>{formatNumber(item.views)}</Text>
          <Text style={styles.heroStatDot}>·</Text>
          <Text style={styles.heroStatText}>{item.timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ item, isDemo }: { item: any; isDemo: boolean }) {
  const isPhoto = !item.duration || item.duration === "00:00";
  return (
    <Pressable
      style={styles.videoCard}
      onPress={() =>
        router.push(isDemo ? (`/video/${item.id}?demo=1` as any) : (`/video/${item.id}` as any))
      }
    >
      <View style={styles.videoThumbWrap}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.videoThumb} contentFit="cover" />
        ) : (
          <View style={[styles.videoThumb, { backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="document-text-outline" size={24} color={C.textMuted} />
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.videoThumbGradient}
        />
        <View style={styles.videoThumbBadgeRow}>
          {isPhoto ? (
            <View style={styles.typeBadge}>
              <Ionicons name="image-outline" size={9} color="#fff" />
              <Text style={styles.typeBadgeText}>写真</Text>
            </View>
          ) : (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.duration}</Text>
            </View>
          )}
          {item.price != null && item.price > 0 ? (
            <View style={[styles.typeBadge, { backgroundColor: C.accent }]}>
              <Text style={[styles.typeBadgeText, { color: "#000" }]}>¥{item.price.toLocaleString()}</Text>
            </View>
          ) : (
            <View style={[styles.typeBadge, { backgroundColor: C.green }]}>
              <Text style={styles.typeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
          <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </Pressable>
  );
}

// ─── Live Card ────────────────────────────────────────────────────────────────
function LiveCard({ item }: { item: any }) {
  return (
    <Pressable style={styles.liveCard} onPress={() => router.push(`/live/${item.id}`)}>
      <View style={styles.liveThumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.liveThumb} contentFit="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          style={styles.liveThumbGradient}
        />
        {item.isDemo ? (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
        ) : (
          <View style={styles.liveBadge}>
            <LiveDot />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye-outline" size={10} color="#fff" />
          <Text style={styles.viewerText}>{formatNumber(item.viewers)}</Text>
        </View>
      </View>
      <View style={styles.liveInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </Pressable>
  );
}

// ─── Mentor Card ──────────────────────────────────────────────────────────────
function MentorCard({ item }: { item: any }) {
  return (
    <Pressable
      style={styles.mentorCard}
      onPress={() => router.push(`/twoshot-booking/${item.id}`)}
    >
      <View style={styles.mentorThumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.mentorThumb} contentFit="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.mentorThumbGradient}
        />
        <View style={styles.mentorBadge}>
          <Text style={styles.mentorBadgeText}>{item.categoryLabel ?? "メンター"}</Text>
        </View>
        <View style={styles.mentorPriceOverlay}>
          <Text style={styles.mentorPriceText}>¥{item.price?.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.mentorInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.creator}</Text>
        </View>
        <Text style={styles.mentorTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.mentorMeta}>
          <Ionicons name="time-outline" size={10} color={C.textMuted} />
          <Text style={styles.mentorMetaText}>{item.duration}</Text>
          <Text style={styles.mentorMetaDot}>·</Text>
          <Text style={styles.mentorMetaText}>残り{item.spotsLeft}枠</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Ranked Video Card ────────────────────────────────────────────────────────
function RankedVideoCard({ item, isDemo, rank }: { item: any; isDemo: boolean; rank: number }) {
  return (
    <Pressable
      style={styles.rankedCard}
      onPress={() =>
        router.push(isDemo ? (`/video/${item.id}?demo=1` as any) : (`/video/${item.id}` as any))
      }
    >
      <View style={styles.rankedThumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.rankedThumb} contentFit="cover" />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.rankedGradient} />
        <View style={[styles.rankNumBadge, rank <= 3 && { backgroundColor: C.orange }]}>
          <Text style={styles.rankNumText}>{rank}</Text>
        </View>
      </View>
      <View style={styles.rankedInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.rankedPrice}>¥{item.price?.toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}

// ─── Creator Rank Card ────────────────────────────────────────────────────────
function CreatorRankCard({ item }: { item: any }) {
  const borderColor = item.rank === 1 ? C.orange : item.rank === 2 ? C.textSec : item.rank === 3 ? "#cd7f32" : C.border;
  return (
    <Pressable
      style={[styles.creatorCard, { borderColor }]}
      onPress={() => router.push(`/livers/${item.id}`)}
    >
      <View style={styles.creatorHeader}>
        <View style={[styles.rankCircle, { backgroundColor: item.rank <= 3 ? C.orange : C.surface3 }]}>
          <Text style={styles.rankCircleText}>{item.rank}</Text>
        </View>
        <Image source={{ uri: item.avatar }} style={styles.creatorAvatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.creatorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.creatorCommunity} numberOfLines={1}>{item.community}</Text>
        </View>
      </View>
      <View style={styles.heatRow}>
        <Ionicons name="flame" size={12} color={C.orange} />
        <Text style={styles.heatLabel}>経済的熱量</Text>
        <Text style={styles.heatValue}>{item.heatScore}B</Text>
      </View>
      <View style={styles.creatorStats}>
        {[
          { icon: "eye-outline", label: "累計視聴", value: formatNumber(item.totalViews) },
          { icon: "cash-outline", label: "総収益", value: `¥${item.revenue.toLocaleString()}` },
          { icon: "people-outline", label: "フォロワー", value: formatNumber(item.followers) },
        ].map((r) => (
          <View key={r.label} style={styles.statRow}>
            <Ionicons name={r.icon as any} size={11} color={C.textSec} />
            <Text style={styles.statLabel}>{r.label}</Text>
            <Text style={styles.statValue}>{r.value}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

// ─── Feed Tab Row ─────────────────────────────────────────────────────────────
function FeedTabRow({ activeTab, onTabChange }: { activeTab: FeedTab; onTabChange: (t: FeedTab) => void }) {
  const tabs: { key: FeedTab; label: string }[] = [
    { key: "all", label: "ALL" },
    { key: "following", label: "FOLLOWING" },
    { key: "recommended", label: "HOT" },
  ];
  return (
    <View style={styles.feedTabRow}>
      {tabs.map((t) => (
        <Pressable key={t.key} style={[styles.feedTab, activeTab === t.key && styles.feedTabActive]} onPress={() => onTabChange(t.key)}>
          <Text style={[styles.feedTabText, activeTab === t.key && styles.feedTabTextActive]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_VIDEOS = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop", duration: "12:34", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", community: "地下アイドル界隈", title: "初めての生配信！みんなとお話したい♪", views: 12400, timeAgo: "2時間前", price: null },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=225&fit=crop", duration: "28:15", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop", community: "キャバ嬢・ホスト界隈", title: "今夜のトーク！恋愛相談なんでも聞くよ✨", views: 8900, timeAgo: "4時間前", price: 500 },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop", duration: "45:00", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", community: "英会話クラブ", title: "TOEIC満点講師が教える！ビジネス英語入門", views: 31200, timeAgo: "6時間前", price: 1000 },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=225&fit=crop", duration: "00:00", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop", community: "JK日常界隈", title: "今日のコーデ公開📸 秋冬パーカーコーデ", views: 5600, timeAgo: "8時間前", price: null },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=225&fit=crop", duration: "33:20", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", community: "占いサロン", title: "【タロット占い】今週のあなたの運勢を読み解く", views: 19800, timeAgo: "12時間前", price: 300 },
];

const DUMMY_LIVE = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", community: "地下アイドル界隈", title: "スタジオ練習 垂れ流し", viewers: 47, isDemo: true },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", community: "D&Bシーン", title: "JAMセッション LIVE", viewers: 23, isDemo: true },
];

const DUMMY_MENTORS = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=169&fit=crop", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", creator: "Yuki", title: "なんでも話せる悩み相談", categoryLabel: "悩み相談", price: 2000, duration: "30分", spotsLeft: 3 },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=169&fit=crop", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", creator: "Kenji", title: "ビジネス英会話 集中レッスン", categoryLabel: "英会話", price: 3500, duration: "45分", spotsLeft: 5 },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=169&fit=crop", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", creator: "Hana", title: "ギター基礎から教えます", categoryLabel: "音楽レッスン", price: 2500, duration: "30分", spotsLeft: 2 },
];

const DUMMY_RANKED: Record<string, any[]> = {
  WEEKLY: DUMMY_VIDEOS.slice(0, 5).map((v, i) => ({ ...v, rank: i + 1 })),
  MONTHLY: [...DUMMY_VIDEOS].reverse().slice(0, 5).map((v, i) => ({ ...v, rank: i + 1 })),
  ALL: DUMMY_VIDEOS.slice(0, 5).map((v, i) => ({ ...v, rank: i + 1 })),
};

const DUMMY_CREATORS: Record<string, any[]> = {
  WEEKLY: [
    { id: 1, rank: 1, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", name: "Yuki", community: "地下アイドル界隈", heatScore: 9840, totalViews: 124000, revenue: 480000, streamCount: 32, followers: 8900, revenueShare: 95 },
    { id: 2, rank: 2, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", name: "Kenji", community: "英会話クラブ", heatScore: 7210, totalViews: 98000, revenue: 320000, streamCount: 18, followers: 5400, revenueShare: 95 },
    { id: 3, rank: 3, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop", name: "Hana", community: "占いサロン", heatScore: 5630, totalViews: 76000, revenue: 210000, streamCount: 24, followers: 4200, revenueShare: 95 },
  ],
  MONTHLY: [
    { id: 1, rank: 1, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", name: "Yuki", community: "地下アイドル界隈", heatScore: 42000, totalViews: 520000, revenue: 1800000, streamCount: 120, followers: 8900, revenueShare: 95 },
    { id: 2, rank: 2, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", name: "Kenji", community: "英会話クラブ", heatScore: 31000, totalViews: 410000, revenue: 1200000, streamCount: 72, followers: 5400, revenueShare: 95 },
  ],
  ALL: [
    { id: 1, rank: 1, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", name: "Yuki", community: "地下アイドル界隈", heatScore: 198000, totalViews: 2400000, revenue: 8200000, streamCount: 480, followers: 8900, revenueShare: 95 },
  ],
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rankFilter, setRankFilter] = useState<"WEEKLY" | "MONTHLY" | "ALL">("WEEKLY");
  const [videoFeedTab, setVideoFeedTab] = useState<FeedTab>("all");
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  const { data: apiVideos = [] } = useQuery<any[]>({ queryKey: ["/api/videos"] });
  const { data: apiLive = [] } = useQuery<any[]>({ queryKey: ["/api/live-streams"] });
  const { data: myCommunities = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/communities/me"],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      try {
        const base = getApiUrl();
        const token = await AsyncStorage.getItem("auth_token");
        const res = await fetch(new URL("/api/communities/me", base).toString(), {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });
  const { data: apiRanked = [] } = useQuery<any[]>({ queryKey: ["/api/videos/ranked"] });
  type BookingSession = {
    id: number; creator: string; category: string; categoryLabel: string; title: string;
    avatar: string; thumbnail: string; date: string; time: string; duration: string;
    price: number; spotsTotal: number; spotsLeft: number; rating: number; reviewCount: number; tag: string | null;
  };
  const { data: twoshotSessions = [] } = useQuery<BookingSession[]>({ queryKey: ["/api/booking-sessions"] });
  const unreadCount = useUnreadCount();
  type Announcement = { id: number; title: string; body: string; type: string; isPinned: boolean; createdAt: string };
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });

  const DUMMY_ANNOUNCEMENT: Announcement[] = [
    { id: 0, title: "【イベント】賞金100万円イベント開催中", body: "", type: "event", isPinned: true, createdAt: "" },
  ];
  const displayAnnouncements = announcements.length > 0 ? announcements : DUMMY_ANNOUNCEMENT;

  const usingDemoVideos = apiVideos.length === 0;
  const allVideos = usingDemoVideos ? DUMMY_VIDEOS : apiVideos;
  const allLiveStreams = apiLive.length > 0 ? apiLive : DUMMY_LIVE;

  const communityIds = useMemo(() => new Set(myCommunities.map((c) => c.id)), [myCommunities]);
  const communityNames = useMemo(() => new Set(myCommunities.map((c) => c.name)), [myCommunities]);

  const [randomCommunity, setRandomCommunity] = useState<{ id: number; name: string } | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (myCommunities.length === 0) { setRandomCommunity(null); return; }
      const idx = Math.floor(Math.random() * myCommunities.length);
      setRandomCommunity(myCommunities[idx]);
    }, [myCommunities])
  );
  const randomCommunityId = randomCommunity?.id ?? null;

  type JukeboxData = { state: { currentVideoTitle: string | null; isPlaying: boolean } | null; queue: unknown[] };
  const { data: jukeboxData } = useQuery<JukeboxData>({
    queryKey: randomCommunityId ? [`/api/jukebox/${randomCommunityId}`] : ["jukebox:none"],
    enabled: !!randomCommunityId && !!user,
  });

  const videos = useMemo(() => {
    let list = [...allVideos];
    if (videoFeedTab === "following" && user) {
      list = list.filter((v) => (v.communityId && communityIds.has(v.communityId)) || (v.community && communityNames.has(v.community)));
    } else if (videoFeedTab === "recommended") {
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    return list;
  }, [allVideos, videoFeedTab, user, communityIds, communityNames]);

  const usingDemoRanked = apiRanked.length === 0;
  const rankedVideos = usingDemoRanked ? DUMMY_RANKED[rankFilter] : apiRanked;
  const mentors = twoshotSessions.length > 0 ? twoshotSessions : DUMMY_MENTORS;

  const topInset = getTabTopInset(insets);
  const bottomInset = getTabBottomInset();

  // Hero = first 3 videos
  const heroVideos = videos.slice(0, 3);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <AppLogo height={32} />
        <View style={styles.headerRight}>
          {user && (
            <Pressable style={styles.broadcastBtn} onPress={() => router.push("/broadcast" as any)}>
              <LiveDot />
              <Text style={styles.broadcastBtnText}>LIVE</Text>
            </Pressable>
          )}
          <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications?filter=purchase")}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/dm" as any)}>
            <Ionicons name="chatbubble-outline" size={22} color={C.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Announcement Banner ── */}
        {displayAnnouncements.length > 0 && (
          <Pressable
            style={styles.announcementBanner}
            onPress={() => setShowAnnouncementsModal(true)}
          >
            <Ionicons name="megaphone-outline" size={13} color={C.orange} />
            <Text style={styles.announcementBannerText} numberOfLines={1}>
              {displayAnnouncements[0].title}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={C.textMuted} />
          </Pressable>
        )}

        {/* ── Jukebox Banner ── */}
        {user && randomCommunityId && randomCommunity && jukeboxData?.state?.isPlaying && (
          <Pressable style={styles.jukeBanner} onPress={() => router.push(`/jukebox/${randomCommunityId}`)}>
            <View style={styles.jukeBannerLeft}>
              <Ionicons name="musical-notes" size={16} color={C.accent} />
              <View>
                <Text style={styles.jukeBannerLabel}>JUKE BOT</Text>
                <Text style={styles.jukeBannerTrack} numberOfLines={1}>
                  {jukeboxData.state?.currentVideoTitle ?? "再生中"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
          </Pressable>
        )}

        {/* ── Hero Carousel ── */}
        {heroVideos.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.heroScroll}
          >
            {heroVideos.map((v) => (
              <HeroCard key={v.id} item={v} isDemo={usingDemoVideos} />
            ))}
          </ScrollView>
        )}

        {/* ── Videos ── */}
        <View style={styles.sectionGap} />
        <SectionHeader
          title="VIDEOS"
          right={<FeedTabRow activeTab={videoFeedTab} onTabChange={setVideoFeedTab} />}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {videos.map((v) => (
            <VideoCard key={v.id} item={v} isDemo={usingDemoVideos} />
          ))}
        </ScrollView>

        {/* ── Now Live ── */}
        <View style={styles.sectionGap} />
        <View style={styles.sectionDivider} />
        <View style={styles.sectionGap} />
        <SectionHeader
          title="NOW LIVE"
          accent
          right={
            <Pressable onPress={() => router.push("/live" as any)}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </Pressable>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {allLiveStreams.map((s) => (
            <LiveCard key={s.id} item={s} />
          ))}
        </ScrollView>

        {/* ── Mentor Sessions ── */}
        <View style={styles.sectionGap} />
        <View style={styles.sectionDivider} />
        <View style={styles.sectionGap} />
        <SectionHeader
          title="MENTOR"
          right={
            <Pressable onPress={() => router.push("/mentor-manage" as any)}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </Pressable>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {mentors.map((s: any) => (
            <MentorCard key={s.id} item={s} />
          ))}
        </ScrollView>

        {/* ── Video Ranking ── */}
        <View style={styles.sectionGap} />
        <View style={styles.sectionDivider} />
        <View style={styles.sectionGap} />
        <SectionHeader
          title="RANKING"
          right={
            <View style={styles.filterPills}>
              {(["WEEKLY", "MONTHLY", "ALL"] as const).map((f) => (
                <Pressable
                  key={f}
                  style={[styles.filterPill, rankFilter === f && styles.filterPillActive]}
                  onPress={() => setRankFilter(f)}
                >
                  <Text style={[styles.filterPillText, rankFilter === f && styles.filterPillTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {rankedVideos.map((v: any, i: number) => (
            <RankedVideoCard key={v.id} item={v} isDemo={usingDemoRanked} rank={i + 1} />
          ))}
        </ScrollView>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Announcements Modal ── */}
      <Modal visible={showAnnouncementsModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAnnouncementsModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>お知らせ</Text>
              <Pressable onPress={() => setShowAnnouncementsModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={C.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }} showsVerticalScrollIndicator={false}>
              {displayAnnouncements.map((a) => (
                <View key={a.id} style={styles.modalAnnouncementItem}>
                  {a.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Ionicons name="pin" size={9} color={C.orange} />
                      <Text style={styles.pinnedText}>固定</Text>
                    </View>
                  )}
                  <Text style={styles.modalAnnouncementTitle}>{a.title}</Text>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: C.bg,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  broadcastBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.live,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  broadcastBtnText: {
    color: C.live,
    fontSize: 10,
    fontFamily: F.mono,
    letterSpacing: 1.5,
    fontWeight: "400",
  },
  iconBtn: { position: "relative" },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.live,
    borderRadius: 2,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  notifBadgeText: { color: "#fff", fontSize: 8, fontWeight: "700" },

  scroll: { flex: 1 },

  // Announcement Banner
  announcementBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  announcementBannerText: {
    flex: 1,
    color: C.text,
    fontSize: 12,
    fontFamily: F.mono,
    letterSpacing: 0.3,
  },

  // Jukebox Banner
  jukeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.accent,
  },
  jukeBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  jukeBannerLabel: {
    color: C.accent,
    fontSize: 9,
    fontFamily: F.mono,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  jukeBannerTrack: { color: C.text, fontSize: 13, fontFamily: F.display, fontWeight: "700" },

  // Hero
  heroScroll: { marginBottom: 0 },
  heroCard: { height: HERO_H, position: "relative" },
  heroThumb: { width: SCREEN_W, height: HERO_H },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_H * 0.7,
  },
  heroInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 6,
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroAvatar: { width: 22, height: 22, borderRadius: 2 },
  heroCommunity: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: F.mono, flex: 1 },
  heroPriceBadge: {
    backgroundColor: C.accent,
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  heroPriceText: { color: "#000", fontSize: 10, fontFamily: F.mono, fontWeight: "700" },
  heroTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: F.display,
    fontWeight: "800",
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  heroStats: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroStatText: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontFamily: F.mono },
  heroStatDot: { color: "rgba(255,255,255,0.3)", fontSize: 10 },

  // Section
  sectionGap: { height: 20 },
  sectionDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionHeaderRight: {},
  sectionAccentBar: { width: 3, height: 20, borderRadius: 1 },
  sectionTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: F.display,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Feed Tabs
  feedTabRow: { flexDirection: "row", gap: 2 },
  feedTab: { paddingHorizontal: 8, paddingVertical: 4 },
  feedTabActive: { borderBottomWidth: 1.5, borderBottomColor: C.accent },
  feedTabText: { color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 0.8 },
  feedTabTextActive: { color: C.accent },

  // Filter Pills
  filterPills: { flexDirection: "row", gap: 4 },
  filterPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2, backgroundColor: C.surface2 },
  filterPillActive: { backgroundColor: C.accent },
  filterPillText: { color: C.textSec, fontSize: 9, fontFamily: F.mono, letterSpacing: 0.8 },
  filterPillTextActive: { color: "#000" },

  viewAllText: { color: C.accent, fontSize: 9, fontFamily: F.mono, letterSpacing: 1.2, textTransform: "uppercase" },

  hScroll: { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },

  // Video Card
  videoCard: { width: PANEL_W, overflow: "hidden", backgroundColor: C.surface },
  videoThumbWrap: { position: "relative", overflow: "hidden", aspectRatio: 16 / 9 },
  videoThumb: { width: PANEL_W, aspectRatio: 16 / 9 },
  videoThumbGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  videoThumbBadgeRow: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  typeBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  typeBadgeText: { color: "#fff", fontSize: 9, fontFamily: F.mono },
  videoInfo: { paddingHorizontal: 10, paddingVertical: 8, gap: 4, backgroundColor: C.surface },

  // Live Card
  liveCard: { width: PANEL_W, overflow: "hidden", backgroundColor: C.surface },
  liveThumbWrap: { position: "relative", overflow: "hidden", aspectRatio: 16 / 9 },
  liveThumb: { width: PANEL_W, aspectRatio: 16 / 9 },
  liveThumbGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.live,
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveBadgeText: { color: "#fff", fontSize: 10, fontFamily: F.mono, fontWeight: "700", letterSpacing: 1 },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5 },
  viewerBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewerText: { color: "#fff", fontSize: 10, fontFamily: F.mono },
  liveInfo: { paddingHorizontal: 10, paddingVertical: 8, gap: 4, backgroundColor: C.surface },

  // Mentor Card
  mentorCard: { width: MENTOR_W, overflow: "hidden", backgroundColor: C.surface },
  mentorThumbWrap: { position: "relative", overflow: "hidden", aspectRatio: 16 / 9 },
  mentorThumb: { width: MENTOR_W, aspectRatio: 16 / 9 },
  mentorThumbGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%" },
  mentorBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: C.accent,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mentorBadgeText: { color: "#000", fontSize: 9, fontFamily: F.mono, fontWeight: "700" },
  mentorPriceOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mentorPriceText: { color: C.accent, fontSize: 11, fontFamily: F.mono, fontWeight: "700" },
  mentorInfo: { paddingHorizontal: 10, paddingVertical: 8, gap: 4, backgroundColor: C.surface },
  mentorTitle: { color: C.text, fontSize: 12, fontWeight: "600", lineHeight: 16 },
  mentorMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  mentorMetaText: { color: C.textMuted, fontSize: 10, fontFamily: F.mono },
  mentorMetaDot: { color: C.textMuted, fontSize: 10 },

  // Ranked Card
  rankedCard: { width: 180, overflow: "hidden" },
  rankedThumbWrap: { position: "relative", overflow: "hidden", borderRadius: 2 },
  rankedThumb: { width: 180, aspectRatio: 16 / 9 },
  rankedGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  rankNumBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: C.surface3,
    width: 28,
    height: 28,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumText: { color: "#fff", fontSize: 14, fontFamily: F.display, fontWeight: "800" },
  rankedInfo: { paddingTop: 8, gap: 3 },
  rankedPrice: { color: C.accent, fontSize: 13, fontFamily: F.mono, fontWeight: "700", marginTop: 2 },

  // Creator Card
  creatorCard: {
    width: 220,
    backgroundColor: C.surface,
    borderRadius: 2,
    padding: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  creatorHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rankCircleText: { color: "#fff", fontSize: 15, fontFamily: F.display, fontWeight: "800" },
  creatorAvatar: { width: 42, height: 42, borderRadius: 2, borderWidth: 1.5, borderColor: C.accent },
  creatorName: { color: C.text, fontSize: 13, fontWeight: "700", fontFamily: F.display },
  creatorCommunity: { color: C.textSec, fontSize: 10, marginTop: 2, fontFamily: F.mono },
  heatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface2,
    borderRadius: 2,
    padding: 8,
  },
  heatLabel: { color: C.textSec, fontSize: 10, flex: 1, fontFamily: F.mono },
  heatValue: { color: C.orange, fontSize: 18, fontFamily: F.display, fontWeight: "800" },
  creatorStats: { gap: 5 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statLabel: { color: C.textSec, fontSize: 11, flex: 1 },
  statValue: { color: C.text, fontSize: 12, fontWeight: "700" },

  // Shared
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  smallAvatar: { width: 18, height: 18, borderRadius: 2 },
  communityText: { color: C.textSec, fontSize: 10, fontFamily: F.mono, flex: 1 },
  timeAgoText: { color: C.textMuted, fontSize: 9, fontFamily: F.mono, flexShrink: 0 },
  videoTitle: { color: C.text, fontSize: 12, fontWeight: "600", lineHeight: 16 },

  // Live Dot
  liveDotAnim: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.live },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.bg, borderTopLeftRadius: 6, borderTopRightRadius: 6, maxHeight: "75%" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: { color: C.text, fontSize: 16, fontFamily: F.display, fontWeight: "800", letterSpacing: 1 },
  modalAnnouncementItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 4 },
  pinnedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  pinnedText: { color: C.orange, fontSize: 10, fontFamily: F.mono },
  modalAnnouncementTitle: { color: C.text, fontSize: 13 },
});
