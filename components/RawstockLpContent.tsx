import React from "react";
import { Platform } from "react-native";

const html = `
<style>
/* ============================================================
   DESIGN TOKENS & FONTS
   ============================================================ */
:root {
  --bg-darkest: #07090f;
  --bg-dark:    #0d1420;
  --bg-mid:     #1B2838;
  --bg-light:   #1E3045;
  --accent:     #29B6CF;
  --red:        #E53935;
  --yellow:     #FFD600;
  --text:       #FFFFFF;
  --text-sec:   rgba(255,255,255,0.72);
  --text-muted: rgba(255,255,255,0.38);
  --border:     rgba(41,182,207,0.25);
  --border-dim: rgba(255,255,255,0.07);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  margin: 0; padding: 0; background: var(--bg-darkest); color: var(--text);
  font-family: 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased;
  overflow-x: hidden; overflow-y: auto; scroll-behavior: smooth;
}

.wrap { max-width: 900px; margin: 0 auto; padding: 0 48px; }
.sec-label { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.sec-label-text { font-family: 'Bebas Neue', sans-serif; font-size: 11px; letter-spacing: .45em; color: var(--accent); }
.sec-label-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }

.gothic { font-family: 'Noto Sans JP', sans-serif; font-weight: 700; }
.bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: .1em; }

/* 1. HEADER */
header { position: absolute; top: 0; left: 0; width: 100%; height: 100px; display: flex; align-items: center; padding-left: 48px; z-index: 100; }
.logo { width: 200px; height: 70px; object-fit: contain; }

/* 2. HERO */
.hero { position: relative; height: 100vh; display: flex; align-items: center; overflow: hidden; background: var(--bg-darkest); }
.hero-bg { position: absolute; inset: 0; z-index: 0; }
.hero-bg img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(7,9,15,0.1) 0%, rgba(7,9,15,0.9) 100%); }
.hero-grid { position: absolute; inset: 0; z-index: 1; background-image: linear-gradient(rgba(41,182,207,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(41,182,207,.05) 1px, transparent 1px); background-size: 50px 50px; }
.hero-inner { position: relative; z-index: 2; width: 100%; max-width: 900px; margin: 0 auto; padding: 0 48px; }
.hero-h1 { font-family: 'Shippori Mincho', serif; font-size: clamp(32px, 6vw, 64px); font-weight: 800; line-height: 1.25; margin: 20px 0; }
.hero-sub { font-size: 24px; color: var(--accent); font-weight: 800; font-family: 'Shippori Mincho', serif; }
.hero-small { font-size: 20px; color: var(--text-sec); letter-spacing: 0.1em; font-family: 'Noto Sans JP', sans-serif; }

/* 3. LEAD */
.lead-sec { padding: 120px 0; background: var(--bg-darkest); }
.lead-text { font-family: 'Shippori Mincho', serif; font-size: 20px; line-height: 2.2; color: var(--text-sec); border-left: 3px solid var(--red); padding-left: 30px; }

/* 4. ECOSYSTEM */
.ecosystem { padding: 100px 0; background: var(--bg-dark); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border-dim); border: 1px solid var(--border-dim); margin-top: 48px; }
.card { background: var(--bg-dark); padding: 40px 24px; transition: .3s; }
.card:hover { background: var(--bg-mid); }
.card-picto { width: 48px; height: 48px; margin-bottom: 24px; color: var(--accent); }
.card h3 { font-family: 'Shippori Mincho', serif; font-size: 18px; margin-bottom: 12px; line-height: 1.4; color: var(--accent); }
.card p { font-size: 14px; color: var(--text-sec); line-height: 1.6; }

/* 5. FLOW */
.flow-sec { position: relative; padding: 100px 0; background: var(--bg-darkest); overflow: hidden; }
.stage-decoration { position: absolute; inset: 0; opacity: 0.1; pointer-events: none; }
.flow-steps { display: flex; align-items: center; gap: 8px; margin-top: 50px; }
.flow-box { flex: 1; border: 1px solid var(--border); background: rgba(41,182,207,0.05); padding: 30px 15px; text-align: center; position: relative; }
.flow-num { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--red); padding: 2px 10px; font-family: 'Bebas Neue'; font-size: 12px; }
.flow-arrow { color: var(--accent); font-size: 24px; font-family: serif; }

/* 6. REVENUE */
.revenue-sec { padding: 100px 0; background: var(--bg-mid); }
.table-wrapper { width: 100%; overflow-x: auto; margin: 30px 0; border: 1px solid var(--border); }
table { width: 100%; border-collapse: collapse; min-width: 800px; }
th { background: rgba(41,182,207,0.15); color: var(--accent); padding: 15px; font-size: 12px; border-bottom: 2px solid var(--accent); text-align: center; font-family: 'Noto Sans JP', sans-serif; font-weight: 700; }
td { padding: 15px; border-bottom: 1px solid var(--border-dim); text-align: center; font-size: 14px; color: var(--text-sec); }
.row-active { background: rgba(41,182,207,0.1); font-weight: 700; color: #fff; }
.pct-big { font-family: 'DM Serif Display', serif; font-size: 26px; font-style: italic; color: var(--red); }

/* 7. VISION */
.vision { position: relative; padding: 180px 0; min-height: 100vh; background-image: url('/haikeihaikei.png'); background-size: cover; background-position: center; background-attachment: fixed; display: flex; align-items: center; }
.vision::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--bg-darkest) 0%, rgba(2,11,28,0.4) 50%, var(--bg-darkest) 100%); z-index: 1; }
.vision-inner { position: relative; z-index: 2; width: 100%; max-width: 900px; margin: 0 auto; padding: 0 48px; }
.vision-text { font-family: 'Shippori Mincho', serif; font-size: 1.7rem; line-height: 2.6; text-shadow: 0 4px 20px #000; }

@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
  .flow-steps { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); margin: 10px 0; }
  .vision-text { font-size: 1.3rem; }
}
</style>

<header><a href="/lp"><img src="/logo-200x70-v2.png" alt="RawStock" class="logo"></a></header>

<section class="hero">
  <div class="hero-bg"><img src="/hero-bg.png" alt=""></div>
  <div class="hero-grid"></div>
  <div class="hero-overlay"></div>
  <div class="hero-inner">
    <p class="hero-sub">ライブレポートを</p>
    <h1 class="hero-h1">動画にして売りませんか？</h1>
    <p class="hero-small">個人開発で90%還元を実現しました</p>
  </div>
</section>

<section class="lead-sec">
  <div class="wrap">
    <div class="lead-text">
      生成AIで誰でも大量のコンテンツを作れる時代だからこそ、<br>
      AIには絶対に量産できない<b>「生の熱量」</b>にこそ、本当の価値があると考えています。<br><br>
      現場の汗、叫び、震え、胸が熱くなる瞬間——<br>
      それをRawのまま切り取り、ストック資産として積み上げ、<br>
      いつか世界に届ける。<br>
      そんな場所を、今、作っています。
    </div>
  </div>
</section>

<section class="ecosystem">
  <div class="wrap">
    <div class="sec-label"><span class="sec-label-text">Ecosystem</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho'; font-size:32px;">私たちが創る共同経済圏<br><span style="font-size:0.6em; color:var(--text-sec);">自分たちで回す、新しいエコシステム</span></h2>
    
    <div class="grid-3">
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        <h3>インディーズアーティスト / 地下アイドル</h3>
        <p>現場の熱量を動画レポートにして世界に届ける</p>
      </div>
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        <h3>ライバー</h3>
        <p>生配信で最大95%還元</p>
      </div>
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <h3>メンタルコーチ・講師</h3>
        <p>有料ライブ販売・個別セッションで直接収益化</p>
      </div>
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        <h3>動画編集者</h3>
        <p>現場動画の編集依頼を受けて稼ぐ</p>
      </div>
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
        <h3>コミュニティ管理人</h3>
        <p>広告収益の<b class="gothic" style="color:var(--accent);">70%</b>がコミュニティへ還元</p>
      </div>
      <div class="card">
        <svg class="card-picto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path></svg>
        <h3>コンテスト賞金・イベント積立</h3>
        <p>コミュニティに貯まった資金でリアルイベント開催</p>
      </div>
    </div>
  </div>
</section>

<section class="flow-sec">
  <div class="stage-decoration"><svg viewBox="0 0 1000 500"><polygon points="0,500 500,0 1000,500" fill="url(#grad)" opacity="0.3"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:var(--accent);stop-opacity:1" /><stop offset="100%" style="stop-color:transparent;stop-opacity:0" /></linearGradient></defs></svg></div>
  <div class="wrap" style="position:relative;">
    <div class="sec-label"><span class="sec-label-text">Process</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho'; font-size:32px;">エコシステムの流れ</h2>
    <div class="flow-steps">
      <div class="flow-box"><span class="flow-num bebas">01</span><h4 class="gothic">現場でスマホ撮影</h4><p>その場の生の熱気を切り取る</p></div>
      <div class="flow-arrow">›</div>
      <div class="flow-box"><span class="flow-num bebas">02</span><h4 class="gothic">編集者に依頼</h4><p>登録編集者に直接オーダー可能</p></div>
      <div class="flow-arrow">›</div>
      <div class="flow-box"><span class="flow-num bebas">03</span><h4 class="gothic">映像を販売</h4><p>ライブレポートから自然に導線</p></div>
      <div class="flow-arrow">›</div>
      <div class="flow-box"><span class="flow-num bebas">04</span><h4 class="gothic">次のライブ集客</h4><p>資産が循環するモデル</p></div>
    </div>
  </div>
</section>

<section class="revenue-sec">
  <div class="wrap">
    <div class="sec-label"><span class="sec-label-text">Revenue Plan</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho';">収益化の仕組み（詳細版）</h2>

    <div style="margin-top:60px;">
      <h3 class="gothic" style="color:var(--accent); margin-bottom:20px;">1. コンテンツ販売（動画レポート・写真・記事など）</h3>
      <p style="font-size:15px; line-height:1.8;">基本還元率：売上の90%が投稿者側へ（プラットフォーム手数料10%のみ）<br>分配設定：投稿時に自由に協力者へ分配比率を設定可能 → AIが売上発生後、自動で分配</p>
      
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>ケース</th><th>投稿者</th><th>アーティスト</th><th>撮影者</th><th>編集者</th><th>PF</th><th>合計</th></tr>
          </thead>
          <tbody>
            <tr class="row-active"><td>標準例</td><td>20%</td><td>60%</td><td>10%</td><td>-</td><td>10%</td><td>100%</td></tr>
            <tr><td>ファン重視</td><td>10%</td><td>50%</td><td>30%</td><td>-</td><td>10%</td><td>100%</td></tr>
            <tr><td>編集込み</td><td>10%</td><td>60%</td><td>10%</td><td>10%</td><td>10%</td><td>100%</td></tr>
            <tr><td>個人独占</td><td>90%</td><td>-</td><td>-</td><td>-</td><td>10%</td><td>100%</td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:13px; color:var(--text-muted);">→ 売上1万円の場合、標準例ならアーティストに6,000円、全体で合計9,000円が投稿者側に分配されます</p>
    </div>

    <div style="margin-top:80px;">
      <h3 class="gothic" style="color:var(--accent); margin-bottom:20px;">2. ライブ配信収益分配</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>レベル</th><th>事務所所属</th><th>個人活動</th><th>備考</th></tr>
          </thead>
          <tbody>
            <tr class="row-active"><td>Level 4</td><td><span class="pct-big">95%</span></td><td><span class="pct-big">75%</span></td><td>最高ランク（視聴数・品質・継続基準クリア）</td></tr>
            <tr><td>Level 3</td><td><span class="pct-big" style="font-size:20px;">90%</span></td><td><span class="pct-big" style="font-size:20px;">70%</span></td><td>上位基準クリア</td></tr>
            <tr><td>Level 2</td><td><span class="pct-big" style="font-size:20px;">80%</span></td><td><span class="pct-big" style="font-size:20px;">60%</span></td><td>中間レベル</td></tr>
            <tr><td>Level 1</td><td><span class="pct-big" style="font-size:20px;">70%</span></td><td><span class="pct-big" style="font-size:20px;">50%</span></td><td>初心者・新規スタート</td></tr>
          </tbody>
        </table>
      </div>
      <div style="font-size:14px; color:var(--text-sec); margin-top:20px; line-height:1.8;">
        ・事務所所属の場合：タレントマネジメントコストを考慮した設計<br>
        ・個人活動の場合：手数料を抑えつつ、事務所並みのサポート（集客ツール・決済代行）を提供<br>
        ・レベルアップ条件：視聴維持率、売上継続、コミュニティ貢献度などで自動判定
      </div>
    </div>

    <div style="margin-top:80px; background:rgba(255,255,255,0.03); padding:40px; border:1px solid var(--border);">
      <h3 class="gothic" style="color:var(--accent); margin-bottom:16px;">3. アルゴリズムに依存しない、自分で選ぶコミュニティ</h3>
      <p style="font-size:15px; line-height:1.8;">テーマに沿ったバナー広告枠を設置。管理人＋モデレーターによる目利き選定で質を担保。<br>アルゴリズム偏重ではなく、人間による推薦で本当に良いコンテンツが届く。</p>
      <div style="margin-top:24px; padding-top:24px; border-top:1px solid var(--border-dim);">
        <p class="gothic" style="font-size:18px;">コミュニティ内バナー広告：メンバー数 × 7円/日（最低保証10,000円/月〜）</p>
        <p style="font-size:14px; color:var(--accent); margin-top:8px;">分配：イベント積立 10% ／ 管理人・モデレーター 70% ／ プラットフォーム 20%</p>
      </div>
      <div style="margin-top:32px;">
        <h4 class="gothic" style="margin-bottom:12px;">ジャンル別階層（ロック・テクノ等）</h4>
        <p style="font-size:14px; line-height:1.7;">上の階層には大きな括りで「ロック」「テクノ」などジャンル別のページも設けます。<br>
        ・ジャンル全体広告：ジャンル総メンバー数 × 5円/日<br>
        ・毎月1日、そのジャンルで最もメンバーが多いコミュニティの管理人が自動でジャンル管理人に就任。収益分配はコミュニティ同様。</p>
      </div>
    </div>
  </div>
</section>

<section class="vision">
  <div class="vision-inner">
    <div class="vision-text">
      最後に<br>
      まだ見ぬ世界の誰かに、この音を届けたい。<br>
      今はまだ小さい。<br>
      でも最初から世界を狙っています。<br>
      運営の力がついたら、日本のインディーズが、<br>
      ベルリンの夜に、ソウルの路地に、ニューヨークの部屋に響く未来。<br>
      言葉はAIが繋いでくれる。<br>
      でも震えとか、叫びとか、胸が熱くなる瞬間は——<br>
      絶対に機械じゃ再現できない。<br><br>
      RawStockは、それを、そのまま届ける場所です。<br>
      一緒に、このシーンをデカくしていきませんか？
    </div>
  </div>
</section>

<footer style="padding:60px 0; text-align:center; background:var(--bg-darkest); color:var(--text-muted); font-size:12px;">
  <p>© 2026 RawStock Project</p>
</footer>
`;

export function RawstockLpContent() {
  if (Platform.OS !== "web") return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#07090f",
        color: "#fff",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
