import React from "react";
import { Platform } from "react-native";

const html = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;800&family=DM+Serif+Display:ital@0;1&family=Noto+Sans+JP:wght@400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
/* ============================================================
   SCROLL FIX — 絶対に消さない
   ============================================================ */
html, body {
  margin: 0; padding: 0;
  height: auto; min-height: 100%;
  overflow-x: hidden; overflow-y: auto;
  scroll-behavior: smooth;
}

/* ============================================================
   TOKENS
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
  --text-sec:   rgba(255, 255, 255, 0.72);
  --text-muted: rgba(255, 255, 255, 0.38);
  --border:     rgba(41, 182, 207, 0.25);
  --border-dim: rgba(255, 255, 255, 0.07);
}

body {
  background: var(--bg-darkest);
  color: var(--text);
  font-family: 'Noto Sans JP', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.wrap { max-width: 900px; margin: 0 auto; padding: 0 48px; position: relative; }
.sec-label { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.sec-label-text { font-family: 'Bebas Neue', sans-serif; font-size: 11px; letter-spacing: .45em; color: var(--accent); text-transform: uppercase; }
.sec-label-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }

/* 1. MASTHEAD */
.masthead {
  position: absolute; top: 0; left: 0; width: 100%; height: 100px;
  display: flex; align-items: center; padding: 0 48px; z-index: 100;
}
.logo { width: 200px; height: 70px; object-fit: contain; }

/* 2. HERO (hero-bg.png) */
.hero {
  position: relative; height: 100vh; display: flex; align-items: center; overflow: hidden;
  background-image: url('/hero-bg.png'); background-size: cover; background-position: center;
}
.hero-grid { position: absolute; inset: 0; z-index: 1; background-image: linear-gradient(rgba(41,182,207,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(41,182,207,.05) 1px, transparent 1px); background-size: 50px 50px; }
.hero-overlay { position: absolute; inset: 0; z-index: 2; background: radial-gradient(circle at 30% 50%, rgba(7,9,15,0.2) 0%, var(--bg-darkest) 90%); }
.hero-inner { position: relative; z-index: 3; width: 100%; }

.hero-dot { display: inline-block; width: 8px; height: 8px; background: var(--red); border-radius: 50%; margin-right: 10px; animation: blink 2s infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.3; } }

.hero-sub { font-family: 'Shippori Mincho', serif; font-size: 24px; color: var(--accent); font-weight: 800; margin-bottom: 8px; }
.hero-h1 { font-family: 'Shippori Mincho', serif; font-size: clamp(32px, 6vw, 64px); font-weight: 800; line-height: 1.25; margin: 20px 0; }
.hero-h1 em { font-style: normal; color: var(--accent); }
.hero-small { font-family: 'Noto Sans JP', sans-serif; font-size: 20px; color: var(--text-sec); letter-spacing: 0.1em; font-weight: 700; }

.hero-lead {
  font-family: 'Shippori Mincho', serif; font-size: 16px; line-height: 2.2; color: var(--text-sec);
  border-left: 3px solid var(--red); padding-left: 24px; margin-top: 40px; max-width: 650px;
}

/* 3. ECOSYSTEM (ピクトグラム復元) */
.for-you { padding: 120px 0; background: var(--bg-dark); }
.for-you-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border-dim); margin-top: 48px; border: 1px solid var(--border-dim); }
.for-you-card { background: var(--bg-dark); padding: 48px 24px; transition: .3s; }
.for-you-card:hover { background: var(--bg-mid); }
.for-you-picto { width: 48px; height: 48px; margin-bottom: 24px; color: var(--accent); }
.for-you-name { font-family: 'Shippori Mincho', serif; font-size: 17px; font-weight: 700; margin-bottom: 12px; line-height: 1.4; color: var(--accent); }
.for-you-desc { font-family: 'Noto Sans JP', sans-serif; font-size: 13px; color: var(--text-sec); line-height: 1.6; }

/* 4. FLOW (ステージ演出) */
.concept { position: relative; padding: 120px 0; background: var(--bg-darkest); overflow: hidden; }
.stage-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.15; pointer-events: none; }
.flow-steps { display: flex; align-items: center; gap: 10px; margin-top: 60px; }
.flow-step { flex: 1; position: relative; border: 1px solid var(--border); background: rgba(41,182,207,0.04); padding: 32px 16px; text-align: center; }
.flow-num { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--red); padding: 2px 12px; font-family: 'Bebas Neue', sans-serif; font-size: 12px; }
.flow-name { font-family: 'Noto Sans JP', sans-serif; font-size: 15px; font-weight: 700; margin: 15px 0 8px; }
.flow-desc { font-family: 'Noto Sans JP', sans-serif; font-size: 11px; color: var(--accent); font-weight: 500; }
.flow-arrow { color: var(--accent); font-size: 24px; opacity: 0.5; }

