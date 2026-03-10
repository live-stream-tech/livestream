import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AuthGuard, useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";

export default function AccountEditScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? user?.profileImageUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("エラー", "氏名（表示名）を入力してください");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || null,
      });
      Alert.alert("保存しました", "登録情報を更新しました", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("保存に失敗しました", e?.message ?? "時間をおいて再度お試しください");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>登録情報の編集</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>基本情報</Text>

          <Text style={styles.label}>氏名（表示名）</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="表示名を入力"
              placeholderTextColor={C.textMuted}
              maxLength={30}
            />
          </View>

          <Text style={styles.label}>自己紹介</Text>
          <View style={[styles.inputRow, styles.inputRowMultiline]}>
            <Ionicons name="text-outline" size={18} color={C.textMuted} style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="自己紹介を入力"
              placeholderTextColor={C.textMuted}
              multiline
              maxLength={200}
            />
          </View>

          <Text style={styles.label}>アイコン画像URL（任意）</Text>
          <View style={styles.inputRow}>
            <Ionicons name="image-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="https://..."
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarPreview} contentFit="cover" />
          ) : null}

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.saveText}>保存する</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </AuthGuard>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  label: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  inputRowMultiline: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    paddingVertical: 2,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  avatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: 12,
    borderWidth: 2,
    borderColor: C.accent,
    alignSelf: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});

