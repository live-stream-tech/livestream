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
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { C } from "@/constants/colors";
import { AppLogo } from "@/components/AppLogo";

const SUGGESTED_CATEGORIES = [
  "地下アイドル",
  "VTuber",
  "キャバ嬢・ホスト",
  "英会話",
  "占い",
  "フィットネス",
  "カウンセリング",
];

export default function CreateCommunityScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const queryClient = useQueryClient();

  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  async function pickImage(kind: "banner" | "icon") {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          if (kind === "banner") setBannerUri(url);
          else setIconUri(url);
        }
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限が必要です", "画像を選択するにはメディアライブラリへのアクセスを許可してください");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.9,
      aspect: kind === "banner" ? [16, 9] : [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      if (kind === "banner") setBannerUri(result.assets[0].uri);
      else setIconUri(result.assets[0].uri);
    }
  }

  function toggleCategory(cat: string) {
    const trimmed = cat.trim();
    if (!trimmed) return;
    if (selectedCategories.includes(trimmed)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== trimmed));
    } else {
      setSelectedCategories([...selectedCategories, trimmed]);
    }
  }

  function addCategoryFromInput() {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
    }
    setCategoryInput("");
  }

  const canSubmit =
    name.trim().length > 0 &&
    description.trim().length >= 10 &&
    selectedCategories.length > 0;

  function openConsentModal() {
    if (!canSubmit || creating) return;
    setConsentAgreed(false);
    setShowConsentModal(true);
  }

  async function handleCreate() {
    if (!canSubmit || creating || !consentAgreed) return;
    setShowConsentModal(false);
    setCreating(true);

    try {
      const primaryCategory = selectedCategories[0];
      const bannerUrl =
        bannerUri ??
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop";
      const iconUrl =
        iconUri ??
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop";

      const res = await apiRequest("POST", "/api/communities", {
        name: name.trim(),
        description: description.trim(),
        bannerUrl,
        iconUrl,
        categories: selectedCategories,
        primaryCategory,
      });
      const newCommunity = await res.json();

      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });

      // Alert に依存せず即座に遷移（Web で Alert が表示されない場合の対策）
      if (newCommunity?.id != null) {
        router.replace(`/community/${newCommunity.id}`);
      } else {
        router.replace("/(tabs)/community");
      }
      Alert.alert("コミュニティを作成しました", "トップページや投稿画面から利用できます。");
    } catch (e: any) {
      const msg =
        e?.message && typeof e.message === "string"
          ? e.message
          : "コミュニティの作成に失敗しました。時間をおいて再度お試しください。";
      Alert.alert("エラー", msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <AppLogo width={120} />
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { flex: 1 }]}>コミュニティを作成</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* バナー画像 */}
        <View style={styles.section}>
          <Text style={styles.label}>トップバナー画像（任意）</Text>
          <Pressable style={styles.bannerPicker} onPress={() => pickImage("banner")}>
            {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={styles.bannerPreview} contentFit="cover" />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={C.accent} />
                <Text style={styles.bannerPlaceholderText}>タップして画像を選択</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* アイコン画像 */}
        <View style={styles.section}>
          <Text style={styles.label}>アイコン画像（任意）</Text>
          <Pressable style={styles.iconPicker} onPress={() => pickImage("icon")}>
            {iconUri ? (
              <Image source={{ uri: iconUri }} style={styles.iconPreview} contentFit="cover" />
            ) : (
              <View style={styles.iconPlaceholderInner}>
                <Ionicons name="person-circle-outline" size={32} color={C.accent} />
                <Text style={styles.iconPlaceholderText}>タップして画像を選択</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* コミュニティ名 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            コミュニティ名 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="例）地下アイドル応援コミュニティ"
            placeholderTextColor={C.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
          <Text style={styles.charCount}>{name.length}/40</Text>
        </View>

        {/* 説明文 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            コミュニティの説明 <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>10文字以上で入力してください</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="どんなメンバーが集まる場所か、活動内容やルールなどを具体的に記載してください。"
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={800}
          />
          <Text
            style={[
              styles.charCount,
              description.trim().length < 10 && description.length > 0 && { color: C.live },
            ]}
          >
            {description.length}/800（現在 {description.trim().length} 文字）
          </Text>
        </View>

        {/* カテゴリ選択 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            カテゴリ <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>複数選択・自由追加ができます</Text>

          <View style={styles.chipRow}>
            {SUGGESTED_CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.addCategoryRow}>
            <TextInput
              style={[styles.input, styles.categoryInput]}
              placeholder="新しいカテゴリを追加（例：バンド、ASMR など）"
              placeholderTextColor={C.textMuted}
              value={categoryInput}
              onChangeText={setCategoryInput}
              onSubmitEditing={addCategoryFromInput}
            />
            <Pressable
              style={[
                styles.addCategoryBtn,
                !categoryInput.trim() && styles.addCategoryBtnDisabled,
              ]}
              onPress={addCategoryFromInput}
              disabled={!categoryInput.trim()}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </Pressable>
          </View>

          {selectedCategories.length > 0 && (
            <View style={styles.selectedWrap}>
              <Text style={styles.selectedLabel}>選択中のカテゴリ</Text>
              <View style={styles.selectedChips}>
                {selectedCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={styles.selectedChip}
                    onPress={() => toggleCategory(cat)}
                  >
                    <Text style={styles.selectedChipText}>{cat}</Text>
                    <Ionicons name="close" size={14} color={C.textSec} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 同意確認モーダル */}
        <Modal visible={showConsentModal} transparent animationType="fade">
          <Pressable style={styles.consentModalOverlay} onPress={() => setShowConsentModal(false)}>
            <Pressable style={styles.consentModalBox} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.consentModalTitle}>コミュニティ作成にあたって</Text>
              <Text style={styles.consentModalIntro}>以下の内容に同意のうえ、作成してください。</Text>
              <View style={styles.consentBullets}>
                <Text style={styles.consentBullet}>・バナー広告収益の50%はRawStock運営費として徴収されます</Text>
                <Text style={styles.consentBullet}>・収益の10%はコミュニティイベント資金としてストックされます</Text>
                <Text style={styles.consentBullet}>・残り40%は管理人・モデレーターで分配（比率は管理人が設定）</Text>
                <Text style={styles.consentBullet}>・管理人はメンバーの50%が不信任票を投じると交代になります</Text>
                <Text style={styles.consentBullet}>・交代時はモデレーターの中から次の管理人を投票で決めます（モデレーター不在の場合は全メンバーから立候補）</Text>
                <Text style={styles.consentBullet}>・モデレーターは管理人が指名します</Text>
              </View>
              <Pressable
                style={styles.consentCheckRow}
                onPress={() => setConsentAgreed((a) => !a)}
              >
                <View style={[styles.consentCheckbox, consentAgreed && styles.consentCheckboxChecked]}>
                  {consentAgreed && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.consentCheckLabel}>上記に同意する</Text>
              </Pressable>
              <View style={styles.consentModalActions}>
                <Pressable style={styles.consentCancelBtn} onPress={() => setShowConsentModal(false)}>
                  <Text style={styles.consentCancelText}>キャンセル</Text>
                </Pressable>
                <Pressable
                  style={[styles.consentConfirmBtn, !consentAgreed && styles.consentConfirmBtnDisabled]}
                  disabled={!consentAgreed}
                  onPress={handleCreate}
                >
                  <Text style={styles.consentConfirmText}>同意して作成する</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* 作成ボタン */}
        <View style={[styles.submitSection, { paddingBottom: bottomInset + 24 }]}>
          <Pressable
            style={[styles.submitBtn, (!canSubmit || creating) && styles.submitBtnDisabled]}
            disabled={!canSubmit || creating}
            onPress={openConsentModal}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>
              {creating ? "作成中..." : "コミュニティを作成する"}
            </Text>
          </Pressable>
          {!canSubmit && (
            <Text style={styles.submitHint}>
              名前・カテゴリ・説明（10文字以上）を入力してください
            </Text>
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
    gap: 12,
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
    marginBottom: 6,
  },
  bannerPicker: {
    height: 170,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  bannerPreview: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bannerPlaceholderText: {
    color: C.textMuted,
    fontSize: 13,
  },
  iconPicker: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconPreview: {
    width: "100%",
    height: "100%",
  },
  iconPlaceholderInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconPlaceholderText: {
    color: C.textMuted,
    fontSize: 11,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    color: C.textMuted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: "rgba(41,182,207,0.12)",
    borderColor: C.accent,
  },
  chipText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: C.accent,
  },
  addCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  categoryInput: {
    flex: 1,
  },
  addCategoryBtn: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addCategoryBtnDisabled: {
    backgroundColor: C.surface3,
  },
  selectedWrap: {
    marginTop: 12,
    gap: 6,
  },
  selectedLabel: {
    color: C.textSec,
    fontSize: 12,
  },
  selectedChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
    backgroundColor: C.surface2,
  },
  selectedChipText: {
    color: C.text,
    fontSize: 12,
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
    borderRadius: 0,
    paddingVertical: 15,
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
    textAlign: "center",
  },

  consentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  consentModalBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: C.surface,
    borderRadius: 0,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  consentModalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  consentModalIntro: {
    color: C.textSec,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  consentBullets: { gap: 10, marginBottom: 20 },
  consentBullet: {
    color: C.textSec,
    fontSize: 13,
    lineHeight: 20,
  },
  consentCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  consentCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  consentCheckboxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  consentCheckLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  consentModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  consentCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  consentCancelText: { color: C.textSec, fontSize: 14, fontWeight: "700" },
  consentConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 0,
    backgroundColor: C.accent,
    alignItems: "center",
  },
  consentConfirmBtnDisabled: { backgroundColor: C.surface3, opacity: 0.8 },
  consentConfirmText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});

