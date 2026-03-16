import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Platform, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { C } from "@/constants/colors";

const MIN_AMOUNT = 10000;
const DAILY_RATE_PER_MEMBER = 5;
const MAX_MONTHS_AHEAD = 3;

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000)) + 1;
}

export default function GenreAdApplyScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { genreId } = useLocalSearchParams<{ genreId?: string }>();
  const gid = (genreId ?? "").toString();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: communities = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/communities${gid ? `?genre=${gid}` : ""}`],
    enabled: !!gid,
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/communities${gid ? `?genre=${gid}` : ""}`, baseUrl).toString());
      if (!res.ok) throw new Error("ジャンル情報を取得できませんでした");
      return res.json();
    },
  });

  const totalMembers = (communities as any[]).reduce((sum, c) => sum + (c.members ?? 0), 0);
  const dailyRate = totalMembers * DAILY_RATE_PER_MEMBER;

  const { totalAmount, days, error: amountError } = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return { totalAmount: 0, days: 0, error: "" };
    if (end < start) return { totalAmount: 0, days: 0, error: "終了日は開始日以降にしてください" };
    const d = daysBetween(start, end);
    const total = d * dailyRate;
    const maxEnd = new Date();
    maxEnd.setMonth(maxEnd.getMonth() + MAX_MONTHS_AHEAD);
    if (end > maxEnd) return { totalAmount: total, days: d, error: `掲載終了日は${MAX_MONTHS_AHEAD}ヶ月以内で指定してください` };
    if (total < MIN_AMOUNT) return { totalAmount: total, days: d, error: `最低出稿金額は${MIN_AMOUNT.toLocaleString()}円以上です` };
    return { totalAmount: total, days: d, error: "" };
  }, [startDate, endDate, dailyRate]);

  const canSubmit =
    gid &&
    companyName.trim().length > 0 &&
    contactName.trim().length > 0 &&
    email.trim().length > 0 &&
    bannerUrl.trim().length > 0 &&
    startDate.trim().length > 0 &&
    endDate.trim().length > 0 &&
    !amountError &&
    totalAmount >= MIN_AMOUNT;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/genre-ads", {
        genreId: gid,
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        bannerUrl: bannerUrl.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
      });
      Alert.alert("申し込み完了", "ジャンルページの広告申し込みを受け付けました。審査結果はメールでお知らせします。", [
        { text: "OK", onPress: () => router.replace(`/community/genre/${gid}`) },
      ]);
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "申し込みに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (!gid) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topInset }]}>
        <Text style={styles.errorText}>ジャンルが指定されていません</Text>
        <Pressable style={styles.backBtnStandalone} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>戻る</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>ジャンル広告申し込み</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.genreLabel}>ジャンル: {gid}</Text>
        <Text style={styles.hint}>
          広告費 = ジャンル全体メンバー数合計 × 5円/日（最低{MIN_AMOUNT.toLocaleString()}円）・掲載は最大3ヶ月先まで
        </Text>

        <Text style={styles.label}>
          会社名 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="株式会社〇〇"
          placeholderTextColor={C.textMuted}
        />

        <Text style={styles.label}>
          担当者名 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="山田 太郎"
          placeholderTextColor={C.textMuted}
        />

        <Text style={styles.label}>
          メールアドレス <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="contact@example.com"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          バナー画像URL <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.hintSmall}>静止画・GIF（フラッシュ）対応。推奨: 16:9</Text>
        <TextInput
          style={styles.input}
          value={bannerUrl}
          onChangeText={setBannerUrl}
          placeholder="https://..."
          placeholderTextColor={C.textMuted}
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          掲載開始日 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD（例: 2025-04-01）"
          placeholderTextColor={C.textMuted}
        />

        <Text style={styles.label}>
          掲載終了日 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD（最大3ヶ月先まで）"
          placeholderTextColor={C.textMuted}
        />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryRow}>ジャンル全体メンバー数合計: {totalMembers.toLocaleString()}人</Text>
          <Text style={styles.summaryRow}>日額: {dailyRate.toLocaleString()}円/日</Text>
          <Text style={styles.summaryRow}>掲載日数: {days}日</Text>
          <Text style={[styles.summaryRow, styles.summaryTotal]}>合計: {totalAmount.toLocaleString()}円</Text>
          {amountError ? <Text style={styles.summaryError}>{amountError}</Text> : null}
        </View>

        <Pressable
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        >
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
          <Text style={styles.submitBtnText}>{submitting ? "送信中..." : "申し込む"}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  errorText: { color: C.text, fontSize: 14 },
  backBtnStandalone: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: C.surface, borderRadius: 12 },
  backBtnText: { color: C.text, fontSize: 14, fontWeight: "600" },
  genreLabel: { color: C.accent, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  hint: { color: C.textMuted, fontSize: 12, marginBottom: 20 },
  hintSmall: { color: C.textMuted, fontSize: 11, marginBottom: 6 },
  label: { color: C.text, fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  required: { color: C.live },
  input: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 14,
    color: C.text,
  },
  summaryBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryRow: { fontSize: 13, color: C.textSec, marginBottom: 2 },
  summaryTotal: { fontWeight: "700", color: C.accent, marginTop: 4 },
  summaryError: { marginTop: 6, fontSize: 12, color: C.live },
  submitBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.accent,
    paddingVertical: 12,
    borderRadius: 999,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

