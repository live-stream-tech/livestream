import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { saveLoginReturn } from "@/lib/login-return";

type Notif = { id: number; isRead: boolean };
function useUnreadCount() {
  const { data = [] } = useQuery<Notif[]>({ queryKey: ["/api/notifications"] });
  return (data as Notif[]).filter((n) => !n.isRead).length;
}

type MyVideo = {
  id: number;
  title: string;
  thumbnail: string;
  creator: string;
  community: string;
  timeAgo?: string | null;
};

type MyCommunity = {
  id: number;
  name: string;
  members: number;
  thumbnail: string;
  online: boolean;
  category: string;
};

const ENNEAGRAM_TYPES = [
  { label: "完璧主義者", num: 1, color: "#E53935" },
  { label: "世話好き", num: 2, color: "#FB8C00" },
  { label: "達成者", num: 3, color: "#F9A825" },
  { label: "個人主義者", num: 4, color: "#8E24AA" },
  { label: "研究家", num: 5, color: "#1E88E5" },
  { label: "忠実者", num: 6, color: "#00ACC1" },
  { label: "楽観主義者", num: 7, color: "#43A047" },
  { label: "挑戦者", num: 8, color: "#E91E63" },
  { label: "平和主義者", num: 9, color: "#9E9E9E" },
];

const STORAGE_KEY = "enneagram_scores";
const DEFAULT_SCORES = [6, 5, 7, 4, 8, 5, 6, 4, 7];

function getPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  scores: number[],
  max = 10
): string {
  const n = scores.length;
  return scores
    .map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (s / max) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

function getAxisPoints(cx: number, cy: number, radius: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function getLabelPoints(cx: number, cy: number, radius: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius + 18;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

function EnneagramChart({ scores }: { scores: number[] }) {
  const SIZE = 240;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const RADIUS = 80;
  const rings = [2, 4, 6, 8, 10];

  const axisPoints = getAxisPoints(cx, cy, RADIUS, 9);
  const labelPoints = getLabelPoints(cx, cy, RADIUS, 9);
  const filledPoints = getPolygonPoints(cx, cy, RADIUS, scores);

  return (
    <Svg width={SIZE} height={SIZE}>
      {rings.map((r) => {
        const pts = getPolygonPoints(cx, cy, RADIUS, Array(9).fill(r));
        return (
          <Polygon
            key={r}
            points={pts}
            fill="none"
            stroke={r === 10 ? C.border : "rgba(255,255,255,0.06)"}
            strokeWidth={r === 10 ? 1 : 0.8}
          />
        );
      })}

      {axisPoints.map((pt, i) => (
        <Line
          key={i}
          x1={cx}
          y1={cy}
          x2={pt.x}
          y2={pt.y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}

      <Polygon
        points={filledPoints}
        fill="rgba(41,182,207,0.25)"
        stroke={C.accent}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / 9 - Math.PI / 2;
        const r = (s / 10) * RADIUS;
        return (
          <Circle
            key={i}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={4}
            fill={ENNEAGRAM_TYPES[i].color}
            stroke="#0A1218"
            strokeWidth={1.5}
          />
        );
      })}

      {labelPoints.map((pt, i) => (
        <SvgText
          key={i}
          x={pt.x}
          y={pt.y}
          fill="rgba(255,255,255,0.65)"
          fontSize="9"
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {ENNEAGRAM_TYPES[i].num}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;
  const unreadCount = useUnreadCount();
  const { user, token, loading: authLoading, logout, updateProfile } = useAuth();
  const queryClient = useQueryClient();

  // Enneagram state
  const [scores, setScores] = useState<number[]>(DEFAULT_SCORES);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScores, setEditScores] = useState<number[]>(DEFAULT_SCORES);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Profile edit state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Role / creator registration state
  const { data: roleStatus, refetch: refetchRoles } = useQuery<{ isEditor: boolean; isTwoshot: boolean } | null>({
    queryKey: ["/api/profile/roles"],
    enabled: !!user,
  });

  const { data: myVideos = [] } = useQuery<MyVideo[]>({
    queryKey: ["/api/videos/my"],
    enabled: !!user && !!token,
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/videos/my", baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const { data: myCommunities = [] } = useQuery<MyCommunity[]>({
    queryKey: ["/api/communities/me"],
    enabled: !!user && !!token,
  });
  const [roleLoading, setRoleLoading] = useState<"editor" | "twoshot" | null>(null);

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchDebounced(searchText.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  type Liver = {
    id: number;
    name: string;
    community: string;
    avatar: string;
    category: string;
    followers: number;
  };

  const { data: searchResults = [] } = useQuery<Liver[]>({
    queryKey: [searchDebounced ? `/api/livers?name=${encodeURIComponent(searchDebounced)}` : "/api/livers"],
    enabled: searchDebounced.length > 0,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === 9) {
            setScores(parsed);
            setEditScores(parsed);
          }
        } catch {}
      }
    });
  }, []);

  function openEdit() {
    setEditScores([...scores]);
    setShowEditModal(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }

  function closeEdit() {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowEditModal(false));
  }

  function saveScores() {
    setScores([...editScores]);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(editScores));
    closeEdit();
  }

  function changeScore(index: number, delta: number) {
    setEditScores((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, Math.min(10, next[index] + delta));
      return next;
    });
  }

  function openProfileEdit() {
    setEditName(user?.name ?? user?.displayName ?? "");
    setEditBio(user?.bio ?? "");
    setEditAvatar(user?.avatar ?? user?.profileImageUrl ?? "");
    setShowProfileModal(true);
  }

  async function saveProfile() {
    if (!editName.trim()) {
      Alert.alert("エラー", "ユーザー名を入力してください");
      return;
    }
    setProfileSaving(true);
    try {
      await updateProfile({ name: editName.trim(), bio: editBio.trim(), avatar: editAvatar.trim() || null });
      setShowProfileModal(false);
    } catch (e: any) {
      Alert.alert("保存失敗", e.message ?? "エラーが発生しました");
    } finally {
      setProfileSaving(false);
    }
  }

  async function deleteVideo(id: number) {
    Alert.alert("投稿を削除しますか？", "この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest("DELETE", `/api/videos/${id}`);
            queryClient.invalidateQueries({ queryKey: ["/api/videos/my"] });
            queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
          } catch (e: any) {
            Alert.alert("削除に失敗しました", e?.message ?? "時間をおいて再度お試しください。");
          }
        },
      },
    ]);
  }

  async function registerRole(role: "editor" | "twoshot") {
    if (!user || roleLoading) return;
    setRoleLoading(role);
    try {
      await apiRequest("POST", "/api/profile/register-role", { role });
      await refetchRoles();
      Alert.alert(
        "登録完了",
        role === "editor"
          ? "動画編集クリエイターとして登録されました。ライバー検索などに表示されます。"
          : "個別セッションライバーとして登録されました。ライバー検索などに表示されます。",
      );
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "登録に失敗しました");
    } finally {
      setRoleLoading(null);
    }
  }

  const dominantIdx = scores.indexOf(Math.max(...scores));
  const dominantType = ENNEAGRAM_TYPES[dominantIdx];

  // Not logged in state: LINEログインボタンを表示
  if (!authLoading && !user) {
    function handleLineLogin() {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const returnTo = window.location.pathname + window.location.search;
        saveLoginReturn(returnTo);
        const apiBase = getApiUrl();
        window.location.href = new URL("/api/auth/line", apiBase).toString();
      } else {
        router.replace("/(tabs)");
      }
    }

    return (
      <View style={[styles.container, styles.guestContainer, { paddingTop: topInset + 40 }]}>
        <Ionicons name="person-circle-outline" size={80} color={C.textMuted} />
        <Text style={styles.guestTitle}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoS}>S</Text>
          <Text style={styles.logoLive}>tage</Text>
        </Text>
        <Text style={styles.guestSub}>ログインしてマイページを確認しよう</Text>
        <Pressable style={styles.lineLoginBtn} onPress={handleLineLogin}>
          <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" }} style={styles.lineIcon} contentFit="contain" />
          <Text style={styles.lineLoginText}>LINEでログイン</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stage</Text>
        </Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.identityBtn}>
            <Ionicons name="shield-checkmark-outline" size={13} color={C.orange} />
            <Text style={styles.identityText}>IDENTITY CHECK</Text>
          </Pressable>
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="ライバー / クリエイターを検索"
          placeholderTextColor={C.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <Pressable style={styles.avatarContainer} onPress={openProfileEdit}>
              {(user?.avatar ?? user?.profileImageUrl) ? (
                <Image
                  source={{ uri: (user.avatar ?? user.profileImageUrl) ?? "" }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>{(user?.name ?? "?")[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera-outline" size={10} color="#fff" />
              </View>
            </Pressable>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? user?.displayName ?? ""}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.editBtn} onPress={openProfileEdit}>
              <Ionicons name="pencil-outline" size={18} color={C.text} />
            </Pressable>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={18} color={C.textMuted} />
            </Pressable>
            <Pressable
              testID="logout-button"
              accessibilityLabel="ログアウト"
              accessibilityRole="button"
              style={styles.logoutBtn}
              onPress={() => {
                Alert.alert("ログアウト", "ログアウトしますか？", [
                  { text: "キャンセル", style: "cancel" },
                  { text: "ログアウト", style: "destructive", onPress: logout },
                ]);
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={C.textMuted} />
            </Pressable>
          </View>
        </View>

        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.tagsRow}>
          <View style={[styles.tag, { borderColor: dominantType.color + "66" }]}>
            <Text style={[styles.tagText, { color: dominantType.color }]}>
              TYPE {dominantType.num}：{dominantType.label}
            </Text>
          </View>
        </View>

        {/* Supporter Level */}
        <View style={styles.supporterCard}>
          <View style={styles.supporterHeader}>
            <Ionicons name="trending-up" size={16} color={C.accent} />
            <Text style={styles.supporterTitle}>AUTHORIZED SUPPORTER LV.3</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "72%" }]} />
            <Ionicons name="trophy-outline" size={14} color={C.orange} style={styles.trophyIcon} />
          </View>
          <Text style={styles.supporterSub}>REVENUE SHARE: 50% + 15% BONUS</Text>
        </View>

        <Pressable style={styles.revenueBtn} onPress={() => router.push("/revenue")}>
          <Ionicons name="wallet-outline" size={16} color="#fff" />
          <Text style={styles.revenueBtnText}>REVENUE MANAGEMENT</Text>
        </Pressable>

        {/* Creator / Twoshot registration */}
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>クリエイター登録</Text>
          <Text style={styles.roleSub}>
            動画編集クリエイター / 個別セッションライバーとして、検索一覧などに表示できるようにします。
          </Text>
          <View style={styles.roleButtonsRow}>
            <Pressable
              style={[
                styles.roleButton,
                roleStatus?.isEditor && styles.roleButtonActive,
              ]}
              disabled={!!roleStatus?.isEditor || roleLoading === "editor"}
              onPress={() => registerRole("editor")}
            >
              <Ionicons
                name="color-wand-outline"
                size={16}
                color={roleStatus?.isEditor ? "#fff" : C.textSec}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  roleStatus?.isEditor && styles.roleButtonTextActive,
                ]}
              >
                動画編集クリエイター
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.roleButton,
                roleStatus?.isTwoshot && styles.roleButtonActive,
              ]}
              disabled={!!roleStatus?.isTwoshot || roleLoading === "twoshot"}
              onPress={() => registerRole("twoshot")}
            >
              <Ionicons
                name="camera-outline"
                size={16}
                color={roleStatus?.isTwoshot ? "#fff" : C.textSec}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  roleStatus?.isTwoshot && styles.roleButtonTextActive,
                ]}
              >
                個別セッションライバー
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Search results */}
        {searchDebounced.length > 0 && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.slice(0, 8).map((liver) => (
              <Pressable
                key={liver.id}
                style={styles.searchResultRow}
                onPress={() => router.push(`/livers/${liver.id}`)}
              >
                <Image source={{ uri: liver.avatar }} style={styles.searchResultAvatar} contentFit="cover" />
                <View style={styles.searchResultBody}>
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {liver.name}
                  </Text>
                  <Text style={styles.searchResultMeta} numberOfLines={1}>
                    {liver.community} / {liver.category}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* 参加コミュニティパネル */}
        {myCommunities.length > 0 && (
          <View style={styles.myCommunitiesSection}>
            <View style={styles.myCommunitiesHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="people-outline" size={16} color={C.accent} />
                <Text style={styles.myCommunitiesTitle}>参加コミュニティ</Text>
              </View>
              <Text style={styles.myCommunitiesCount}>{myCommunities.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.myCommunitiesList}
            >
              {myCommunities.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.myCommunityCard}
                  onPress={() => router.push(`/community/${c.id}`)}
                >
                  <Image source={{ uri: c.thumbnail }} style={styles.myCommunityThumb} contentFit="cover" />
                  <View style={styles.myCommunityOverlay} />
                  {c.online && (
                    <View style={styles.myCommunityLiveBadge}>
                      <View style={styles.myCommunityLiveDot} />
                      <Text style={styles.myCommunityLiveText}>LIVE</Text>
                    </View>
                  )}
                  <View style={styles.myCommunityBottom}>
                    <Text style={styles.myCommunityName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.myCommunityMeta} numberOfLines={1}>
                      {c.members.toLocaleString()}人
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.postsHeader}>
          <View style={styles.postsLeft}>
            <Text style={styles.postsTitle}>タイムライン</Text>
            <Text style={styles.postsCount}>{myVideos.length}</Text>
          </View>
          <Pressable style={styles.uploadBtn} onPress={() => router.push("/upload")}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>投稿する</Text>
          </Pressable>
        </View>

        <View style={styles.timelineList}>
          {myVideos.slice(0, 4).map((video) => (
            <View key={video.id} style={styles.timelineItem}>
              <Pressable
                style={styles.timelineMain}
                onPress={() => router.push(`/video/${video.id}`)}
              >
                <Image source={{ uri: video.thumbnail }} style={styles.timelineThumb} contentFit="cover" />
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.timelineMeta} numberOfLines={1}>
                    {video.community} ・ {video.timeAgo ?? "たった今"}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.timelineDeleteBtn}
                onPress={() => deleteVideo(video.id)}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={16} color={C.textMuted} />
              </Pressable>
            </View>
          ))}
          {myVideos.length === 0 && (
            <View style={styles.timelineEmpty}>
              <Text style={styles.timelineEmptyText}>まだ投稿がありません</Text>
              <Text style={styles.timelineEmptySub}>左下の「投稿する」から最初の投稿をしてみましょう</Text>
            </View>
          )}
        </View>

        {/* Enneagram Card */}
        <View style={styles.enneagramCard}>
          <View style={styles.enneagramHeader}>
            <Ionicons name="analytics-outline" size={15} color={C.accent} />
            <Text style={styles.enneagramTitle}>ENNEAGRAM</Text>
            <Pressable style={styles.enneagramEditBtn} onPress={openEdit}>
              <Ionicons name="create-outline" size={14} color={C.textMuted} />
              <Text style={styles.enneagramEditText}>編集</Text>
            </Pressable>
          </View>

          <View style={styles.enneagramBody}>
            <EnneagramChart scores={scores} />
            <View style={styles.enneagramLegend}>
              {ENNEAGRAM_TYPES.map((t, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: t.color }]} />
                  <Text style={styles.legendNum}>{t.num}</Text>
                  <Text style={styles.legendLabel}>{t.label}</Text>
                  <View style={styles.legendBarBg}>
                    <View
                      style={[
                        styles.legendBarFill,
                        { width: `${scores[i] * 10}%` as any, backgroundColor: t.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.legendScore}>{scores[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Pressable style={[styles.startFab, { bottom: bottomInset + 80 }]}>
        <Ionicons name="radio" size={16} color="#fff" />
        <Text style={styles.startFabText}>START</Text>
      </Pressable>

      {/* Profile Edit Modal */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowProfileModal(false)} />
          <View style={[styles.modalSheet, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="person-circle-outline" size={20} color={C.accent} />
              <Text style={styles.modalTitle}>プロフィール編集</Text>
            </View>

            <Text style={styles.profileFieldLabel}>ユーザー名</Text>
            <View style={styles.profileInputWrap}>
              <Ionicons name="person-outline" size={16} color={C.textMuted} />
              <TextInput
                style={styles.profileInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="表示名"
                placeholderTextColor={C.textMuted}
                maxLength={30}
              />
            </View>

            <Text style={styles.profileFieldLabel}>自己紹介</Text>
            <View style={[styles.profileInputWrap, { alignItems: "flex-start", paddingTop: 12, paddingBottom: 12 }]}>
              <Ionicons name="text-outline" size={16} color={C.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.profileInput, { height: 72, textAlignVertical: "top" }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="自己紹介を入力"
                placeholderTextColor={C.textMuted}
                multiline
                maxLength={200}
              />
            </View>

            <Text style={styles.profileFieldLabel}>アイコン画像URL（任意）</Text>
            <View style={styles.profileInputWrap}>
              <Ionicons name="image-outline" size={16} color={C.textMuted} />
              <TextInput
                style={styles.profileInput}
                value={editAvatar}
                onChangeText={setEditAvatar}
                placeholder="https://..."
                placeholderTextColor={C.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            {editAvatar ? (
              <Image source={{ uri: editAvatar }} style={styles.avatarPreview} contentFit="cover" />
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowProfileModal(false)}>
                <Text style={styles.cancelBtnText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, profileSaving && { opacity: 0.6 }]}
                onPress={saveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>保存する</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enneagram Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="none">
        <Pressable style={styles.modalBg} onPress={closeEdit}>
          <Animated.View
            style={[
              styles.modalSheet,
              { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 },
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Ionicons name="analytics" size={18} color={C.accent} />
                <Text style={styles.modalTitle}>エニアグラムを設定</Text>
              </View>
              <Text style={styles.modalSub}>各タイプの強さを 0〜10 で入力してください</Text>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {ENNEAGRAM_TYPES.map((t, i) => (
                  <View key={i} style={styles.editRow}>
                    <View style={styles.editRowLeft}>
                      <View style={[styles.editTypeBadge, { backgroundColor: t.color + "22", borderColor: t.color + "55" }]}>
                        <Text style={[styles.editTypeNum, { color: t.color }]}>{t.num}</Text>
                      </View>
                      <Text style={styles.editTypeLabel}>{t.label}</Text>
                    </View>
                    <View style={styles.editRowRight}>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => changeScore(i, -1)}
                        testID={`minus-${i}`}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="remove" size={16} color={C.textSec} />
                      </Pressable>
                      <View style={[styles.scoreBox, { borderColor: t.color + "66" }]} testID={`score-${i}`}>
                        <Text style={[styles.scoreText, { color: t.color }]}>{editScores[i]}</Text>
                      </View>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => changeScore(i, 1)}
                        testID={`plus-${i}`}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="add" size={16} color={C.textSec} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeEdit}>
                  <Text style={styles.cancelBtnText}>キャンセル</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={saveScores}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>保存する</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logo: { fontSize: 22, fontWeight: "800" },
  logoLive: { color: C.text },
  logoS: { color: C.accent },
  logoStock: { color: C.accent },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  identityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.orange,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  identityText: { color: C.orange, fontSize: 11, fontWeight: "700" },
  notifButton: { position: "relative" },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.live,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  scroll: { flex: 1 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  profileLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarContainer: {
    borderWidth: 2,
    borderColor: C.accent,
    borderRadius: 35,
    padding: 2,
  },
  avatar: { width: 66, height: 66, borderRadius: 33 },
  profileInfo: { gap: 6 },
  profileName: { color: C.text, fontSize: 22, fontWeight: "800" },
  followRow: { flexDirection: "row", gap: 16 },
  followStat: { alignItems: "center", gap: 1 },
  followNumber: { color: C.text, fontSize: 14, fontWeight: "700" },
  followLabel: { color: C.textMuted, fontSize: 9, fontWeight: "600", letterSpacing: 0.3 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bio: { color: C.textSec, fontSize: 13, paddingHorizontal: 16, marginBottom: 10 },
  tagsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: "wrap" },
  tag: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagText: { color: C.textSec, fontSize: 12, fontWeight: "600" },

  enneagramCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  enneagramHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  enneagramTitle: { color: C.accent, fontSize: 12, fontWeight: "800", letterSpacing: 1, flex: 1 },
  enneagramEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  enneagramEditText: { color: C.textMuted, fontSize: 11, fontWeight: "600" },
  enneagramBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  enneagramLegend: { flex: 1, gap: 5, justifyContent: "center" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendNum: { color: C.textMuted, fontSize: 9, fontWeight: "700", width: 10 },
  legendLabel: { color: C.textSec, fontSize: 9, flex: 1 },
  legendBarBg: {
    width: 40,
    height: 4,
    backgroundColor: C.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  legendBarFill: { height: "100%", borderRadius: 2 },
  legendScore: { color: C.textMuted, fontSize: 9, fontWeight: "700", width: 14, textAlign: "right" },

  supporterCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  supporterHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  supporterTitle: { color: C.accent, fontSize: 12, fontWeight: "800", letterSpacing: 0.5, flex: 1 },
  activeBadge: { backgroundColor: C.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  activeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  progressBar: {
    height: 8,
    backgroundColor: C.surface2,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: { height: "100%", backgroundColor: C.accent, borderRadius: 4 },
  trophyIcon: { position: "absolute", right: 0, top: -3 },
  supporterSub: { color: C.accent, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  roleCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  roleTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  roleSub: { color: C.textMuted, fontSize: 11 },
  roleButtonsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  roleButtonActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  roleButtonText: { color: C.textSec, fontSize: 12, fontWeight: "700" },
  roleButtonTextActive: { color: "#fff" },
  revenueBtn: {
    marginHorizontal: 16,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  revenueBtnText: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  searchResults: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchResultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  searchResultBody: { flex: 1 },
  searchResultName: { color: C.text, fontSize: 13, fontWeight: "700" },
  searchResultMeta: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  postsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postsLeft: { gap: 2 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  postsTitle: { color: C.text, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  postsCount: { color: C.textMuted, fontSize: 12, fontWeight: "600" },
  timelineList: { paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  timelineMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  timelineThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: C.surface2 },
  timelineBody: { flex: 1 },
  timelineTitle: { color: C.text, fontSize: 12, fontWeight: "700", marginBottom: 1 },
  timelineMeta: { color: C.textMuted, fontSize: 10 },
  timelineDeleteBtn: {
    paddingLeft: 6,
    paddingVertical: 4,
  },
  timelineEmpty: { paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  timelineEmptyText: { color: C.textSec, fontSize: 13, fontWeight: "700" },
  timelineEmptySub: { color: C.textMuted, fontSize: 11, marginTop: 4 },
  myCommunitiesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  myCommunitiesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  myCommunitiesTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  myCommunitiesCount: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  myCommunitiesList: {
    gap: 10,
  },
  myCommunityCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  myCommunityThumb: {
    width: "100%",
    height: "100%",
  },
  myCommunityOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  myCommunityBottom: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
  },
  myCommunityName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  myCommunityMeta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 2,
  },
  myCommunityLiveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.live,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  myCommunityLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  myCommunityLiveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  startFab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.accent,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  startFabText: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#131E2A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: "800" },
  modalSub: { color: C.textMuted, fontSize: 12, marginBottom: 20 },
  modalScroll: { maxHeight: 380 },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  editRowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  editTypeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editTypeNum: { fontSize: 13, fontWeight: "800" },
  editTypeLabel: { color: C.textSec, fontSize: 13 },
  editRowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: { fontSize: 16, fontWeight: "800" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelBtnText: { color: C.textSec, fontSize: 14, fontWeight: "700" },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  // Guest / not logged in
  guestContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  guestTitle: { color: C.text, fontSize: 28, fontWeight: "800" },
  guestSub: { color: C.textMuted, fontSize: 14, textAlign: "center" },
  guestLoginBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  guestLoginText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  guestRegisterBtn: { paddingVertical: 8 },
  guestRegisterText: { color: C.accent, fontSize: 14, fontWeight: "600" },
  lineLoginBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#06C755",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  lineIcon: { width: 22, height: 22 },
  lineLoginText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  // Header actions (edit + logout)
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar fallback + edit badge
  avatarFallback: {
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: C.accent, fontSize: 28, fontWeight: "800" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.bg,
  },

  // Profile edit modal fields
  profileFieldLabel: { color: C.textSec, fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 14 },
  profileInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileInput: { flex: 1, color: C.text, fontSize: 14, paddingVertical: 12 },
  avatarPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: 10,
    borderWidth: 2,
    borderColor: C.accent,
    alignSelf: "center",
  },
});
