import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  ActionSheetIOS,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, ApiError, getApiUrl } from "@/lib/query-client";
import { C } from "@/constants/colors";
import { useAuth } from "@/lib/auth";

type FeeType = "free" | "paid";
type PriceOption = 300 | 500 | 1000 | 2000 | 3000 | 5000;
const PRICE_OPTIONS: PriceOption[] = [300, 500, 1000, 2000, 3000, 5000];

type MediaItem = { id: string; uri: string; type: "image" | "video" };
type Community = { id: number; name: string; thumbnail: string };

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const queryClient = useQueryClient();
  const { user, requireAuth } = useAuth();

  const { data: communities = [] } = useQuery<Community[]>({ queryKey: ["/api/communities"] });
  const { concertId: rawConcertId } = useLocalSearchParams<{ concertId?: string }>();
  const concertId = rawConcertId ? parseInt(rawConcertId as string, 10) || null : null;

  const [text, setText] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [postTarget, setPostTarget] = useState<"my_page_only" | "community">("my_page_only");
  const [publishFromExisting, setPublishFromExisting] = useState(false);
  const [showPublishFromModal, setShowPublishFromModal] = useState(false);
  const [fee, setFee] = useState<FeeType>("free");
  const [price, setPrice] = useState<PriceOption>(500);
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: myVideos = [] } = useQuery<any[]>({
    queryKey: ["/api/videos/my"],
    enabled: showPublishFromModal && !!user,
  });
  const myPageOnlyVideos = myVideos.filter((v) => (v as any).visibility === "my_page_only" || (v as any).visibility === "draft");

  const activeCommunityId = selectedCommunityId ?? communities[0]?.id ?? null;
  const selectedCommunity = communities.find((c) => c.id === activeCommunityId);

  function addMedia(id: string, uri: string, type: "image" | "video") {
    setMediaItems((prev) => [...prev, { id, uri, type }]);
  }

  function removeMedia(id: string) {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
  }

  async function uploadFileToR2Web(file: File) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {}
    const res = await fetch(new URL("/api/upload-url", getApiUrl()).toString(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });
    if (!res.ok) {
      throw new Error("署名付きURLの取得に失敗しました");
    }
    const { uploadUrl, url } = await res.json();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("ファイルのアップロードに失敗しました");
    }
    return url as string;
  }

  async function uploadFileToR2Native(uri: string, name: string, mime: string) {
    const resp = await apiRequest("POST", "/api/upload-url", {
      fileName: name,
      contentType: mime,
    });
    const { uploadUrl, url } = await resp.json();
    const blob = await (await fetch(uri)).blob();
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mime },
      body: blob,
    });
    return url as string;
  }

  async function pickPhoto() {
    setAddMenuVisible(false);
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0] as File | undefined;
        if (!file) return;
        try {
          setUploading(true);
          const url = await uploadFileToR2Web(file);
          addMedia(`img-${Date.now()}`, url, "image");
          console.log("Uploaded image to:", url);
        } catch (err) {
          console.error(err);
          Alert.alert("エラー", "画像のアップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限が必要です", "写真を選択するにはメディアライブラリへのアクセスを許可してください");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        setUploading(true);
        const mime = asset.mimeType ?? "image/jpeg";
        const name = asset.fileName ?? "image.jpg";
        const url = await uploadFileToR2Native(asset.uri, name, mime);
        addMedia(`img-${Date.now()}`, url, "image");
        console.log("Uploaded image to:", url);
      } catch (err) {
        console.error(err);
        Alert.alert("エラー", "画像のアップロードに失敗しました");
      } finally {
        setUploading(false);
      }
    }
  }

  async function pickVideo() {
    setAddMenuVisible(false);
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0] as File | undefined;
        if (!file) return;
        try {
          setUploading(true);
          const url = await uploadFileToR2Web(file);
          addMedia(`vid-${Date.now()}`, url, "video");
          console.log("Uploaded video to:", url);
        } catch (err) {
          console.error(err);
          Alert.alert("エラー", "動画のアップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限が必要です", "動画を選択するにはメディアライブラリへのアクセスを許可してください");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        setUploading(true);
        const mime = asset.mimeType ?? "video/mp4";
        const name = asset.fileName ?? "video.mp4";
        const url = await uploadFileToR2Native(asset.uri, name, mime);
        addMedia(`vid-${Date.now()}`, url, "video");
        console.log("Uploaded video to:", url);
      } catch (err) {
        console.error(err);
        Alert.alert("エラー", "動画のアップロードに失敗しました");
      } finally {
        setUploading(false);
      }
    }
  }

  function openAddMenu() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["キャンセル", "写真を追加", "動画を追加"],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) pickPhoto();
          if (i === 2) pickVideo();
        }
      );
    } else {
      setAddMenuVisible(true);
    }
  }

  /** blob: URL は永続化できないため、R2 にアップロードして https URL に変換する */
  async function ensureHttpsUrl(uri: string, type: "image" | "video"): Promise<string> {
    if (!uri.startsWith("blob:")) return uri;
    const res = await fetch(uri);
    if (!res.ok) throw new Error("画像の読み込みに失敗しました");
    const blob = await res.blob();
    const contentType = res.headers.get("content-type") || (type === "image" ? "image/jpeg" : "video/mp4");
    const ext = type === "image" ? "jpg" : "mp4";
    const resp = await apiRequest("POST", "/api/upload-url", {
      fileName: `upload.${ext}`,
      contentType,
    });
    const { uploadUrl, url } = await resp.json();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });
    if (!putRes.ok) throw new Error("画像のアップロードに失敗しました");
    return url as string;
  }

  async function handlePublishFromExisting(videoId: number) {
    if (!requireAuth("公開") || !selectedCommunity) return;
    setUploading(true);
    try {
      await apiRequest("PATCH", `/api/videos/${videoId}`, {
        visibility: "community",
        communityId: selectedCommunity.id,
        community: selectedCommunity.name,
      });
      setShowPublishFromModal(false);
      router.replace("/(tabs)/profile");
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/my"] });
    } catch (err: any) {
      Alert.alert("エラー", err?.message ?? "公開に失敗しました");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    const title = text.trim();
    if (!title.length) {
      Alert.alert("", "テキストを入力してください");
      return;
    }
    if (postTarget === "community" && !selectedCommunity) {
      Alert.alert("", "コミュニティを選択してください");
      return;
    }
    // 投稿はログイン必須
    if (!requireAuth("投稿")) return;
    setUploading(true);
    try {
      const communityName = selectedCommunity?.name ?? "";
      const creatorName = user?.name ?? user?.displayName ?? "ゲストライバー";
      const firstImage = mediaItems.find((m) => m.type === "image");
      let thumbUrl =
        firstImage?.uri ??
        selectedCommunity?.thumbnail ??
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop";
      // blob: URL は永続化できないため R2 にアップロード
      if (thumbUrl.startsWith("blob:") && firstImage) {
        try {
          thumbUrl = await ensureHttpsUrl(firstImage.uri, "image");
        } catch (e) {
          console.error("blob URL upload failed:", e);
          thumbUrl =
            selectedCommunity?.thumbnail ??
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop";
        }
      }
      const avatarUrl =
        user?.avatar ??
        user?.profileImageUrl ??
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop";

      const res = await apiRequest("POST", "/api/videos", {
        title,
        description: title,
        creator: creatorName,
        community: communityName,
        communityId: postTarget === "community" ? selectedCommunity?.id : null,
        duration: "00:00",
        price: fee === "paid" ? price : null,
        thumbnail: thumbUrl,
        avatar: avatarUrl,
        concertId,
        visibility: postTarget === "my_page_only" ? "my_page_only" : "community",
      });
      const data = (await res.json()) as { id: number };
      // 遷移を先に実行（invalidate の完了を待たない）
      router.replace("/(tabs)/profile");
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/my"] });
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          Alert.alert("ログインが必要です", "LINEでログインしてから投稿してください。");
        } else if (err.status === 400) {
          Alert.alert("投稿内容に問題があります", "入力内容を確認して、もう一度お試しください。");
        } else if (err.status >= 500) {
          Alert.alert("サーバーエラー", "サーバー側でエラーが発生しました。時間をおいて再度お試しください。");
        } else {
          Alert.alert("エラー", "投稿に失敗しました。もう一度お試しください。");
        }
      } else {
        Alert.alert("エラー", "投稿に失敗しました。もう一度お試しください。");
      }
    } finally {
      setUploading(false);
    }
  }

  const canSubmit = text.trim().length > 0 && !uploading;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>新規投稿</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* サムネイルプレビュー（入力欄の上） */}
        {mediaItems.length > 0 && (
          <View style={styles.previewRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewScroll}>
              {mediaItems.map((item) => (
                <View key={item.id} style={styles.previewItem}>
                  {item.type === "image" ? (
                    <Image source={{ uri: item.uri }} style={styles.previewThumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.previewThumb, styles.previewVideo]}>
                      <Ionicons name="videocam" size={28} color={C.textMuted} />
                    </View>
                  )}
                  <Pressable style={styles.removeBtn} onPress={() => removeMedia(item.id)} hitSlop={8}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* メインテキスト入力（大きめ・LINE風） */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.mainInput}
            placeholder="何を共有しますか？"
            placeholderTextColor={C.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>

        {/* 投稿先・コミュニティ */}
        <View style={styles.optionsSection}>
          <Text style={styles.optionsLabel}>投稿先</Text>
          <View style={styles.postTargetRow}>
            <Pressable
              style={[styles.postTargetBtn, postTarget === "my_page_only" && styles.postTargetBtnActive]}
              onPress={() => setPostTarget("my_page_only")}
            >
              <Text style={[styles.postTargetText, postTarget === "my_page_only" && styles.postTargetTextActive]}>自分のページのみ</Text>
            </Pressable>
            <Pressable
              style={[styles.postTargetBtn, postTarget === "community" && styles.postTargetBtnActive]}
              onPress={() => setPostTarget("community")}
            >
              <Text style={[styles.postTargetText, postTarget === "community" && styles.postTargetTextActive]}>コミュニティに公開</Text>
            </Pressable>
          </View>

          {postTarget === "community" && (
            <>
              <Text style={styles.optionsLabel}>コミュニティ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communityRow}>
                {communities.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.communityPill, activeCommunityId === c.id && styles.communityPillActive]}
                    onPress={() => setSelectedCommunityId(c.id)}
                  >
                    <Text style={[styles.communityPillText, activeCommunityId === c.id && styles.communityPillTextActive]} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {myPageOnlyVideos.length > 0 && (
                <Pressable style={styles.publishFromBtn} onPress={() => setShowPublishFromModal(true)}>
                  <Ionicons name="document-outline" size={16} color={C.accent} />
                  <Text style={styles.publishFromText}>自分の投稿から公開する</Text>
                </Pressable>
              )}
            </>
          )}

          {concertId && (
            <View style={[styles.communityChip, { marginTop: 8 }]}>
              <Ionicons name="musical-notes-outline" size={14} color={C.textMuted} />
              <Text style={styles.communityChipText}>紐付け公演ID: {concertId}</Text>
            </View>
          )}

          <Text style={styles.optionsLabel}>料金</Text>
          <View style={styles.feeRow}>
            <Pressable style={[styles.feeBtn, fee === "free" && styles.feeBtnActive]} onPress={() => setFee("free")}>
              <Text style={[styles.feeBtnText, fee === "free" && styles.feeBtnTextActive]}>無料</Text>
            </Pressable>
            <Pressable style={[styles.feeBtn, fee === "paid" && styles.feeBtnActive]} onPress={() => setFee("paid")}>
              <Text style={[styles.feeBtnText, fee === "paid" && styles.feeBtnTextActive]}>有料</Text>
            </Pressable>
          </View>
          {fee === "paid" && (
            <View style={styles.priceRow}>
              {PRICE_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.priceBtn, price === p && styles.priceBtnActive]}
                  onPress={() => setPrice(p)}
                >
                  <Text style={[styles.priceBtnText, price === p && styles.priceBtnTextActive]}>¥{p}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 下部バー: 左下 + ボタン、右下 投稿する */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <Pressable style={styles.addBtn} onPress={openAddMenu}>
          <Ionicons name="add" size={26} color={C.accent} />
        </Pressable>
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>投稿する</Text>
          )}
        </Pressable>
      </View>

      {/* 自分の投稿から公開するモーダル */}
      <Modal visible={showPublishFromModal} transparent animationType="slide">
        <Pressable style={styles.menuOverlay} onPress={() => !uploading && setShowPublishFromModal(false)}>
          <Pressable style={styles.publishFromModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.publishFromModalTitle}>公開する投稿を選択</Text>
            <ScrollView style={styles.publishFromList} showsVerticalScrollIndicator={false}>
              {myPageOnlyVideos.map((v) => (
                <Pressable
                  key={v.id}
                  style={styles.publishFromItem}
                  onPress={() => handlePublishFromExisting(v.id)}
                  disabled={uploading}
                >
                  <Image source={{ uri: v.thumbnail }} style={styles.publishFromThumb} contentFit="cover" />
                  <Text style={styles.publishFromItemTitle} numberOfLines={2}>{v.title}</Text>
                  <Ionicons name="arrow-forward" size={16} color={C.accent} />
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.publishFromCancel} onPress={() => setShowPublishFromModal(false)} disabled={uploading}>
              <Text style={styles.publishFromCancelText}>キャンセル</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Android/Web: + タップでメニューモーダル */}
      <Modal visible={addMenuVisible} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setAddMenuVisible(false)}>
          <View style={styles.menuCard}>
            <Pressable style={styles.menuItem} onPress={pickPhoto}>
              <Ionicons name="image-outline" size={22} color={C.text} />
              <Text style={styles.menuItemText}>写真を追加</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={pickVideo}>
              <Ionicons name="videocam-outline" size={22} color={C.text} />
              <Text style={styles.menuItemText}>動画を追加</Text>
            </Pressable>
            <Pressable style={[styles.menuItem, styles.menuItemCancel]} onPress={() => setAddMenuVisible(false)}>
              <Text style={styles.menuItemCancelText}>キャンセル</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  previewRow: { marginBottom: 12 },
  previewScroll: { flexDirection: "row", gap: 10 },
  previewItem: { position: "relative" },
  previewThumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: C.surface },
  previewVideo: { alignItems: "center", justifyContent: "center" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    minHeight: 140,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  mainInput: {
    color: C.text,
    fontSize: 16,
    minHeight: 116,
    textAlignVertical: "top",
    padding: 0,
  },
  optionsSection: { marginTop: 20, gap: 10 },
  optionsLabel: { color: C.textMuted, fontSize: 12, fontWeight: "600" },
  communityRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  communityChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.surface2,
  },
  communityChipText: {
    fontSize: 12,
    color: C.textMuted,
    marginLeft: 4,
  },
  communityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  communityPillActive: { borderColor: C.accent, backgroundColor: "rgba(41,182,207,0.15)" },
  communityPillText: { color: C.textSec, fontSize: 13, fontWeight: "600" },
  communityPillTextActive: { color: C.accent },
  postTargetRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  postTargetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  postTargetBtnActive: { borderColor: C.accent, backgroundColor: "rgba(41,182,207,0.15)" },
  postTargetText: { color: C.textSec, fontSize: 13, fontWeight: "600" },
  postTargetTextActive: { color: C.accent },
  publishFromBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  publishFromText: { color: C.accent, fontSize: 13, fontWeight: "600" },
  publishFromModal: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  publishFromModalTitle: { color: C.text, fontSize: 16, fontWeight: "800", marginBottom: 16 },
  publishFromList: { maxHeight: 300 },
  publishFromItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  publishFromThumb: { width: 56, height: 56, borderRadius: 8 },
  publishFromItemTitle: { flex: 1, color: C.text, fontSize: 14 },
  publishFromCancel: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  publishFromCancelText: { color: C.textMuted, fontSize: 14 },
  feeRow: { flexDirection: "row", gap: 10 },
  feeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  feeBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  feeBtnText: { color: C.textSec, fontSize: 14, fontWeight: "700" },
  feeBtnTextActive: { color: "#fff" },
  priceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  priceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  priceBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  priceBtnText: { color: C.textSec, fontSize: 13, fontWeight: "700" },
  priceBtnTextActive: { color: "#fff" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(41,182,207,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: C.accent,
  },
  submitBtnDisabled: { backgroundColor: C.surface3, opacity: 0.8 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuItemText: { color: C.text, fontSize: 16, fontWeight: "600" },
  menuItemCancel: { marginTop: 8, alignItems: "center" },
  menuItemCancelText: { color: C.textMuted, fontSize: 15 },
});
