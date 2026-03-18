import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getLoginReturn } from "@/lib/login-return";
import { C } from "@/constants/colors";

/**
 * 同一タブリダイレクト方式のOAuth認証コールバックページ。
 * サーバーが /auth/callback?token=xxx にリダイレクトしてくる。
 * Expo RouterのuseLocalSearchParamsは初回レンダリング時にundefinedになることがあるため、
 * window.location.searchから直接tokenを取得する。
 */
export default function AuthCallbackScreen() {
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      router.replace("/auth/login" as any);
      return;
    }

    // URLSearchParamsから直接tokenを取得（Expo Routerの遅延を回避）
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.replace("/auth/login?line_error=me_failed" as any);
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
      } catch (e) {
        console.error("[auth/callback] loginWithToken failed:", e);
        if (!cancelled) {
          setStatus("error");
          setTimeout(() => {
            router.replace("/auth/login?line_error=me_failed" as any);
          }, 1500);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loginWithToken]);

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
          color: status === "error" ? "#ef4444" : C.textMuted,
          fontSize: 13,
          fontFamily: "Courier Prime",
        }}
      >
        {status === "error" ? "ログインに失敗しました。再度お試しください..." : "ログイン処理中..."}
      </Text>
    </View>
  );
}
