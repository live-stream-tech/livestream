import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { apiRequest } from "@/lib/query-client";
import { C } from "@/constants/colors";

export default function BannerSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ amountYen: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) {
      setLoading(false);
      return;
    }
    apiRequest("POST", "/api/banner/confirm-session", { sessionId: session_id })
      .then(async (res) => {
        const data = await res.json();
        setResult({ amountYen: data.amountYen });
      })
      .catch(() => setError("決済の確認に失敗しました"))
      .finally(() => setLoading(false));
  }, [session_id]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>決済を確認中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        <Ionicons name="alert-circle" size={60} color={C.live} />
        <Text style={styles.errorTitle}>確認エラー</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable style={styles.btn} onPress={() => router.replace("/community")}>
          <Text style={styles.btnText}>コミュニティへ戻る</Text>
        </Pressable>
      </View>
    );
  }

  const amountYen = result?.amountYen ?? 15_000;

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={styles.title}>決済が完了しました</Text>
      <Text style={styles.subtitle}>コミュニティ広告バナー（3日間）の出稿が確定しました</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>お支払い金額</Text>
        <Text style={styles.amount}>¥{amountYen.toLocaleString()}</Text>
        <Text style={styles.cardSub}>広告バナーは3日間表示されます</Text>
      </View>

      <Pressable style={styles.btn} onPress={() => router.replace("/community")}>
        <Ionicons name="people" size={16} color="#fff" />
        <Text style={styles.btnText}>コミュニティへ戻る</Text>
      </Pressable>
      <Pressable style={styles.subBtn} onPress={() => router.replace("/")}>
        <Text style={styles.subBtnText}>ホームへ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { color: C.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: C.textSec, fontSize: 14, textAlign: "center" },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 6,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  cardLabel: { color: C.textMuted, fontSize: 12 },
  amount: { color: C.accent, fontSize: 32, fontWeight: "800" },
  cardSub: { color: C.textSec, fontSize: 12, textAlign: "center" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  subBtn: { paddingVertical: 10 },
  subBtnText: { color: C.textMuted, fontSize: 13 },
  loadingText: { color: C.textSec, fontSize: 14, marginTop: 16 },
  errorTitle: { color: C.text, fontSize: 20, fontWeight: "800" },
  errorBody: { color: C.textSec, fontSize: 13, textAlign: "center" },
});
