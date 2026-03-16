import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C } from "@/constants/colors";

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.article}>
      <Text style={styles.articleTitle}>{title}</Text>
      <Text style={styles.articleBody}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>プライバシーポリシー</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.docTitle}>RawStock プライバシーポリシー</Text>
        <Text style={styles.effectiveDate}>制定日：2026年3月13日</Text>

        <Article title="第1条（取得する情報）">
          LINEアカウント情報、メールアドレス、投稿コンテンツ、利用履歴・ログ、決済情報（カード番号は保持しません）。
        </Article>

        <Article title="第2条（利用目的）">
          サービス提供・改善、問い合わせ対応、不正利用検知、通知、統計データ作成。
        </Article>

        <Article title="第3条（第三者提供）">
          同意がある場合・法令に基づく場合・生命保護・公衆衛生の場合を除き、第三者に提供しません。
        </Article>

        <Article title="第4条（委託）">
          Neon Inc.（DB）、Cloudflare, Inc.（ストレージ）、LINE株式会社（認証）に委託することがあります。
        </Article>

        <Article title="第5条（Cookie・解析ツール）">
          サービス改善のため利用します。ブラウザ設定で無効化可能です。
        </Article>

        <Article title="第6条（安全管理）">
          適切な安全管理措置を講じます。
        </Article>

        <Article title="第7条（開示・訂正・削除）">
          rawstock.infomation@gmail.com に請求可能です。本人確認の上、対応いたします。
        </Article>

        <Article title="第8条（未成年者）">
          18歳未満の方は、保護者の同意が必要です。
        </Article>

        <Article title="第9条（ポリシーの変更）">
          重要な変更は、サービス上でお知らせします。
        </Article>

        <Article title="第10条（お問い合わせ）">
          氏名：鹿之賦 宏美{"\n"}
          住所：〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C{"\n"}
          メール：rawstock.infomation@gmail.com{"\n\n"}
          制定日：2026年3月13日
        </Article>

        <View style={{ height: 80 }} />
      </ScrollView>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  docTitle: { fontSize: 20, fontWeight: "700", color: C.text, marginBottom: 8, textAlign: "center" },
  effectiveDate: { fontSize: 13, color: C.textMuted, marginBottom: 20, textAlign: "center" },
  article: { marginBottom: 24 },
  articleTitle: { fontSize: 16, fontWeight: "700", color: C.accent, marginBottom: 10 },
  articleBody: { fontSize: 14, lineHeight: 22, color: C.textSec },
});
