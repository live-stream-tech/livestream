import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { getTabTopInset, getTabBottomInset } from "@/constants/layout";
import { getApiUrl } from "@/lib/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppLogo } from "@/components/AppLogo";
import { useAuth } from "@/lib/auth";

type FeedTab = "all" | "following" | "recommended";

type Notif = { id: number; isRead: boolean };

function useUnreadCount() {
  const { data = [] } = useQuery<Notif[]>({ queryKey: ["/api/notifications"] });
  return (data as Notif[]).filter((n) => !n.isRead).length;
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

function VideoCard({ item, isDemo, panelWidth }: { item: any; isDemo: boolean; panelWidth: number }) {
  const isPhotoPost = !item.duration || item.duration === "00:00";
  return (
    <Pressable
      style={[styles.panelCard, { width: panelWidth }]}
      onPress={() =>
        router.push(isDemo ? (`/video/${item.id}?demo=1` as any) : (`/video/${item.id}` as any))
      }
    >
      <View style={[styles.panelThumbWrap, { width: panelWidth }]}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={[styles.panelThumb, { width: panelWidth }]} contentFit="cover" />
        ) : (
          <View style={[styles.panelThumb, styles.noThumbPlaceholder, { width: panelWidth }]}>
            <Ionicons name="document-text-outline" size={28} color={C.textMuted} />
          </View>
        )}
        {isPhotoPost ? (
          <View style={styles.photoBadge}>
            <Ionicons name="image-outline" size={11} color="#fff" />
            <Text style={styles.photoBadgeText}>写真</Text>
          </View>
        ) : (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
        {/* 画像内オーバーレイ: 視聴数・価格 */}
        <View style={styles.panelThumbOverlay}>
          <View style={styles.panelThumbOverlayRight}>
            <Ionicons name="eye-outline" size={9} color="rgba(255,255,255,0.9)" />
            <Text style={styles.overlayMetaText}>{formatNumber(item.views)}</Text>
            {item.price != null && item.price > 0 ? (
              <Text style={styles.overlayPriceText}>¥{item.price.toLocaleString()}</Text>
            ) : (
              <Text style={styles.overlayFreeText}>無料</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.panelInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.videoTimeAgo}>{item.timeAgo}</Text>
      </View>
    </Pressable>
  );
}

function LiveCard({ item, panelWidth }: { item: any; panelWidth: number }) {
  return (
    <Pressable style={[styles.panelCard, { width: panelWidth }]} onPress={() => router.push(`/live/${item.id}`)}>
      <View style={[styles.panelThumbWrap, { width: panelWidth }]}>
        <Image source={{ uri: item.thumbnail }} style={[styles.panelThumb, { width: panelWidth }]} contentFit="cover" />
        {item.isDemo ? (
          <View style={styles.comingSoonRibbon}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
        ) : (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye-outline" size={11} color="#fff" />
          <Text style={styles.viewerText}>{formatNumber(item.viewers)}</Text>
        </View>
      </View>
      <View style={styles.panelInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.avatar }} style={styles.smallAvatar} contentFit="cover" />
          <Text style={styles.communityText} numberOfLines={1}>{item.community}</Text>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </Pressable>
  );
}

function RankedVideoCard({ item, isDemo }: { item: any; isDemo: boolean }) {
  return (
    <Pressable
      style={styles.rankedCard}
      onPress={() =>
        router.push(isDemo ? (`/video/${item.id}?demo=1` as any) : (`/video/${item.id}` as any))
      }
    >
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
    <Pressable style={[styles.creatorCard, { borderColor }]} onPress={() => router.push(`/livers/${item.id}`)}>
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
    </Pressable>
  );
}

const DUMMY_VIDEOS = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop", duration: "12:34", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", community: "地下アイドル界隈", title: "【アイドル】初めての生配信！みんなとお話したい♪", views: 12400, timeAgo: "2時間前", price: null },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop", duration: "28:15", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop", community: "キャバ嬢・ホスト界隈", title: "今夜のトーク！恋愛相談なんでも聞くよ✨", views: 8900, timeAgo: "4時間前", price: 500 },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", duration: "45:00", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", community: "英会話クラブ", title: "TOEIC満点講師が教える！ビジネス英語入門", views: 31200, timeAgo: "6時間前", price: 1000 },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=200&fit=crop", duration: "00:00", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop", community: "JK日常界隈", title: "今日のコーデ公開📸 秋冬パーカーコーデ", views: 5600, timeAgo: "8時間前", price: null },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop", duration: "33:20", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", community: "占いサロン", title: "【タロット占い】今週のあなたの運勢を読み解く", views: 19800, timeAgo: "12時間前", price: 300 },
];

