import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

export type User = {
  id: number;
  email: string;
  name: string;
  bio: string;
  avatar: string | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "bio" | "avatar">>) => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  loginWithToken: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
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
          setUser(me);
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const loginWithToken = useCallback(async (t: string) => {
    const me = await apiFetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    });
    await AsyncStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<User, "name" | "bio" | "avatar">>) => {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    const updated = await apiFetch("/api/auth/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${t}` },
      body: JSON.stringify(data),
    });
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
