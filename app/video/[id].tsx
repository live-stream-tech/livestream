import React, { useState } from "react";
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
import { C } from "@/constants/colors";
import { VIDEOS, RANKED_VIDEOS } from "@/constants/data";

const COMMENTS = [
  {
    id: "1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    name: "星空みゆ",
    text: "みゆちゃんが泣いてるシーンが一番好き！大粒のファン泣いて感謝！",
    time: "10分前",
  },
  {
    id: "2",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    name: "ファン太郎",
    text: "チェキ会行けなかったけど動画でおなじ気持ちになれた！ありがとう",
    time: "25分前",
  },
  {
    id: "3",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop",
    name: "まいまい17歳",
    text: "みゆちゃん泣い... チェキ会行けな...",
    time: "1時間前",
  },
];

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [purchased, setPurchased] = useState(false);

  const allVideos = [...VIDEOS, ...RANKED_VIDEOS];
  const video = allVideos.find((v) => v.id === id) ?? allVideos[0];

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Video Player Area */}
        <View style={styles.playerContainer}>
          <Image source={{ uri: video.thumbnail }} style={styles.playerThumb} contentFit="cover" />
          <View style={styles.playerOverlay}>
            {!purchased && video.price && (
              <View style={styles.lockedOverlay}>
                <Ionicons name="lock-closed" size={32} color="rgba(255,255,255,0.5)" />
              </View>
            )}
            <View style={styles.playerControls}>
              <Pressable
                style={[styles.backBtn, { top: topInset + 12 }]}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Video Info */}
        <View style={styles.infoSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoDesc}>
            昨日の渋谷WWWワンマンライブの舞台裏を特別公開！リハ風景、メイクルーム、本番直前の緊張感まで全部見せます。チェキ会の様子もあるよ
          </Text>

          {/* Comments Preview */}
          <View style={styles.commentsPreview}>
            {COMMENTS.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Image source={{ uri: c.avatar }} style={styles.commentAvatar} contentFit="cover" />
                <View style={styles.commentContent}>
                  <Text style={styles.commentName}>{c.name}</Text>
                  <Text style={styles.commentText} numberOfLines={1}>{c.text}</Text>
                </View>
                <Text style={styles.commentTime}>{c.time}</Text>
              </View>
            ))}
          </View>

          {/* Purchase / Play Button */}
          {video.price && !purchased ? (
            <View style={styles.purchaseSection}>
              <Pressable
                style={styles.purchaseBtn}
                onPress={() => setPurchased(true)}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.purchaseBtnText}>
                  動画を見る！ ¥{video.price.toLocaleString()}
                </Text>
              </Pressable>
              <Text style={styles.viewCount}>
                {(video.views).toLocaleString()}人が視聴
              </Text>
            </View>
          ) : (
            <View style={styles.purchaseSection}>
              <Pressable style={[styles.purchaseBtn, { backgroundColor: C.green }]}>
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.purchaseBtnText}>今すぐ視聴</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Creator info */}
        <View style={styles.creatorSection}>
          <View style={styles.creatorRow}>
            <Image source={{ uri: video.avatar }} style={styles.creatorAvatar} contentFit="cover" />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{video.creator}</Text>
              <Text style={styles.creatorCommunity}>{video.community}</Text>
            </View>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followBtnText}>フォロー</Text>
            </Pressable>
          </View>
        </View>

        {/* Video meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={16} color={C.textSec} />
            <Text style={styles.metaText}>{video.views.toLocaleString()}回視聴</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={C.textSec} />
            <Text style={styles.metaText}>{video.timeAgo}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="heart-outline" size={16} color={C.textSec} />
            <Text style={styles.metaText}>いいね</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="share-outline" size={16} color={C.textSec} />
            <Text style={styles.metaText}>シェア</Text>
          </View>
        </View>

        <View style={{ height: 100 + bottomInset }} />
      </ScrollView>
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
  playerContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  playerThumb: {
    width: "100%",
    height: "100%",
  },
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  playerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    padding: 16,
    gap: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  videoTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
  },
  videoDesc: {
    color: C.textSec,
    fontSize: 13,
    lineHeight: 20,
  },
  commentsPreview: {
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.accent,
  },
  commentContent: {
    flex: 1,
  },
  commentName: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
  },
  commentText: {
    color: C.textSec,
    fontSize: 11,
  },
  commentTime: {
    color: C.textMuted,
    fontSize: 10,
  },
  purchaseSection: {
    gap: 8,
    alignItems: "center",
  },
  purchaseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
  },
  purchaseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  viewCount: {
    color: C.textMuted,
    fontSize: 12,
  },
  creatorSection: {
    padding: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: C.accent,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
  },
  creatorCommunity: {
    color: C.textSec,
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: C.textSec,
    fontSize: 12,
  },
});
