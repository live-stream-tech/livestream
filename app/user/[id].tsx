import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { C } from "@/constants/colors";

type UserProfile = {
  id: number;
  name: string;
  displayName: string;
  avatar: string | null;
  profileImageUrl: string | null;
  bio: string;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id ?? "0");
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: [`/api/users/${userId}`],
    enabled: !Number.isNaN(userId) && userId > 0,
  });

  if (Number.isNaN(userId) || userId <= 0) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>ユーザー</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ユーザーが見つかりません</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>ユーザー</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>ユーザー</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="person-outline" size={48} color={C.textMuted} />
          <Text style={styles.emptyText}>ユーザーが見つかりません</Text>
        </View>
      </View>
    );
  }

  const avatar = user.avatar ?? user.profileImageUrl;
  const displayName = user.name ?? user.displayName ?? "ユーザー";

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase() ?? "?"}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          {user.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : null}
        </View>
        <View style={{ height: 80 }} />
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: C.text, fontSize: 17, fontWeight: "700", textAlign: "center" },

  loading: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 48 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    gap: 12,
  },
  emptyText: { color: C.textMuted, fontSize: 15 },

  scroll: { flex: 1 },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarWrap: { marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: C.textMuted, fontSize: 36, fontWeight: "700" },
  userName: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 8 },
  bio: {
    color: C.textSec,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
});
