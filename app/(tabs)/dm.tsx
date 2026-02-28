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
import { router } from "expo-router";
import { C } from "@/constants/colors";
import { FOLLOWING_FEED, COMMUNITIES } from "@/constants/data";

export default function DMScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: topInset + 16 }} />

        {/* Following Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FOLLOWING FEED</Text>
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>HOT</Text>
          </View>
        </View>

        <View style={styles.feedList}>
          {FOLLOWING_FEED.map((item) => (
            <Pressable key={item.id} style={styles.feedItem}>
              <Image source={{ uri: item.avatar }} style={styles.feedAvatar} contentFit="cover" />
              <View style={styles.feedContent}>
                <View style={styles.feedHeader}>
                  <Text style={styles.feedCreator}>{item.creator}</Text>
                  <Text style={styles.feedTime}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.feedText} numberOfLines={2}>{item.content}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Joined Communities */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>JOINED COMMUNITIES</Text>
        </View>

        <View style={styles.communityGrid}>
          {COMMUNITIES.map((community) => (
            <Pressable
              key={community.id}
              style={styles.communityCard}
              onPress={() => router.push(`/community/${community.id}`)}
            >
              <Image source={{ uri: community.thumbnail }} style={styles.communityThumb} contentFit="cover" />
              {community.online && <View style={styles.onlineDot} />}
              <View style={styles.communityOverlay}>
                <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
                <Text style={styles.communityMembers}>{(community.members / 1000).toFixed(0)}千人</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Start */}
      <Pressable style={[styles.startFab, { bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 }]}>
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
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  hotBadge: {
    backgroundColor: C.live,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  feedList: {
    paddingHorizontal: 16,
    gap: 2,
  },
  feedItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  feedAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: C.accent,
  },
  feedContent: {
    flex: 1,
    gap: 5,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedCreator: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  feedTime: {
    color: C.textMuted,
    fontSize: 11,
  },
  feedText: {
    color: C.textSec,
    fontSize: 13,
    lineHeight: 19,
  },
  communityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 4,
  },
  communityCard: {
    width: "48.5%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  communityThumb: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.bg,
  },
  communityOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 10,
  },
  communityName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  communityMembers: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
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
