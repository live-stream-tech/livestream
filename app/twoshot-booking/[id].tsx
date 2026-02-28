import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { C } from "@/constants/colors";

type LiveStream = {
  id: number;
  title: string;
  creator: string;
  avatar: string;
  thumbnail: string;
  viewers: number;
};

type Step = "terms" | "tokusho" | "confirm";

const TERMS = [
  {
    id: "no_record",
    icon: "camera-off" as const,
    title: "記録行為の禁止",
    body: "写真・動画・音声の録音・スクリーンショット等、あらゆる記録行為を禁止します。",
  },
  {
    id: "no_sns",
    icon: "logo-twitter" as const,
    title: "SNS投稿制限",
    body: "ツーショット内容・クリエイターの発言・映像等のSNS投稿・拡散を禁止します。",
  },
  {
    id: "no_contact",
    icon: "hand-left" as const,
    title: "身体接触・不適切言動の禁止",
    body: "無断の身体接触、ハラスメント行為、不適切な発言・要求は即時退出の対象となります。",
  },
  {
    id: "no_refund",
    icon: "card" as const,
    title: "返金不可（原則）",
    body: "お客様都合のキャンセルは原則返金不可です。クリエイター側事由の場合のみ返金対応いたします。",
  },
];

const TWOSHOT_PRICE = 3000;

