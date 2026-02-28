import React from "react";
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

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574155462052-a5c83003e3e5?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574155462052-a5c83003e3e5?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=300&fit=crop",
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
          <Pressable style={styles.identityBtn}>
            <Ionicons name="shield-checkmark-outline" size={13} color={C.orange} />
            <Text style={styles.identityText}>IDENTITY CHECK</Text>
          </Pressable>
          <View style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="ユーザーを検索"
          placeholderTextColor={C.textMuted}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" }}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>山田太郎</Text>
              <View style={styles.followRow}>
                <View style={styles.followStat}>
                  <Text style={styles.followNumber}>567</Text>
                  <Text style={styles.followLabel}>FOLLOWING</Text>
                </View>
                <View style={styles.followStat}>
                  <Text style={styles.followNumber}>1,234</Text>
                  <Text style={styles.followLabel}>FOLLOWERS</Text>
                </View>
              </View>
            </View>
          </View>
          <Pressable style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color={C.text} />
          </Pressable>
        </View>

        <Text style={styles.bio}>音楽と旅行が大好き！</Text>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>男性</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>28 YEARS OLD</Text>
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

        {/* Revenue Management */}
        <Pressable style={styles.revenueBtn}>
          <Ionicons name="wallet-outline" size={16} color="#fff" />
          <Text style={styles.revenueBtnText}>REVENUE MANAGEMENT</Text>
        </Pressable>

        {/* Posts Grid */}
        <View style={styles.postsHeader}>
          <View style={styles.postsLeft}>
            <Text style={styles.postsTitle}>POSTS</Text>
            <Text style={styles.postsCount}>15 TOTAL</Text>
          </View>
          <Pressable style={styles.uploadBtn} onPress={() => router.push("/upload")}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>動画を投稿</Text>
          </Pressable>
        </View>

        <View style={styles.postsGrid}>
          {POST_IMAGES.map((uri, i) => (
            <Pressable key={i} style={styles.postThumbContainer}>
              <Image source={{ uri }} style={styles.postThumb} contentFit="cover" />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Start */}
      <Pressable style={[styles.startFab, { bottom: bottomInset + 80 }]}>
        <Ionicons name="radio" size={16} color="#fff" />
        <Text style={styles.startFabText}>START</Text>
      </Pressable>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
  identityText: {
    color: C.orange,
    fontSize: 11,
    fontWeight: "700",
  },
  notifButton: {
    position: "relative",
  },
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
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },
  scroll: { flex: 1 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: C.accent,
    borderRadius: 35,
    padding: 2,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  profileInfo: {
    gap: 6,
  },
  profileName: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
  },
  followRow: {
    flexDirection: "row",
    gap: 16,
  },
  followStat: {
    alignItems: "center",
    gap: 1,
  },
  followNumber: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
  },
  followLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    color: C.textSec,
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
  },
  supporterCard: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  supporterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  supporterTitle: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: C.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  progressBar: {
    height: 8,
    backgroundColor: C.surface2,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.accent,
    borderRadius: 4,
  },
  trophyIcon: {
    position: "absolute",
    right: 0,
    top: -3,
  },
  supporterSub: {
    color: C.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
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
  revenueBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  postsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postsLeft: {
    gap: 2,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  postsTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  postsCount: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    paddingHorizontal: 16,
  },
  postThumbContainer: {
    width: "32%",
    aspectRatio: 1,
  },
  postThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
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
  startFabText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
