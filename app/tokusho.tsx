import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";

const ROWS: [string, string][] = [
  ["販売業者", "鹿之賦 宏美"],
  ["所在地", "〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C"],
  ["電話番号", "現在公表しておりません。お問い合わせはメールにてお受けしております。"],
  ["お問い合わせ", "rawstock.infomation@gmail.com"],
  ["受付時間", "メールにて受付（返信は3営業日以内を目安）"],
  ["販売URL", "https://livestream-nu-ten.vercel.app"],
  ["販売価格", "各コンテンツ・サービスの販売ページに表示する価格（消費税込み）"],
  ["支払方法", "クレジットカード決済（Visa / Mastercard / American Express / JCB）"],
  ["支払時期", "購入手続き完了時に即時決済"],
  ["サービス提供時期", "決済完了後、即時にコンテンツへのアクセス権を付与"],
  ["返品・キャンセル", "デジタルコンテンツの性質上、購入完了後の返品・キャンセル・返金はお受けできません。ただし、システム障害等によりサービスを提供できない場合はこの限りではありません。"],
  ["動作環境", "インターネット接続環境が必要です。推奨ブラウザ：Chrome / Safari / Firefox 最新版"],
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
    borderRadius: 18,
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
    borderRadius: 12,
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
