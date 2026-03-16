import React from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { C } from "@/constants/colors";
import { getTabTopInset } from "@/constants/layout";

type UserProfile = {
  id: number;
  name: string;
  displayName: string;
  avatar: string | null;
  profileImageUrl: string | null;
  bio: string;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
};

type VideoItem = {
  id: number;
  title: string;
  thumbnail: string;
  community: string;
  timeAgo?: string;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id ?? "0");
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: [`/api/users/${userId}`],
    enabled: userId > 0,
  });

  const { data: posts = [] } = useQuery<VideoItem[]>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: userId > 0,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>プロフィール</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }
  if (isError || !profile) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>プロフィール</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>ユーザーが見つかりません</Text>
        </View>
      </View>
    );
  }

  const avatar = profile.avatar ?? profile.profileImageUrl ?? null;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{(profile.name ?? "?")[0].toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {(profile.instagramUrl || profile.youtubeUrl || profile.xUrl) ? (
            <View style={styles.socialRow}>
              {profile.instagramUrl && (
                <Pressable style={styles.socialBtn} onPress={() => profile.instagramUrl && Linking.openURL(profile.instagramUrl)}>
                  <Ionicons name="logo-instagram" size={22} color="#E4405F" />
                </Pressable>
              )}
              {profile.youtubeUrl && (
                <Pressable style={styles.socialBtn} onPress={() => profile.youtubeUrl && Linking.openURL(profile.youtubeUrl)}>
                  <Ionicons name="logo-youtube" size={22} color="#FF0000" />
                </Pressable>
              )}
              {profile.xUrl && (
                <Pressable style={styles.socialBtn} onPress={() => profile.xUrl && Linking.openURL(profile.xUrl)}>
                  <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
                </Pressable>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.postsTitle}>投稿</Text>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>まだ投稿がありません</Text>
          ) : (
            posts.map((v) => (
              <Pressable
                key={v.id}
                style={styles.postItem}
                onPress={() => router.push(`/video/${v.id}`)}
              >
                <Image source={{ uri: v.thumbnail }} style={styles.postThumb} contentFit="cover" />
                <View style={styles.postBody}>
                  <Text style={styles.postTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={styles.postMeta} numberOfLines={1}>
                    {v.community || "自分のページ"} ・ {v.timeAgo ?? ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: C.textMuted, fontSize: 14 },
  scroll: { flex: 1 },
  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarFallback: {
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: C.textMuted, fontSize: 28, fontWeight: "700" },
  name: { color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 8 },
  bio: { color: C.textSec, fontSize: 14, lineHeight: 20, textAlign: "center", maxWidth: "100%" },
  socialRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  socialBtn: { padding: 8 },
  postsSection: { paddingHorizontal: 16, paddingBottom: 32 },
  postsTitle: { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  emptyText: { color: C.textMuted, fontSize: 14, paddingVertical: 24 },
  postItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  postThumb: { width: 64, height: 48, borderRadius: 8 },
  postBody: { flex: 1 },
  postTitle: { color: C.text, fontSize: 14, fontWeight: "600" },
  postMeta: { color: C.textMuted, fontSize: 12, marginTop: 2 },
});
