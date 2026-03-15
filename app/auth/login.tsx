import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { C } from "@/constants/colors";
import { AppLogo } from "@/components/AppLogo";
import { getApiUrl } from "@/lib/query-client";
import { saveLoginReturn } from "@/lib/login-return";

/** LINEログインのみ。メール/パスワードは廃止。 */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 12 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  // トップウィンドウで遷移（iframe内なら脱出して親を置換、タブ増加を防ぐ）
  function handleLineLogin() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const returnTo = window.location.pathname + window.location.search;
      saveLoginReturn(returnTo);
      const apiBase = getApiUrl();
      const url = new URL("/api/auth/line", apiBase).toString();
      try {
        (window.top || window).location.replace(url);
      } catch {
        window.location.replace(url);
      }
    } else {
      router.replace("/(tabs)");
    }
  }

  function handleGoogleLogin() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const returnTo = window.location.pathname + window.location.search;
      saveLoginReturn(returnTo);
      const apiBase = getApiUrl();
      const url = new URL("/api/auth/google", apiBase).toString();
      try {
        (window.top || window).location.replace(url);
      } catch {
        window.location.replace(url);
      }
    } else {
      router.replace("/(tabs)");
    }
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
        <AppLogo width={200} />
        <Text style={styles.tagline}>生ライブレポ＆生配信LIVEをストック資産に</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ログイン</Text>
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
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  cardTitle: { color: C.text, fontSize: 22, fontWeight: "800", marginBottom: 12 },
  cardSub: { color: C.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 20 },

  lineLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#06C755",
    borderRadius: 14,
    paddingVertical: 16,
  },
  lineIcon: { width: 24, height: 24 },
  lineLoginText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  guestLink: { alignItems: "center", paddingVertical: 12 },
  guestLinkText: { color: C.textMuted, fontSize: 13 },

  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  legalLinkText: { color: C.accent, fontSize: 12 },
  legalSeparator: { color: C.textMuted, fontSize: 12 },

  googleLoginBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  googleIcon: { width: 20, height: 20 },
  googleLoginText: { color: "#202124", fontSize: 15, fontWeight: "700" },
});
