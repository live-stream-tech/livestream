import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === "web" && typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

/** URL に line_token があるか（web のみ）。初回から正しく検知してフラッシュを防ぐ */
function useHasLineTokenInUrl(): boolean {
  const [hasToken] = useState(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return false;
    return !!new URLSearchParams(window.location.search).get("line_token");
  });
  return hasToken;
}

/**
 * LINE コールバックで戻ったとき、line_token を最優先で処理する。
 * 処理が終わるまでメインUIを出さずローディングを表示し、認証ガードによるログインリダイレクトの無限ループを防ぐ。
 */
function LineTokenHandler({ children }: { children: React.ReactNode }) {
  const { line_token } = useLocalSearchParams<{ line_token?: string }>();
  const { loginWithToken } = useAuth();
  const hasLineTokenInUrl = useHasLineTokenInUrl();
  const [webTokenProcessed, setWebTokenProcessed] = useState(false);

  // Web: URL の line_token を処理（メインUIより先に実行）
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const webToken = params.get("line_token");
    const lineError = params.get("line_error");
    if (lineError) {
      const url = new URL(window.location.href);
      url.searchParams.delete("line_error");
      window.history.replaceState({}, "", url.toString());
      router.replace("/auth/login");
      return;
    }
    if (!webToken) {
      setWebTokenProcessed(true);
      return;
    }
    let cancelled = false;
    loginWithToken(webToken)
      .then(() => {
        if (cancelled) return;
        const url = new URL(window.location.href);
        url.searchParams.delete("line_token");
        window.history.replaceState({}, "", url.toString());
        // 認証前にいたページへ戻る（保存されていれば）
        let returnTo = "/(tabs)/profile";
        try {
          const saved = typeof window !== "undefined" ? sessionStorage.getItem("line_login_return") : null;
          if (saved && saved.startsWith("/") && !saved.startsWith("//")) {
            returnTo = saved;
            sessionStorage.removeItem("line_login_return");
          }
        } catch {}
        // 状態更新がコンテキストに反映されてから遷移する（反映前に profile が user=null で描画されるのを防ぐ）
        setTimeout(() => {
          if (!cancelled) router.replace(returnTo as any);
        }, 100);
      })
      .catch(() => {
        if (cancelled) return;
        const url = new URL(window.location.href);
        url.searchParams.delete("line_token");
        window.history.replaceState({}, "", url.toString());
      })
      .finally(() => {
        if (!cancelled) setWebTokenProcessed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loginWithToken]);

  // Web: line_token が URL にあるあいだはローディング表示（認証ガードでログインに飛ばされないようにする）
  if (Platform.OS === "web" && hasLineTokenInUrl && !webTokenProcessed) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
        <ActivityIndicator size="large" color="#06C755" />
      </View>
    );
  }

  // ネイティブ: line_token パラメータを処理
  useEffect(() => {
    if (Platform.OS !== "web" && line_token) {
      loginWithToken(line_token as string)
        .then(() => router.replace("/(tabs)/profile"))
        .catch(() => {});
    }
  }, [line_token, loginWithToken]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="video/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="jukebox/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="live/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="dm/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="twoshot-booking/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="twoshot-success" options={{ headerShown: false }} />
      <Stack.Screen name="success" options={{ headerShown: false }} />
      <Stack.Screen name="revenue" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="payout-settings" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LineTokenHandler>
                <RootLayoutNav />
              </LineTokenHandler>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
