import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { getApiUrl } from "@/lib/query-client";
import { saveLoginReturn } from "@/lib/login-return";
import { router } from "expo-router";

/** 認証はLINEログインのみ。メール/パスワードは廃止。 */
export type User = {
  id: number;
  name: string;
  displayName?: string;
  bio: string;
  avatar: string | null;
  profileImageUrl?: string | null;
  role?: string;
  phoneNumber?: string | null;
  phoneVerifiedAt?: string | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "bio" | "avatar">>) => Promise<void>;
  /** 未ログイン時にLINEログインへ誘導する。戻り値はログイン済みなら true */
  requireAuth: (actionLabel?: string, options?: { requirePhone?: boolean }) => boolean;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  loginWithToken: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  requireAuth: () => false,
});

const TOKEN_KEY = "auth_token";

async function apiFetch(path: string, options?: RequestInit) {
  const base = getApiUrl();
  const url = new URL(path, base).toString();
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "エラーが発生しました");
  return data;
}

function normalizeMe(me: Record<string, unknown>): User {
  return {
    id: me.id as number,
    name: (me.name ?? me.displayName ?? "ユーザー") as string,
    displayName: (me.displayName ?? me.name) as string | undefined,
    bio: (me.bio ?? "") as string,
    avatar: (me.avatar ?? me.profileImageUrl ?? null) as string | null,
    profileImageUrl: (me.profileImageUrl ?? me.avatar) as string | null | undefined,
    role: me.role as string | undefined,
    phoneNumber: (me.phoneNumber ?? null) as string | null,
    phoneVerifiedAt: (me.phoneVerifiedAt ?? null) as string | null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(async (t) => {
      if (t) {
        try {
          const me = await apiFetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${t}` },
          });
          setToken(t);
          setUser(normalizeMe(me));
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    });
  }, []);

  const loginWithToken = useCallback(async (t: string) => {
    const me = await apiFetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    });
    await AsyncStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(normalizeMe(me));
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    // ログアウト後は常にログイン画面へ戻す
    router.replace("/auth/login");
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<User, "name" | "bio" | "avatar">>) => {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    const payload: Record<string, string | null> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.avatar !== undefined) payload.avatar = data.avatar;
    const updated = await apiFetch("/api/auth/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${t}` },
      body: JSON.stringify(payload),
    });
    setUser(normalizeMe(updated));
  }, []);

  const requireAuth = useCallback(
    (actionLabel?: string, options?: { requirePhone?: boolean }): boolean => {
      // まだログインしていない場合は、LINEログインへ誘導
      if (!user) {
        if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("line_token")) {
          // LINEコールバック処理中はリダイレクトしない（無限ループ防止）
          return false;
        }
        if (typeof window !== "undefined") {
          const returnTo = window.location.pathname + window.location.search;
          saveLoginReturn(returnTo);
        }
        router.replace("/auth/login");
        return false;
      }

      // 電話番号認証まで必須なアクションの場合
      if (options?.requirePhone) {
        const isVerified = !!user.phoneNumber && !!user.phoneVerifiedAt;
        if (!isVerified) {
          const label = actionLabel ?? "この操作";
          Alert.alert(
            "電話番号の確認が必要です",
            `${label}を行うには、電話番号の認証が必要です。マイページから電話番号を登録・認証してください。`,
            [
              {
                text: "マイページへ",
                onPress: () => router.replace("/(tabs)/profile"),
              },
              { text: "キャンセル", style: "cancel" },
            ]
          );
          return false;
        }
      }

      return true;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout, updateProfile, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** URL に line_token があるか（LINEコールバック処理中はログインへ飛ばさない） */
function hasLineTokenInUrl(): boolean {
  if (typeof window === "undefined") return false;
  return !!new URLSearchParams(window.location.search).get("line_token");
}

/** ログイン必須画面で未ログインならLINEログインへリダイレクトするガード */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (hasLineTokenInUrl()) return; // コールバック処理中はリダイレクトしない
    if (!user) {
      if (typeof window !== "undefined") {
        const returnTo = window.location.pathname + window.location.search;
        saveLoginReturn(returnTo);
      }
      router.replace("/auth/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return null;
  }
  return <>{children}</>;
}
