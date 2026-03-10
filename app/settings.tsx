import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth, AuthGuard } from "@/lib/auth";
import { C } from "@/constants/colors";
import { apiRequest, ApiError } from "@/lib/query-client";

function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  destructive,
  chevron = true,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        <Ionicons name={icon as any} size={18} color={destructive ? C.live : C.accent} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && { color: C.live }]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {chevron && (
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { user, logout, reloadMe } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isVerified = !!user?.phoneNumber && !!user?.phoneVerifiedAt;

  // ログインユーザーに電話番号があれば初期値として軽く反映
  useEffect(() => {
    if (user?.phoneNumber && !phone) {
      // +81始まりなら 0 から始まる国内向け表記に戻す
      if (user.phoneNumber.startsWith("+81")) {
        setPhone("0" + user.phoneNumber.slice(3));
      } else {
        setPhone(user.phoneNumber);
      }
    }
  }, [user?.phoneNumber, phone]);

  function normalizePhone(input: string): string {
    const trimmed = input.trim().replace(/[\s-]/g, "");
    if (!trimmed) return "";
    if (trimmed.startsWith("+")) return trimmed;
    if (trimmed.startsWith("0")) {
      return "+81" + trimmed.slice(1);
    }
    return "+81" + trimmed;
  }

  function handleLogout() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const ok = window.confirm("ログアウトしますか？");
      if (ok) logout();
      return;
    }
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "ログアウト", style: "destructive", onPress: logout },
    ]);
  }

  async function handleSendPhoneCode() {
    if (sendingCode) return;
    const normalized = normalizePhone(phone || user?.phoneNumber || "");
    if (!normalized) {
      Alert.alert("電話番号を入力してください");
      return;
    }
    setSendingCode(true);
    try {
      const res = await apiRequest("POST", "/api/auth/phone/start", {
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
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 400) {
          Alert.alert("エラー", "電話番号の形式を確認してください。");
        } else if (e.status === 409) {
          Alert.alert("エラー", "この電話番号は既に別のアカウントで使用されています。");
        } else if (e.status === 401) {
          Alert.alert("エラー", "ログインが切れています。再度ログインしてください。");
        } else {
          Alert.alert("エラー", "認証コードの送信に失敗しました。");
        }
      } else {
        Alert.alert("エラー", "認証コードの送信に失敗しました。");
      }
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyPhone() {
    if (verifying) return;
    const normalized = normalizePhone(phone || user?.phoneNumber || "");
    if (!normalized || !code.trim()) {
      Alert.alert("電話番号とコードを入力してください");
      return;
    }
    setVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/phone/verify", {
        phoneNumber: normalized,
        code: code.trim(),
      });
      await res.json();
      await reloadMe();
      Alert.alert("認証完了", "電話番号の認証が完了しました。");
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 400) {
          Alert.alert("認証に失敗しました", "コードが正しくないか、有効期限が切れています。");
        } else if (e.status === 409) {
          Alert.alert("エラー", "この電話番号は既に別のアカウントで使用されています。");
        } else if (e.status === 401) {
          Alert.alert("エラー", "ログインが切れています。再度ログインしてください。");
        } else {
          Alert.alert("エラー", "認証に失敗しました。");
        }
      } else {
        Alert.alert("エラー", "認証に失敗しました。");
      }
    } finally {
      setVerifying(false);
    }
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>設定</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {user && (
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person-circle" size={48} color={C.accent} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileSub}>LINEでログイン中</Text>
              </View>
            </View>
          )}

          <SectionHeader title="アカウント" />
          <View style={styles.section}>
            <SettingRow
              icon="person-outline"
              label="プロフィール編集"
              sublabel="表示名・プロフィール文・アイコン"
              onPress={() => router.push("/(tabs)/profile")}
            />
            <View style={styles.rowDivider} />
            <View style={styles.phoneWrap}>
              <View style={styles.phoneHeaderRow}>
                <Text style={styles.phoneLabel}>電話番号認証</Text>
                <Text style={[styles.phoneStatus, isVerified ? styles.phoneStatusOk : styles.phoneStatusWarn]}>
                  {isVerified ? "認証済み" : "未認証"}
                </Text>
              </View>
              <Text style={styles.phoneHelp}>
                投稿や一部の機能には電話番号認証が必要です。SMSで届くコードで本人確認を行います。
              </Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="例: 09012345678"
                placeholderTextColor={C.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <Pressable
                style={[
                  styles.phoneButton,
                  (sendingCode || (!phone.trim() && !user?.phoneNumber)) && styles.phoneButtonDisabled,
                ]}
                disabled={sendingCode || (!phone.trim() && !user?.phoneNumber)}
                onPress={handleSendPhoneCode}
              >
                {sendingCode ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.phoneButtonText}>認証コードを送信</Text>
                )}
              </Pressable>
              {codeSent && (
                <>
                  <Text style={[styles.phoneHelp, { marginTop: 12 }]}>
                    SMSで届いた6桁のコードを入力してください。
                  </Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="123456"
                    placeholderTextColor={C.textMuted}
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                    maxLength={6}
                  />
                  <Pressable
                    style={[
                      styles.phoneButton,
                      (verifying || !code.trim()) && styles.phoneButtonDisabled,
                    ]}
                    disabled={verifying || !code.trim()}
                    onPress={handleVerifyPhone}
                  >
                    {verifying ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.phoneButtonText}>認証して保存</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>

        <SectionHeader title="収益・お支払い" />
        <View style={styles.section}>
          <SettingRow
            icon="wallet-outline"
            label="収益管理"
            sublabel="収益の確認・出金申請"
            onPress={() => router.push("/revenue")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="card-outline"
            label="払い出し設定"
            sublabel="銀行口座の登録・変更"
            onPress={() => router.push("/payout-settings")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="receipt-outline"
            label="取引履歴"
            sublabel="過去の売上・出金記録"
            onPress={() => router.push("/revenue")}
          />
        </View>

        <SectionHeader title="ライバー機能" />
        <View style={styles.section}>
          <SettingRow
            icon="calendar-outline"
            label="予約可能日時の設定"
            sublabel="ファンが予約できる枠を管理"
            onPress={() => router.push("/liver-schedule")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="analytics-outline"
            label="自分のスコアを確認"
            sublabel="満足度・配信回数・約束遵守率"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
        </View>

        <SectionHeader title="通知" />
        <View style={styles.section}>
          <SettingRow
            icon="notifications-outline"
            label="プッシュ通知設定"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="mail-unread-outline"
            label="メール通知設定"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
        </View>

        <SectionHeader title="サポート" />
        <View style={styles.section}>
          <SettingRow
            icon="help-circle-outline"
            label="ヘルプ・FAQ"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="document-text-outline"
            label="利用規約"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="shield-outline"
            label="プライバシーポリシー"
            onPress={() => Alert.alert("準備中", "この機能は近日公開予定です")}
          />
        </View>

        <SectionHeader title="" />
        <View style={styles.section}>
          <SettingRow
            icon="log-out-outline"
            label="ログアウト"
            destructive
            chevron={false}
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.versionText}>LiveStage v1.0.0</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileAvatar: {},
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 2 },
  profileSub: { fontSize: 12, color: C.textMuted },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 6,
    marginHorizontal: 20,
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDestructive: {
    backgroundColor: "#3A1A1A",
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: C.text },
  rowSublabel: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 60,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: C.textMuted,
    marginTop: 24,
    marginBottom: 8,
  },
  // 電話番号認証ブロック
  phoneWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface2,
  },
  phoneHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  phoneLabel: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  phoneStatus: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  phoneStatusOk: {
    backgroundColor: "rgba(76,175,80,0.18)",
    color: "#AED581",
  },
  phoneStatusWarn: {
    backgroundColor: "rgba(255,193,7,0.16)",
    color: "#FFCA28",
  },
  phoneHelp: {
    color: C.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  phoneInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    color: C.text,
    fontSize: 13,
    backgroundColor: C.surface,
    marginTop: 4,
  },
  phoneButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: C.accent,
  },
  phoneButtonDisabled: {
    backgroundColor: C.surface3,
  },
  phoneButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