export default function TwoshotBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamId = parseInt(id ?? "1");
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>("terms");
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const { data: stream } = useQuery<LiveStream>({
    queryKey: [`/api/live-streams/${streamId}`],
  });
  const { data: queueData } = useQuery<{ count: number }>({
    queryKey: [`/api/twoshot/${streamId}/queue-count`],
  });

  const allAgreed = TERMS.every((t) => agreed[t.id]);
  const queuePos = (queueData?.count ?? 0) + 1;

  async function handleProceedToPayment() {
    if (!allAgreed) return;
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/twoshot/${streamId}/checkout`, {
        userName: "ゲストユーザー",
        userAvatar: null,
        price: TWOSHOT_PRICE,
      });
      if (res.checkoutUrl) {
        await Linking.openURL(res.checkoutUrl);
        router.back();
      }
    } catch (e: any) {
      Alert.alert("エラー", "決済の開始に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>ツーショット予約</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {(["terms", "tokusho", "confirm"] as Step[]).map((s, i) => {
          const labels = ["同意事項", "特商法", "確認・決済"];
          const isActive = step === s;
          const isDone =
            (s === "terms" && (step === "tokusho" || step === "confirm")) ||
            (s === "tokusho" && step === "confirm");
          return (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    isActive && styles.stepDotActive,
                    isDone && styles.stepDotDone,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {labels[i]}
                </Text>
              </View>
              {i < 2 && <View style={[styles.stepLine, isDone && styles.stepLineDone]} />}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stream info */}
        {stream && (
          <View style={styles.streamCard}>
            <Image source={{ uri: stream.thumbnail }} style={styles.streamThumb} contentFit="cover" />
            <View style={styles.streamCardOverlay} />
            <View style={styles.streamCardInfo}>
              <Image source={{ uri: stream.avatar }} style={styles.streamAvatar} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.streamCreator}>{stream.creator}</Text>
                <Text style={styles.streamTitle} numberOfLines={1}>{stream.title}</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 1: Terms */}
        {step === "terms" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>利用規約・現場ルールへの同意</Text>
            <Text style={styles.sectionDesc}>
              すべての項目に同意いただかないと決済へ進めません。ご確認の上チェックしてください。
            </Text>
            {TERMS.map((term) => (
              <Pressable
                key={term.id}
                style={[styles.termCard, agreed[term.id] && styles.termCardAgreed]}
                onPress={() => setAgreed((prev) => ({ ...prev, [term.id]: !prev[term.id] }))}
              >
                <View style={styles.termHeader}>
                  <View style={[styles.termIconBox, agreed[term.id] && styles.termIconBoxAgreed]}>
                    <Ionicons
                      name={term.icon}
                      size={18}
                      color={agreed[term.id] ? "#fff" : C.textMuted}
                    />
                  </View>
                  <Text style={[styles.termTitle, agreed[term.id] && styles.termTitleAgreed]}>
                    {term.title}
                  </Text>
                  <View
                    style={[styles.checkbox, agreed[term.id] && styles.checkboxChecked]}
                  >
                    {agreed[term.id] && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
                <Text style={styles.termBody}>{term.body}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.nextBtn, !allAgreed && styles.nextBtnDisabled]}
              onPress={() => allAgreed && setStep("tokusho")}
              disabled={!allAgreed}
            >
              <Text style={styles.nextBtnText}>特定商取引法の表示を確認する</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 2: Tokusho */}
        {step === "tokusho" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>特定商取引法に基づく表示</Text>
            <View style={styles.tokushoCard}>
              {[
                ["事業者名", "LiveStock運営事務局"],
                ["サービス名", "ツーショット撮影予約（ライブ内）"],
                ["販売価格", `¥${TWOSHOT_PRICE.toLocaleString()}（税込）`],
                ["支払時期", "予約時（クレジットカード事前決済）"],
                ["提供時期", "予約したライブ配信中・順番が回ってきた時"],
                ["キャンセル規定", "お客様都合のキャンセルは原則返金不可。クリエイター側事由の場合は全額返金。"],
                ["決済方法", "クレジットカード（Stripe決済）"],
                ["お問い合わせ", "support@livestock-app.jp"],
              ].map(([label, value]) => (
                <View key={label} style={styles.tokushoRow}>
                  <Text style={styles.tokushoLabel}>{label}</Text>
                  <Text style={styles.tokushoValue}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.btnRow}>
              <Pressable style={styles.backStepBtn} onPress={() => setStep("terms")}>
                <Ionicons name="chevron-back" size={15} color={C.textSec} />
                <Text style={styles.backStepText}>戻る</Text>
              </Pressable>
              <Pressable style={[styles.nextBtn, { flex: 1 }]} onPress={() => setStep("confirm")}>
                <Text style={styles.nextBtnText}>内容を確認して予約へ</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 3: Confirm & Pay */}
        {step === "confirm" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>予約内容の確認</Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>整理番号</Text>
                <Text style={styles.confirmValue}>
                  <Text style={styles.confirmHighlight}>{queuePos}</Text>
                  {" "}番
                </Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>サービス</Text>
                <Text style={styles.confirmValue}>ツーショット撮影（ライブ内）</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>クリエイター</Text>
                <Text style={styles.confirmValue}>{stream?.creator ?? "---"}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>実施日時</Text>
                <Text style={styles.confirmValue}>ライブ配信中・順番が回った時</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { fontSize: 15 }]}>お支払い金額</Text>
                <Text style={styles.priceText}>¥{TWOSHOT_PRICE.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={15} color={C.orange} />
              <Text style={styles.warningText}>
                ウォーターマーク（透かし）がツーショット中の画面に表示されます。無断キャプチャ・転載は規約違反となります。
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Pressable style={styles.backStepBtn} onPress={() => setStep("tokusho")}>
                <Ionicons name="chevron-back" size={15} color={C.textSec} />
                <Text style={styles.backStepText}>戻る</Text>
              </Pressable>
              <Pressable
                style={[styles.payBtn, loading && styles.nextBtnDisabled]}
                onPress={handleProceedToPayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="card" size={16} color="#fff" />
                )}
                <Text style={styles.payBtnText}>
                  {loading ? "処理中..." : `¥${TWOSHOT_PRICE.toLocaleString()} 決済へ進む`}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.stripeNote}>
              決済はStripeの安全なページで行われます。カード情報はLiveStockには送信されません。
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: C.accent },
  stepDotDone: { backgroundColor: C.green },
  stepNum: { color: C.textMuted, fontSize: 11, fontWeight: "700" },
  stepLabel: { color: C.textMuted, fontSize: 10 },
  stepLabelActive: { color: C.accent, fontWeight: "700" },
  stepLine: { flex: 1, height: 2, backgroundColor: C.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: C.green },
  scroll: { flex: 1 },
  streamCard: {
    height: 120,
    position: "relative",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  streamThumb: { ...StyleSheet.absoluteFillObject },
  streamCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  streamCardInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.accent,
  },
  streamCreator: { color: "#fff", fontSize: 13, fontWeight: "700" },
  streamTitle: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.live,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  section: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "800", marginTop: 4 },
  sectionDesc: { color: C.textSec, fontSize: 13, lineHeight: 19 },
  termCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  termCardAgreed: { borderColor: C.green, backgroundColor: "rgba(0,200,83,0.05)" },
  termHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  termIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  termIconBoxAgreed: { backgroundColor: C.green },
  termTitle: { flex: 1, color: C.text, fontSize: 14, fontWeight: "700" },
  termTitleAgreed: { color: C.green },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: C.green, borderColor: C.green },
  termBody: { color: C.textSec, fontSize: 12, lineHeight: 18 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  tokushoCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  tokushoRow: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tokushoLabel: { color: C.textMuted, fontSize: 12, width: 90 },
  tokushoValue: { flex: 1, color: C.text, fontSize: 12, lineHeight: 18 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 2,
  },
  backStepText: { color: C.textSec, fontSize: 14 },
  confirmCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  confirmLabel: { color: C.textSec, fontSize: 13 },
  confirmValue: { color: C.text, fontSize: 13, fontWeight: "600", textAlign: "right" },
  confirmHighlight: { color: C.accent, fontSize: 22, fontWeight: "800" },
  confirmDivider: { height: 1, backgroundColor: C.border },
  priceText: { color: C.accent, fontSize: 20, fontWeight: "800" },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,139,0,0.08)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,139,0,0.2)",
  },
  warningText: { flex: 1, color: C.orange, fontSize: 12, lineHeight: 18 },
  payBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6772e5",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  payBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  stripeNote: {
    color: C.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
