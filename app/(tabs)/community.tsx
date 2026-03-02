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

const GENRES = [
  { id: 1, name: "アニメ", icon: "tv-outline", count: 1204 },
  { id: 2, name: "バンド", icon: "musical-notes-outline", count: 876 },
  { id: 3, name: "サブカル", icon: "sparkles-outline", count: 642 },
  { id: 4, name: "コスプレ", icon: "shirt-outline", count: 531 },
  { id: 5, name: "VTuber", icon: "desktop-outline", count: 987 },
];

const DUMMY_POSTS = [
  { id: 1, user: "sakura_fan", avatar: "https://i.pravatar.cc/40?img=1", text: "新エピソードが最高すぎた…作画もストーリーも完璧", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", genre: "アニメ", votes: 342, timeAgo: "2時間前" },
  { id: 2, user: "band_master", avatar: "https://i.pravatar.cc/40?img=2", text: "昨日のライブ配信がやばかった！アンコール3回もやってくれた", videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0", genre: "バンド", votes: 215, timeAgo: "4時間前" },
  { id: 3, user: "subculture_king", avatar: "https://i.pravatar.cc/40?img=3", text: "コミケの新刊速報！もう完売しそう…", videoUrl: "", genre: "サブカル", votes: 189, timeAgo: "6時間前" },
  { id: 4, user: "cosplay_queen", avatar: "https://i.pravatar.cc/40?img=4", text: "今日の衣装どう思う？手作りで3週間かかった", videoUrl: "https://www.youtube.com/watch?v=ZRtdQ81jPUQ", genre: "コスプレ", votes: 567, timeAgo: "1時間前" },
  { id: 5, user: "vtuber_lover", avatar: "https://i.pravatar.cc/40?img=5", text: "推しのデビュー1周年おめでとう！ずっと応援してるよ", videoUrl: "https://www.youtube.com/watch?v=uelHwf8o7_U", genre: "VTuber", votes: 891, timeAgo: "30分前" },
  { id: 6, user: "anime_nerd", avatar: "https://i.pravatar.cc/40?img=6", text: "このOPのイントロで鳥肌立った。神曲すぎる", videoUrl: "https://www.youtube.com/watch?v=CevxZvSJLk8", genre: "アニメ", votes: 124, timeAgo: "8時間前" },
  { id: 7, user: "rock_soul", avatar: "https://i.pravatar.cc/40?img=7", text: "新曲のギターソロが天才的すぎてコピーできない", videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", genre: "バンド", votes: 203, timeAgo: "5時間前" },
  { id: 8, user: "otaku_life", avatar: "https://i.pravatar.cc/40?img=8", text: "聖地巡礼レポート！実際に行ってきたよ動画あり", videoUrl: "https://www.youtube.com/watch?v=XqZsoesa55w", genre: "サブカル", votes: 77, timeAgo: "12時間前" },
  { id: 9, user: "costume_pro", avatar: "https://i.pravatar.cc/40?img=9", text: "ウィッグのセット方法を動画で解説しました！", videoUrl: "https://www.youtube.com/watch?v=L_jWHffIx5E", genre: "コスプレ", votes: 312, timeAgo: "3時間前" },
  { id: 10, user: "virtual_dream", avatar: "https://i.pravatar.cc/40?img=10", text: "3Dモデル更新きた！動きがめちゃくちゃ滑らか", videoUrl: "https://www.youtube.com/watch?v=fRh_vgS2dFE", genre: "VTuber", votes: 445, timeAgo: "45分前" },
];

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
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [votedPosts, setVotedPosts] = useState<Record<number, boolean>>({});
  const [postVotes, setPostVotes] = useState<Record<number, number>>(
    Object.fromEntries(DUMMY_POSTS.map((p) => [p.id, p.votes]))
  );
  const [votedRanks, setVotedRanks] = useState<Record<number, boolean>>({});

  const { data: allCommunities = [] } = useQuery<any[]>({ queryKey: ["/api/communities"] });
  const { data: rankedVideos = [] } = useQuery<any[]>({ queryKey: ["/api/videos/ranked"] });
  const unreadCount = useUnreadCount();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  function handleVotePost(id: number) {
    if (votedPosts[id]) return;
    setVotedPosts((prev) => ({ ...prev, [id]: true }));
    setPostVotes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function handleVoteRank(id: number) {
    setVotedRanks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const filteredPosts = selectedGenre
    ? DUMMY_POSTS.filter((p) => p.genre === selectedGenre)
    : DUMMY_POSTS;

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
        <Pressable style={styles.notifButton} onPress={() => router.push("/notifications?filter=purchase")}>
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
                  <Pressable
                    style={[styles.voteBtn, votedRanks[community.id] && styles.voteBtnActive]}
                    onPress={() => handleVoteRank(community.id)}
                  >
                    <Ionicons
                      name={votedRanks[community.id] ? "thumbs-up" : "thumbs-up-outline"}
                      size={13}
                      color={votedRanks[community.id] ? "#fff" : C.accent}
                    />
                  </Pressable>
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

        {/* ④ ジャンル別一覧 */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>ジャンル別コミュニティ</Text>
        </View>

        <View style={styles.genreGrid}>
          {GENRES.map((genre) => (
            <Pressable
              key={genre.id}
              style={[styles.genreCard, selectedGenre === genre.name && styles.genreCardActive]}
              onPress={() => setSelectedGenre(selectedGenre === genre.name ? null : genre.name)}
            >
              <Ionicons
                name={genre.icon as any}
                size={22}
                color={selectedGenre === genre.name ? "#fff" : C.accent}
              />
              <Text style={[styles.genreName, selectedGenre === genre.name && styles.genreNameActive]}>
                {genre.name}
              </Text>
              <Text style={styles.genreCount}>{formatNumber(genre.count)}</Text>
            </Pressable>
          ))}
        </View>

        {/* ⑤ 投稿一覧 */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>
            {selectedGenre ? `${selectedGenre}の投稿` : "最新の投稿"}
          </Text>
        </View>

        <View style={styles.postList}>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image source={{ uri: post.avatar }} style={styles.postAvatar} contentFit="cover" />
                <View style={styles.postMeta}>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <View style={styles.postMetaRow}>
                    <Text style={styles.postGenreBadge}>{post.genre}</Text>
                    <Text style={styles.postTime}>{post.timeAgo}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.postText}>{post.text}</Text>
              {!!post.videoUrl && (
                <View style={styles.postVideoRow}>
                  <Ionicons name="play-circle-outline" size={14} color={C.accent} />
                  <Text style={styles.postVideoUrl} numberOfLines={1}>{post.videoUrl}</Text>
                </View>
              )}
              <View style={styles.postFooter}>
                <Pressable
                  style={[styles.postVoteBtn, votedPosts[post.id] && styles.postVoteBtnActive]}
                  onPress={() => handleVotePost(post.id)}
                >
                  <Ionicons
                    name={votedPosts[post.id] ? "thumbs-up" : "thumbs-up-outline"}
                    size={14}
                    color={votedPosts[post.id] ? "#fff" : C.accent}
                  />
                  <Text style={[styles.postVoteText, votedPosts[post.id] && styles.postVoteTextActive]}>
                    {postVotes[post.id] ?? post.votes}
                  </Text>
                </Pressable>
              </View>
            </View>
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
  voteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.accent,
    marginLeft: 6,
  },
  voteBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  genreCard: {
    width: "18%",
    minWidth: 62,
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  genreCardActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  genreName: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  genreNameActive: {
    color: "#fff",
  },
  genreCount: {
    color: C.textMuted,
    fontSize: 10,
    textAlign: "center",
  },
  postList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  postCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
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
  },
  postMeta: {
    flex: 1,
    gap: 3,
  },
  postUser: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  postMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postGenreBadge: {
    color: C.accent,
    fontSize: 10,
    fontWeight: "600",
    backgroundColor: "rgba(41,182,207,0.12)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  postTime: {
    color: C.textMuted,
    fontSize: 10,
  },
  postText: {
    color: C.text,
    fontSize: 13,
    lineHeight: 19,
  },
  postVideoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  postVideoUrl: {
    color: C.accent,
    fontSize: 11,
    flex: 1,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  postVoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.accent,
  },
  postVoteBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  postVoteText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  postVoteTextActive: {
    color: "#fff",
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
