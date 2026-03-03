import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";

const GENRES = [
  { id: "anime", name: "アニメ", icon: "tv-outline", count: 1204, color: "#E91E8C" },
  { id: "band", name: "バンド", icon: "musical-notes-outline", count: 876, color: C.accent },
  { id: "subcul", name: "サブカル", icon: "sparkles-outline", count: 642, color: C.orange },
  { id: "english", name: "英会話", icon: "language-outline", count: 531, color: C.green },
  { id: "fortune", name: "占い", icon: "moon-outline", count: 389, color: "#9C27B0" },
];

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stock</Text>
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>ジャンル別コミュニティ</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {GENRES.map((genre) => (
          <Pressable
            key={genre.id}
            style={styles.genreCard}
            onPress={() => router.push(`/community/genre/${genre.id}`)}
          >
            <View style={[styles.iconWrap, { backgroundColor: genre.color + "22" }]}>
              <Ionicons name={genre.icon as any} size={26} color={genre.color} />
            </View>
            <View style={styles.genreInfo}>
              <Text style={styles.genreName}>{genre.name}</Text>
              <Text style={styles.genreCount}>{formatNumber(genre.count)} コミュニティ</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </Pressable>
        ))}
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
  logo: { fontSize: 22, fontWeight: "800" },
  logoLive: { color: C.text },
  logoStock: { color: C.accent },
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
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "700" },
  scroll: { flex: 1 },
  genreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  genreInfo: { flex: 1 },
  genreName: { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 3 },
  genreCount: { color: C.textMuted, fontSize: 12 },
});
