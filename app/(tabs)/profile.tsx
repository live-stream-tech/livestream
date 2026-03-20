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
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";
import { getTabTopInset, getTabBottomInset } from "@/constants/layout";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { AppLogo } from "@/components/AppLogo";
import { MetallicLine } from "@/components/MetallicLine";
import { saveLoginReturn } from "@/lib/login-return";

type Notif = { id: number; isRead: boolean };
function useUnreadCount() {
  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30_000,
  });
  return data?.count ?? 0;
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


/** 公開プロフィール用の投稿一覧（プレビュー用） */
function ProfilePreviewPosts({ userId }: { userId: number }) {
  const { data: posts = [] } = useQuery<MyVideo[]>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: userId > 0,
  });
  if (posts.length === 0) return <Text style={styles.timelineEmptyText}>まだ投稿がありません</Text>;
  return (
    <View style={styles.previewPostsList}>
      {posts.slice(0, 6).map((v) => (
        <Pressable key={v.id} style={styles.previewPostItem} onPress={() => router.push(`/video/${v.id}`)}>
          <Image source={{ uri: v.thumbnail }} style={styles.timelineThumb} contentFit="cover" />
          <View style={styles.timelineBody}>
            <Text style={styles.timelineTitle} numberOfLines={2}>{v.title}</Text>
            <Text style={styles.timelineMeta} numberOfLines={1}>{v.community} ・ {v.timeAgo ?? ""}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

// v2: 旧フラグ（pwa_add_to_home_dismissed）は無視して再度表示できるようにする
const PWA_DISMISSED_KEY = "pwa_add_to_home_dismissed_v2";

/** PWA「ホーム画面に追加」FAB＋ポップアップ。Web かつ 未インストール かつ 未閉じの場合のみ表示 */
function usePwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt(): Promise<void> } | null>(null);

  const isWeb = Platform.OS === "web";
  const isIos =
    isWeb &&
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIosChrome =
    isWeb &&
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /CriOS/.test(navigator.userAgent);
  const isIosSafari = isIos && !isIosChrome;

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;

    let isStandalone = false;
    try {
      if (typeof window.matchMedia === "function") {
        isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      }
      // iOS Safari PWA
      if (!isStandalone && typeof navigator !== "undefined" && (navigator as any).standalone === true) {
        isStandalone = true;
      }
    } catch {
      // 判定に失敗した場合はスタンドアロン扱いにはしない
      isStandalone = false;
    }

    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    // v2では一旦「閉じた」フラグをかなり緩く扱う（存在しても表示を完全には止めない）
    try {
      const dismissed = window.localStorage.getItem(PWA_DISMISSED_KEY);
      if (dismissed === "1") {
        // 旧来どおり完全に非表示にするのではなく、今回だけは再度表示させる
        // ユーザーがもう一度閉じれば新しいフラグが保存される
      }
    } catch {
      // localStorage が使えなくても表示は続行する
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt(): Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    setShowBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [isWeb]);

  const onDismiss = () => {
    if (isWeb && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PWA_DISMISSED_KEY, "1");
      } catch {
        // localStorage が使えない環境では単にフラグなしで閉じる
      }
    }
    setShowPopup(false);
    setShowBanner(false);
  };

  const onFabPress = () => setShowPopup(true);

  const onAddPress = () => {
    if (isIosSafari) {
      setShowPopup(false);
      return;
    }
    if (isIosChrome) {
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setShowPopup(false);
      setShowBanner(false);
      if (isWeb && typeof window !== "undefined") {
        window.localStorage.setItem(PWA_DISMISSED_KEY, "1");
      }
    }
  };

  return {
    showBanner,
    showPopup,
    onAddPress,
    onDismiss,
    onFabPress,
    isIosSafari,
    isIosChrome,
    hasDeferredPrompt: !!deferredPrompt,
  };
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = getTabTopInset(insets);
  const bottomInset = getTabBottomInset(insets);
  const unreadCount = useUnreadCount();
  const { user, token, loading: authLoading, logout, updateProfile, loginWithToken } = useAuth();
  const queryClient = useQueryClient();

  // ポップアップログイン完了時のpostMessageリスナー
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "auth_success" && event.data?.token) {
        try {
          await loginWithToken(event.data.token);
          queryClient.invalidateQueries();
        } catch (e) {
          console.error("[profile] popup auth failed:", e);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loginWithToken, queryClient]);

  // Profile edit state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
  const { data: savedVideos = [] } = useQuery<MyVideo[]>({
    queryKey: ["/api/videos/saved"],
    enabled: !!user && !!token,
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/videos/saved", baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const [roleLoading, setRoleLoading] = useState<"editor" | "twoshot" | null>(null);

  const pwaBanner = usePwaInstallBanner();

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
      // モーダルを先に閉じてから saving を解除（UI の即時反映）
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
          : "メンターライバーとして登録されました。ライバー検索などに表示されます。",
      );
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "登録に失敗しました");
    } finally {
      setRoleLoading(null);
    }
  }


  // Not logged in state: LINEログインボタンを表示
  if (!authLoading && !user) {
    function handleLineLogin() {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const returnTo = window.location.pathname + window.location.search;
        saveLoginReturn(returnTo);
        const apiBase = getApiUrl();
        const url = new URL("/api/auth/line", apiBase).toString();
        const w = 520, h = 640;
        const left = Math.max(0, (window.screen.width - w) / 2);
        const top = Math.max(0, (window.screen.height - h) / 2);
        window.open(url, "oauth_popup", `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
      } else {
        router.replace("/(tabs)");
      }
    }

    return (
      <View style={[styles.container, styles.guestContainer, { paddingTop: topInset + 40 }]}>
        <Ionicons name="person-circle-outline" size={80} color={C.textMuted} />
        <View style={styles.guestLogoWrap}>
          <AppLogo height={36} />
        </View>
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
        <AppLogo height={36} />
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
      <MetallicLine thickness={1} style={{ marginHorizontal: 16 }} />

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
                  <View style={styles.avatarWhiteCircle} />
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
            <Pressable
              style={({ pressed }) => [
                styles.editBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={() => setShowPreviewModal(true)}
            >
              <Ionicons name="eye-outline" size={18} color={C.accent} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.editBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={openProfileEdit}
            >
              <Ionicons name="pencil-outline" size={18} color={C.accent} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.settingsBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={18} color={C.accent} />
            </Pressable>
            <Pressable
              testID="logout-button"
              accessibilityLabel="ログアウト"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={() => {
                if (Platform.OS === "web" && typeof window !== "undefined") {
                  const ok = window.confirm("ログアウトしますか？");
                  if (ok) {
                    logout();
                  }
                  return;
                }
                Alert.alert("ログアウト", "ログアウトしますか？", [
                  { text: "キャンセル", style: "cancel" },
                  { text: "ログアウト", style: "destructive", onPress: logout },
                ]);
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={C.live} />
            </Pressable>
          </View>
        </View>

        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        <View style={styles.followRow}>
          <Pressable style={styles.followStat} onPress={() => router.push(`/user/${user?.id}/followers`)}>
            <Text style={styles.followStatValue}>{user?.followersCount ?? 0}</Text>
            <Text style={styles.followStatLabel}>フォロワー</Text>
          </Pressable>
          <Pressable style={styles.followStat} onPress={() => router.push(`/user/${user?.id}/following`)}>
            <Text style={styles.followStatValue}>{user?.followingCount ?? 0}</Text>
            <Text style={styles.followStatLabel}>フォロー中</Text>
          </Pressable>
        </View>

        {(user?.instagramUrl || user?.youtubeUrl || user?.xUrl) ? (
          <View style={styles.socialLinksRow}>
            {user?.instagramUrl ? (
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => user.instagramUrl && Linking.openURL(user.instagramUrl)}
              >
                <Ionicons name="logo-instagram" size={22} color="#E4405F" />
              </Pressable>
            ) : null}
            {user?.youtubeUrl ? (
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => user.youtubeUrl && Linking.openURL(user.youtubeUrl)}
              >
                <Ionicons name="logo-youtube" size={22} color="#FF0000" />
              </Pressable>
            ) : null}
            {user?.xUrl ? (
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => user.xUrl && Linking.openURL(user.xUrl)}
              >
                <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
              </Pressable>
            ) : null}
          </View>
        ) : null}



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
          <Ionicons name="wallet-outline" size={16} color="#050505" />
          <Text style={styles.revenueBtnText}>REVENUE MANAGEMENT</Text>
        </Pressable>

        <Pressable style={styles.adReviewBtn} onPress={() => router.push("/community/ad-review")}>
          <Ionicons name="megaphone-outline" size={16} color="#050505" />
          <Text style={styles.adReviewBtnText}>広告審査（管理人・モデレーター）</Text>
        </Pressable>

        {/* Creator / Twoshot registration */}
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>クリエイター登録</Text>
          <Text style={styles.roleSub}>
            動画編集クリエイター / メンターライバーとして、検索一覧などに表示できるようにします。
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
                color={roleStatus?.isEditor ? "#050505" : C.textSec}
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
                color={roleStatus?.isTwoshot ? "#050505" : C.textSec}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  roleStatus?.isTwoshot && styles.roleButtonTextActive,
                ]}
              >
                メンターライバー
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

        {/* マイリスト */}
        <View style={styles.myListSection}>
          <View style={styles.myListHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="bookmark" size={16} color={C.accent} />
              <Text style={styles.myListTitle}>マイリスト</Text>
            </View>
            <Text style={styles.myListCount}>{savedVideos.length}</Text>
          </View>
          <View style={styles.myListContent}>
            {savedVideos.slice(0, 8).map((v) => (
              <Pressable
                key={v.id}
                style={styles.myListItem}
                onPress={() => router.push(`/video/${v.id}`)}
              >
                <Image source={{ uri: v.thumbnail }} style={styles.timelineThumb} contentFit="cover" />
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={styles.timelineMeta} numberOfLines={1}>{v.community} ・ {v.timeAgo ?? ""}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
              </Pressable>
            ))}
            {savedVideos.length === 0 && (
              <Text style={styles.myListEmpty}>気に入った動画をマイリストに追加しよう</Text>
            )}
          </View>
        </View>

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
            <Text style={styles.postsTitle}>日常</Text>
            <Text style={styles.postsCount}>
              {myVideos.filter((v: any) => (v as any).postType === "daily" || !(v as any).postType).length}
            </Text>
          </View>
          <Pressable style={styles.uploadBtn} onPress={() => router.push("/upload")}>
            <Ionicons name="add" size={16} color="#050505" />
            <Text style={styles.uploadBtnText}>投稿する</Text>
          </Pressable>
        </View>

        <View style={styles.timelineList}>
          {myVideos
            .filter((v: any) => (v as any).postType === "daily" || !(v as any).postType)
            .slice(0, 4)
            .map((video) => (
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
          {myVideos.filter((v: any) => (v as any).postType === "daily" || !(v as any).postType).length === 0 && (
            <View style={styles.timelineEmpty}>
              <Text style={styles.timelineEmptyText}>まだ日常投稿がありません</Text>
              <Text style={styles.timelineEmptySub}>「投稿する」から手軽に投稿してみましょう</Text>
            </View>
          )}
        </View>

        {/* 作品タイムライン */}
        <View style={styles.postsHeader}>
          <View style={styles.postsLeft}>
            <Text style={styles.postsTitle}>作品</Text>
            <Text style={styles.postsCount}>
              {myVideos.filter((v: any) => (v as any).postType === "work").length}
            </Text>
          </View>
          <Pressable style={styles.uploadBtn} onPress={() => router.push("/upload/work")}>
            <Ionicons name="add" size={16} color="#050505" />
            <Text style={styles.uploadBtnText}>作品を投稿</Text>
          </Pressable>
        </View>

        <View style={styles.timelineList}>
          {myVideos
            .filter((v: any) => (v as any).postType === "work")
            .slice(0, 4)
            .map((video) => (
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
          {myVideos.filter((v: any) => (v as any).postType === "work").length === 0 && (
            <View style={styles.timelineEmpty}>
              <Text style={styles.timelineEmptyText}>まだ作品がありません</Text>
              <Text style={styles.timelineEmptySub}>「作品を投稿」から記事＋写真（＋動画）を投稿できます</Text>
            </View>
          )}
        </View>

   

        <View style={{ height: 120 }} />
      </ScrollView>

      <Pressable style={[styles.startFab, { bottom: bottomInset + 80 }]}>
        <Ionicons name="radio" size={16} color="#050505" />
        <Text style={styles.startFabText}>START</Text>
      </Pressable>

      {/* PWA ホーム画面に追加 FAB（右下固定）＋ポップアップ */}
      {Platform.OS === "web" && pwaBanner.showBanner && (
        <>
          <Pressable
            style={[styles.pwaFab, { bottom: bottomInset + 140 }]}
            onPress={pwaBanner.onFabPress}
          >
            <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
          </Pressable>
          <Modal visible={pwaBanner.showPopup} transparent animationType="fade">
            <Pressable style={styles.pwaPopupOverlay} onPress={pwaBanner.onDismiss}>
              <Pressable style={styles.pwaPopupBox} onPress={(e) => e.stopPropagation()}>
                <View style={styles.pwaPopupHeader}>
                  <Text style={styles.pwaPopupTitle}>ホーム画面に追加</Text>
                  <Pressable style={styles.pwaPopupClose} onPress={pwaBanner.onDismiss} hitSlop={8}>
                    <Ionicons name="close" size={22} color={C.textMuted} />
                  </Pressable>
                </View>
                {pwaBanner.isIosChrome ? (
                  <Text style={styles.pwaPopupBody}>
                    Safariで開いてください。Safariで開くとホーム画面に追加できます。
                  </Text>
                ) : pwaBanner.isIosSafari ? (
                  <>
                    <Text style={styles.pwaPopupBody}>
                      Safariの画面下部にある「共有」ボタン（□に上矢印）をタップし、一覧から「ホーム画面に追加」を選んでください。
                    </Text>
                    <Pressable style={styles.pwaPopupBtn} onPress={pwaBanner.onAddPress}>
                      <Text style={styles.pwaPopupBtnText}>OK</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.pwaPopupBody}>ホーム画面に追加してアプリとして使う</Text>
                    <Pressable
                      style={[styles.pwaPopupBtn, !pwaBanner.hasDeferredPrompt && styles.pwaPopupBtnDisabled]}
                      disabled={!pwaBanner.hasDeferredPrompt}
                      onPress={pwaBanner.onAddPress}
                    >
                      <Text style={styles.pwaPopupBtnText}>追加</Text>
                    </Pressable>
                  </>
                )}
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}

      {/* プレビュー（公開プロフィール）モーダル */}
      <Modal visible={showPreviewModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowPreviewModal(false)} />
          <View style={[styles.modalSheet, styles.previewModalSheet, { paddingBottom: getTabBottomInset(insets) + 16, maxHeight: "90%" }]}>
            <View style={styles.modalHandle} />
            <View style={styles.previewModalHeader}>
              <Text style={styles.modalTitle}>公開プロフィールのプレビュー</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                  style={styles.previewOpenPageBtn}
                  onPress={() => {
                    setShowPreviewModal(false);
                    if (user?.id) router.push(`/user/${user.id}`);
                  }}
                >
                  <Text style={styles.previewOpenPageText}>実際のページで見る</Text>
                </Pressable>
                <Pressable onPress={() => setShowPreviewModal(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </Pressable>
              </View>
            </View>
            <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.previewProfileCard}>
                <View style={styles.previewAvatarWrap}>
                  {(user?.avatar ?? user?.profileImageUrl) ? (
                    <Image source={{ uri: (user.avatar ?? user.profileImageUrl) ?? "" }} style={styles.previewAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.previewAvatar, styles.avatarFallback]}>
                      <View style={styles.previewWhiteCircle} />
                    </View>
                  )}
                </View>
                <Text style={styles.previewName}>{user?.name ?? user?.displayName ?? ""}</Text>
                {user?.bio ? <Text style={styles.previewBio}>{user.bio}</Text> : (
                  <Text style={styles.previewBio}>プロフィールが未設定です</Text>
                )}
                {/* Role badges */}
                <View style={styles.previewRoleBadges}>
                  {roleStatus?.isEditor && (
                    <View style={styles.previewRoleBadge}>
                      <Ionicons name="color-wand-outline" size={11} color={C.accent} />
                      <Text style={styles.previewRoleBadgeText}>動画編集クリエイター</Text>
                    </View>
                  )}
                  {roleStatus?.isTwoshot && (
                    <View style={styles.previewRoleBadge}>
                      <Ionicons name="camera-outline" size={11} color={C.accent} />
                      <Text style={styles.previewRoleBadgeText}>メンターライバー</Text>
                    </View>
                  )}
                </View>
                {(user?.instagramUrl || user?.youtubeUrl || user?.xUrl) ? (
                  <View style={styles.socialLinksRow}>
                    {user?.instagramUrl && <View style={styles.socialIconBtn}><Ionicons name="logo-instagram" size={22} color="#E4405F" /></View>}
                    {user?.youtubeUrl && <View style={styles.socialIconBtn}><Ionicons name="logo-youtube" size={22} color="#FF0000" /></View>}
                    {user?.xUrl && <View style={styles.socialIconBtn}><Ionicons name="logo-twitter" size={22} color="#1DA1F2" /></View>}
                  </View>
                ) : null}
              </View>
               {myCommunities.length > 0 && (
                <View style={styles.previewCommunitiesSection}>
                  <Text style={styles.previewSectionTitle}>参加コミュニティ</Text>
                  <View style={styles.previewCommunityGrid}>
                    {myCommunities.slice(0, 6).map((c) => (
                      <Pressable key={c.id} style={styles.previewCommunityChip} onPress={() => router.push(`/community/${c.id}`)}>
                        <Image source={{ uri: c.thumbnail }} style={styles.previewCommunityThumb} contentFit="cover" />
                        <Text style={styles.previewCommunityName} numberOfLines={1}>{c.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.previewPostsSection}>
                <Text style={styles.postsTitle}>投稿</Text>
                <ProfilePreviewPosts userId={user?.id ?? 0} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowProfileModal(false)} />
          <View style={[styles.modalSheet, { paddingBottom: getTabBottomInset(insets) + 16 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="person-circle-outline" size={20} color={C.accent} />
              <Text style={styles.modalTitle}>プロフィール編集</Text>
            </View>
            <Text style={styles.profileEditHint}>公開される表示名・自己紹介・アイコンを手軽に変更できます。Instagram・YouTube・X・音楽リンクなど詳細は設定の「登録情報の編集」から。</Text>

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
    paddingBottom: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  identityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.orange,
    borderRadius: 3,
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
    borderRadius: 2,
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
    borderRadius: 3,
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
    borderColor: "#fff",
    borderRadius: 35,
    padding: 2,
  },
  avatar: { width: 66, height: 66, borderRadius: 33 },
  profileInfo: { gap: 6 },
  profileName: { color: C.text, fontSize: 18, fontWeight: "800" },
  followRow: { flexDirection: "row", gap: 24, marginTop: 10, marginBottom: 4 },
  followStat: { alignItems: "center" as const, gap: 2 },
  followStatValue: { fontSize: 18, fontWeight: "700" as const, color: C.text },
  followStatLabel: { fontSize: 11, color: C.textMuted },
  followNumber: { color: C.text, fontSize: 14, fontWeight: "700" },
  followLabel: { color: C.textMuted, fontSize: 9, fontWeight: "600", letterSpacing: 0.3 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bio: { color: C.textSec, fontSize: 13, paddingHorizontal: 16, marginBottom: 10 },
  socialLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  socialIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 3,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: "wrap" },
  tag: {
    backgroundColor: C.surface,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagText: { color: C.textSec, fontSize: 12, fontWeight: "600" },


  supporterCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 3,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  supporterHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  supporterTitle: { color: C.accent, fontSize: 12, fontWeight: "800", letterSpacing: 0.5, flex: 1 },
  activeBadge: { backgroundColor: C.accent, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 },
  activeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  progressBar: {
    height: 8,
    backgroundColor: C.surface2,
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: { height: "100%", backgroundColor: C.accent, borderRadius: 2 },
  trophyIcon: { position: "absolute", right: 0, top: -3 },
  supporterSub: { color: C.accent, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  roleCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 3,
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
    borderRadius: 3,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  roleButtonActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  roleButtonText: { color: C.textSec, fontSize: 12, fontWeight: "700" },
  roleButtonTextActive: { color: "#050505" },
  revenueBtn: {
    marginHorizontal: 16,
    backgroundColor: C.green,
    borderRadius: 3,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  revenueBtnText: { color: "#050505", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  adReviewBtn: {
    marginHorizontal: 16,
    backgroundColor: C.orange,
    borderRadius: 3,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  adReviewBtnText: { color: "#050505", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  searchResults: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 3,
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
    borderRadius: 3,
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
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadBtnText: { color: "#050505", fontSize: 12, fontWeight: "700" },
  postsTitle: { color: C.text, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  postsCount: { color: C.textMuted, fontSize: 12, fontWeight: "600" },
  timelineList: { paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 3,
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
  timelineThumb: { width: 64, aspectRatio: 16 / 9, borderRadius: 3, backgroundColor: C.surface2 },
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
  myListSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  myListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  myListTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  myListCount: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  myListContent: {
    backgroundColor: C.surface,
    borderRadius: 3,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  myListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  myListEmpty: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
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
    borderRadius: 3,
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
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  myCommunityLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
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
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  startFabText: { color: "#050505", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
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
  previewModalSheet: { paddingHorizontal: 16 },
  previewModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  previewOpenPageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.accent,
    borderRadius: 3,
  },
  previewOpenPageText: { color: "#050505", fontSize: 12, fontWeight: "700" },
  previewScroll: { flex: 1 },
  previewProfileCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderDim,
    marginBottom: 16,
  },
  previewAvatarWrap: { marginBottom: 14 },
  previewAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: C.accent },
  previewWhiteCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },
  previewName: { color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 8 },
  previewBio: { color: C.textSec, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 12 },
  previewPostsSection: { paddingHorizontal: 16, paddingBottom: 24 },
  previewPostsList: { gap: 8 },
  previewRoleBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 },
  previewRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: C.borderDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewRoleBadgeText: { color: C.textSec, fontSize: 10, fontWeight: "700" },
  previewSectionTitle: { color: C.textSec, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  previewCommunitiesSection: { paddingHorizontal: 16, marginBottom: 20 },
  previewCommunityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  previewCommunityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.borderDim,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "47%",
  },
  previewCommunityThumb: { width: 28, height: 28, borderRadius: 2 },
  previewCommunityName: { color: C.text, fontSize: 11, fontWeight: "700", flex: 1 },
  previewPostItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: "800" },
  modalSub: { color: C.textMuted, fontSize: 12, marginBottom: 20 },
  profileEditHint: { color: C.textMuted, fontSize: 11, lineHeight: 16, marginBottom: 16 },
  modalScroll: { maxHeight: 380 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelBtnText: { color: C.textSec, fontSize: 14, fontWeight: "700" },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 3,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: { color: "#050505", fontSize: 14, fontWeight: "800" },

  // Guest / not logged in
  guestContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  guestLogoWrap: { marginBottom: 4 },
  guestSub: { color: C.textMuted, fontSize: 14, textAlign: "center" },
  guestLoginBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: 3,
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
    borderRadius: 3,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  lineIcon: { width: 22, height: 22 },
  lineLoginText: { color: "#050505", fontSize: 16, fontWeight: "800" },

  pwaFab: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 3,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.accent,
  },
  pwaPopupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pwaPopupBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: C.surface,
    borderRadius: 3,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  pwaPopupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pwaPopupTitle: { color: C.text, fontSize: 16, fontWeight: "800" },
  pwaPopupClose: { padding: 4 },
  pwaPopupBody: {
    color: C.textSec,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  pwaPopupBtn: {
    backgroundColor: C.accent,
    borderRadius: 3,
    paddingVertical: 12,
    alignItems: "center",
  },
  pwaPopupBtnDisabled: { opacity: 0.6 },
  pwaPopupBtnText: { color: "#050505", fontSize: 14, fontWeight: "700" },

  // Header actions (edit + logout)
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnPressed: {
    backgroundColor: C.surface2,
    borderColor: C.accent,
  },

  // Avatar fallback + edit badge
  avatarFallback: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWhiteCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarInitial: { color: C.accent, fontSize: 28, fontWeight: "800" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 3,
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
    borderRadius: 3,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileInput: { flex: 1, color: C.text, fontSize: 14, paddingVertical: 12 },
  avatarPreview: {
    width: 56,
    height: 56,
    borderRadius: 3,
    marginTop: 10,
    borderWidth: 2,
    borderColor: C.accent,
    alignSelf: "center",
  },
});
