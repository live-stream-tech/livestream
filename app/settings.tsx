import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth, AuthGuard } from "@/lib/auth";
import { C } from "@/constants/colors";

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
  const { user, logout } = useAuth();

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
});
