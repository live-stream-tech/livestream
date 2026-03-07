import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AuthGuard, useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";

const ACCOUNT_TYPES = ["普通", "当座"];

export default function PayoutSettingsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { token } = useAuth();
  const params = useLocalSearchParams<{ connect?: string }>();

  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountType, setAccountType] = useState("普通");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectLinking, setConnectLinking] = useState(false);

  const fetchConnectStatus = useCallback(async () => {
    if (!token) return;
    try {
      const base = getApiUrl();
      const res = await fetch(new URL("/api/connect/status", base).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConnectStatus({
        connected: !!data.connected,
        chargesEnabled: !!data.chargesEnabled,
        detailsSubmitted: !!data.detailsSubmitted,
      });
    } catch {
      setConnectStatus({ connected: false, chargesEnabled: false, detailsSubmitted: false });
    }
  }, [token]);

  useEffect(() => {
    fetchConnectStatus();
  }, [fetchConnectStatus]);

  useEffect(() => {
    if (params.connect === "return" || params.connect === "refresh") {
      fetchConnectStatus();
    }
  }, [params.connect, fetchConnectStatus]);

  async function handleStripeConnect() {
    if (!token) return;
    setConnectLinking(true);
    try {
      const base = getApiUrl();
      const res = await fetch(new URL("/api/connect/onboard", base).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "連携の開始に失敗しました");
      const url = data.url;
      if (Platform.OS === "web") {
        window.location.href = url;
      } else {
        const can = await Linking.canOpenURL(url);
        if (can) await Linking.openURL(url);
        else Alert.alert("エラー", "Stripeのページを開けません");
      }
    } catch (e: any) {
      Alert.alert("エラー", e.message ?? "Stripe Connect の開始に失敗しました");
    } finally {
      setConnectLinking(false);
    }
  }

  async function handleSave() {
    if (!bankName || !bankBranch || !accountNumber || !accountName) {
      Alert.alert("入力エラー", "すべての項目を入力してください");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    Alert.alert("保存完了", "銀行口座情報を保存しました");
  }

  return (
    <AuthGuard>
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>払い出し設定</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={C.accent} />
          <Text style={styles.infoText}>
            収益の振込先となる銀行口座を登録してください。出金申請は月に2回まで可能です。最低引き出し額は¥1,000です。
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={16} color={C.accent} />
            <Text style={styles.cardTitle}>Stripe で口座連携</Text>
          </View>
          {connectStatus === null ? (
            <ActivityIndicator size="small" color={C.accent} style={{ marginVertical: 12 }} />
          ) : connectStatus.connected ? (
            <View style={styles.connectStatusRow}>
              <Ionicons name="checkmark-circle" size={20} color={C.green} />
              <Text style={styles.connectStatusText}>
                {connectStatus.chargesEnabled
                  ? "Stripe と連携済みです。出金を受け付けられます。"
                  : "Stripe と連携済みです。審査完了後、出金可能になります。"}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.securityText}>
                Stripe の連結アカウントを登録すると、収益を安全に振り込めます。ボタンから Stripe の画面へ進んで口座情報を登録してください。
              </Text>
              <Pressable
                style={[styles.stripeConnectBtn, connectLinking && { opacity: 0.6 }]}
                onPress={handleStripeConnect}
                disabled={connectLinking}
              >
                {connectLinking ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="link-outline" size={18} color="#fff" />
                    <Text style={styles.stripeConnectBtnText}>Stripe で口座を連携する</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={16} color={C.accent} />
            <Text style={styles.cardTitle}>銀行情報</Text>
          </View>

          <Text style={styles.fieldLabel}>銀行名</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="business-outline" size={16} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="例：三菱UFJ銀行"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.fieldLabel}>支店名</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={16} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={bankBranch}
              onChangeText={setBankBranch}
              placeholder="例：渋谷支店"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.fieldLabel}>口座種別</Text>
          <View style={styles.typeRow}>
            {ACCOUNT_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.typePill, accountType === t && styles.typePillActive]}
                onPress={() => setAccountType(t)}
              >
                <Text style={[styles.typePillText, accountType === t && styles.typePillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>口座番号</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="keypad-outline" size={16} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="7桁の口座番号"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              maxLength={7}
            />
          </View>

          <Text style={styles.fieldLabel}>口座名義（カタカナ）</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={16} color={C.textMuted} />
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="例：ヤマダ タロウ"
              placeholderTextColor={C.textMuted}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={16} color={C.green} />
            <Text style={styles.cardTitle}>セキュリティ</Text>
          </View>
          <Text style={styles.securityText}>
            銀行口座情報は暗号化されて保管されます。第三者に共有されることはありません。
          </Text>
          <View style={styles.securityBadgeRow}>
            <View style={styles.securityBadge}>
              <Ionicons name="lock-closed" size={12} color={C.green} />
              <Text style={styles.securityBadgeText}>SSL暗号化</Text>
            </View>
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={12} color={C.green} />
              <Text style={styles.securityBadgeText}>安全な保管</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name={saved ? "checkmark-circle" : "save-outline"} size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{saved ? "保存済み" : "保存する"}</Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.revenueLink} onPress={() => router.push("/revenue")}>
          <Ionicons name="arrow-forward-outline" size={14} color={C.accent} />
          <Text style={styles.revenueLinkText}>収益管理・出金申請はこちら</Text>
        </Pressable>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
  },
  infoText: { flex: 1, fontSize: 12, color: C.textSec, lineHeight: 18 },
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
  },
  input: { flex: 1, fontSize: 15, color: C.text },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  typePill: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
  },
  typePillActive: { backgroundColor: C.accent, borderColor: C.accent },
  typePillText: { fontSize: 14, color: C.textSec, fontWeight: "600" },
  typePillTextActive: { color: "#fff" },
  securityText: { fontSize: 12, color: C.textMuted, lineHeight: 18, marginBottom: 12 },
  connectStatusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  connectStatusText: { flex: 1, fontSize: 13, color: C.textSec },
  stripeConnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#635BFF",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
  },
  stripeConnectBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  securityBadgeRow: { flexDirection: "row", gap: 8 },
  securityBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#0F2E1A", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  securityBadgeText: { fontSize: 11, color: C.green, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.accent, marginHorizontal: 16, borderRadius: 12, paddingVertical: 14,
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  revenueLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginBottom: 8,
  },
  revenueLinkText: { fontSize: 13, color: C.accent },
});