/* 5. REVENUE (全表復元) */
.revenue { padding: 120px 0; background: var(--bg-mid); }
.table-scroll { width: 100%; overflow-x: auto; margin: 32px 0; border: 1px solid var(--border); background: rgba(0,0,0,0.2); }
table { width: 100%; border-collapse: collapse; min-width: 800px; }
th { background: rgba(41,182,207,0.15); color: var(--accent); padding: 16px; font-size: 12px; border-bottom: 2px solid var(--accent); font-family: 'Noto Sans JP', sans-serif; font-weight: 700; }
td { padding: 18px; border-bottom: 1px solid var(--border-dim); font-size: 14px; color: var(--text-sec); }
.row-active { background: rgba(41,182,207,0.08); font-weight: 700; }
.pct-val { font-family: 'DM Serif Display', serif; font-size: 24px; color: var(--red); font-style: italic; }

/* 6. VISION (haikeihaikei.png) */
.vision {
  position: relative; padding: 200px 0; min-height: 100vh;
  background-image: url('/haikeihaikei.png'); background-size: cover; background-position: center; background-attachment: fixed;
  display: flex; align-items: center;
}
.vision::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--bg-darkest) 0%, rgba(2,11,28,0.4) 50%, var(--bg-darkest) 100%); z-index: 1; }
.vision-inner { position: relative; z-index: 2; width: 100%; max-width: 900px; margin: 0 auto; padding: 0 48px; }
.vision-text { font-family: 'Shippori Mincho', serif; font-size: 1.8rem; line-height: 2.6; text-shadow: 0 4px 20px #000; }

@media (max-width: 768px) {
  .wrap { padding: 0 24px; }
  .for-you-grid { grid-template-columns: 1fr; }
  .flow-steps { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); margin: 10px 0; }
  .vision-text { font-size: 1.3rem; }
  .vision-inner { padding: 0 24px; }
  .masthead { padding: 0 24px; }
}
</style>

<header class="masthead">
  <img src="/logo-200x70-v2.png" alt="RawStock" class="logo">
</header>

<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-overlay"></div>
  <div class="hero-inner">
    <div class="wrap">
      <div class="hero-badge"><span class="hero-dot"></span><span style="font-family:'Bebas Neue'; letter-spacing:.4em; font-size:12px; color:var(--text-muted)">2026 NEW ECOSYSTEM</span></div>
      <p class="hero-sub">ライブレポートを</p>
      <h1 class="hero-h1">動画にして売りませんか？</h1>
      <p class="hero-small">個人開発で90%還元を実現しました</p>
      <div class="hero-lead">
        生成AIで誰でも大量のコンテンツを作れる時代だからこそ、AIには絶対に量産できない「生の熱量」にこそ、本当の価値があると考えています。<br><br>
        現場の汗、叫び、震え、胸が熱くなる瞬間——それをRawのまま切り取り、ストック資産として積み上げ、いつか世界に届ける。そんな場所を、今、作っています。
      </div>
    </div>
  </div>
</section>

<section class="for-you">
  <div class="wrap">
    <div class="sec-label"><span class="sec-label-text">Ecosystem</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho'; font-size:32px; line-height:1.4;">私たちが創る共同経済圏<br><span style="font-size:0.6em; color:var(--text-sec);">自分たちで回す、新しいエコシステム</span></h2>
    
    <div class="for-you-grid">
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
        <div class="for-you-name">インディーズアーティスト<br>/ 地下アイドル</div>
        <div class="for-you-desc">現場の熱量を動画レポートにして世界に届ける</div>
      </div>
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></div>
        <div class="for-you-name">ライバー</div>
        <div class="for-you-desc">生配信で最大95%還元</div>
      </div>
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
        <div class="for-you-name">メンタルコーチ・講師</div>
        <div class="for-you-desc">有料ライブ販売・個別セッションで直接収益化</div>
      </div>
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>
        <div class="for-you-name">動画編集者</div>
        <div class="for-you-desc">現場動画の編集依頼を受けて稼ぐ</div>
      </div>
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg></div>
        <div class="for-you-name">コミュニティ管理人</div>
        <div class="for-you-desc">広告収益の<b>70%</b>がコミュニティへ還元</div>
      </div>
      <div class="for-you-card">
        <div class="for-you-picto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path></svg></div>
        <div class="for-you-name">コンテスト賞金・<br>イベント積立</div>
        <div class="for-you-desc">コミュニティに貯まった資金でリアルイベント開催</div>
      </div>
    </div>
  </div>
