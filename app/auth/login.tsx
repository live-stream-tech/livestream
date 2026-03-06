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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("入力エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      Alert.alert("ログイン失敗", e.message ?? "エラーが発生しました");
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
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>
            <Text style={styles.logoLive}>Live</Text>
            <Text style={styles.logoStock}>Stock</Text>
          </Text>
          <Text style={styles.tagline}>ライブ配信プラットフォーム</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ログイン</Text>

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
              autoComplete="password"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={C.textMuted}
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginBtnText}>ログイン</Text>
              </>
            )}
          </Pressable>

          <View style={styles.demoBox}>
            <Text style={styles.demoLabel}>デモアカウント</Text>
            <Pressable
              onPress={() => {
                setEmail("demo@livestage.jp");
                setPassword("password");
              }}
            >
              <Text style={styles.demoFill}>demo@livestage.jp / password を入力</Text>
            </Pressable>
            <Pressable
              style={styles.demoLoginBtn}
              onPress={async () => {
                if (loading) return;
                setLoading(true);
                try {
                  await login("demo@livestage.jp", "password");
                  router.replace("/(tabs)/profile");
                } catch (e: any) {
                  Alert.alert("ログイン失敗", e.message ?? "デモアカウントにログインできませんでした");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Ionicons name="play-circle-outline" size={16} color={C.accent} />
              <Text style={styles.demoLoginText}>デモとしてすぐにログイン</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>アカウントをお持ちでない方は</Text>
          <Pressable onPress={() => router.push("/auth/register")}>
            <Text style={styles.registerLink}>新規登録</Text>
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
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 13,
  },

  loginBtn: {
    marginTop: 28,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  demoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: C.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  demoLabel: { color: C.textMuted, fontSize: 11, fontWeight: "600" },
  demoFill: { color: C.accent, fontSize: 12, fontWeight: "600" },
  demoLoginBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  demoLoginText: { color: C.accent, fontSize: 12, fontWeight: "700" },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  registerText: { color: C.textMuted, fontSize: 13 },
  registerLink: { color: C.accent, fontSize: 13, fontWeight: "700" },
});
