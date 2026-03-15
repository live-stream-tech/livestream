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

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>利用規約</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.docTitle}>SANCTUM HAVEN 利用規約</Text>
        <Text style={styles.effectiveDate}>制定日：2026年3月18日</Text>

        <Text style={styles.intro}>
          本利用規約（以下「本規約」）は、株式会社　（以下「当社」）が提供するサービス「SANCTUM
          HAVEN」（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するすべてのユーザーは、本規約に同意したうえでご利用ください。
        </Text>

        <Article title="第1条（定義）">
          本規約において使用する用語の意味は、以下のとおりとします。{"\n\n"}
          （1）「本サービス」とは、当社が提供するライブ配信・動画投稿・コミュニティ・収益分配等を含むプラットフォームサービス「SANCTUM
          HAVEN」をいいます。{"\n\n"}
          （2）「ユーザー」とは、本規約に同意のうえ、本サービスに登録した個人または法人をいいます。{"\n\n"}
          （3）「配信者」とは、本サービス上でライブ配信・動画・写真・テキスト等のコンテンツを発信するユーザーをいいます。{"\n\n"}
          （4）「視聴者」とは、配信者のコンテンツを視聴・購入・支援するユーザーをいいます。{"\n\n"}
          （5）「投稿コンテンツ」とは、ユーザーが本サービス上に投稿・送信・公開する文章・画像・動画・音声・ライブ配信等の一切の情報をいいます。{"\n\n"}
          （6）「ストック資産」とは、本サービスに保存されたライブ配信のアーカイブ・動画・写真・テキスト等のコンテンツをいいます。{"\n\n"}
          （7）「有料コンテンツ」とは、視聴・利用に際してポイントまたは金銭の支払いが必要なコンテンツをいいます。{"\n\n"}
          （8）「投げ銭（ギフト）」とは、視聴者が配信者へリアルタイムに送るポイント・仮想アイテム等をいいます。
        </Article>

        <Article title="第2条（規約への同意）">
          ユーザーは、本規約の全文を確認・理解したうえで、本サービスの利用を開始するものとします。本サービスを利用した時点で、本規約および当社が別途定めるガイドライン・プライバシーポリシー等の関連規定（以下「関連規定」）の全てに同意したものとみなします。未成年者は、法定代理人（親権者等）の同意を得たうえで本サービスを利用するものとします。当社は、ユーザーへの事前通知をもって本規約を変更できるものとします。変更後も本サービスを継続して利用した場合は、変更後の規約に同意したものとみなします。
        </Article>

        <Article title="第3条（アカウント登録・管理）">
          ユーザーは、真実かつ正確な情報を用いて登録を行うものとします。1人につき1アカウントを原則とし、複数アカウントの作成・不正利用を禁止します。アカウントの第三者への譲渡・貸与・売買は禁止します。ユーザーは、ログイン情報（電話番号・LINEアカウント情報等）を自己の責任で管理するものとします。第三者による不正アクセスにより生じた損害について、当社は責任を負いません。当社は、長期間利用がないアカウントを事前通知のうえ削除できるものとします。
        </Article>

        <Article title="第4条（サービスの内容）">
          本サービスは、「生ライブレポ＆生配信LIVEをストック資産に」というコンセプトのもと、以下を提供します。{"\n\n"}
          ・ライブ配信（有料・無料）{"\n"}
          ・動画・写真・テキストの投稿・販売{"\n"}
          ・コミュニティ機能（ファンクラブ・グループ等）{"\n"}
          ・投げ銭（ギフト）機能{"\n"}
          ・収益分配（レベニューシェア）{"\n"}
          ・その他当社が定める機能{"\n\n"}
          当社は、予告なくサービス内容を追加・変更・終了できるものとします。
        </Article>

        <Article title="第5条（投稿コンテンツの権利・責任）">
          ユーザーが本サービスに投稿したコンテンツの著作権は、当該ユーザーに帰属します。ユーザーは当社に対し、本サービスの運営・広告宣伝・プロモーション・メディア掲載の目的において、投稿コンテンツを無償・非独占的に利用（複製・翻案・公衆送信等）する世界的・無期限の権利を許諾し、著作者人格権を行使しないものとします。ユーザーは、投稿コンテンツが第三者の著作権・肖像権・プライバシー権・名誉権等を侵害していないことを保証するものとします。第三者から当社に対してクレーム・損害賠償請求等がなされた場合、ユーザーは自己の費用と責任で解決し、当社に損害を与えないものとします。ユーザーは、投稿コンテンツのバックアップを自ら取るものとします。当社はデータの消失について復旧の義務を負いません。
        </Article>

        <Article title="第6条（禁止事項）">
          ユーザーは、以下の行為を行ってはなりません。{"\n\n"}
          ・法令・公序良俗・本規約に違反する行為{"\n"}
          ・第三者の著作権・肖像権・プライバシー権・名誉権等を侵害する行為{"\n"}
          ・性的・暴力的・差別的な表現、または過度な露出・残虐な表現を含む投稿{"\n"}
          ・当社が許可していない営利目的の広告・勧誘・宣伝行為{"\n"}
          ・サーバーへの過負荷行為（不正アクセス・スクレイピング等）{"\n"}
          ・複数アカウントの作成・不正利用{"\n"}
          ・他のユーザーへのハラスメント・なりすまし行為{"\n"}
          ・未成年者への性的・暴力的コンテンツの提供{"\n"}
          ・反社会的勢力との関与・協力{"\n"}
          ・その他当社が不適切と判断する行為
        </Article>

        <Article title="第7条（有料サービス・決済）">
          有料コンテンツの購入・投げ銭の送付は、当社が定める決済方法によるものとします。支払い済みの料金は、法令または本規約に別段の定めがある場合を除き、返金しないものとします。当社は、料金体系を事前通知のうえ変更できるものとします。決済に関するトラブル（二重引き落とし等）は、ユーザーが利用した決済事業者の規約に従うものとします。
        </Article>

        <Article title="第8条（未成年者の利用）">
          未成年者が有料コンテンツの購入または投げ銭の送付を行う場合は、事前に法定代理人（親権者等）の同意を得るものとします。未成年者が法定代理人の同意なく有料決済を行った場合、または年齢を偽って決済した場合、当該行為の取消しはできません。当社は、以下の月間購入限度額を設定することがあります。{"\n\n"}
          ・15歳以下：月間5,000円まで{"\n"}
          ・16歳以上17歳以下：月間10,000円まで{"\n"}
          ・18歳以上：制限なし{"\n\n"}
          未成年者による無断決済について、当社は原則として返金に応じません。
        </Article>

        <Article title="第9条（収益分配）">
          配信者は、当社が定める条件を満たした場合、本サービスを通じて得た収益の一部を受け取ることができます。収益分配率・支払い条件・支払い方法等の詳細は、別途当社が定める収益分配規約によるものとします。収益の受け取りには、本人確認・口座情報の登録等が必要な場合があります。脱税・マネーロンダリングその他不正な目的による利用が疑われる場合、当社は支払いを停止・凍結できるものとします。
        </Article>

        <Article title="第10条（個人情報の取り扱い）">
          当社は、ユーザーの個人情報を別途定めるプライバシーポリシーに従って適切に取り扱います。ユーザーは、プライバシーポリシーの内容に同意したうえで本サービスを利用するものとします。
        </Article>

        <Article title="第11条（サービスの停止・変更・終了）">
          当社は、以下の場合にユーザーへの事前通知なく本サービスを一時停止または終了できるものとします。{"\n\n"}
          ・システムの保守・点検・障害対応が必要な場合{"\n"}
          ・天災地変・戦争・感染症等の不可抗力が生じた場合{"\n"}
          ・法令上または行政上の要請がある場合{"\n"}
          ・その他当社が必要と判断した場合{"\n\n"}
          当社は、本サービスの停止・変更・終了によりユーザーに生じた損害について責任を負いません。
        </Article>

        <Article title="第12条（利用制限・アカウント削除）">
          当社は、ユーザーが本規約に違反した場合または以下に該当すると判断した場合、事前通知なく投稿コンテンツの削除・サービス利用の一時停止・アカウントの永久削除を行うことができます。{"\n\n"}
          ・反社会的勢力であることが判明した場合{"\n"}
          ・虚偽の情報で登録した場合{"\n"}
          ・第三者に迷惑・損害を与えた場合{"\n"}
          ・その他当社が不適切と判断した場合{"\n\n"}
          前項の措置により生じた損害について、当社は責任を負いません。
        </Article>

        <Article title="第13条（免責事項）">
          当社は、本サービス上の情報の正確性・有用性・安全性について、明示または黙示を問わず一切保証しません。当社は、通信障害・デプロイ不備・データ消失その他本サービスの利用に関してユーザーに生じた損害について、故意または重大な過失がある場合を除き、責任を負いません。ユーザー間またはユーザーと第三者間で生じた紛争について、当社は一切関与せず、ユーザーが自らの責任で解決するものとします。当社が損害賠償責任を負う場合、その範囲は直接かつ通常の損害に限り、かつ当該ユーザーが過去1ヶ月間に当社に支払った金額を上限とします。
        </Article>

        <Article title="第14条（反社会的勢力の排除）">
          ユーザーは、現在および将来にわたり、暴力団・暴力団員・暴力団関係企業・総会屋等の反社会的勢力に該当しないことを表明・保証するものとします。ユーザーが前項に違反した場合、当社は直ちにアカウントを削除できるものとします。
        </Article>

        <Article title="第15条（準拠法および裁判管轄）">
          本規約の準拠法は日本法とします。本サービスに関して紛争が生じた場合、当社の本店所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。
        </Article>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>附則</Text>
          <Text style={styles.articleBody}>本規約は、2025年　月　日より施行します。</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  docTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    textAlign: "center",
  },
  effectiveDate: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 20,
    textAlign: "center",
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: C.textSec,
    marginBottom: 24,
  },
  article: {
    marginBottom: 24,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.accent,
    marginBottom: 10,
  },
  articleBody: {
    fontSize: 14,
    lineHeight: 22,
    color: C.textSec,
  },
});
