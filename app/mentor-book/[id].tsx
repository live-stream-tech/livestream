/**
 * mentor-book/[id].tsx
 * メンターセッション予約ページ
 * - セッション詳細表示
 * - 日時選択（liverAvailabilityスロット or 手動入力）
 * - Stripe Checkout へリダイレクト
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";
import { F } from "@/constants/fonts";
import { useAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/query-client";

const CATEGORY_LABELS: Record<string, string> = {
  counselor: "悩み相談",
  english: "英会話",
  coaching: "コーチング",
  music: "音楽レッスン",
  yoga: "ヨガ・瞑想",
  fortune: "占い",
  other: "その他",
};

interface MentorSession {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  maxParticipants: number;
  userId: number;
}

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  bookedSlots: number;
}

export default function MentorBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [session, setSession] = useState<MentorSession | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const baseUrl = getApiUrl();
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // セッション情報取得（my-sessionsから探すか、直接取得）
        // まずセッションIDでユーザーを特定するためにセッション情報を取得
        // APIはuserId別なので、ここでは仮にセッションIDから取得するエンドポイントを使用
        const res = await fetch(new URL(`/api/mentor/session/${id}`, baseUrl).toString());
        if (res.ok) {
          const s = await res.json();
          setSession(s);
          // そのクリエイターのスロットを取得
          if (s.userId) {
            const slotsRes = await fetch(new URL(`/api/availability/${s.userId}`, baseUrl).toString());
            if (slotsRes.ok) {
              const slotsData = await slotsRes.json();
              setSlots(Array.isArray(slotsData) ? slotsData : []);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      Alert.alert("ログインが必要です", "予約するにはログインしてください");
      return;
    }
    if (!session) return;

    const scheduledAt = selectedSlot
      ? new Date(`${selectedSlot.date}T${selectedSlot.startTime}`).toISOString()
      : selectedDate?.toISOString();

    if (!scheduledAt) {
      Alert.alert("日時を選択してください");
      return;
    }

    setBooking(true);
    try {
      const res = await fetch(new URL("/api/mentor/bookings", baseUrl).toString(), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          sessionId: session.id,
          slotId: selectedSlot?.id,
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "creator_not_connected") {
          Alert.alert("予約できません", "このクリエイターはまだ受取り設定を完了していません");
        } else {
          Alert.alert("エラー", data.error ?? "予約に失敗しました");
        }
        return;
      }
      // Stripe Checkout へリダイレクト
      if (data.checkoutUrl) {
        if (Platform.OS === "web") {
          window.location.href = data.checkoutUrl;
        } else {
          Linking.openURL(data.checkoutUrl);
        }
      }
    } catch (e: any) {
      Alert.alert("エラー", e.message);
    } finally {
      setBooking(false);
    }
  };

  // 今後7日間の日付を生成
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const formatDayLabel = (d: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>セッションが見つかりません</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableSlots = slots.filter(s => s.bookedSlots < s.maxSlots);

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color={C.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BOOK SESSION</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll}>
        {/* セッション情報 */}
        <View style={styles.sessionCard}>
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{CATEGORY_LABELS[session.category] ?? session.category}</Text>
          </View>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionDesc}>{session.description}</Text>
          <View style={styles.sessionMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={C.textMuted} />
              <Text style={styles.metaText}>{session.duration}分</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={C.textMuted} />
              <Text style={styles.metaText}>最大{session.maxParticipants}名</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="videocam-outline" size={14} color={C.textMuted} />
              <Text style={styles.metaText}>ビデオ通話</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>料金</Text>
            <Text style={styles.price}>¥{session.price.toLocaleString()}</Text>
          </View>
        </View>

        {/* 日時選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日時を選択</Text>

          {availableSlots.length > 0 ? (
            <>
              <Text style={styles.sectionSubtitle}>クリエイターの空き時間</Text>
              {availableSlots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotItem, selectedSlot?.id === slot.id && styles.slotItemSelected]}
                  onPress={() => { setSelectedSlot(slot); setSelectedDate(null); }}
                >
                  <View>
                    <Text style={[styles.slotDate, selectedSlot?.id === slot.id && styles.slotDateSelected]}>
                      {slot.date} {slot.startTime} 〜 {slot.endTime}
                    </Text>
                    <Text style={styles.slotRemain}>残り{slot.maxSlots - slot.bookedSlots}枠</Text>
                  </View>
                  {selectedSlot?.id === slot.id && (
                    <Ionicons name="checkmark-circle" size={20} color={C.accent} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
              <Text style={styles.sectionSubtitle}>または希望日を選択</Text>
            </>
          ) : (
            <Text style={styles.noSlotText}>希望日を選んでリクエストしてください</Text>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
            {next7Days.map((d, i) => {
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => { setSelectedDate(d); setSelectedSlot(null); }}
                >
                  <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                    {formatDayLabel(d)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 注意事項 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>ご注意</Text>
          <Text style={styles.noticeText}>
            • 決済完了後、セッションが確定されます{"\n"}
            • ビデオ通話はWebブラウザでご利用ください{"\n"}
            • デジタルコンテンツのため返金はできません{"\n"}
            • RawStockは20%の手数料を差し引きます
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 予約ボタン */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>合計</Text>
          <Text style={styles.footerPriceValue}>¥{session.price.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, (!selectedSlot && !selectedDate) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={booking || (!selectedSlot && !selectedDate)}
        >
          {booking ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <Text style={styles.bookBtnText}>決済へ進む</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderDim,
  },
  headerBack: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: F.display, fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: 2 },
  scroll: { flex: 1 },
  sessionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.borderDim,
  },
  catBadge: { backgroundColor: C.borderDim, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 10 },
  catText: { fontFamily: F.mono, fontSize: 11, color: C.accent },
  sessionTitle: { fontFamily: F.display, fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 8 },
  sessionDesc: { fontFamily: F.mono, fontSize: 13, color: C.textSec, lineHeight: 20, marginBottom: 16 },
  sessionMeta: { flexDirection: "row", gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: F.mono, fontSize: 12, color: C.textMuted },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: C.borderDim },
  priceLabel: { fontFamily: F.mono, fontSize: 12, color: C.textMuted },
  price: { fontFamily: F.display, fontSize: 24, fontWeight: "800", color: C.accent },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontFamily: F.display, fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" },
  sectionSubtitle: { fontFamily: F.mono, fontSize: 11, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  noSlotText: { fontFamily: F.mono, fontSize: 13, color: C.textMuted, marginBottom: 12 },
  slotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: C.borderDim,
    borderRadius: 8,
    marginBottom: 8,
  },
  slotItemSelected: { borderColor: C.accent, backgroundColor: `${C.accent}11` },
  slotDate: { fontFamily: F.mono, fontSize: 13, color: C.text },
  slotDateSelected: { color: C.accent },
  slotRemain: { fontFamily: F.mono, fontSize: 11, color: C.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.borderDim, marginVertical: 16 },
  dateRow: { flexDirection: "row" },
  dateChip: { borderWidth: 1, borderColor: C.borderDim, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  dateChipSelected: { backgroundColor: C.accent, borderColor: C.accent },
  dateChipText: { fontFamily: F.mono, fontSize: 12, color: C.textSec },
  dateChipTextSelected: { color: C.bg },
  noticeSection: { marginHorizontal: 16, padding: 16, backgroundColor: C.surface2, borderRadius: 8 },
  noticeTitle: { fontFamily: F.display, fontSize: 13, fontWeight: "700", color: C.textMuted, marginBottom: 8, letterSpacing: 1 },
  noticeText: { fontFamily: F.mono, fontSize: 12, color: C.textMuted, lineHeight: 20 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.borderDim,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontFamily: F.mono, fontSize: 11, color: C.textMuted },
  footerPriceValue: { fontFamily: F.display, fontSize: 22, fontWeight: "800", color: C.accent },
  bookBtn: { backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 28, paddingVertical: 14 },
  bookBtnDisabled: { opacity: 0.4 },
  bookBtnText: { fontFamily: F.display, fontSize: 16, fontWeight: "800", color: C.bg },
  errorText: { fontFamily: F.mono, fontSize: 14, color: C.live },
  backBtn: { borderWidth: 1, borderColor: C.accent, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { fontFamily: F.mono, fontSize: 13, color: C.accent },
});
