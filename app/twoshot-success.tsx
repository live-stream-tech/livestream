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

export default function TwoshotSuccessScreen() {
  const { session_id, stream } = useLocalSearchParams<{ session_id: string; stream: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) { setLoading(false); return; }
    apiRequest("POST", "/api/twoshot/confirm-payment", { sessionId: session_id })
      .then((res) => { setBooking(res.booking); })
      .catch(() => setError("支払い確認に失敗しました"))
      .finally(() => setLoading(false));
  }, [session_id]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>支払いを確認中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        <Ionicons name="alert-circle" size={60} color={C.live} />
        <Text style={styles.errorTitle}>確認エラー</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>ホームへ戻る</Text>
        </Pressable>
      </View>
    );
  }

  const queuePos = booking?.queuePosition ?? "—";

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={styles.title}>予約完了！</Text>
      <Text style={styles.subtitle}>個別セッションの予約が確定しました</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>整理番号</Text>
        <Text style={styles.queueNum}>{queuePos}番</Text>
        <Text style={styles.cardSub}>順番が来たらライブ画面に通知が届きます</Text>
      </View>

      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={16} color={C.accent} />
        <Text style={styles.noteText}>
          個別セッション中は画面に透かし（ウォーターマーク）が表示されます。スクリーンショット・録画は禁止です。
        </Text>
      </View>

      <Pressable
        style={styles.btn}
        onPress={() => stream ? router.replace(`/live/${stream}`) : router.replace("/")}
      >
        <Ionicons name="radio" size={16} color="#fff" />
        <Text style={styles.btnText}>ライブへ戻る</Text>
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
  queueNum: { color: C.accent, fontSize: 52, fontWeight: "800", lineHeight: 60 },
  cardSub: { color: C.textSec, fontSize: 12, textAlign: "center" },
  noteBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(41,182,207,0.08)",
    borderRadius: 10,
    padding: 12,
    alignItems: "flex-start",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(41,182,207,0.2)",
  },
  noteText: { flex: 1, color: C.textSec, fontSize: 12, lineHeight: 18 },
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
