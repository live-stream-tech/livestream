import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";

type Playlist = {
  id: number;
  title: string;
  description: string;
  url: string;
};

const GENRE_DATA: Record<string, { name: string; icon: string; color: string; playlists: Playlist[] }> = {
  anime: {
    name: "アニメ",
    icon: "tv-outline",
    color: "#E91E8C",
    playlists: [
      { id: 1, title: "深夜のチルプレイリスト", description: "リラックスできる曲まとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime01" },
      { id: 2, title: "神OPメドレー2024", description: "今年の名曲オープニングを厳選", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime02" },
      { id: 3, title: "泣けるアニソン特集", description: "感動シーンのBGMコレクション", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime03" },
      { id: 4, title: "戦闘BGM最強まとめ", description: "テンション上がる戦闘曲だけ集めた", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime04" },
      { id: 5, title: "ジブリ名曲セレクション", description: "久石譲作品の名曲を網羅", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime05" },
      { id: 6, title: "ロボットアニメ主題歌", description: "ガンダムからエヴァまで", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime06" },
      { id: 7, title: "少女漫画アニメED集", description: "エンディングの名曲特集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime07" },
      { id: 8, title: "進撃BGMコンプリート", description: "進撃の巨人全シーズンBGM", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime08" },
      { id: 9, title: "ドラゴンボール主題歌全部", description: "Z〜超まで全部入り", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime09" },
      { id: 10, title: "勉強用アニソンBGM", description: "歌詞なし・集中できるアレンジ集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxAnime10" },
    ],
  },
  band: {
    name: "バンド",
    icon: "musical-notes-outline",
    color: C.accent,
    playlists: [
      { id: 1, title: "邦ロック名盤セレクト", description: "ドライブで聴きたい邦ロックまとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand01" },
      { id: 2, title: "ライブ映像神回まとめ", description: "フェスのベストパフォーマンス集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand02" },
      { id: 3, title: "ギターソロ名曲100選", description: "コピーしたい神ソロをピックアップ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand03" },
      { id: 4, title: "90年代ビジュアル系名曲", description: "X JAPANからGacktまで", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand04" },
      { id: 5, title: "インディーズ注目バンド", description: "メジャー前の神曲を掘り起こし", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand05" },
      { id: 6, title: "夏フェスド定番セトリ", description: "サマソニ・ロッキン定番曲まとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand06" },
      { id: 7, title: "弾き語りカバー傑作選", description: "アコースティックアレンジが神すぎる", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand07" },
      { id: 8, title: "ベース神プレイまとめ", description: "スラップからフィンガーまで", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand08" },
      { id: 9, title: "ELLEGARDENトリビュート", description: "エルレ曲のカバー動画コレクション", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand09" },
      { id: 10, title: "深夜ロックセッション", description: "眠れない夜に聴く轟音ギター", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxBand10" },
    ],
  },
  subcul: {
    name: "サブカル",
    icon: "sparkles-outline",
    color: C.orange,
    playlists: [
      { id: 1, title: "シティポップ黄金期セレクト", description: "80年代シティポップの名盤たち", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub01" },
      { id: 2, title: "エモい映画サントラ集", description: "ミニシアター系作品のBGM特集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub02" },
      { id: 3, title: "コミケ応援プレイリスト", description: "創作活動が捗る曲まとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub03" },
      { id: 4, title: "ゲームミュージック名曲選", description: "レトロゲーから最新作まで", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub04" },
      { id: 5, title: "渋谷系ポップ名盤まとめ", description: "フリッパーズギターから始まる旅", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub05" },
      { id: 6, title: "カセットテープの音楽たち", description: "ローファイ・サウンド特集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub06" },
      { id: 7, title: "アングラ演劇BGM", description: "小劇場の世界観を音で表現", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub07" },
      { id: 8, title: "同人音楽の神曲特集", description: "コミケ頒布CDから厳選", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub08" },
      { id: 9, title: "ZINE制作用BGM", description: "原稿が進む静かな音楽たち", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub09" },
      { id: 10, title: "レコードショップ掘り出し物", description: "中古レコード店で見つけた隠れ名盤", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxSub10" },
    ],
  },
  english: {
    name: "英会話",
    icon: "language-outline",
    color: C.green,
    playlists: [
      { id: 1, title: "日常英会話フレーズ100", description: "ネイティブがよく使う表現まとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng01" },
      { id: 2, title: "英語ポップスで学ぶ発音", description: "洋楽を聴きながらリスニング強化", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng02" },
      { id: 3, title: "TED Talks おすすめ10選", description: "英語力アップのためのTED厳選集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng03" },
      { id: 4, title: "映画で学ぶスラング集", description: "ハリウッド映画に出てくる口語表現", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng04" },
      { id: 5, title: "ビジネス英語フレーズ", description: "会議・メールで使えるフォーマル表現", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng05" },
      { id: 6, title: "英語の歌で単語暗記", description: "耳に残る洋楽で語彙力アップ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng06" },
      { id: 7, title: "ニュース英語入門", description: "BBCニュースで時事単語を学ぶ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng07" },
      { id: 8, title: "子ども向け英語ソング", description: "初心者が楽しく始められる英語歌", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng08" },
      { id: 9, title: "IELTS対策スピーキング", description: "試験頻出トピックの模範解答集", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng09" },
      { id: 10, title: "英語で聴く落語・漫談", description: "コメディで自然な英語リズムを習得", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxEng10" },
    ],
  },
  fortune: {
    name: "占い",
    icon: "moon-outline",
    color: "#9C27B0",
    playlists: [
      { id: 1, title: "深夜の瞑想BGM", description: "占いセッションに合う静寂の音楽", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor01" },
      { id: 2, title: "タロット読み解き動画集", description: "人気占い師のタロット解説まとめ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor02" },
      { id: 3, title: "星座別運勢ソング", description: "12星座ごとのテーマ曲セレクト", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor03" },
      { id: 4, title: "クリスタルボウル ヒーリング", description: "浄化と癒しのサウンドバス", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor04" },
      { id: 5, title: "月のリズムで聴く音楽", description: "新月・満月に合わせたプレイリスト", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor05" },
      { id: 6, title: "西洋占星術入門動画", description: "ホロスコープの読み方を学ぶ", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor06" },
      { id: 7, title: "神秘的なアンビエント集", description: "霊感が冴えると話題の音楽たち", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor07" },
      { id: 8, title: "数秘術解説シリーズ", description: "誕生日から運命数を読む方法", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor08" },
      { id: 9, title: "ルーン文字学習プレイリスト", description: "北欧神話と占いを音で体験", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor09" },
      { id: 10, title: "朝の引き寄せルーティン", description: "アファメーション＋ヒーリング音楽", url: "https://www.youtube.com/playlist?list=PLxxxxxxxxFor10" },
    ],
  },
};

export default function GenreScreen() {
  const { genreId } = useLocalSearchParams<{ genreId: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const genre = GENRE_DATA[genreId ?? ""] ?? null;

  if (!genre) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <Text style={styles.notFound}>ジャンルが見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Ionicons name={genre.icon as any} size={20} color={genre.color} />
          <Text style={styles.headerText}>{genre.name}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: genre.color }]} />
        <Text style={styles.sectionTitle}>おすすめプレイリスト</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {genre.playlists.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={[styles.indexBadge, { backgroundColor: genre.color + "33" }]}>
                <Text style={[styles.indexText, { color: genre.color }]}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <View style={styles.urlRow}>
                <Ionicons name="play-circle-outline" size={13} color={C.accent} />
                <Text style={styles.urlText} numberOfLines={1}>{item.url}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
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
  },
  backBtn: { width: 32, alignItems: "flex-start" },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerText: { color: C.text, fontSize: 18, fontWeight: "700" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionAccent: { width: 3, height: 18, borderRadius: 2 },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: "700" },
  scroll: { flex: 1 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  cardLeft: { paddingTop: 2 },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: { fontSize: 14, fontWeight: "700" },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { color: C.text, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  cardDesc: { color: C.textSec, fontSize: 12, lineHeight: 17 },
  urlRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  urlText: { color: C.textMuted, fontSize: 11, flex: 1 },
  notFound: { color: C.text, textAlign: "center", marginTop: 40, fontSize: 16 },
});
