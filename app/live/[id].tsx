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

export default function LiveStreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamId = parseInt(id ?? "1");
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [chatInput, setChatInput] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [joined, setJoined] = useState(true);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: stream } = useQuery<LiveStream>({
    queryKey: [`/api/live-streams/${streamId}`],
    refetchInterval: 10000,
  });

  const { data: chat = [] } = useQuery<ChatMsg[]>({
    queryKey: [`/api/live-streams/${streamId}/chat`],
    refetchInterval: 3000,
  });

  const chatMutation = useMutation({
    mutationFn: ({ message, isGift, giftAmount }: { message: string; isGift?: boolean; giftAmount?: number }) =>
      apiRequest("POST", `/api/live-streams/${streamId}/chat`, {
        username: "あなた",
        avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop",
        message, isGift: isGift ?? false, giftAmount: giftAmount ?? null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/live-streams/${streamId}/chat`] }),
  });

  const sendChat = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput("");
    chatMutation.mutate({ message: msg });
  }, [chatInput]);

  const sendGift = useCallback((amount: number, emoji: string) => {
    setShowGiftModal(false);
    chatMutation.mutate({
      message: `${emoji} ¥${amount.toLocaleString()} ギフトを贈りました！`,
      isGift: true,
      giftAmount: amount,
    });
  }, []);

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
          </View>
        </View>

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
});
