import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getLoginReturn } from "@/lib/login-return";
import { C } from "@/constants/colors";

/**
 * 同一タブリダイレクト方式のOAuth認証コールバックページ。
 * サーバーが /auth/callback?token=xxx にリダイレクトしてくる。
 * tokenを受け取ってloginWithTokenを呼び、元のページへ遷移する。
 */
export default function AuthCallbackScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "web" || !token) {
      router.replace("/auth/login" as any);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await loginWithToken(token);
        if (cancelled) return;
        const saved = getLoginReturn();
        let returnTo = saved ?? "/(tabs)/profile";
        if (returnTo.startsWith("/auth/")) returnTo = "/(tabs)/profile";
        router.replace(returnTo as any);
      } catch {
        if (!cancelled) router.replace("/auth/login?line_error=me_failed" as any);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, loginWithToken]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator color={C.accent} size="large" />
      <Text
        style={{
          color: C.textMuted,
          fontSize: 13,
          fontFamily: "Courier Prime",
        }}
      >
        ログイン処理中...
      </Text>
    </View>
  );
}
