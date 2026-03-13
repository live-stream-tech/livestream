import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

const COLORS = {
  bg: "#FFFFFF",
  mastheadBg: "#1B2838",
  text: "#1B2838",
  accent: "#29B6CF",
  emphasis: "#E53935",
  highlight: "#FFD600",
  subtext: "#546A82",
  border: "#e0e8f0",
  surface: "#f4f8fb",
};

type SectionProps = {
  id?: string;
  label?: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, label, title, children }: SectionProps) {
  return (
    <View style={styles.section} nativeID={id}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PrimaryButton({
  children,
  variant = "primary",
  onPress,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  onPress?: () => void;
}) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          isOutline ? styles.buttonTextOutline : styles.buttonTextPrimary,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export default function LpScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
      >
        {/* Masthead / Hero */}
        <View style={styles.masthead}>
          <View style={styles.mastheadInner}>
            <View style={styles.mastheadTopRow}>
              <View style={styles.logoRow}>
                <Image
                  source={require("../logo-200x70-v2.png")}
                  resizeMode="contain"
                  style={styles.logo}
                />
              </View>
              <Text style={styles.mastheadTagline}>
                LIVE &amp; COMMUNITY PLATFORM / JAPAN 2026
              </Text>
            </View>

            <View
              style={[
                styles.heroRow,
                isWide ? styles.heroRowWide : styles.heroRowStacked,
              ]}
            >
              <View style={styles.heroTextCol}>
                <Text style={styles.heroKicker}>RawStock / Creator Revenue</Text>
                <Text style={styles.heroTitle}>
                  <Text style={styles.heroTitleMain}>AIに作れないものを、</Text>
                  {"\n"}
                  <Text style={styles.heroTitleAccent}>売れる場所。</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                  還元率<Text style={styles.heroSubtitleStrong}>90%</Text>。これが個人開発にしかできないこと。
                </Text>
                <Text style={styles.heroBody}>
                  YouTubeは55%、TikTokは30%。大手プラットフォームはクリエイターの売上の半分近くを持っていく。
                  RawStockは違う。有料動画は売上の90%があなたの手元に残る。手数料は受け取る側じゃなく、払う側が負担する。
                  個人開発だから、大手の論理じゃなくクリエイターの論理で作れた。
                </Text>
                <View style={styles.heroCtas}>
                  <PrimaryButton onPress={() => router.push("/auth/register")}>
                    無料で始める
                  </PrimaryButton>
                  <PrimaryButton variant="outline" onPress={() => router.push("/lp#contact")}>
                    資料請求・お問い合わせ
                  </PrimaryButton>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FOR YOU */}
        <Section id="for-you" title="こんな人のために作りました。">
          <View style={styles.cardsGrid}>
            {[
              {
                title: "インディーズバンド・アーティスト",
                body: "現場の熱量を動画にして売る。",
              },
              { title: "ライバー", body: "生配信で最大95%還元。" },
              {
                title: "メンタルコーチ・講師",
                body: "有料コンテンツを高還元で販売。",
              },
              {
                title: "動画編集者",
                body: "編集依頼を受けて稼ぐ。",
              },
              {
                title: "コミュニティ管理人",
                body: "広告収益の70%がコミュニティへ。",
              },
            ].map((item) => (
              <View key={item.title} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* CONCEPT */}
        <Section title="生の瞬間には、2種類ある。">
          <Text style={styles.paragraph}>
            ひとつは現場レポート。ライブハウス、劇場、フェス。その場にいた人だけが撮れる映像を、有料コンテンツとして販売する。
            AIには絶対に作れない、一度きりの記録。
          </Text>
          <Text style={styles.paragraph}>
            もうひとつはリアルタイム生配信。コメント、投げ銭、ファンとのリアルな交流。その熱量ごとアーカイブとして積み上げていく。
          </Text>
          <Text style={styles.paragraph}>
            どちらも流れて消えるんじゃなく、積み上がる資産になる。それがRawStockの設計思想です。
          </Text>
        </Section>

        {/* NUMBERS */}
        <Section title="数字で見るRawStock。">
          <View style={styles.numbersRow}>
            {[
              {
                label: "有料動画",
                value: "90%",
                caption: "売上の90%があなたへ",
              },
              {
                label: "ライブ配信",
                value: "95%",
                caption: "最大95%還元",
              },
              {
                label: "手数料設計",
                value: "0%",
                caption: "手数料は受け取り側ではなく\n払う側が負担する",
              },
            ].map((n) => (
              <View key={n.label} style={styles.numberCard}>
                <Text style={styles.numberLabel}>{n.label}</Text>
                <Text style={styles.numberValue}>{n.value}</Text>
                <Text style={styles.numberCaption}>{n.caption}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* REVENUE */}
        <Section title="稼ぎ方は一つじゃない。">
          {[
            "有料動画販売：売上90%還元。編集者・撮影者・出演者への分配設定も自由。",
            "ライブ配信：レベル制度で最大95%還元。個人でも最大75%。",
            "コミュニティ広告：メンバー数×7円/日。収益の70%がコミュニティへ。",
            "動画編集依頼：編集クリエイターとして登録。報酬設定は自由。",
            "ツーショット予約：ファンとの特別な時間を販売。",
            "事務所所属：事務所経由でLevel4から参加可能。",
          ].map((line) => (
            <View key={line} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{line}</Text>
            </View>
          ))}
        </Section>

        {/* COMMUNITY */}
        <Section title="コミュニティが、自走する。">
          <Text style={styles.paragraph}>
            広告収益の70%は管理人・モデレーターへ。10%はイベント資金として自動積立。10万円に到達したらメンバーの投票でコンテストやイベントを開催できる。
          </Text>
          <Text style={styles.paragraph}>
            賞金もコミュニティのお金から出せる。プラットフォームじゃなく、コミュニティが主役の経済圏。不信任制度でコミュニティの健全さを保つ。
          </Text>
          <Text style={styles.paragraph}>
            プラットフォームに依存しない、自立した場所を作れる。ジュークボックス機能でメンバーとYouTube・オリジナル動画を同時視聴できる。
          </Text>
        </Section>

        {/* HONEST */}
        <Section title="個人開発です。正直に言います。">
          <Text style={styles.paragraph}>
            まだ完成していない機能があります。ライブ配信・決済機能は現在開発中です。でも、クリエイターに不利な設計は最初から入れていません。
          </Text>
          <Text style={styles.paragraph}>
            手数料はクリエイターではなく購入者が負担する。還元率は最初から高く設定する。大きくなってから還元率を下げるつもりもありません。
          </Text>
          <Text style={styles.paragraph}>
            小さく始めて、一緒に育てていきたいと思っています。
          </Text>
        </Section>

        {/* CONTACT */}
        <Section id="contact" title="まず、話を聞かせてください。">
          <Text style={styles.paragraph}>
            配信者・コミュニティ運営者・広告出稿・展示会や営業資料のご請求はメールにて。
          </Text>
          <Text style={styles.contactMail}>rawstock.infomation@gmail.com</Text>
          <View style={styles.contactButtonWrapper}>
            <PrimaryButton
              onPress={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "mailto:rawstock.infomation@gmail.com";
                }
              }}
            >
              お問い合わせ
            </PrimaryButton>
          </View>
        </Section>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 RawStock — 鹿之賦 宏美
          </Text>
          <Text style={styles.footerText}>
            〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  scrollContentWide: {
    maxWidth: 960,
    alignSelf: "center",
  },
  masthead: {
    backgroundColor: COLORS.mastheadBg,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  mastheadInner: {
    gap: 20,
  },
  mastheadTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    height: 40,
    width: 120,
    tintColor: "#FFFFFF",
  },
  mastheadTagline: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  heroRow: {
    width: "100%",
  },
  heroRowWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroRowStacked: {
    flexDirection: "column",
  },
  heroTextCol: {
    flex: 1,
  },
  heroKicker: {
    fontSize: 12,
    letterSpacing: 1,
    color: COLORS.highlight,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 12,
  },
  heroTitleMain: {
    color: "#FFFFFF",
  },
  heroTitleAccent: {
    color: COLORS.accent,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  heroSubtitleStrong: {
    color: COLORS.highlight,
    fontWeight: "700",
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#E0ECFF",
    marginBottom: 18,
  },
  heroCtas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionBody: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    flexBasis: "100%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: COLORS.subtext,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subtext,
    marginBottom: 10,
  },
  numbersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  numberCard: {
    flexBasis: "100%",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  numberValue: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.emphasis,
    marginBottom: 4,
  },
  numberCaption: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.subtext,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 7,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.subtext,
  },
  contactMail: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 12,
  },
  contactButtonWrapper: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderColor: "#FFFFFF",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: "#1B2838",
  },
  buttonTextOutline: {
    color: "#FFFFFF",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.subtext,
    marginBottom: 4,
  },
});

