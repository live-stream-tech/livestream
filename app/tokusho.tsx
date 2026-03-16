import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";

const ROWS: [string, string][] = [
  ["販売業者", "鹿之賦 宏美"],
  ["所在地", "〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C"],
  ["お問い合わせ", "rawstock.infomation@gmail.com"],
  ["受付時間", "メールにて受付（返信は3営業日以内を目安）"],
  ["販売URL", "https://livestream-nu-ten.vercel.app"],
];

export default function TokushoScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>特定商取引法に基づく表記</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.docTitle}>特定商取引法に基づく表記</Text>

        <View style={styles.table}>
          {ROWS.map(([label, value], i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  docTitle: { fontSize: 20, fontWeight: "700", color: C.text, marginBottom: 20, textAlign: "center" },
  table: {
    backgroundColor: C.surface,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rowLabel: {
    width: 100,
    fontSize: 13,
    fontWeight: "600",
    color: C.textMuted,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: C.textSec,
  },
});
