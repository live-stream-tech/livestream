import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { C } from "@/constants/colors";
import { getTabTopInset, getTabBottomInset } from "@/constants/layout";
import { MetallicLine } from "@/components/MetallicLine";
import type { BookingSession } from "@/constants/data";
import { apiRequest } from "@/lib/query-client";

const MENTOR_CATEGORY_ICONS: Record<string, string> = {
  english: "language-outline",
  counselor: "heart-outline",
  fortune: "star-outline",
  idol: "musical-notes-outline",
  cooking: "restaurant-outline",
  coaching: "trophy-outline",
  yoga: "flower-outline",
};

const MENTOR_CATEGORY_COLORS: Record<string, string> = {
  english: "#00ffcc",
  counselor: "#EC407A",
  fortune: "#7C4DFF",
  idol: "#FF4081",
  cooking: "#FF7043",
  coaching: "#00BCD4",
  yoga: "#66BB6A",
};

function BookingCard({ session }: { session: BookingSession }) {
  const categoryColor = MENTOR_CATEGORY_COLORS[session.category] ?? C.accent;
  const spotsPercent = ((session.spotsTotal - session.spotsLeft) / session.spotsTotal) * 100;
  const isAlmostFull = session.spotsLeft <= 2;

  return (
    <Pressable style={styles.bookingCard}>
      <View style={styles.bookingThumbContainer}>
        <Image source={{ uri: session.thumbnail }} style={styles.bookingThumb} contentFit="cover" />
        <View style={[styles.bookingCategoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={MENTOR_CATEGORY_ICONS[session.category] as any} size={10} color="#fff" />
          <Text style={styles.bookingCategoryText}>{session.categoryLabel}</Text>
        </View>
        {session.tag && (
          <View style={styles.bookingTagBadge}>
            <Text style={styles.bookingTagText}>{session.tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.bookingCardBody}>
        <View style={styles.bookingCreatorRow}>
          <Image source={{ uri: session.avatar }} style={styles.bookingAvatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingCreatorName}>{session.creator}</Text>
            <View style={styles.bookingRatingRow}>
              <Ionicons name="star" size={11} color={C.orange} />
              <Text style={styles.bookingRating}>{session.rating.toFixed(1)}</Text>
              <Text style={styles.bookingReviewCount}>({session.reviewCount})</Text>
            </View>
          </View>
          <View style={styles.bookingPriceBox}>
            <Text style={styles.bookingPrice}>¥{session.price.toLocaleString()}</Text>
            <Text style={styles.bookingPriceSub}>/{session.duration}</Text>
          </View>
        </View>

        <Text style={styles.bookingTitle} numberOfLines={2}>{session.title}</Text>

        <View style={styles.bookingMetaRow}>
          <View style={styles.bookingMeta}>
            <Ionicons name="calendar-outline" size={12} color={C.textMuted} />
            <Text style={styles.bookingMetaText}>{session.date} {session.time}</Text>
          </View>
          <View style={styles.bookingMeta}>
            <Ionicons name="time-outline" size={12} color={C.textMuted} />
            <Text style={styles.bookingMetaText}>{session.duration}</Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <View style={{ flex: 1 }}>
            <View style={styles.bookingSpotsRow}>
              <Text style={[styles.bookingSpotsText, isAlmostFull && { color: C.live }]}>
                残り{session.spotsLeft}枠
              </Text>
              <Text style={styles.bookingSpotsSub}>/ {session.spotsTotal}枠</Text>
            </View>
            <View style={styles.bookingProgressBg}>
              <View style={[styles.bookingProgressFill, { width: `${spotsPercent}%` as any, backgroundColor: isAlmostFull ? C.live : categoryColor }]} />
            </View>
          </View>
          <Pressable
            style={[styles.bookingActionBtn, { backgroundColor: categoryColor }]}
            onPress={() => router.push(`/twoshot-booking/${session.id}`)}
          >
            <Text style={styles.bookingBtnText}>予約する</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

type PublicScope = "public" | "invite" | "twoshot";
type FeeType = "free" | "paid";
type PriceOption = 500 | 1000 | 3000 | 5000;

function LiveStartModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<PublicScope>("public");
  const [fee, setFee] = useState<FeeType>("paid");
  const [price, setPrice] = useState<PriceOption>(500);
  const [creating, setCreating] = useState(false);

  const prices: PriceOption[] = [500, 1000, 3000, 5000];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContainer, { paddingBottom: insets.bottom + 20 }]} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>ライブ配信を開始</Text>
              <Text style={styles.modalSub}>配信設定を選択してください</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 公開範囲 */}
            <Text style={styles.settingLabel}>公開範囲</Text>
            <View style={styles.scopeOptions}>
              <Pressable
                style={[styles.scopeOption, scope === "public" && styles.scopeOptionActive]}
                onPress={() => setScope("public")}
              >
                <Ionicons name="globe-outline" size={22} color={scope === "public" ? C.accent : C.textSec} />
                <View style={styles.scopeText}>
                  <Text style={[styles.scopeTitle, scope === "public" && styles.scopeTitleActive]}>一般公開</Text>
                  <Text style={styles.scopeDesc}>誰でも視聴可能</Text>
                </View>
              </Pressable>
              <Pressable
                style={[styles.scopeOption, scope === "invite" && styles.scopeOptionActive]}
                onPress={() => setScope("invite")}
              >
                <Ionicons name="lock-closed-outline" size={22} color={scope === "invite" ? C.accent : C.textSec} />
                <View style={styles.scopeText}>
                  <Text style={[styles.scopeTitle, scope === "invite" && styles.scopeTitleActive]}>招待者限定</Text>
                  <Text style={styles.scopeDesc}>招待した人のみ視聴可能</Text>
                </View>
              </Pressable>
              <Pressable
                style={[styles.scopeOption, scope === "twoshot" && styles.scopeOptionActive]}
                onPress={() => setScope("twoshot")}
              >
                <Ionicons name="people-outline" size={22} color={scope === "twoshot" ? C.accent : C.textSec} />
                <View style={styles.scopeText}>
                  <Text style={[styles.scopeTitle, scope === "twoshot" && styles.scopeTitleActive]}>メンターセッション</Text>
                  <Text style={styles.scopeDesc}>1対1のプライベート配信</Text>
                </View>
              </Pressable>
            </View>

            {/* 配信料金 */}
            <Text style={[styles.settingLabel, { marginTop: 16 }]}>配信料金</Text>
            <View style={styles.feeRow}>
              <Pressable
                style={[styles.feePill, fee === "free" && styles.feePillActive]}
                onPress={() => setFee("free")}
              >
                <Text style={[styles.feePillText, fee === "free" && styles.feePillTextActive]}>無料</Text>
              </Pressable>
              <Pressable
                style={[styles.feePill, fee === "paid" && styles.feePillActive]}
                onPress={() => setFee("paid")}
              >
                <Text style={[styles.feePillText, fee === "paid" && styles.feePillTextActive]}>有料</Text>
              </Pressable>
            </View>

            {fee === "paid" && (
              <>
                <Text style={[styles.settingLabel, { marginTop: 16 }]}>視聴料金</Text>
                <View style={styles.priceOptions}>
                  {prices.map((p) => (
                    <Pressable
                      key={p}
                      style={[styles.pricePill, price === p && styles.pricePillActive]}
                      onPress={() => setPrice(p)}
                    >
                      <Text style={[styles.pricePillText, price === p && styles.pricePillTextActive]}>
                        ¥{p.toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.priceDisplay}>
                  <Text style={styles.priceDisplayCurrency}>¥</Text>
                  <Text style={styles.priceDisplayValue}>{price.toLocaleString()}</Text>
                </View>
                <View style={styles.revenueRow}>
                  <Text style={styles.revenueLabel}>あなたの取り分 (80%)</Text>
                  <Text style={styles.revenueValue}>¥{(price * 0.8).toLocaleString()}</Text>
                </View>
              </>
            )}

            {/* Preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewCamera}>
                <Ionicons name="videocam" size={40} color={C.accent} />
                <View style={styles.previewRedDot} />
              <View style={styles.previewComingSoonRibbon}>
                <Text style={styles.previewComingSoonText}>COMING SOON</Text>
              </View>
              </View>
              <View style={styles.previewStats}>
                <View style={styles.previewStat}>
                  <Ionicons name="people-outline" size={16} color={C.textSec} />
                  <Text style={styles.previewStatLabel}>推定視聴者</Text>
                </View>
                <Text style={styles.previewStatValue}>500-800人</Text>
                <View style={[styles.previewStat, { marginTop: 8 }]}>
                  <Ionicons name="time-outline" size={16} color={C.textSec} />
                  <Text style={styles.previewStatLabel}>配信時間</Text>
                </View>
                <Text style={styles.previewStatValue}>無制限</Text>
              </View>
            </View>

            <Pressable
              style={styles.startBtn}
              onPress={async () => {
                if (creating) return;
                // 配信機能は未実装のため、リリース時は準備中表示（Cloudflare Stream 実装後に有効化）
                const BROADCAST_ENABLED = false;
                if (!BROADCAST_ENABLED) {
                  Alert.alert("準備中", "ライブ配信機能は近日公開予定です。しばらくお待ちください。");
                  return;
                }
                try {
                  setCreating(true);
                  const res = await apiRequest("POST", "/api/stream/create", {
                    scope,
                    fee,
                    price,
                  });
                  const data = (await res.json()) as {
                    id: number;
                    webRtc: { url: string };
                    rtmps: { url: string; streamKey: string };
                  };
                  onClose();
                  Alert.alert(
                    "配信入力を作成しました",
                    `配信ソフト(OBSなど)には次を設定してください:\n\nサーバーURL:\n${data.rtmps.url}\n\nストリームキー:\n${data.rtmps.streamKey}`
                  );
                  router.push("/broadcast");
                } catch (e: any) {
                  Alert.alert("エラー", e?.message ?? "ライブ入力の作成に失敗しました");
                } finally {
                  setCreating(false);
                }
              }}
            >
              <View style={styles.startDot} />
              <Text style={styles.startBtnText}>
                {creating ? "作成中..." : "ライブ配信を開始"}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"now" | "booking">("now");
  const [modalVisible, setModalVisible] = useState(false);
  const [liveSearch, setLiveSearch] = useState("");

  const { data: liveStreams = [] } = useQuery<any[]>({ queryKey: ["/api/live-streams"] });
  const { data: bookingSessions = [] } = useQuery<any[]>({ queryKey: ["/api/booking-sessions"] });

  const filteredLiveStreams = liveStreams.filter((s: any) => {
    const matchSearch = !liveSearch || s.title?.includes(liveSearch) || s.creator?.includes(liveSearch);
    return matchSearch;
  });

  const filteredBookings = bookingSessions.filter((s: any) => {
    const matchSearch = !liveSearch || s.title?.includes(liveSearch) || s.creator?.includes(liveSearch);
    return matchSearch;
  });

  const topInset = getTabTopInset(insets);
  const bottomInset = getTabBottomInset(insets);

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.push("/livers")}>
          <Ionicons name="search-outline" size={18} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>LIVE & RESERVE</Text>
        <Pressable style={styles.startFabSmall} onPress={() => setModalVisible(true)}>
          <Ionicons name="radio" size={14} color="#fff" />
          <Text style={styles.startFabSmallText}>START</Text>
        </Pressable>
      </View>
      <MetallicLine thickness={1} style={{ marginHorizontal: 16 }} />

      {/* 検索バー（両タブ共通） */}
      <View style={styles.liveSearchWrap}>
        <Ionicons name="search-outline" size={18} color={C.textMuted} />
        <TextInput
          style={styles.liveSearchInput}
          placeholder="ライバー・配信を検索"
          placeholderTextColor={C.textMuted}
          value={liveSearch}
          onChangeText={setLiveSearch}
        />
        {liveSearch.length > 0 && (
          <Pressable onPress={() => setLiveSearch("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabItem, activeTab === "now" && styles.tabItemActive]}
          onPress={() => setActiveTab("now")}
        >
          <Ionicons name="radio-outline" size={13} color={activeTab === "now" ? C.accent : C.textMuted} />
          <Text style={[styles.tabText, activeTab === "now" && styles.tabTextActive]}>LIVE NOW</Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, activeTab === "booking" && styles.tabItemActive]}
          onPress={() => setActiveTab("booking")}
        >
          <Ionicons name="calendar-outline" size={13} color={activeTab === "booking" ? C.accent : C.textMuted} />
          <Text style={[styles.tabText, activeTab === "booking" && styles.tabTextActive]}>メンターセッション</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "now" ? (
          <View>
            {filteredLiveStreams.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>配信中のライバーはいません</Text>
              </View>
            ) : (
              <View style={styles.liveList}>
                {filteredLiveStreams.map((stream: any) => (
                  <Pressable key={stream.id} style={styles.liveStreamCard} onPress={() => router.push(`/live/${stream.id}`)}>
                    <Image source={{ uri: stream.thumbnail }} style={styles.liveStreamThumb} contentFit="cover" />
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                    <View style={styles.viewersBadge}>
                      <Ionicons name="people-outline" size={12} color="#fff" />
                      <Text style={styles.viewersText}>{stream.viewers.toLocaleString()}</Text>
                    </View>
                    <View style={styles.streamInfo}>
                      <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
                      <View style={styles.streamCreatorRow}>
                        <Image source={{ uri: stream.avatar }} style={styles.streamAvatar} contentFit="cover" />
                        <Text style={styles.streamCreator}>{stream.creator}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View style={styles.bookingList}>
              {filteredBookings.map((session) => (
                <BookingCard key={session.id} session={session} />
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 + bottomInset }} />
      </ScrollView>

      <LiveStartModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    flex: 1,
  },
  bookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookingText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: C.accent,
  },
  tabText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: C.accent,
  },
  scroll: {
    flex: 1,
  },
  liveList: {
    gap: 2,
    paddingTop: 2,
  },
  liveStreamCard: {
    position: "relative",
    backgroundColor: C.surface,
  },
  liveStreamThumb: {
    width: "100%",
    height: 220,
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.live,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  viewersBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewersText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  streamInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  streamTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  streamCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streamAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  streamCreator: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: C.textSec,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubText: {
    color: C.textMuted,
    fontSize: 13,
  },
  emptyCtaBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyCtaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  liveSearchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  liveSearchInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 4,
  },
  liveGenreScrollWrap: {
    marginBottom: 12,
  },
  liveGenreScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  liveGenrePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  liveGenrePillActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  liveGenreText: {
    color: C.textSec,
    fontSize: 13,
    fontWeight: "600",
  },
  liveGenreTextActive: {
    color: "#fff",
  },
  startFab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.accent,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  startFabText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  startFabSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.live,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  startFabSmallText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
  },
  modalSub: {
    color: C.textSec,
    fontSize: 12,
    marginTop: 3,
  },
  closeBtn: {
    padding: 4,
  },
  settingLabel: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scopeOptions: {
    gap: 8,
  },
  scopeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  scopeOptionActive: {
    borderColor: C.accent,
  },
  scopeText: {
    gap: 2,
  },
  scopeTitle: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "700",
  },
  scopeTitleActive: {
    color: C.text,
  },
  scopeDesc: {
    color: C.textMuted,
    fontSize: 12,
  },
  feeRow: {
    flexDirection: "row",
    gap: 10,
  },
  feePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
  },
  feePillActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(41, 182, 207, 0.1)",
  },
  feePillText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "700",
  },
  feePillTextActive: {
    color: C.text,
  },
  priceOptions: {
    flexDirection: "row",
    gap: 8,
  },
  pricePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.surface2,
  },
  pricePillActive: {
    backgroundColor: C.accent,
  },
  pricePillText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "700",
  },
  pricePillTextActive: {
    color: "#fff",
  },
  priceDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    backgroundColor: C.surface2,
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  priceDisplayCurrency: {
    color: C.text,
    fontSize: 22,
    fontWeight: "700",
  },
  priceDisplayValue: {
    color: C.text,
    fontSize: 36,
    fontWeight: "800",
  },
  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  revenueLabel: {
    color: C.textMuted,
    fontSize: 12,
  },
  revenueValue: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  previewContainer: {
    flexDirection: "row",
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
    gap: 16,
  },
  previewCamera: {
    flex: 1,
    backgroundColor: C.surface3,
    borderRadius: 10,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewRedDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.live,
  },
  previewComingSoonRibbon: {
    position: "absolute",
    top: 12,
    left: -40,
    paddingHorizontal: 40,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    transform: [{ rotate: "-25deg" }],
  },
  previewComingSoonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  previewStats: {
    gap: 4,
  },
  previewStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewStatLabel: {
    color: C.textSec,
    fontSize: 11,
  },
  previewStatValue: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 22,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
  },
  startDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.live,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  /* Booking category filter */
  bookingCatScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  bookingCatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  bookingCatText: {
    color: C.textSec,
    fontSize: 12,
    fontWeight: "600",
  },
  bookingCatTextActive: {
    color: "#fff",
  },

  /* Booking list */
  bookingList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  bookingCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  bookingThumbContainer: {
    position: "relative",
  },
  bookingThumb: {
    width: "100%",
    height: 150,
  },
  bookingCategoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingCategoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  bookingTagBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: C.orange,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingTagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  bookingCardBody: {
    padding: 12,
    gap: 8,
  },
  bookingCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bookingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bookingCreatorName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  bookingRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  bookingRating: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "700",
  },
  bookingReviewCount: {
    color: C.textMuted,
    fontSize: 11,
  },
  bookingPriceBox: {
    alignItems: "flex-end",
  },
  bookingPrice: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
  },
  bookingPriceSub: {
    color: C.textMuted,
    fontSize: 10,
  },
  bookingTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  bookingMetaRow: {
    flexDirection: "row",
    gap: 14,
  },
  bookingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookingMetaText: {
    color: C.textMuted,
    fontSize: 12,
  },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  bookingSpotsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 5,
  },
  bookingSpotsText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  bookingSpotsSub: {
    color: C.textMuted,
    fontSize: 11,
  },
  bookingProgressBg: {
    height: 4,
    backgroundColor: C.surface3,
    borderRadius: 2,
    overflow: "hidden",
  },
  bookingProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  bookingActionBtn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexShrink: 0,
  },
  bookingBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
