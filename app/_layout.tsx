import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth";
import { getLoginReturn, saveLoginReturn } from "@/lib/login-return";
import { GlobalJukeboxPlayer } from "@/components/GlobalJukeboxPlayer";

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

    const run = async () => {
      try {
        await loginWithToken(webToken);
        if (cancelled) return;

        // 認証前にいたページへ戻る（保存されていれば）。なければマイページへ。
        const saved = getLoginReturn();
        const returnTo = saved ?? "/(tabs)/profile";

        // コンテキストへの反映完了を少し待ってから、履歴を置き換える形で遷移する
        setTimeout(() => {
          if (cancelled) return;
          router.replace(returnTo as any);
          setWebTokenProcessed(true);
        }, 100);
      } catch {
        if (cancelled) return;
        setWebTokenProcessed(true);
      }
    };

    run();

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
        .then(() => router.navigate("/(tabs)/profile"))
        .catch(() => {});
    }
  }, [line_token, loginWithToken]);

  return <>{children}</>;
}

function isPublicPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true; // /(tabs)/index
  if (pathname === "/auth/login") return true;
  if (pathname === "/community" || pathname.startsWith("/community/")) return true; // /(tabs)/community + 詳細
  if (pathname === "/live" || pathname.startsWith("/live")) return true; // /(tabs)/live + /live/[id]
  return false;
}

/** ルートレベルの認証ガード。指定のパス以外はすべてログイン必須にする。 */
function GlobalAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const hasLineTokenInUrl = useHasLineTokenInUrl();

  useEffect(() => {
    if (loading) return;
    if (hasLineTokenInUrl) return; // LINEコールバック処理中は何もしない
    if (!pathname) return;
    if (user) return;
    if (isPublicPath(pathname)) return;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const full = window.location.pathname + window.location.search;
      saveLoginReturn(full);
    }
    router.replace("/auth/login");
  }, [user, loading, pathname, hasLineTokenInUrl]);

  // 未ログインかつ保護ページの場合は何も描画しない（リダイレクト待ち）
  if (!user && !loading && !hasLineTokenInUrl && pathname && !isPublicPath(pathname)) {
    return null;
  }

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
                <GlobalAuthGate>
                  <View style={{ flex: 1 }}>
                    <RootLayoutNav />
                    <GlobalJukeboxPlayer />
                  </View>
                </GlobalAuthGate>
              </LineTokenHandler>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
