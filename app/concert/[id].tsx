import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, ActivityIndicator, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { C } from "@/constants/colors";
import { useAuth, AuthGuard } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";

type Concert = {
  id: number;
  artistUserId: number;
  title: string;
  venueName: string;
  venueAddress: string;
  concertDate: string;
  ticketUrl?: string | null;
  shootingAllowed: boolean;
  shootingNotes?: string | null;
  artistShare: number;
  photographerShare: number;
  editorShare: number;
  venueShare: number;
  status: string;
};

type StaffRow = {
  id: number;
  concertId: number;
  artistUserId: number;
  staffUserId: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function ConcertDetailScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: concert, isLoading } = useQuery<Concert | null>({
    queryKey: [`/api/concerts/${numericId}`],
    enabled: !Number.isNaN(numericId),
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/concerts/${numericId}`);
      return res.json();
    },
  });

  const isArtist = !!user && !!concert && user.id === concert.artistUserId;

  const { data: staffRequests = [], isLoading: loadingStaff } = useQuery<StaffRow[]>({
    queryKey: [`/api/concerts/${numericId}/staff-req`],
    enabled: !!concert && isArtist,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/concerts/${numericId}/staff-req`);
      return res.json();
    },
  });

  const handleTicket = () => {
    if (!concert?.ticketUrl) return;
    Linking.openURL(concert.ticketUrl);
  };

  const handleUpload = () => {
    router.push({ pathname: "/upload", params: { concertId: String(concert?.id ?? numericId) } });
  };

  const handleStaffRequest = async () => {
    try {
      await apiRequest("POST", `/api/concerts/${numericId}/staff-request`, {});
      Alert.alert("申請を送信しました", "アーティストの承認をお待ちください。");
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "申請に失敗しました");
    }
  };

  const updateStaffStatus = async (staffId: number, action: "approve" | "reject") => {
    try {
      await apiRequest("PATCH", `/api/concerts/${numericId}/staff/${staffId}/${action}`, {});
      await qc.invalidateQueries({ queryKey: [`/api/concerts/${numericId}/staff-req`] });
    } catch (e: any) {
      Alert.alert("エラー", e?.message ?? "更新に失敗しました");
    }
  };

  if (isLoading || !concert) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topInset }]}>
        {isLoading ? <ActivityIndicator size="large" color={C.accent} /> : <Text style={styles.errorText}>公演が見つかりません</Text>}
      </View>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>公演詳細</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{concert.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={C.textMuted} />
            <Text style={styles.infoText}>{concert.venueName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={16} color={C.textMuted} />
            <Text style={styles.infoText}>{concert.venueAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={C.textMuted} />
            <Text style={styles.infoText}>{concert.concertDate}</Text>
          </View>

          <View style={styles.chipRow}>
            <View style={[styles.chip, concert.shootingAllowed ? styles.chipOn : styles.chipOff]}>
              <Ionicons
                name={concert.shootingAllowed ? "camera-outline" : "close-circle-outline"}
                size={14}
                color={concert.shootingAllowed ? "#0C3B2E" : "#5F2120"}
              />
              <Text style={[styles.chipText, concert.shootingAllowed ? styles.chipTextOn : styles.chipTextOff]}>
                {concert.shootingAllowed ? "撮影可" : "撮影不可"}
              </Text>
            </View>
          </View>

          {concert.shootingNotes ? (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>撮影ルール</Text>
              <Text style={styles.boxBody}>{concert.shootingNotes}</Text>
            </View>
          ) : null}

          <View style={styles.box}>
            <Text style={styles.boxTitle}>分配比率</Text>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>アーティスト</Text>
              <Text style={styles.shareValue}>{concert.artistShare}%</Text>
            </View>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>撮影者</Text>
              <Text style={styles.shareValue}>{concert.photographerShare}%</Text>
            </View>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>編集者</Text>
              <Text style={styles.shareValue}>{concert.editorShare}%</Text>
            </View>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>会場</Text>
              <Text style={styles.shareValue}>{concert.venueShare}%</Text>
            </View>
          </View>

          {concert.ticketUrl ? (
            <Pressable style={styles.primaryBtn} onPress={handleTicket}>
              <Ionicons name="ticket-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>チケットを購入する</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.secondaryBtn} onPress={handleUpload}>
            <Ionicons name="cloud-upload-outline" size={18} color={C.accent} />
            <Text style={styles.secondaryBtnText}>この公演の動画をアップロード</Text>
          </Pressable>

          {!isArtist && (
            <Pressable style={styles.outlineBtn} onPress={handleStaffRequest}>
              <Ionicons name="people-outline" size={16} color={C.text} />
              <Text style={styles.outlineBtnText}>この公演の公認スタッフ申請を送る</Text>
            </Pressable>
          )}

          {isArtist && (
            <View style={{ marginTop: 28 }}>
              <Text style={styles.sectionTitle}>公認スタッフ申請</Text>
              {loadingStaff ? (
                <ActivityIndicator size="small" color={C.accent} />
              ) : staffRequests.length === 0 ? (
                <Text style={styles.emptyText}>現在申請はありません。</Text>
              ) : (
                staffRequests.map((s) => (
                  <View key={s.id} style={styles.staffCard}>
                    <View style={styles.staffHeader}>
                      <Text style={styles.staffTitle}>スタッフID: {s.staffUserId}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusText}>{s.status}</Text>
                      </View>
                    </View>
                    <View style={styles.staffActions}>
                      <Pressable
                        style={[styles.staffBtn, styles.approveBtn]}
                        onPress={() => updateStaffStatus(s.id, "approve")}
                      >
                        <Text style={styles.staffBtnText}>承認</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.staffBtn, styles.rejectBtn]}
                        onPress={() => updateStaffStatus(s.id, "reject")}
                      >
                        <Text style={styles.staffBtnText}>却下</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  errorText: { color: C.text, fontSize: 14 },
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
    borderRadius: 0,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "700", color: C.text, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: C.textSec },
  chipRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 12 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0 },
  chipOn: { backgroundColor: "#C8E6C9" },
  chipOff: { backgroundColor: "#FFCDD2" },
  chipText: { fontSize: 11, fontWeight: "600" },
  chipTextOn: { color: "#0C3B2E" },
  chipTextOff: { color: "#5F2120" },
  box: {
    marginTop: 8,
    padding: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  boxTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 4 },
  boxBody: { fontSize: 13, color: C.textSec },
  shareRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  shareLabel: { fontSize: 13, color: C.textSec },
  shareValue: { fontSize: 13, color: C.text, fontWeight: "700" },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: C.live,
    paddingVertical: 12,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.accent,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: { color: C.accent, fontSize: 13, fontWeight: "700" },
  outlineBtn: {
    marginTop: 16,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  outlineBtnText: { color: C.textSec, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: C.textMuted },
  staffCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  staffTitle: { fontSize: 13, color: C.text },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusText: { fontSize: 11, color: C.textMuted },
  staffActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  staffBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
  },
  approveBtn: { backgroundColor: C.accent },
  rejectBtn: { backgroundColor: C.live },
  staffBtnText: { fontSize: 12, color: "#fff", fontWeight: "600" },
});

