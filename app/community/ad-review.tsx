import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useAuth } from "@/lib/auth";
import { C } from "@/constants/colors";

type ReviewAd = {
  id: number;
  communityId: number;
  communityName: string;
  companyName: string;
  contactName: string;
  email: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  status: string;
  isOwner: boolean;
};

export default function CommunityAdReviewScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [detailAd, setDetailAd] = useState<ReviewAd | null>(null);

  const { data: list = [], isLoading } = useQuery<ReviewAd[]>({
    queryKey: ["/api/community-ads/review", token],
    enabled: !!token,
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/community-ads/review", baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("一覧を取得できませんでした");
      return res.json();
    },
  });

  const runAction = async (id: number, action: "moderator-approve" | "approve" | "reject") => {
    setActioningId(id);
    try {
      await apiRequest("PATCH", `/api/community-ads/${id}/${action}`);
      setDetailAd(null);
      queryClient.invalidateQueries({ queryKey: ["/api/community-ads/review"] });
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "処理に失敗しました");
    } finally {
      setActioningId(null);
    }
  };

  const handleModApprove = (ad: ReviewAd) => {
    Alert.alert("仮承認", "モデレーターとして仮承認しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "承認", onPress: () => runAction(ad.id, "moderator-approve") },
    ]);
  };

  const handleOwnerApprove = (ad: ReviewAd) => {
    Alert.alert("最終承認", "管理人として承認して出稿を確定しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "承認", onPress: () => runAction(ad.id, "approve") },
    ]);
  };

  const handleReject = (ad: ReviewAd) => {
    Alert.alert("却下", "この申し込みを却下しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "却下", style: "destructive", onPress: () => runAction(ad.id, "reject") },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>広告審査</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>管理人・モデレーターとして審査待ちの申し込み一覧です。</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 24 }} />
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={C.textMuted} />
            <Text style={styles.emptyText}>審査待ちの申し込みはありません</Text>
          </View>
        ) : (
          list.map((ad) => (
            <Pressable key={ad.id} style={styles.card} onPress={() => setDetailAd(ad)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardCommunity}>{ad.communityName}</Text>
                <View style={[styles.statusBadge, ad.status === "moderator_approved" && styles.statusModApproved]}>
                  <Text style={styles.statusText}>
                    {ad.status === "pending" ? "モデレーター承認待ち" : "管理人承認待ち"}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardCompany}>{ad.companyName}</Text>
              <Text style={styles.cardMeta}>
                {ad.startDate} 〜 {ad.endDate} · {ad.totalAmount.toLocaleString()}円
              </Text>
              <View style={styles.cardActions}>
                {ad.status === "pending" && !ad.isOwner && (
                  <Pressable
                    style={[styles.btn, styles.btnApprove]}
                    onPress={() => handleModApprove(ad)}
                    disabled={actioningId === ad.id}
                  >
                    {actioningId === ad.id ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={16} color="#fff" />}
                    <Text style={styles.btnText}>仮承認</Text>
                  </Pressable>
                )}
                {ad.status === "moderator_approved" && ad.isOwner && (
                  <Pressable
                    style={[styles.btn, styles.btnApprove]}
                    onPress={() => handleOwnerApprove(ad)}
                    disabled={actioningId === ad.id}
                  >
                    {actioningId === ad.id ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark-done" size={16} color="#fff" />}
                    <Text style={styles.btnText}>承認</Text>
                  </Pressable>
                )}
                {(ad.status === "pending" || ad.status === "moderator_approved") && (
                  <Pressable
                    style={[styles.btn, styles.btnReject]}
                    onPress={() => handleReject(ad)}
                    disabled={actioningId === ad.id}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.btnText}>却下</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={!!detailAd} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setDetailAd(null)}>
          {detailAd && (
            <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>申し込み詳細</Text>
                <Pressable onPress={() => setDetailAd(null)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.modalRow}>コミュニティ: {detailAd.communityName}</Text>
              <Text style={styles.modalRow}>会社名: {detailAd.companyName}</Text>
              <Text style={styles.modalRow}>担当者: {detailAd.contactName}</Text>
              <Text style={styles.modalRow}>メール: {detailAd.email}</Text>
              <Text style={styles.modalRow}>掲載期間: {detailAd.startDate} 〜 {detailAd.endDate}</Text>
              <Text style={styles.modalRow}>合計: {detailAd.totalAmount.toLocaleString()}円</Text>
              {detailAd.bannerUrl ? (
                <View style={styles.modalBannerWrap}>
                  <Image source={{ uri: detailAd.bannerUrl }} style={styles.modalBanner} contentFit="cover" />
                </View>
              ) : null}
              <View style={styles.modalActions}>
                {detailAd.status === "pending" && !detailAd.isOwner && (
                  <Pressable style={[styles.modalBtn, styles.btnApprove]} onPress={() => { handleModApprove(detailAd); setDetailAd(null); }}>
                    <Text style={styles.btnText}>仮承認</Text>
                  </Pressable>
                )}
                {detailAd.status === "moderator_approved" && detailAd.isOwner && (
                  <Pressable style={[styles.modalBtn, styles.btnApprove]} onPress={() => { handleOwnerApprove(detailAd); setDetailAd(null); }}>
                    <Text style={styles.btnText}>承認</Text>
                  </Pressable>
                )}
                {(detailAd.status === "pending" || detailAd.status === "moderator_approved") && (
                  <Pressable style={[styles.modalBtn, styles.btnReject]} onPress={() => { handleReject(detailAd); setDetailAd(null); }}>
                    <Text style={styles.btnText}>却下</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  intro: { color: C.textSec, fontSize: 13, marginBottom: 16 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { color: C.textMuted, fontSize: 14 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 0,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardCommunity: { color: C.accent, fontSize: 12, fontWeight: "700" },
  statusBadge: { backgroundColor: C.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 0 },
  statusModApproved: { backgroundColor: C.accent + "33" },
  statusText: { color: C.textSec, fontSize: 11, fontWeight: "600" },
  cardCompany: { color: C.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  cardMeta: { color: C.textMuted, fontSize: 12, marginBottom: 10 },
  cardActions: { flexDirection: "row", gap: 8 },
  btn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 0 },
  btnApprove: { backgroundColor: C.green },
  btnReject: { backgroundColor: C.live },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalBox: { width: "100%", maxWidth: 400, backgroundColor: C.surface, borderRadius: 0, padding: 20, borderWidth: 1, borderColor: C.border },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { color: C.text, fontSize: 17, fontWeight: "800" },
  modalRow: { color: C.textSec, fontSize: 14, marginBottom: 6 },
  modalBannerWrap: { marginTop: 12, borderRadius: 0, overflow: "hidden", height: 100 },
  modalBanner: { width: "100%", height: "100%" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 0, alignItems: "center" },
});
