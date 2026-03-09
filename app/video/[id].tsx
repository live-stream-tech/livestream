import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { C } from "@/constants/colors";
import { VIDEOS } from "@/constants/data";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";

type VideoComment = {
  id: number;
  videoId: number;
  userId: number;
  text: string;
  createdAt: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
};

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [purchased, setPurchased] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const qc = useQueryClient();
  const { user, requireAuth } = useAuth();

  const { data: apiVideo } = useQuery<any>({
    queryKey: [`/api/videos/${id}`],
    enabled: !!id,
  });

  const fallbackVideo = VIDEOS.find((v) => v.id === String(id)) ?? VIDEOS[0];
  const video = (apiVideo as any) ?? fallbackVideo;

  const { data: comments = [] } = useQuery<VideoComment[]>({
    queryKey: [`/api/videos/${id}/comments`],
    enabled: !!id,
  });

  const isOwner =
    !!apiVideo &&
    !!user &&
    (video.creator === (user.displayName ?? user.name) || video.creator === user.name);

  async function handleAddComment() {
    const text = commentText.trim();
    if (!text) return;
    if (!requireAuth("コメント")) return;
    try {
      await apiRequest("POST", `/api/videos/${id}/comments`, { text });
      setCommentText("");
      await qc.invalidateQueries({ queryKey: [`/api/videos/${id}/comments`] });
    } catch {
      Alert.alert("エラー", "コメントの投稿に失敗しました");
    }
  }

  function openEdit() {
    if (!isOwner || !apiVideo) return;
    setEditTitle(video.title ?? "");
    setEditMode(true);
  }

  async function saveEdit() {
    const newTitle = editTitle.trim();
    if (!newTitle) {
      Alert.alert("", "タイトルを入力してください");
      return;
    }
    if (!requireAuth("編集")) return;
    try {
      await apiRequest("PATCH", `/api/videos/${id}`, { title: newTitle });
      await qc.invalidateQueries({ queryKey: [`/api/videos/${id}`] });
      await qc.invalidateQueries({ queryKey: ["/api/videos/my"] });
      setEditMode(false);
    } catch {
      Alert.alert("エラー", "投稿の更新に失敗しました");
    }
  }

  function confirmDelete() {
    if (!isOwner) return;
    Alert.alert("投稿を削除", "この投稿を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: deletePost,
      },
    ]);
  }

  async function deletePost() {
    if (!requireAuth("削除")) return;
    try {
      await apiRequest("DELETE", `/api/videos/${id}`);
      await qc.invalidateQueries({ queryKey: ["/api/videos"] });
      await qc.invalidateQueries({ queryKey: ["/api/videos/my"] });
      router.replace("/(tabs)/profile");
    } catch {
      Alert.alert("エラー", "削除に失敗しました");
    }
  }

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!video) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <Pressable
          style={[styles.backBtn, { top: topInset + 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.titleRow}>
            {editMode ? (
              <TextInput
                style={styles.editTitleInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="タイトルを編集"
                placeholderTextColor={C.textMuted}
              />
            ) : (
              <Text style={styles.videoTitle}>{video.title}</Text>
            )}
            {isOwner && !editMode && (
              <View style={styles.postActionsRow}>
                <Pressable style={styles.postActionBtn} onPress={openEdit}>
                  <Ionicons name="pencil-outline" size={14} color={C.textSec} />
                  <Text style={styles.postActionText}>編集</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn} onPress={confirmDelete}>
                  <Ionicons name="trash-outline" size={14} color={C.textSec} />
                  <Text style={styles.postActionText}>削除</Text>
                </Pressable>
              </View>
            )}
            {editMode && (
              <View style={styles.postActionsRow}>
                <Pressable style={styles.postActionBtn} onPress={() => setEditMode(false)}>
                  <Text style={styles.postActionText}>キャンセル</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn} onPress={saveEdit}>
                  <Text style={[styles.postActionText, { color: C.accent }]}>保存</Text>
                </Pressable>
              </View>
            )}
          </View>
          <Text style={styles.videoDesc}>
            昨日の渋谷WWWワンマンライブの舞台裏を特別公開！リハ風景、メイクルーム、本番直前の緊張感まで全部見せます。チェキ会の様子もあるよ
          </Text>

          {/* Comments Preview */}
          <View style={styles.commentsPreview}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Image
                  source={{ uri: c.profileImageUrl ?? undefined }}
                  style={styles.commentAvatar}
                  contentFit="cover"
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentName}>{c.displayName ?? "ユーザー"}</Text>
                  <Text style={styles.commentText} numberOfLines={1}>
                    {c.text}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="コメントを追加..."
                placeholderTextColor={C.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                maxLength={200}
              />
              <Pressable style={styles.commentSendBtn} onPress={handleAddComment} disabled={!commentText.trim()}>
                <Ionicons
                  name="send"
                  size={16}
                  color={commentText.trim() ? C.accent : C.textMuted}
                />
              </Pressable>
            </View>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  editTitleInput: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: C.text,
    fontSize: 15,
  },
  postActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postActionText: {
    color: C.textSec,
    fontSize: 11,
    fontWeight: "600",
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
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: C.text,
    fontSize: 13,
  },
  commentSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
