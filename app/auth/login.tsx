import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { C } from "@/constants/colors";
import { AppLogo } from "@/components/AppLogo";
import { getApiUrl } from "@/lib/query-client";
import { saveLoginReturn } from "@/lib/login-return";

const LINE_ERROR_LABELS: Record<string, string> = {
  invalid_state: "認証の有効期限が切れました。もう一度お試しください。",
  token_failed: "トークン取得に失敗しました。",
  profile_failed: "プロフィール取得に失敗しました。",
  server_error: "サーバーエラーが発生しました。しばらくしてからお試しください。",
  me_failed: "ログインの確認に失敗しました。もう一度お試しください。",
};
const getErrorLabel = (key: string) => {
  if (LINE_ERROR_LABELS[key]) return LINE_ERROR_LABELS[key];
  if (key.startsWith("server_error:")) return `サーバーエラー: ${key.slice(13, 93)}`;
  return key.length > 50 ? "エラーが発生しました。" : `エラー: ${key}`;
};

/** LINEログインのみ。メール/パスワードは廃止。 */
export default function LoginScreen() {
  const { line_error } = useLocalSearchParams<{ line_error?: string }>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (line_error && Platform.OS === "web" && typeof window !== "undefined") {
      const msg = getErrorLabel(line_error);
      setErrorMsg(msg);
      const url = new URL(window.location.href);
      url.searchParams.delete("line_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [line_error]);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 12 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  // 同一タブでOAuth認証（ポップアップブロック問題を回避）
  function openAuthRedirect(path: string) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const returnTo = window.location.pathname + window.location.search;
      saveLoginReturn(returnTo);
      const apiBase = getApiUrl();
      const url = new URL(path, apiBase).toString();
      window.location.href = url;
    } else {
      router.replace("/(tabs)");
    }
  }

  function handleLineLogin() {
    openAuthRedirect("/api/auth/line");
  }

  function handleGoogleLogin() {
    openAuthRedirect("/api/auth/google");
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: topInset, paddingBottom: bottomInset + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoWrap}>
        <AppLogo height={36} />
        <Text style={styles.tagline}>生ライブレポ＆生配信LIVEをストック資産に</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ログイン</Text>
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        <Text style={styles.cardSub}>
          コメント・投げ銭・購入・投稿・プロフィール設定などを行うには、LINE または Google でログインしてください。
        </Text>

        <Pressable style={styles.lineLoginBtn} onPress={handleLineLogin}>
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" }}
            style={styles.lineIcon}
            contentFit="contain"
          />
          <Text style={styles.lineLoginText}>LINEでログイン</Text>
        </Pressable>

        <Pressable style={styles.googleLoginBtn} onPress={handleGoogleLogin}>
          <Image
            source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }}
            style={styles.googleIcon}
            contentFit="contain"
          />
          <Text style={styles.googleLoginText}>Googleでログイン</Text>
        </Pressable>
      </View>

      <Pressable style={styles.guestLink} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.guestLinkText}>ログインせずに閲覧する</Text>
      </Pressable>

      <View style={styles.legalLinks}>
        <Pressable onPress={() => router.push("/terms")}>
          <Text style={styles.legalLinkText}>利用規約</Text>
        </Pressable>
        <Text style={styles.legalSeparator}>|</Text>
        <Pressable onPress={() => router.push("/privacy")}>
          <Text style={styles.legalLinkText}>プライバシーポリシー</Text>
        </Pressable>
        <Text style={styles.legalSeparator}>|</Text>
        <Pressable onPress={() => router.push("/tokusho")}>
          <Text style={styles.legalLinkText}>特定商取引法に基づく表記</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center", backgroundColor: C.bg },
  logoWrap: { alignItems: "center", marginBottom: 16 },
  tagline: { color: C.textMuted, fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 4,
    padding: 28,
    borderWidth: 1,
    borderColor: C.accent,
    marginBottom: 20,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardTitle: { color: C.text, fontSize: 24, fontWeight: "800", marginBottom: 12, fontFamily: "Barlow Condensed" },
  errorBanner: { backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 4, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.4)" },
  errorText: { color: "#ef4444", fontSize: 13, fontFamily: "Courier Prime" },
  cardSub: { color: C.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 20, fontFamily: "Courier Prime" },

  lineLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.accent,
    borderRadius: 4,
    paddingVertical: 16,
  },
  lineIcon: { width: 24, height: 24 },
  lineLoginText: { color: "#050505", fontSize: 16, fontWeight: "800", fontFamily: "Barlow Condensed" },

  guestLink: { alignItems: "center", paddingVertical: 12 },
  guestLinkText: { color: C.textMuted, fontSize: 13, fontFamily: "Courier Prime" },

  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  legalLinkText: { color: C.accent, fontSize: 12, fontFamily: "Courier Prime" },
  legalSeparator: { color: C.textMuted, fontSize: 12 },

  googleLoginBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#050505",
    borderRadius: 4,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.accent,
  },
  googleIcon: { width: 20, height: 20 },
  googleLoginText: { color: C.text, fontSize: 15, fontWeight: "700", fontFamily: "Barlow Condensed" },
});
