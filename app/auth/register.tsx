import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("入力エラー", "すべての項目を入力してください");
      return;
    }
    if (password.length < 6) {
      Alert.alert("入力エラー", "パスワードは6文字以上で設定してください");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("入力エラー", "パスワードが一致しません");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      Alert.alert("登録失敗", e.message ?? "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>
            <Text style={styles.logoLive}>Live</Text>
            <Text style={styles.logoStock}>Stock</Text>
          </Text>
          <Text style={styles.tagline}>アカウントを作成して始めよう</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>新規登録</Text>

          <Text style={styles.label}>ユーザー名</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="表示名を入力"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              maxLength={30}
            />
          </View>

          <Text style={styles.label}>メールアドレス</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={C.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <Text style={styles.label}>パスワード</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="6文字以上"
              placeholderTextColor={C.textMuted}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={C.textMuted}
              />
            </Pressable>
          </View>

          <Text style={styles.label}>パスワード（確認）</Text>
          <View style={[styles.inputWrap, passwordConfirm && password !== passwordConfirm && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="もう一度入力"
              placeholderTextColor={C.textMuted}
              secureTextEntry={!showPassword}
            />
            {passwordConfirm && password === passwordConfirm && (
              <Ionicons name="checkmark-circle" size={18} color={C.green} />
            )}
          </View>
          {passwordConfirm && password !== passwordConfirm && (
            <Text style={styles.errorText}>パスワードが一致しません</Text>
          )}

          <Pressable
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.registerBtnText}>登録する</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>すでにアカウントをお持ちの方は</Text>
          <Pressable onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginLink}>ログイン</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, flexGrow: 1, justifyContent: "center" },
  logoWrap: { alignItems: "center", marginBottom: 36 },
  logo: { fontSize: 38, fontWeight: "800" },
  logoLive: { color: C.text },
  logoStock: { color: C.accent },
  tagline: { color: C.textMuted, fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  cardTitle: { color: C.text, fontSize: 22, fontWeight: "800", marginBottom: 24 },

  label: { color: C.textSec, fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputError: { borderColor: C.live },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 13,
  },
  errorText: { color: C.live, fontSize: 11, marginTop: 4 },

  registerBtn: {
    marginTop: 28,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loginText: { color: C.textMuted, fontSize: 13 },
  loginLink: { color: C.accent, fontSize: 13, fontWeight: "700" },
});
