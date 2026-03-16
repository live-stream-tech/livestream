import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { C } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useAuth } from "@/lib/auth";

type LiveStream = {
  id: number;
  title: string;
  creator: string;
  avatar: string;
  thumbnail: string;
  viewers: number;
  category: string;
  fee: string;
  price: number | null;
};

type ChatMsg = {
  id: number;
  username: string;
  avatar: string | null;
  message: string;
  isGift: boolean;
  giftAmount: number | null;
  createdAt: string;
};

const GIFT_OPTIONS = [
  { amount: 100, label: "¥100", emoji: "🌸" },
  { amount: 500, label: "¥500", emoji: "⭐" },
  { amount: 1000, label: "¥1,000", emoji: "💎" },
  { amount: 5000, label: "¥5,000", emoji: "👑" },
];

function PulseDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.6, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.liveDot, { transform: [{ scale: anim }] }]} />
  );
}

type TwoshotBooking = {
  id: number;
  queuePosition: number;
  status: string;
  userName: string;
  userId: string;
};

/** デモモード用：API が空のときのフォールバック（DUMMY_LIVE と対応） */
const DEMO_LIVE_STREAMS: Record<number, LiveStream> = {
  1: { id: 1, title: "星空みゆ♪ 歌とダンスでお届け！", creator: "星空みゆ", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop", viewers: 1240, category: "idol", fee: "無料", price: null },
  2: { id: 2, title: "麗華の夜トーク【本音で語るよ】", creator: "麗華 -REIKA-", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop", thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop", viewers: 890, category: "idol", fee: "無料", price: null },
  3: { id: 3, title: "朝活！一緒にヨガしよう🧘", creator: "ヨガ講師 なな", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop", thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop", viewers: 420, category: "coaching", fee: "無料", price: null },
  4: { id: 4, title: "神崎リナ【深夜の占いタイム🔮】", creator: "神崎 リナ", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop", viewers: 312, category: "fortune", fee: "無料", price: null },
};

export default function LiveStreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamId = parseInt(id ?? "1");
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [chatInput, setChatInput] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showTwoshotNotif, setShowTwoshotNotif] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { user, requireAuth } = useAuth();

  const myUserId = user ? `user-${user.id}` : "guest";
  const myUsername = user?.name ?? "ゲスト";

  const { data: apiStream } = useQuery<LiveStream>({
    queryKey: [`/api/live-streams/${streamId}`],
    refetchInterval: 10000,
  });

  const stream = apiStream ?? DEMO_LIVE_STREAMS[streamId];

  const { data: chat = [] } = useQuery<ChatMsg[]>({
    queryKey: [`/api/live-streams/${streamId}/chat`],
    refetchInterval: 3000,
  });

  const { data: myBooking } = useQuery<TwoshotBooking | null>({
    queryKey: [`/api/twoshot/${streamId}/bookings`],
    refetchInterval: 5000,
    select: (bookings: TwoshotBooking[]) =>
      bookings.find((b) => b.userId === myUserId) ?? null,
  });

  useEffect(() => {
    if (myBooking?.status === "notified" && !showTwoshotNotif) {
      setShowTwoshotNotif(true);
      Animated.spring(notifAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
    }
  }, [myBooking?.status]);

  const chatMutation = useMutation({
    mutationFn: ({ message, isGift, giftAmount }: { message: string; isGift?: boolean; giftAmount?: number }) =>
      apiRequest("POST", `/api/live-streams/${streamId}/chat`, {
        username: myUsername,
        avatar: user?.avatar ?? user?.profileImageUrl ?? null,
        message, isGift: isGift ?? false, giftAmount: giftAmount ?? null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/live-streams/${streamId}/chat`] }),
  });

  const sendChat = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    if (!requireAuth("コメント")) return;
    setChatInput("");
    chatMutation.mutate({ message: msg });
  }, [chatInput, requireAuth]);

  const sendGift = useCallback((amount: number, emoji: string) => {
    if (!requireAuth("投げ銭")) return;
    setShowGiftModal(false);
    chatMutation.mutate({
      message: `${emoji} ¥${amount.toLocaleString()} ギフトを贈りました！`,
      isGift: true,
      giftAmount: amount,
    });
  }, [requireAuth]);

  useEffect(() => {
    if (chat.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chat.length]);

  if (!stream) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        {/* Stream Thumbnail / Player */}
        <View style={[styles.player, { paddingTop: topInset }]}>
          <Image source={{ uri: stream.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.playerDimmer} />

          {/* Top bar */}
          <View style={[styles.playerTop, { paddingTop: topInset + 8 }]}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.liveBadge}>
              <PulseDot />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <View style={styles.viewersBadge}>
              <Ionicons name="people" size={13} color="#fff" />
              <Text style={styles.viewersText}>{(stream.viewers).toLocaleString()}</Text>
            </View>
          </View>

          {/* Creator info + title at bottom of player */}
          <View style={styles.playerBottom}>
            <View style={styles.creatorRow}>
              <Image source={{ uri: stream.avatar }} style={styles.creatorAvatar} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
                <Text style={styles.creatorName}>{stream.creator}</Text>
              </View>
              <Pressable style={styles.followBtn}>
                <Text style={styles.followBtnText}>フォロー</Text>
              </Pressable>
            </View>
            {stream.price && (
              <View style={styles.paidBadge}>
                <Ionicons name="lock-closed" size={10} color={C.orange} />
                <Text style={styles.paidText}>有料 ¥{stream.price.toLocaleString()}</Text>
              </View>
            )}
            {/* Twoshot booking button */}
            {myBooking ? (
              <View style={styles.twoshotBooked}>
                <Ionicons name="camera" size={12} color={C.accent} />
                <Text style={styles.twoshotBookedText}>個別セッション予約済み {myBooking.queuePosition}番</Text>
              </View>
            ) : (
              <Pressable
                style={styles.twoshotBtn}
                onPress={() => router.push(`/twoshot-booking/${streamId}`)}
              >
                <Ionicons name="camera-outline" size={13} color="#fff" />
                <Text style={styles.twoshotBtnText}>個別セッション</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Twoshot turn notification */}
        {showTwoshotNotif && (
          <Animated.View
            style={[
              styles.twoshotNotif,
              {
                transform: [{ scale: notifAnim }],
                opacity: notifAnim,
              },
            ]}
          >
            <View style={styles.twoshotNotifInner}>
              <View style={styles.twoshotNotifIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.twoshotNotifTitle}>あなたの番です！</Text>
                <Text style={styles.twoshotNotifBody}>個別セッションを開始してください</Text>
              </View>
              <Pressable onPress={() => setShowTwoshotNotif(false)}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Watermark overlay (when twoshot notified/active) */}
        {myBooking?.status === "notified" && (
          <View style={styles.watermarkOverlay} pointerEvents="none">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Text
                key={i}
                style={[
                  styles.watermarkText,
                  {
                    top: `${15 + i * 16}%` as any,
                    left: i % 2 === 0 ? "5%" : "30%",
                    transform: [{ rotate: "-25deg" }],
                  },
                ]}
              >
                {MY_USER_ID} • RawStock
              </Text>
            ))}
          </View>
        )}

        {/* Chat area */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <Ionicons name="chatbubbles-outline" size={13} color={C.accent} />
            <Text style={styles.chatHeaderText}>ライブコメント</Text>
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={11} color={C.green} />
              <Text style={styles.joinedText}>参加中</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={chat}
            keyExtractor={(item) => item.id.toString()}
            style={styles.chatList}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              item.isGift ? (
                <View style={styles.giftBubble}>
                  <View style={styles.giftLeft}>
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.chatAvatar, { backgroundColor: C.surface3 }]} />
                    )}
                  </View>
                  <View style={styles.giftContent}>
                    <Text style={styles.giftUsername}>{item.username}</Text>
                    <Text style={styles.giftMessage}>{item.message}</Text>
                    {item.giftAmount && (
                      <Text style={styles.giftAmount}>¥{item.giftAmount.toLocaleString()}</Text>
                    )}
                  </View>
                </View>
              ) : (
                <View style={[styles.chatMsg, item.username === "あなた" && styles.chatMsgMine]}>
                  {item.username !== "あなた" && (
                    item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.chatAvatar, { backgroundColor: C.surface3 }]} />
                    )
                  )}
                  <View style={[styles.chatBubble, item.username === "あなた" && styles.chatBubbleMine]}>
                    {item.username !== "あなた" && (
                      <Text style={styles.chatUsername}>{item.username}</Text>
                    )}
                    <Text style={[styles.chatText, item.username === "あなた" && styles.chatTextMine]}>
                      {item.message}
                    </Text>
                  </View>
                </View>
              )
            )}
          />
        </View>

        {/* Input row */}
        <View style={[styles.inputRow, { paddingBottom: bottomInset + 8 }]}>
          <Pressable style={styles.giftBtn} onPress={() => setShowGiftModal(true)}>
            <Ionicons name="gift" size={18} color={C.orange} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="コメントを入力..."
            placeholderTextColor={C.textMuted}
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendChat}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.sendBtn, !chatInput.trim() && styles.sendBtnOff]}
            onPress={sendChat}
          >
            <Ionicons name="send" size={15} color="#fff" />
          </Pressable>
        </View>

        {/* Gift modal */}
        <Modal visible={showGiftModal} transparent animationType="slide">
          <Pressable style={styles.giftModalBg} onPress={() => setShowGiftModal(false)}>
            <Pressable style={[styles.giftModalSheet, { paddingBottom: bottomInset + 16 }]} onPress={() => {}}>
              <View style={styles.giftModalHandle} />
              <Text style={styles.giftModalTitle}>ギフトを贈る</Text>
              <Text style={styles.giftModalSub}>クリエイターを直接応援しよう</Text>
              <View style={styles.giftGrid}>
                {GIFT_OPTIONS.map((g) => (
                  <Pressable key={g.amount} style={styles.giftOption} onPress={() => sendGift(g.amount, g.emoji)}>
                    <Text style={styles.giftEmoji}>{g.emoji}</Text>
                    <Text style={styles.giftOptionLabel}>{g.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1218" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: C.textMuted, fontSize: 14 },

  player: {
    height: 240,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  playerDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  playerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.live,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  viewersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: "auto" as any,
  },
  viewersText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  playerBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    gap: 6,
    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
  },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  creatorAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  streamTitle: { color: "#fff", fontSize: 13, fontWeight: "700", lineHeight: 17 },
  creatorName: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 },
  followBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  followBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,139,0,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.orange + "55",
  },
  paidText: { color: C.orange, fontSize: 10, fontWeight: "600" },

  chatSection: { flex: 1, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  chatHeaderText: { color: C.accent, fontSize: 11, fontWeight: "700", flex: 1 },
  joinedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  joinedText: { color: C.green, fontSize: 10, fontWeight: "600" },

  chatList: { flex: 1 },
  chatContent: { paddingHorizontal: 12, paddingVertical: 4, gap: 6 },

  chatMsg: { flexDirection: "row", alignItems: "flex-end", gap: 6, maxWidth: "85%" },
  chatMsgMine: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  chatAvatar: { width: 24, height: 24, borderRadius: 12 },
  chatBubble: {
    backgroundColor: C.surface2,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 1,
  },
  chatBubbleMine: {
    backgroundColor: C.accentDark,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
  },
  chatUsername: { color: C.accent, fontSize: 10, fontWeight: "700" },
  chatText: { color: C.text, fontSize: 13, lineHeight: 18 },
  chatTextMine: { color: "#fff" },

  giftBubble: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,139,0,0.12)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: C.orange + "55",
  },
  giftLeft: {},
  giftContent: { flex: 1 },
  giftUsername: { color: C.orange, fontSize: 11, fontWeight: "700", marginBottom: 2 },
  giftMessage: { color: C.text, fontSize: 13, lineHeight: 18 },
  giftAmount: { color: C.orange, fontSize: 15, fontWeight: "800", marginTop: 2 },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
    alignItems: "center",
  },
  giftBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.orange + "55",
  },
  input: {
    flex: 1,
    height: 38,
    backgroundColor: C.surface,
    borderRadius: 19,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnOff: { backgroundColor: C.surface2 },

  giftModalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  giftModalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  giftModalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 16 },
  giftModalTitle: { color: C.text, fontSize: 18, fontWeight: "800", textAlign: "center" },
  giftModalSub: { color: C.textMuted, fontSize: 12, textAlign: "center", marginTop: 4, marginBottom: 20 },
  giftGrid: { flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 8 },
  giftOption: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.orange + "44",
  },
  giftEmoji: { fontSize: 28 },
  giftOptionLabel: { color: C.orange, fontSize: 13, fontWeight: "700" },

  twoshotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(229,57,53,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  twoshotBtnText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  twoshotBooked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(41,182,207,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.accent + "66",
  },
  twoshotBookedText: { color: C.accent, fontSize: 11, fontWeight: "700" },
  twoshotNotif: {
    position: "absolute",
    left: 12,
    right: 12,
    top: "30%",
    zIndex: 100,
    borderRadius: 16,
    overflow: "hidden",
  },
  twoshotNotifInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.live,
    padding: 16,
  },
  twoshotNotifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  twoshotNotifTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  twoshotNotifBody: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  watermarkText: {
    position: "absolute",
    color: "rgba(255,255,255,0.12)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