const DUMMY_LIVE = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
    community: "地下アイドル界隈",
    title: "星空みゆ♪ 歌とダンスでお届け！",
    viewers: 1240,
    timeAgo: "配信予定",
    isDemo: true,
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop",
    community: "キャバ嬢・ホスト界隈",
    title: "麗華の夜トーク【本音で語るよ】",
    viewers: 890,
    timeAgo: "配信予定",
    isDemo: true,
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
    community: "フィットネス部",
    title: "朝活！一緒にヨガしよう🧘",
    viewers: 420,
    timeAgo: "配信予定",
    isDemo: true,
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
    community: "占いサロン",
    title: "神崎リナ【深夜の占いタイム🔮】",
    viewers: 312,
    timeAgo: "配信予定",
    isDemo: true,
  },
];

const DUMMY_RANKED: Record<string, any[]> = {
  WEEKLY: [
    { id: 1, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=150&fit=crop", duration: "42:00", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop", community: "キャバ嬢・ホスト界隈", title: "麗華の本音トーク！週間1位", views: 88400, timeAgo: "1日前", price: 500, rank: 1 },
    { id: 2, thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop", duration: "60:00", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", community: "英会話クラブ", title: "完全マスター！TOEIC900点の英語術", views: 54200, timeAgo: "2日前", price: 1000, rank: 2 },
    { id: 3, thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=150&fit=crop", duration: "28:30", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", community: "地下アイドル界隈", title: "みゆの歌唱力全開スペシャル✨", views: 41000, timeAgo: "3日前", price: 300, rank: 3 },
    { id: 4, thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=150&fit=crop", duration: "50:00", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", community: "占いサロン", title: "【限定公開】2025年運勢大鑑定", views: 36700, timeAgo: "4日前", price: 800, rank: 4 },
  ],
  MONTHLY: [
    { id: 5, thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=150&fit=crop", duration: "55:00", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop", community: "フィットネス部", title: "月間1位！脂肪燃焼フルプログラム", views: 210000, timeAgo: "2週間前", price: 1500, rank: 1 },
    { id: 6, thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=150&fit=crop", duration: "90:00", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop", community: "カウンセリングルーム", title: "心の整え方 〜ストレスを手放すヒント〜", views: 175000, timeAgo: "3週間前", price: 2000, rank: 2 },
    { id: 7, thumbnail: "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=200&h=150&fit=crop", duration: "38:00", avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=40&h=40&fit=crop", community: "料理教室", title: "フレンチのきほん！本格ソースの作り方", views: 142000, timeAgo: "3週間前", price: 800, rank: 3 },
    { id: 8, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=150&fit=crop", duration: "42:00", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop", community: "キャバ嬢・ホスト界隈", title: "麗華の恋愛講座 第3弾", views: 128000, timeAgo: "1ヶ月前", price: 500, rank: 4 },
  ],
  ALL: [
    { id: 9, thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop", duration: "120:00", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", community: "英会話クラブ", title: "【殿堂入り】英語習得の全ロードマップ", views: 850000, timeAgo: "半年前", price: 3000, rank: 1 },
    { id: 10, thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=150&fit=crop", duration: "180:00", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop", community: "カウンセリングルーム", title: "人生を変える心理学の授業【全集】", views: 720000, timeAgo: "1年前", price: 5000, rank: 2 },
    { id: 11, thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=150&fit=crop", duration: "60:00", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", community: "地下アイドル界隈", title: "みゆ1st記念ライブ完全版", views: 654000, timeAgo: "8ヶ月前", price: 1000, rank: 3 },
    { id: 12, thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=150&fit=crop", duration: "90:00", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop", community: "フィットネス部", title: "【総集編】完全版ボディメイクプログラム", views: 590000, timeAgo: "10ヶ月前", price: 2000, rank: 4 },
  ],
};

const DUMMY_CREATORS: Record<string, any[]> = {
  WEEKLY: [
    { id: 1, name: "麗華 -REIKA-", community: "キャバ嬢・ホスト界隈", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop", rank: 1, heatScore: 1414, totalViews: 164800, revenue: 165000, streamCount: 52, followers: 67000, revenueShare: 80 },
    { id: 2, name: "星空みゆ", community: "地下アイドル界隈", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", rank: 2, heatScore: 1090, totalViews: 185320, revenue: 173000, streamCount: 34, followers: 48000, revenueShare: 80 },
    { id: 3, name: "コンビ芸人「ダブルパンチ」", community: "お笑い芸人界隈", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", rank: 3, heatScore: 923, totalViews: 172450, revenue: 119000, streamCount: 45, followers: 92000, revenueShare: 80 },
    { id: 4, name: "まいまい17歳", community: "JK日常界隈", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", rank: 4, heatScore: 865, totalViews: 148900, revenue: 85500, streamCount: 68, followers: 52000, revenueShare: 80 },
  ],
  MONTHLY: [
    { id: 5, name: "桜井 みなみ", community: "アイドル部", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", rank: 1, heatScore: 4.8, totalViews: 125000, revenue: 980000, streamCount: 87, followers: 15200, revenueShare: 80 },
    { id: 6, name: "田中 ゆうき", community: "英会話クラブ", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", rank: 2, heatScore: 4.6, totalViews: 89000, revenue: 650000, streamCount: 62, followers: 9800, revenueShare: 80 },
    { id: 7, name: "伊藤 さやか", community: "カウンセリングルーム", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop", rank: 3, heatScore: 4.7, totalViews: 41000, revenue: 380000, streamCount: 29, followers: 4200, revenueShare: 80 },
    { id: 8, name: "神崎 リナ", community: "占いサロン", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", rank: 4, heatScore: 4.5, totalViews: 73000, revenue: 520000, streamCount: 45, followers: 7600, revenueShare: 80 },
  ],
  ALL: [
    { id: 9, name: "田中 ゆうき", community: "英会話クラブ", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", rank: 1, heatScore: 9999, totalViews: 890000, revenue: 6500000, streamCount: 312, followers: 98000, revenueShare: 80 },
    { id: 10, name: "麗華 -REIKA-", community: "キャバ嬢・ホスト界隈", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop", rank: 2, heatScore: 8821, totalViews: 740000, revenue: 5200000, streamCount: 280, followers: 670000, revenueShare: 80 },
    { id: 11, name: "星空みゆ", community: "地下アイドル界隈", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", rank: 3, heatScore: 7540, totalViews: 620000, revenue: 4100000, streamCount: 201, followers: 480000, revenueShare: 80 },
    { id: 12, name: "伊藤 さやか", community: "カウンセリングルーム", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop", rank: 4, heatScore: 6320, totalViews: 510000, revenue: 3800000, streamCount: 145, followers: 210000, revenueShare: 80 },
  ],
};

const SCREEN_WIDTH = Dimensions.get("window").width;
/** サムネ幅（やや大きめ。右端に次のパネルが少し見える） */
const PANEL_WIDTH = Math.floor(SCREEN_WIDTH * 0.75);

function FeedTabRow({
  activeTab,
  onTabChange,
  inline,
}: {
  activeTab: FeedTab;
  onTabChange: (t: FeedTab) => void;
  inline?: boolean;
}) {
  const tabs: { key: FeedTab; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "following", label: "フォロー中" },
    { key: "recommended", label: "おすすめ" },
  ];
  return (
    <View style={[styles.feedTabRow, inline && styles.feedTabRowInline]}>
      {tabs.map((t) => (
        <Pressable
          key={t.key}
          style={[styles.feedTab, activeTab === t.key && styles.feedTabActive]}
          onPress={() => onTabChange(t.key)}
        >
          <Text style={[styles.feedTabText, activeTab === t.key && styles.feedTabTextActive]}>
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rankFilter, setRankFilter] = useState<"WEEKLY" | "MONTHLY" | "ALL">("ALL");
  const [creatorFilter, setCreatorFilter] = useState<"WEEKLY" | "MONTHLY" | "ALL">("MONTHLY");
  const [creatorTab, setCreatorTab] = useState<"ranking" | "twoshot">("ranking");
  const [videoFeedTab, setVideoFeedTab] = useState<FeedTab>("all");
  const [liveFeedTab, setLiveFeedTab] = useState<FeedTab>("all");
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
    id: number;
    creator: string;
    category: string;
    categoryLabel: string;
    title: string;
    avatar: string;
    thumbnail: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    spotsTotal: number;
    spotsLeft: number;
    rating: number;
    reviewCount: number;
    tag: string | null;
  };
  const { data: twoshotSessions = [] } = useQuery<BookingSession[]>({
    queryKey: ["/api/booking-sessions"],
  });
  const unreadCount = useUnreadCount();
  type Announcement = { id: number; title: string; body: string; type: string; isPinned: boolean; createdAt: string };
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });

  const DUMMY_ANNOUNCEMENT: Announcement[] = [
    {
      id: 0,
      title: "【イベント】「アイドル界隈コミュニティ」で賞金100万円イベント開催中",
      body: "",
      type: "event",
      isPinned: true,
      createdAt: "",
    },
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
      if (myCommunities.length === 0) {
        setRandomCommunity(null);
        return;
      }
      const idx = Math.floor(Math.random() * myCommunities.length);
      setRandomCommunity(myCommunities[idx]);
    }, [myCommunities])
  );
  const randomCommunityId = randomCommunity?.id ?? null;

  type JukeboxData = {
    state: { currentVideoTitle: string | null; isPlaying: boolean } | null;
    queue: unknown[];
  };
  const { data: jukeboxData } = useQuery<JukeboxData>({
    queryKey: randomCommunityId ? [`/api/jukebox/${randomCommunityId}`] : ["jukebox:none"],
    enabled: !!randomCommunityId && !!user,
  });

  const videos = useMemo(() => {
    let list = [...allVideos];
    if (videoFeedTab === "following" && user) {
      list = list.filter(
        (v) =>
          (v.communityId && communityIds.has(v.communityId)) ||
          (v.community && communityNames.has(v.community))
      );
    } else if (videoFeedTab === "recommended") {
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    return list;
  }, [allVideos, videoFeedTab, user, communityIds, communityNames]);

  const liveStreams = useMemo(() => {
    let list = [...allLiveStreams];
    if (liveFeedTab === "following" && user) {
      list = list.filter((s) => s.community && communityNames.has(s.community));
    } else if (liveFeedTab === "recommended") {
      list = [...list].sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0));
    }
    return list;
  }, [allLiveStreams, liveFeedTab, user, communityNames]);
  const usingDemoRanked = apiRanked.length === 0;
  const rankedVideos = usingDemoRanked ? DUMMY_RANKED[rankFilter] : apiRanked;
  const creators = DUMMY_CREATORS[creatorFilter];

  const topInset = getTabTopInset(insets);
  const bottomInset = getTabBottomInset();

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <AppLogo width={160} />
        <View style={styles.headerRight}>
          <Pressable style={styles.notifButton} onPress={() => router.push("/notifications?filter=purchase")}>
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
        {/* 運営からのお知らせ */}
        <Pressable
          style={styles.announcementSection}
          onPress={() => displayAnnouncements.length > 0 && setShowAnnouncementsModal(true)}
        >
          <View style={styles.announcementSectionHeader}>
            <Ionicons name="megaphone-outline" size={16} color={C.accent} />
            <Text style={styles.announcementSectionTitle}>運営からのお知らせ</Text>
          </View>
          {displayAnnouncements.length === 0 ? (
            <View style={styles.announcementCard}>
              <Text style={styles.announcementBody}>現在お知らせはありません</Text>
            </View>
          ) : (
            <>
              {displayAnnouncements.slice(0, 3).map((a) => (
                <View key={a.id} style={styles.announcementCard}>
                  <View style={styles.announcementCardRow}>
                    {a.isPinned && (
                      <View style={styles.announcementPinned}>
                        <Ionicons name="pin" size={10} color={C.orange} />
                        <Text style={styles.announcementPinnedText}>固定</Text>
                      </View>
                    )}
                    <Text style={styles.announcementTitle} numberOfLines={1}>{a.title}</Text>
                  </View>
                </View>
              ))}
              {displayAnnouncements.length > 3 && (
                <Text style={styles.announcementMore}>タップして全て表示 ({displayAnnouncements.length}件)</Text>
              )}
            </>
          )}
        </Pressable>

        {/* お知らせ一覧モーダル */}
        <Modal visible={showAnnouncementsModal} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowAnnouncementsModal(false)}>
            <Pressable style={styles.announcementModalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.announcementModalHeader}>
                <Text style={styles.announcementModalTitle}>運営からのお知らせ</Text>
                <Pressable onPress={() => setShowAnnouncementsModal(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </Pressable>
              </View>
              <ScrollView style={styles.announcementModalScroll} showsVerticalScrollIndicator={false}>
                {displayAnnouncements.map((a) => (
                  <View key={a.id} style={styles.announcementCard}>
                    <View style={styles.announcementCardRow}>
                      {a.isPinned && (
                        <View style={styles.announcementPinned}>
                          <Ionicons name="pin" size={10} color={C.orange} />
                          <Text style={styles.announcementPinnedText}>固定</Text>
                        </View>
                      )}
                      <Text style={styles.announcementTitle} numberOfLines={1}>{a.title}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Juke bot - 再生中のみ表示 */}
        {user && randomCommunityId && randomCommunity && jukeboxData?.state?.isPlaying && (
          <Pressable
            style={styles.jukeBotCard}
            onPress={() => router.push(`/jukebox/${randomCommunityId}`)}
          >
            <View style={styles.jukeBotLeft}>
              <View style={styles.jukeBotIcon}>
                <Ionicons name="musical-notes" size={18} color={C.accent} />
              </View>
              <View>
                <Text style={styles.jukeBotLabel}>Juke bot</Text>
                <Text style={styles.jukeBotCommunity} numberOfLines={1}>
                  {randomCommunity.name}
                </Text>
                <Text style={styles.jukeBotNowPlaying} numberOfLines={2}>
                  {jukeboxData?.state?.isPlaying && jukeboxData?.state?.currentVideoTitle
                    ? `再生中: ${jukeboxData.state.currentVideoTitle}`
                    : "キューを開く"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
          </Pressable>
        )}

        {/* 新着動画 */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="sparkles" size={16} color={C.accent} />
            <Text style={styles.sectionTitle}>新着動画</Text>
          </View>
          <FeedTabRow activeTab={videoFeedTab} onTabChange={setVideoFeedTab} inline />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.panelScroll}
        >
          {videos.map((v) => (
            <VideoCard key={v.id} item={v} isDemo={usingDemoVideos} panelWidth={PANEL_WIDTH} />
          ))}
        </ScrollView>

        {/* 現在ライブ中 */}
        <View style={[styles.sectionHeaderRow, { marginTop: 40 }]}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="radio" size={16} color={C.live} />
            <Text style={styles.sectionTitle}>now</Text>
          </View>
          <View style={styles.feedTabRowWithViewAllRight}>
            <FeedTabRow activeTab={liveFeedTab} onTabChange={setLiveFeedTab} inline />
            <Pressable style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.panelScroll}
        >
          {liveStreams.map((s) => (
            <LiveCard key={s.id} item={s} panelWidth={PANEL_WIDTH} />
          ))}
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
          {rankedVideos.map((v) => (
            <RankedVideoCard key={v.id} item={v} isDemo={usingDemoRanked} />
          ))}
        </ScrollView>

        {/* 配信者ランキング */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.liveDotInline, { backgroundColor: C.orange }]} />
            <Text style={styles.sectionTitle}>配信者ランキング</Text>
          </View>
          <View style={styles.creatorTabs}>
            <Pressable
              style={[styles.creatorTab, creatorTab === "ranking" && styles.creatorTabActive]}
              onPress={() => setCreatorTab("ranking")}
            >
              <Text
                style={[
                  styles.creatorTabText,
                  creatorTab === "ranking" && styles.creatorTabTextActive,
                ]}
              >
                ランキング
              </Text>
            </Pressable>
            <Pressable
              style={[styles.creatorTab, creatorTab === "twoshot" && styles.creatorTabActive]}
              onPress={() => setCreatorTab("twoshot")}
            >
              <Text
                style={[
                  styles.creatorTabText,
                  creatorTab === "twoshot" && styles.creatorTabTextActive,
                ]}
              >
                個別セッション
              </Text>
            </Pressable>
          </View>
        </View>
        {creatorTab === "ranking" ? (
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft} />
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
        ) : null}
        {creatorTab === "ranking" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {creators.map((c) => (
              <CreatorRankCard key={c.id} item={c} />
            ))}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {twoshotSessions.map((s) => (
              <Pressable
                key={s.id}
                style={styles.twoshotCard}
                onPress={() => router.push(`/twoshot-booking/${s.id}`)}
              >
                <View style={styles.twoshotThumbWrap}>
                  <Image source={{ uri: s.thumbnail }} style={styles.twoshotThumb} contentFit="cover" />
                  <View style={styles.twoshotBadge}>
                    <Ionicons name="camera-outline" size={10} color="#fff" />
                    <Text style={styles.twoshotBadgeText}>個別セッション</Text>
                  </View>
                </View>
                <View style={styles.twoshotBody}>
                  <Text style={styles.twoshotCreator} numberOfLines={1}>
                    {s.creator}
                  </Text>
                  <Text style={styles.twoshotTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                  <Text style={styles.twoshotMeta}>
                    {s.date} {s.time} · 残り{s.spotsLeft}枠
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.bg,
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
  announcementSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  announcementSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  announcementSectionTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
  },
  announcementCard: {
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  announcementCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  announcementPinned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  announcementPinnedText: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "700",
  },
  announcementTitle: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  announcementMore: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  announcementModalSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  announcementModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  announcementModalTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
  },
  announcementModalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  jukeBotCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: C.border,
  },
  jukeBotLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  jukeBotIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  jukeBotLabel: {
    color: C.accent,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  jukeBotCommunity: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  jukeBotNowPlaying: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
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
  creatorTabs: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  creatorTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  creatorTabActive: {
    backgroundColor: C.accent,
  },
  creatorTabText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  creatorTabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  hScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  feedTabRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  feedTabRowInline: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  feedTabRowWithViewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  feedTabRowWithViewAllLeft: {
    flex: 1,
  },
  feedTabRowWithViewAllRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  feedTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
  },
  feedTabText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  feedTabTextActive: {
    color: C.accent,
    fontWeight: "700",
  },
  panelScroll: {
    paddingBottom: 16,
    gap: 0,
  },
  panelCard: {
    marginRight: 0,
    borderRadius: 0,
    overflow: "hidden",
  },
  panelThumbWrap: {
    position: "relative",
    overflow: "hidden",
    aspectRatio: 16 / 9,
    borderRadius: 0,
  },
  panelThumb: {
    aspectRatio: 16 / 9,
    borderRadius: 0,
  },
  panelThumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  panelThumbOverlayRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  overlayMetaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
  },
  overlayPriceText: {
    color: C.accent,
    fontSize: 10,
    fontWeight: "700",
  },
  overlayFreeText: {
    color: "#4CAF50",
    fontSize: 9,
    fontWeight: "700",
  },
  panelInfo: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: C.surface,
    gap: 3,
    borderRadius: 0,
  },
  twoshotCard: {
    width: 220,
    backgroundColor: C.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  twoshotThumbWrap: {
    position: "relative",
  },
  twoshotThumb: {
    width: 220,
    height: 110,
  },
  twoshotBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  twoshotBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  twoshotBody: {
    padding: 10,
    gap: 3,
  },
  twoshotCreator: {
    color: C.textSec,
    fontSize: 11,
  },
  twoshotTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  twoshotMeta: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 2,
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
    borderRadius: 0,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  photoBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(41,182,207,0.85)",
    borderRadius: 0,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  photoBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  noThumbPlaceholder: {
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  videoTimeAgo: {
    color: C.textMuted,
    fontSize: 9,
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
  comingSoonRibbon: {
    position: "absolute",
    top: 12,
    left: -40,
    paddingHorizontal: 40,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    transform: [{ rotate: "-25deg" }],
  },
  comingSoonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  liveBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: C.live,
    borderRadius: 0,
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
    borderRadius: 0,
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
