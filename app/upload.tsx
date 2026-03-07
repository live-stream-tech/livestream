import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { C } from "@/constants/colors";
import { useAuth } from "@/lib/auth";

type FeeType = "free" | "paid";
type ScopeType = "public" | "members" | "invite";
type PriceOption = 300 | 500 | 1000 | 2000 | 3000 | 5000;

const PRICE_OPTIONS: PriceOption[] = [300, 500, 1000, 2000, 3000, 5000];

type Community = { id: number; name: string; thumbnail: string };

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const queryClient = useQueryClient();
  const { user, requireAuth } = useAuth();

  const { data: communities = [] } = useQuery<Community[]>({ queryKey: ["/api/communities"] });

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [fee, setFee] = useState<FeeType>("free");
  const [price, setPrice] = useState<PriceOption>(500);
  const [scope, setScope] = useState<ScopeType>("public");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);

  const activeCommunityId = selectedCommunityId ?? communities[0]?.id ?? null;
  const selectedCommunity = communities.find((c) => c.id === activeCommunityId);

  async function pickPhoto() {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setPhotoUri(url);
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
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!canUpload) return;
    if (!requireAuth("投稿")) return;
    setUploading(true);
    try {
      const communityName = selectedCommunity?.name ?? "一般";
      const creatorName = user?.name ?? "ゲストライバー";
      const thumbUrl = photoUri
        ?? selectedCommunity?.thumbnail
        ?? "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop";
      const avatarUrl = user?.avatar
        ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop";
      const newPost = await apiRequest("POST", "/api/videos", {
        title: title.trim(),
        creator: creatorName,
        community: communityName,
        duration: "00:00",
        price: fee === "paid" ? price : null,
        thumbnail: thumbUrl,
        avatar: avatarUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      Alert.alert("記録完了！", "活動が記録されました", [
        { text: "確認する", onPress: () => router.replace(`/video/${newPost.id}`) },
        { text: "ホームへ", onPress: () => router.replace("/") },
      ]);
    } catch (e) {
      Alert.alert("エラー", "投稿に失敗しました。もう一度お試しください。");
    } finally {
      setUploading(false);
    }
  }

  const canUpload = title.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>活動を記録</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 写真選択エリア */}
        <Pressable style={styles.photoPicker} onPress={pickPhoto}>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
              <View style={styles.photoSelectedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={C.green} />
                <Text style={styles.photoSelectedLabel}>写真を選択済み</Text>
              </View>
              <Pressable style={styles.rePickBtn} onPress={pickPhoto}>
                <Text style={styles.rePickText}>変更</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoPickerInner}>
              <View style={styles.photoPickerIcon}>
                <Ionicons name="image-outline" size={36} color={C.accent} />
              </View>
              <Text style={styles.photoPickerTitle}>写真を追加（任意）</Text>
              <Text style={styles.photoPickerSub}>タップして写真を選ぶ</Text>
            </View>
          )}
        </Pressable>

        {/* タイトル */}
        <View style={styles.section}>
          <Text style={styles.label}>タイトル <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="活動のタイトルを入力..."
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
          <Text style={styles.charCount}>{title.length}/60</Text>
        </View>

        {/* 説明 */}
        <View style={styles.section}>
          <Text style={styles.label}>説明</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="活動の内容を入力..."
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* コミュニティ */}
        <View style={styles.section}>
          <Text style={styles.label}>投稿先コミュニティ</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.communityScroll}
          >
            {communities.map((community) => (
              <Pressable
                key={community.id}
                style={[styles.communityPill, activeCommunityId === community.id && styles.communityPillActive]}
                onPress={() => setSelectedCommunityId(community.id)}
              >
                <Text
                  style={[styles.communityPillText, activeCommunityId === community.id && styles.communityPillTextActive]}
                  numberOfLines={1}
                >
                  {community.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 公開範囲 */}
        <View style={styles.section}>
          <Text style={styles.label}>公開範囲</Text>
          <View style={styles.scopeRow}>
            {(["public", "members", "invite"] as ScopeType[]).map((s) => {
              const labels: Record<ScopeType, string> = {
                public: "一般公開",
                members: "メンバー限定",
                invite: "招待者のみ",
              };
              const icons: Record<ScopeType, string> = {
                public: "globe-outline",
                members: "people-outline",
                invite: "lock-closed-outline",
              };
              const isActive = scope === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.scopeOption, isActive && styles.scopeOptionActive]}
                  onPress={() => setScope(s)}
                >
                  <Ionicons name={icons[s] as any} size={18} color={isActive ? C.accent : C.textMuted} />
                  <Text style={[styles.scopeText, isActive && styles.scopeTextActive]}>{labels[s]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 料金設定 */}
        <View style={styles.section}>
          <Text style={styles.label}>料金設定</Text>
          <View style={styles.feeRow}>
            <Pressable
              style={[styles.feePill, fee === "free" && styles.feePillActive]}
              onPress={() => setFee("free")}
            >
              <Ionicons name="gift-outline" size={14} color={fee === "free" ? "#fff" : C.textSec} />
              <Text style={[styles.feePillText, fee === "free" && styles.feePillTextActive]}>無料</Text>
            </Pressable>
            <Pressable
              style={[styles.feePill, fee === "paid" && styles.feePillActive]}
              onPress={() => setFee("paid")}
            >
              <Ionicons name="card-outline" size={14} color={fee === "paid" ? "#fff" : C.textSec} />
              <Text style={[styles.feePillText, fee === "paid" && styles.feePillTextActive]}>有料</Text>
            </Pressable>
          </View>

          {fee === "paid" && (
            <View style={styles.priceGrid}>
              {PRICE_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.pricePill, price === p && styles.pricePillActive]}
                  onPress={() => setPrice(p)}
                >
                  <Text style={[styles.pricePillText, price === p && styles.pricePillTextActive]}>
                    ¥{p.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {fee === "paid" && (
            <View style={styles.pricePreview}>
              <Text style={styles.pricePreviewLabel}>設定価格</Text>
              <Text style={styles.pricePreviewValue}>¥{price.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* タグ */}
        <View style={styles.section}>
          <Text style={styles.label}>タグ</Text>
          <TextInput
            style={styles.input}
            placeholder="#音楽 #ライブ #アイドル..."
            placeholderTextColor={C.textMuted}
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.hint}>スペース区切りで複数入力できます</Text>
        </View>

        {/* 投稿ボタン */}
        <View style={[styles.submitSection, { paddingBottom: bottomInset + 20 }]}>
          <Pressable
            style={[styles.submitBtn, (!canUpload || uploading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={uploading || !canUpload}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>{uploading ? "記録中..." : "活動を記録"}</Text>
          </Pressable>
          {!canUpload && (
            <Text style={styles.submitHint}>タイトルは必須です</Text>
          )}
        </View>
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  photoPicker: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: "dashed",
  },
  photoPickerInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  photoPickerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(41, 182, 207, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPickerTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },
  photoPickerSub: {
    color: C.textMuted,
    fontSize: 13,
  },
  photoPreviewContainer: {
    flex: 1,
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoSelectedBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  photoSelectedLabel: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
  },
  rePickBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rePickText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  label: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  required: {
    color: C.live,
  },
  hint: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 5,
  },
  charCount: {
    color: C.textMuted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  communityScroll: {
    gap: 8,
  },
  communityPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.surface,
    maxWidth: 150,
  },
  communityPillActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(41,182,207,0.12)",
  },
  communityPillText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
  },
  communityPillTextActive: {
    color: C.accent,
  },
  scopeRow: {
    gap: 8,
  },
  scopeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  scopeOptionActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(41,182,207,0.08)",
  },
  scopeText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "600",
  },
  scopeTextActive: {
    color: C.accent,
  },
  feeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  feePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  feePillActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  feePillText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "700",
  },
  feePillTextActive: {
    color: "#fff",
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pricePill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  pricePillActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  pricePillText: {
    color: C.textSec,
    fontSize: 13,
    fontWeight: "700",
  },
  pricePillTextActive: {
    color: "#fff",
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pricePreviewLabel: {
    color: C.textSec,
    fontSize: 13,
  },
  pricePreviewValue: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
  },
  submitSection: {
    marginHorizontal: 16,
    marginTop: 28,
    alignItems: "center",
    gap: 10,
  },
  submitBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitBtnDisabled: {
    backgroundColor: C.surface3,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  submitHint: {
    color: C.textMuted,
    fontSize: 12,
  },
});
