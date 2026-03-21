import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DemoModeProvider } from "@/lib/demo-mode";
import { AuthProvider, useAuth } from "@/lib/auth";
import { getLoginReturn, saveLoginReturn } from "@/lib/login-return";
import { GlobalJukeboxPlayer } from "@/components/GlobalJukeboxPlayer";
import { GlobalMyListPlayer } from "@/components/GlobalMyListPlayer";
import { PlayingVideoProvider } from "@/lib/playing-video-context";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === "web" && typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

/** URL に line_token / auth/callback?token / ?token があるか（web のみ）。初回から正しく検知してフラッシュを防ぐ */
function useHasLineTokenInUrl(): boolean {
  const [hasToken] = useState(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return false;
    // 旧方式: /?line_token=xxx
    if (new URLSearchParams(window.location.search).get("line_token")) return true;
    // 旧方式2: /auth/callback?token=xxx
    if (window.location.pathname === "/auth/callback" && new URLSearchParams(window.location.search).get("token")) return true;
    // 新方式: /?token=xxx（iOS Safari PWA対応）
    if (window.location.pathname === "/" && new URLSearchParams(window.location.search).get("token")) return true;
    return false;
  });
  return hasToken;
}

/**
 * 認証トークンハンドラ。
 * - /?token=xxx（iOS Safari PWA対応）: ルートで直接トークン処理
 * - ネイティブ: line_token パラメータを処理
 */
function LineTokenHandler({ children }: { children: React.ReactNode }) {
  const { line_token } = useLocalSearchParams<{ line_token?: string }>();
  const { loginWithToken } = useAuth();

  // Web: /?token=xxx パターン（iOS Safari PWA対応）
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token || window.location.pathname !== "/") return;
    // URLからtokenを除去してからログイン処理
    const newUrl = window.location.pathname;
    window.history.replaceState({}, "", newUrl);
    loginWithToken(token)
      .then(() => router.replace("/(tabs)/profile"))
      .catch(() => router.replace("/auth/login?line_error=me_failed"));
  }, [loginWithToken]);

  // ネイティブ: line_token パラメータを処理（ネイティブアプリ用）
  useEffect(() => {
    if (Platform.OS !== "web" && line_token) {
      loginWithToken(line_token as string)
        .then(() => router.navigate("/(tabs)/profile"))
        .catch(() => {});
    }
  }, [line_token, loginWithToken]);

  return <>{children}</>;
}

/** PWA スタンドアロン（ホーム画面から起動）かどうかを判定 */
function isPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if ((navigator as any).standalone === true) return true;
  } catch {}
  return false;
}

function isPublicPath(pathname: string): boolean {
  if (!pathname) return false;
  // PWA スタンドアロン起動時はホームも認証必須にする（ただしtokenパラメータがある場合は公開）
  if (pathname === "/") {
    if (!isPwaStandalone()) return true; // ブラウザは公開
    if (Platform.OS === "web" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("token")) return true; // トークン処理中は公開
  }
  if (pathname === "/auth/login") return true;
  if (pathname === "/auth/callback") return true; // OAuthリダイレクトコールバック
  if (pathname === "/community" || pathname.startsWith("/community/")) return true; // /(tabs)/community + 詳細 + members
  if (pathname === "/live" || pathname.startsWith("/live")) return true; // /(tabs)/live + /live/[id]
  if (pathname === "/livers" || pathname.startsWith("/livers/")) return true; // ライバー一覧・詳細（他ユーザーページ）
  if (pathname.startsWith("/video/")) return true; // 動画詳細
  if (pathname === "/jukebox" || pathname.startsWith("/jukebox/")) return true; // ジュークボックス（閲覧はゲストOK、リクエスト・会話はログイン必須）
  if (pathname.startsWith("/user/")) return true; // 他ユーザープロフィール
  if (pathname === "/terms") return true;
  if (pathname === "/privacy") return true;
  if (pathname === "/tokusho") return true;
  if (pathname === "/lp" || pathname === "/rawstock-lp") return true;
  return false;
}

/** 初回ログイン時は設定（登録情報編集）を必須にする */
const PROFILE_SETUP_REQUIRED_NAMES = ["LINEユーザー", "Googleユーザー", "ユーザー"];
function needsProfileSetup(displayName: string | undefined): boolean {
  const name = (displayName ?? "").trim();
  return !name || PROFILE_SETUP_REQUIRED_NAMES.includes(name);
}

function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;
    if (pathname === "/account" || pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/callback") return;
    if (isPublicPath(pathname)) return;
    if (needsProfileSetup(user.displayName ?? user.name)) {
      router.replace("/account");
    }
  }, [user, loading, pathname]);

  return <>{children}</>;
}

/** ルートレベルの認証ガード。指定のパス以外はすべてログイン必須にする。 */
function GlobalAuthGate({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const pathname = usePathname();
  const hasLineTokenInUrl = useHasLineTokenInUrl();
  // ログイン済み判定: userがあるか、ネットワークエラー時に tokenだけ復元された場合も含む
  const isLoggedIn = !!user || !!token;

  useEffect(() => {
    if (loading) return;
    if (hasLineTokenInUrl) return; // LINEコールバック処理中は何もしない
    if (!pathname) return;
    // PWAスタンドアロン起動時にログイン済み（user または token があれば）なら/profileへ
    if ((user || token) && pathname === "/" && isPwaStandalone()) {
      router.replace("/profile");
      return;
    }
    if (isLoggedIn) return;
    if (isPublicPath(pathname)) return;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const full = window.location.pathname + window.location.search;
      saveLoginReturn(full);
    }
    router.replace("/auth/login");
  }, [user, token, loading, pathname, hasLineTokenInUrl, isLoggedIn]);

  // 未ログインかつ保護ページの場合は何も描画しない（リダイレクト待ち）
  if (!isLoggedIn && !loading && !hasLineTokenInUrl && pathname && !isPublicPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="community/members/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="livers" options={{ headerShown: false }} />
      <Stack.Screen name="livers/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="community/ad-apply" options={{ headerShown: false }} />
      <Stack.Screen name="community/ad-review" options={{ headerShown: false }} />
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
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="tokusho" options={{ headerShown: false }} />
      <Stack.Screen name="lp" options={{ headerShown: false }} />
      <Stack.Screen name="rawstock-lp" options={{ headerShown: false }} />
      <Stack.Screen name="community/genre-ad-apply" options={{ headerShown: false }} />
      <Stack.Screen name="admin/reports" options={{ headerShown: false }} />
      <Stack.Screen name="concert/create" options={{ headerShown: false }} />
      <Stack.Screen name="concert/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="concert/staff-request" options={{ headerShown: false }} />
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
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#070F18" }}>
            <View style={{ flex: 1 }}>
            <KeyboardProvider>
              <LineTokenHandler>
                <GlobalAuthGate>
                  <ProfileSetupGuard>
                  <DemoModeProvider>
                    <PlayingVideoProvider>
                      <View style={{ flex: 1 }}>
                        <RootLayoutNav />
                        <GlobalJukeboxPlayer />
                        <GlobalMyListPlayer />
                      </View>
                    </PlayingVideoProvider>
                  </DemoModeProvider>
                  </ProfileSetupGuard>
                </GlobalAuthGate>
              </LineTokenHandler>
            </KeyboardProvider>
            </View>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
