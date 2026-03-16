import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useDemoMode } from "@/lib/demo-mode";
import { C } from "@/constants/colors";

export default function NotFoundScreen() {
  const { isDemoMode } = useDemoMode();

  return (
    <>
      <Stack.Screen options={{ title: "ページが見つかりません" }} />
      <View style={styles.container}>
        {isDemoMode ? (
          <>
            <Text style={styles.title}>このコンテンツはデモ用のため表示できません</Text>
            <Text style={styles.sub}>
              実データでは正常に表示されます。リンク切れはデモモードによるものです。
            </Text>
          </>
        ) : (
          <Text style={styles.title}>ページが見つかりません</Text>
        )}

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>ホームに戻る</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: C.bg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },
  sub: {
    marginTop: 12,
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: C.accent,
    borderRadius: 0,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