</section>

<section class="concept">
  <div class="stage-bg"><svg viewBox="0 0 1000 500"><polygon points="0,500 500,0 1000,500" fill="url(#grad)" opacity="0.3"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:var(--accent);stop-opacity:1" /><stop offset="100%" style="stop-color:transparent;stop-opacity:0" /></linearGradient></defs></svg></div>
  <div class="wrap" style="position:relative;">
    <div class="sec-label"><span class="sec-label-text">Process</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho'; font-size:32px;">エコシステムの流れ</h2>
    <div class="flow-steps">
      <div class="flow-step"><span class="flow-num">01</span><div class="flow-name">現場でスマホ撮影</div><div class="flow-desc">その場の生の熱気を切り取る</div></div>
      <div class="flow-arrow">›</div>
      <div class="flow-step"><span class="flow-num">02</span><div class="flow-name">編集者に依頼</div><div class="flow-desc">登録編集者に直接オーダー可能</div></div>
      <div class="flow-arrow">›</div>
      <div class="flow-step"><span class="flow-num">03</span><div class="flow-name">映像を販売</div><div class="flow-desc">ライブレポートから自然に導線</div></div>
      <div class="flow-arrow">›</div>
      <div class="flow-step"><span class="flow-num">04</span><div class="flow-name">次のライブ集客</div><div class="flow-desc">資産が循環するモデル</div></div>
    </div>
  </div>
</section>

<section class="revenue">
  <div class="wrap">
    <div class="sec-label"><span class="sec-label-text">Revenue Plan</span><span class="sec-label-line"></span></div>
    <h2 style="font-family:'Shippori Mincho';">収益化の仕組み（詳細版）</h2>

    <div style="margin-top:60px;">
      <h3 style="font-family:'Noto Sans JP',sans-serif; font-weight:700; color:var(--accent); margin-bottom:20px;">1. コンテンツ販売（動画レポート・写真・記事など）</h3>
      <p style="font-size:15px; line-height:1.8;">基本還元率：売上の90%が投稿者側へ（プラットフォーム手数料10%のみ）<br>分配設定：投稿時に自由に協力者へ分配比率を設定可能 → AIが売上発生後、自動で分配</p>
      
      <div class="table-scroll">
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
      <h3 style="font-family:'Noto Sans JP',sans-serif; font-weight:700" style="color:var(--accent); margin-bottom:20px;">2. ライブ配信収益分配</h3>
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>レベル</th><th>事務所所属</th><th>個人活動</th><th>備考</th></tr>
          </thead>
          <tbody>
            <tr class="row-active"><td>Level 4</td><td><span class="pct-val">95%</span></td><td><span class="pct-val">75%</span></td><td>最高ランク（視聴数・品質・継続基準クリア）</td></tr>
            <tr><td>Level 3</td><td><span class="pct-val" style="font-size:20px;">90%</span></td><td><span class="pct-val" style="font-size:20px;">70%</span></td><td>上位基準クリア</td></tr>
            <tr><td>Level 2</td><td><span class="pct-val" style="font-size:20px;">80%</span></td><td><span class="pct-val" style="font-size:20px;">60%</span></td><td>中間レベル</td></tr>
            <tr><td>Level 1</td><td><span class="pct-val" style="font-size:20px;">70%</span></td><td><span class="pct-val" style="font-size:20px;">50%</span></td><td>初心者・新規スタート</td></tr>
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
      <h3 style="font-family:'Noto Sans JP',sans-serif; font-weight:700; color:var(--accent); margin-bottom:16px;">3. アルゴリズムに依存しない、自分で選ぶコミュニティ</h3>
      <p style="font-size:15px; line-height:1.8;">テーマに沿ったバナー広告枠を設置。管理人＋モデレーターによる目利き選定で質を担保。<br>アルゴリズム偏重ではなく、人間による推薦で本当に良いコンテンツが届く。</p>
      <div style="margin-top:24px; padding-top:24px; border-top:1px solid var(--border-dim);">
        <p style="font-family:'Noto Sans JP',sans-serif; font-weight:700; font-size:18px;">コミュニティ内バナー広告：メンバー数 × 7円/日（最低保証10,000円/月〜）</p>
        <p style="font-size:14px; color:var(--accent); margin-top:8px;">分配：イベント積立 10% ／ 管理人・モデレーター 70% ／ プラットフォーム 20%</p>
      </div>
      <div style="margin-top:32px;">
        <h4 style="font-family:'Noto Sans JP',sans-serif; font-weight:700; margin-bottom:12px;">ジャンル別階層（ロック・テクノ等）</h4>
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
