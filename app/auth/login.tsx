import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { C } from "@/constants/colors";
import { apiRequest, ApiError, getApiUrl } from "@/lib/query-client";
import { saveLoginReturn, getLoginReturn } from "@/lib/login-return";
import { useAuth } from "@/lib/auth";
import { TopStageBackground } from "@/components/TopStageBackground";

/** LINEログインのみ。メール/パスワードは廃止。 */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 12 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { loginWithToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"line" | "phone">("line");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  function handleLineLogin() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // 他の場所でまだ保存されていない場合のみ、現在のURLを戻り先として保存する
      const returnTo = window.location.pathname + window.location.search;
      saveLoginReturn(returnTo);
      // 本番ではAPIサーバー（EXPO_PUBLIC_DOMAIN または同一オリジン）の /api/auth/line へ遷移する
      const apiBase = getApiUrl();
      window.location.href = new URL("/api/auth/line", apiBase).toString();
    } else {
      // ネイティブでは WebView や LINE SDK で /api/auth/line を開く
      router.replace("/(tabs)");
    }
  }

  function normalizePhone(input: string): string {
    const trimmed = input.trim().replace(/[\s-]/g, "");
    if (!trimmed) return "";
    if (trimmed.startsWith("+")) return trimmed;
    // 日本 (+81) 前提で単純に補完
    if (trimmed.startsWith("0")) {
      return "+81" + trimmed.slice(1);
    }
    return "+81" + trimmed;
  }

  async function handleSendCode() {
    if (sendingCode) return;
    const normalized = normalizePhone(phone);
    if (!normalized) {
      Alert.alert("電話番号を入力してください");
      return;
    }
    setSendingCode(true);
    try {
      const res = await apiRequest("POST", "/api/auth/phone/login/start", {
        phoneNumber: normalized,
      });
      const data = (await res.json()) as { ok: boolean; code?: string };
      setPhone(normalized);
      setCodeSent(true);
      if (data.code) {
        Alert.alert(
          "認証コードを送信しました",
          `SMSで届いた6桁のコードを入力してください。\n\n（開発中につきテスト用コード: ${data.code}）`,
        );
      } else {
        Alert.alert("認証コードを送信しました", "SMSで届いた6桁のコードを入力してください。");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          Alert.alert(
            "アカウントが見つかりません",
            "この電話番号に紐づくアカウントがありません。先にLINEログインでアカウントを作成してください。"
          );
        } else if (err.status === 400) {
          Alert.alert("電話番号エラー", "電話番号の形式を確認してください。");
        } else {
          Alert.alert("エラー", "認証コードの送信に失敗しました。時間をおいて再度お試しください。");
        }
      } else {
        Alert.alert("エラー", "認証コードの送信に失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setSendingCode(false);
    }
  }

  async function handlePhoneLogin() {
    if (verifying) return;
    const normalized = normalizePhone(phone);
    if (!normalized || code.trim().length === 0) {
      Alert.alert("電話番号と認証コードを入力してください");
      return;
    }
    setVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/phone/login/verify", {
        phoneNumber: normalized,
        code: code.trim(),
      });
      const data = (await res.json()) as { token: string };
      await loginWithToken(data.token);

      // 戻り先URLが保存されていればそこへ、なければマイページへ
      let target: string = "/(tabs)/profile";
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const saved = getLoginReturn();
        if (saved) target = saved;
      }
      router.replace(target as any);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          Alert.alert("認証に失敗しました", "コードが正しくないか、有効期限が切れています。");
        } else if (err.status === 404) {
          Alert.alert("アカウントが見つかりません", "この電話番号に紐づくアカウントがありません。");
        } else {
          Alert.alert("エラー", "ログインに失敗しました。時間をおいて再度お試しください。");
        }
      } else {
        Alert.alert("エラー", "ログインに失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setVerifying(false);
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
      <TopStageBackground height={56} />

      <View style={styles.logoWrap}>
        <Text style={styles.logo}>
          <Text style={styles.logoLive}>Live</Text>
          <Text style={styles.logoStage}>Stage</Text>
        </Text>
        <Text style={styles.tagline}>ライブ配信プラットフォーム</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabItem, activeTab === "line" && styles.tabItemActive]}
            onPress={() => setActiveTab("line")}
          >
            <Text style={[styles.tabText, activeTab === "line" && styles.tabTextActive]}>LINEログイン</Text>
          </Pressable>
          <Pressable
            style={[styles.tabItem, activeTab === "phone" && styles.tabItemActive]}
            onPress={() => setActiveTab("phone")}
          >
            <Text style={[styles.tabText, activeTab === "phone" && styles.tabTextActive]}>電話番号ログイン</Text>
          </Pressable>
        </View>

        {activeTab === "line" ? (
          <>
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
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>電話番号でログイン</Text>
            <Text style={styles.cardSub}>
              事前にLINEログイン後、マイページで電話番号を登録したアカウントのみ利用できます。
            </Text>

            <Text style={styles.fieldLabel}>電話番号（日本国内は 0 からでOK）</Text>
            <TextInput
              style={styles.input}
              placeholder="例: 09012345678"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Pressable
              style={[styles.primaryBtn, (!phone.trim() || sendingCode) && styles.primaryBtnDisabled]}
              onPress={handleSendCode}
              disabled={!phone.trim() || sendingCode}
            >
              {sendingCode ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>認証コードを送信</Text>
              )}
            </Pressable>

            {codeSent && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>認証コード（6桁）</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={C.textMuted}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                  maxLength={6}
                />
                <Pressable
                  style={[styles.primaryBtn, (code.trim().length === 0 || verifying) && styles.primaryBtnDisabled]}
                  onPress={handlePhoneLogin}
                  disabled={code.trim().length === 0 || verifying}
                >
                  {verifying ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>ログイン</Text>
                  )}
                </Pressable>
              </>
            )}
          </>
        )}
      </View>

      <Pressable style={styles.guestLink} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.guestLinkText}>ログインせずに閲覧する</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center", backgroundColor: C.bg },
  logoWrap: { alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 26, fontWeight: "800" },
  logoLive: { color: C.text },
  logoStage: { color: C.accent },
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

  tabRow: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: C.surface2,
    padding: 2,
    marginBottom: 18,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabItemActive: {
    backgroundColor: C.accent,
  },
  tabText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  fieldLabel: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    color: C.text,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: C.surface,
  },
  primaryBtn: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: C.accent,
  },
  primaryBtnDisabled: {
    backgroundColor: C.surface3,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
