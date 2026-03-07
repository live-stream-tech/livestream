import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { C } from "@/constants/colors";

/** LINEログインのみ。メール/パスワードは廃止。 */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  function handleLineLogin() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = "/api/auth/line";
    } else {
      // ネイティブでは WebView や LINE SDK で /api/auth/line を開く
      router.replace("/(tabs)");
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: topInset + 40, paddingBottom: bottomInset + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStock}>Stock</Text>
        </Text>
        <Text style={styles.tagline}>ライブ配信プラットフォーム</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ログイン</Text>
        <Text style={styles.cardSub}>
          コメント・投げ銭・購入・投稿・プロフィール設定などを行うには、LINEでログインしてください。
        </Text>

        <Pressable style={styles.lineLoginBtn} onPress={handleLineLogin}>
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" }}
            style={styles.lineIcon}
            contentFit="contain"
          />
          <Text style={styles.lineLoginText}>LINEでログイン</Text>
        </Pressable>
      </View>

      <Pressable style={styles.guestLink} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.guestLinkText}>ログインせずに閲覧する</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center", backgroundColor: C.bg },
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
});
