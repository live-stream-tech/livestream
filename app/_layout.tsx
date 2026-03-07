import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
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

function LineTokenHandler() {
  const { line_token } = useLocalSearchParams<{ line_token?: string }>();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const webToken = params.get("line_token");
      if (webToken) {
        loginWithToken(webToken)
          .then(() => {
            const url = new URL(window.location.href);
            url.searchParams.delete("line_token");
            window.history.replaceState({}, "", url.toString());
            router.replace("/(tabs)/profile");
          })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && line_token) {
      loginWithToken(line_token as string)
        .then(() => router.replace("/(tabs)/profile"))
        .catch(() => {});
    }
  }, [line_token]);

  return null;
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
              <LineTokenHandler />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
