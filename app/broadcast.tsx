import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";

const FILTERS = [
  { id: "none", label: "なし", icon: "ban-outline", css: "" },
  { id: "beauty", label: "美肌", icon: "sparkles-outline", css: "brightness(1.05) saturate(1.1)" },
  { id: "smooth", label: "つるつる", icon: "water-outline", css: "contrast(0.9) brightness(1.1) saturate(0.95)" },
  { id: "warm", label: "暖色", icon: "sunny-outline", css: "sepia(0.3) saturate(1.2) brightness(1.05)" },
  { id: "cool", label: "クール", icon: "snow-outline", css: "hue-rotate(15deg) saturate(1.1) brightness(0.98)" },
  { id: "vivid", label: "鮮明", icon: "color-palette-outline", css: "saturate(1.5) contrast(1.05)" },
];

export default function BroadcastScreen() {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [title, setTitle] = useState("");
  const [viewers, setViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [streamReady, setStreamReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewersRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      viewersRef.current = setInterval(() => {
        setViewers((v) => {
          const delta = Math.floor(Math.random() * 20) - 5;
          return Math.max(0, v + delta + 3);
        });
      }, 2000);
    } else {
      blinkAnim.stopAnimation();
      blinkAnim.setValue(1);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (viewersRef.current) clearInterval(viewersRef.current);
      if (!isLive) { setElapsed(0); setViewers(0); }
    }
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (viewersRef.current) clearInterval(viewersRef.current);
    };
  }, [isLive]);

  const startCamera = async () => {
    if (Platform.OS !== "web") return;
    try {
      const stream = await (navigator as any).mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamReady(true);
      }
    } catch {
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (Platform.OS !== "web") return;
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t: MediaStreamTrack) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const currentFilter = FILTERS.find((f) => f.id === selectedFilter);

  const handleGoLive = () => {
    if (!title.trim()) {
      Alert.alert("タイトルを入力してください", "配信タイトルを入力してから開始してください。");
      return;
    }
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 30) + 10);
  };

  const handleStop = () => {
    Alert.alert("配信を終了", "ライブ配信を終了しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "終了する",
        style: "destructive",
        onPress: () => {
          setIsLive(false);
          stopCamera();
          router.back();
        },
      },
    ]);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraArea}>
        {Platform.OS === "web" ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: currentFilter?.css || "",
              transform: "scaleX(-1)",
              display: "block",
            }}
          />
        ) : (
          <View style={styles.nativeCameraPlaceholder}>
            <Ionicons name="videocam" size={60} color={C.accent} />
            <Text style={styles.placeholderText}>カメラプレビュー</Text>
            <Text style={styles.placeholderSub}>実機でカメラが表示されます</Text>
          </View>
        )}

        {cameraError && (
          <View style={styles.cameraErrorOverlay}>
            <Ionicons name="videocam-off-outline" size={48} color="#ffffff88" />
            <Text style={styles.cameraErrorText}>カメラへのアクセスが必要です</Text>
            <Text style={styles.cameraErrorSub}>ブラウザの設定でカメラを許可してください</Text>
          </View>
        )}

        {/* Top overlay */}
        <View style={[styles.topOverlay, { paddingTop: topInset + 8 }]}>
          <Pressable style={styles.closeButton} onPress={() => {
            if (isLive) handleStop(); else { stopCamera(); router.back(); }
          }}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>

          <View style={styles.topCenter}>
            {isLive ? (
              <>
                <Animated.View style={[styles.liveBadge, { opacity: blinkAnim }]}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </Animated.View>
                <Text style={styles.elapsedText}>{formatTime(elapsed)}</Text>
              </>
            ) : (
              <Text style={styles.readyText}>配信待機中</Text>
            )}
          </View>

          {isLive ? (
            <View style={styles.viewersBadge}>
              <Ionicons name="people" size={14} color="#fff" />
              <Text style={styles.viewersText}>{viewers.toLocaleString()}</Text>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Filter buttons */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const isActive = selectedFilter === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setSelectedFilter(f.id)}
              >
                <Ionicons name={f.icon as any} size={16} color={isActive ? "#fff" : "#ffffff99"} />
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: bottomInset + 12 }]}>
        {!isLive && (
          <View style={styles.titleRow}>
            <Ionicons name="create-outline" size={16} color={C.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.titleInput}
              placeholder="配信タイトルを入力"
              placeholderTextColor={C.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
          </View>
        )}

        {isLive ? (
          <View style={styles.liveControls}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={16} color={C.accent} />
                <Text style={styles.statValue}>{viewers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>視聴者</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={C.accent} />
                <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
                <Text style={styles.statLabel}>経過時間</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="card-outline" size={16} color={C.green} />
                <Text style={[styles.statValue, { color: C.green }]}>¥{(viewers * 5).toLocaleString()}</Text>
                <Text style={styles.statLabel}>収益</Text>
              </View>
            </View>
            <Pressable style={styles.stopBtn} onPress={handleStop}>
              <View style={styles.stopDot} />
              <Text style={styles.stopBtnText}>配信を終了</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.goLiveBtn, (!title.trim()) && styles.goLiveBtnDisabled]}
            onPress={handleGoLive}
          >
            <View style={styles.goLiveDot} />
            <Text style={styles.goLiveBtnText}>ライブ配信を開始</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  cameraArea: { flex: 1, backgroundColor: "#000", overflow: "hidden" },
  nativeCameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d1b2a",
    gap: 12,
  },
  placeholderText: { color: C.text, fontSize: 18, fontWeight: "700" },
  placeholderSub: { color: C.textMuted, fontSize: 13 },

  cameraErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 10,
  },
  cameraErrorText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cameraErrorSub: { color: "#ffffff88", fontSize: 13, textAlign: "center", paddingHorizontal: 24 },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.live,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  liveBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  elapsedText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  readyText: { color: "#ffffffcc", fontSize: 14, fontWeight: "600" },
  viewersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewersText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  filterRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  filterBtn: {
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: {
    backgroundColor: "rgba(41,182,207,0.35)",
    borderColor: C.accent,
  },
  filterLabel: { color: "#ffffff88", fontSize: 10, fontWeight: "600" },
  filterLabelActive: { color: "#fff" },

  controls: {
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  titleInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },

  goLiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.live,
    borderRadius: 14,
    paddingVertical: 15,
  },
  goLiveBtnDisabled: { opacity: 0.5 },
  goLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  goLiveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },

  liveControls: { gap: 12 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statDivider: { width: 1, height: 36, backgroundColor: C.border },
  statValue: { color: C.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: C.textMuted, fontSize: 11 },

  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5393522",
  },
  stopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E53935" },
  stopBtnText: { color: "#E53935", fontSize: 15, fontWeight: "700" },
});
