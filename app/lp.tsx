import React from "react";
import { Platform } from "react-native";
import { router } from "expo-router";

const html = `
<style>
* { box-sizing: border-box; }

/* ============ CONCEPT ============ */
.concept-wrap {
  position: relative;
  background: #0a0e14;
  overflow: hidden;
  font-family: 'Noto Sans JP', sans-serif;
}

.bg-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.18;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(41,182,207,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(41,182,207,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}

.spotlight {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 700px;
  background: radial-gradient(ellipse at center, rgba(41,182,207,0.13) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}
.spotlight-red {
  position: absolute;
  top: -80px;
  left: 5%;
  width: 320px;
  height: 480px;
  background: radial-gradient(ellipse at center, rgba(229,57,53,0.09) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}
.spotlight-red2 {
  position: absolute;
  top: -80px;
  right: 5%;
  width: 320px;
  height: 480px;
  background: radial-gradient(ellipse at center, rgba(229,57,53,0.07) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

.concept-inner {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 48px;
}

.c-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.c-label-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .4em;
  color: #29B6CF;
  text-transform: uppercase;
}
.c-label-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(41,182,207,0.5), transparent);
}

.c-heading {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 32px;
  letter-spacing: .02em;
}
.c-heading em {
  font-style: italic;
  color: #29B6CF;
  font-family: 'DM Serif Display', serif;
}

.c-body {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 2;
  color: rgba(255,255,255,0.72);
  margin-bottom: 52px;
  border-left: 2px solid #E53935;
  padding-left: 20px;
}

/* DIVIDER */
.metal-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 48px 0 32px;
}
.metal-divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(41,182,207,0.4), transparent);
}
.metal-divider-diamonds {
  display: flex;
  gap: 5px;
  align-items: center;
}
.metal-divider-diamonds span {
  display: block;
  width: 5px;
  height: 5px;
  background: #29B6CF;
  transform: rotate(45deg);
}

/* FLOW */
.flow-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  letter-spacing: .3em;
  color: #29B6CF;
  margin-bottom: 24px;
  text-transform: uppercase;
}

.flow-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 56px;
}

.flow-step {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-box {
  width: 100%;
  border: 1px solid rgba(41,182,207,0.4);
  background: rgba(41,182,207,0.05);
  padding: 18px 8px 14px;
  text-align: center;
  position: relative;
  transition: border-color .2s, background .2s;
  cursor: default;
}
.flow-box:hover {
  border-color: #29B6CF;
  background: rgba(41,182,207,0.1);
}

.flow-num {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: #E53935;
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .1em;
  padding: 1px 8px;
  white-space: nowrap;
}

.flow-icon-wrap {
  margin: 2px auto 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-name {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  letter-spacing: .03em;
}
.flow-desc {
  font-size: 10px;
  color: rgba(41,182,207,0.85);
  margin-top: 5px;
  line-height: 1.4;
}

.flow-arrow {
  width: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #29B6CF;
  font-size: 20px;
  padding-bottom: 10px;
}

/* PULLQUOTE */
.pullquote {
  border-top: 1px solid rgba(41,182,207,0.3);
  border-bottom: 1px solid rgba(41,182,207,0.3);
  padding: 28px 0 28px 16px;
  margin: 48px 0;
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(17px, 2.5vw, 22px);
  color: #29B6CF;
  line-height: 1.8;
  position: relative;
}
.pullquote-mark {
  font-family: 'DM Serif Display', serif;
  font-size: 72px;
  color: rgba(41,182,207,0.14);
  position: absolute;
  top: -12px;
  left: -4px;
  line-height: 1;
  pointer-events: none;
}

/* LEVEL TABLE */
.level-heading {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: .32em;
  text-transform: uppercase;
  color: #29B6CF;
  margin-bottom: 8px;
}
.level-sub {
  font-size: 13px;
  color: rgba(224,236,255,0.86);
  margin-bottom: 18px;
}
.level-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}
.level-table thead th {
  padding: 10px 12px;
  background: linear-gradient(90deg, #1B2838, #111621);
  color: #E0ECFF;
  font-size: 11px;
  font-weight: 600;
  text-align: left;
  letter-spacing: .06em;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(41,182,207,0.4);
}
.level-table thead th:nth-child(2),
.level-table thead th:nth-child(3) {
  text-align: center;
}
.level-table tbody tr:nth-child(odd) {
  background: rgba(15,23,38,0.96);
}
.level-table tbody tr:nth-child(even) {
  background: rgba(11,17,26,0.96);
}
.level-table tbody tr.row-top {
  background: radial-gradient(circle at top, rgba(41,182,207,0.18), rgba(11,17,26,0.98));
}
.level-table tbody td {
  padding: 12px 12px;
  border-bottom: 1px solid rgba(41,182,207,0.18);
  font-size: 12px;
  color: #E0ECFF;
}
.level-table tbody td:nth-child(2),
.level-table tbody td:nth-child(3) {
  text-align: center;
}
.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(41,182,207,0.7);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.pct {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  color: #E53935;
}
.pct-top {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: #E53935;
  font-style: italic;
}
.level-note {
  font-size: 11px;
  color: rgba(255,255,255,0.28);
  margin-top: 14px;
  letter-spacing: .04em;
  padding-left: 2px;
}

/* ============ VISION ============ */
.vision-wrap {
  background: #1B2838;
  padding: 80px 48px;
  position: relative;
  overflow: hidden;
}
.vision-wrap::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(41,182,207,0.4), transparent);
}
.vision-inner {
  max-width: 720px;
  margin: 0 auto;
}
.v-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.v-label-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .4em;
  color: #29B6CF;
  text-transform: uppercase;
}
.v-label-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(41,182,207,0.4), transparent);
}
.v-heading {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 32px;
}
.v-body {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 17px;
  line-height: 1.95;
  color: rgba(255,255,255,0.82);
  margin-bottom: 0;
}
.v-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(41,182,207,0.35), transparent);
  margin: 36px 0;
}
.v-close {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(17px, 2vw, 20px);
  color: #29B6CF;
  line-height: 1.9;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 600px) {
  .concept-inner { padding: 52px 24px; }
  .vision-wrap { padding: 56px 24px; }
  .flow-steps {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  .flow-arrow {
    transform: rotate(90deg);
    margin: -8px auto;
    padding: 0;
  }
  .flow-box { padding: 18px 12px 14px; }
  .level-table thead th,
  .level-table tbody td { padding: 12px 12px; }
}
</style>

<div style="font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#05070b; color:#E0ECFF;">
  <div style="background-image:linear-gradient(to bottom, rgba(5,7,11,0) 0%, rgba(5,7,11,0.7) 70%, rgba(5,7,11,1) 100%), url('/haikeihaikei.png'); background-size:cover; background-position:center top; background-repeat:no-repeat;">
    <!-- MASTHEAD -->
    <header style="background:rgba(27,40,56,0.9); padding:20px clamp(16px,5vw,48px); display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:16px;">
        <img src="/logo-200x70-v2.png" alt="RawStock" style="height:40px; width:auto;" />
      </div>
      <div style="color:#FFFFFF; font-size:11px; letter-spacing:0.1em; text-transform:uppercase;">
        LIVE &amp; COMMUNITY PLATFORM / JAPAN 2026
      </div>
    </header>

    <!-- COVER STORY -->
    <main style="max-width:720px; margin:0 auto; padding:80px 48px 40px;">
    <section style="margin-bottom:72px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <span style="font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:#29B6CF;">
          Cover Story
        </span>
        <span style="flex:1; height:1px; background:#29B6CF; opacity:0.4;"></span>
      </div>
      <h1 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight:800; line-height:1.25; margin:0 0 16px; color:#F5FBFF; text-shadow:0 0 6px rgba(41,182,207,0.9), 0 0 18px rgba(41,182,207,0.7);">
        個人開発×AIで、還元率90%。
      </h1>
      <p style="font-size:clamp(14px,3.2vw,18px); color:#B9ECFF; margin:0 0 24px; text-shadow:0 0 4px rgba(41,182,207,0.7);">
        AIに作れない現場の記憶が売れる。
      </p>
      <div style="border-left:4px solid #E53935; padding-left:20px; margin-bottom:28px;">
        <p style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(14px,3.4vw,17px); line-height:1.9; margin:0; color:#E0ECFF;">
          個人開発だから、余計なコストがない。AIを活用して作ったから、少人数で回せる。だから有料動画は売上の90%をクリエイターに還元できる。手数料は決済サービスの約3.5％のみ払う側が負担する。クリエイターの論理だけで設計できた、それが個人×AI開発の強みです。
        </p>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        <button id="lp-start-free" style="border:1px solid #FFFFFF; cursor:default; padding:12px 28px; background:transparent; color:#FFFFFF; font-size:14px; font-weight:600; letter-spacing:0.06em; opacity:0.8;">
          近日公開
        </button>
        <button id="lp-contact" style="border:1px solid #FFFFFF; cursor:pointer; padding:12px 28px; background:transparent; color:#FFFFFF; font-size:14px; font-weight:500; letter-spacing:0.06em;">
          資料請求・お問い合わせ
        </button>
      </div>
    </section>
    </main>
  </div>

  <!-- FOR YOU -->
  <section style="background:#1B2838;">
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <div style="font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:#29B6CF; margin-bottom:8px;">
        For You
      </div>
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(24px,4.4vw,36px); margin:0 0 24px; color:#FFFFFF;">
        こんな人のために作りました。
      </h2>
      <div style="border-top:1px solid rgba(224,232,240,0.25);">
        <div style="padding:12px 0; border-bottom:1px solid rgba(224,232,240,0.25);">
          <div style="font-weight:700; margin-bottom:4px; color:#FFFFFF;">インディーズバンド・アーティスト</div>
          <div style="color:#E0ECFF; font-size:14px;">現場の熱量を動画にして売る</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid rgba(224,232,240,0.25);">
          <div style="font-weight:700; margin-bottom:4px; color:#FFFFFF;">ライバー</div>
          <div style="color:#E0ECFF; font-size:14px;">生配信で最大95%還元</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid rgba(224,232,240,0.25);">
          <div style="font-weight:700; margin-bottom:4px; color:#FFFFFF;">メンタルコーチ・講師</div>
          <div style="color:#E0ECFF; font-size:14px;">有料コンテンツ販売・個別セッション（ツーショット）・有料ライブ配信で稼ぐ。</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid rgba(224,232,240,0.25);">
          <div style="font-weight:700; margin-bottom:4px; color:#FFFFFF;">動画編集者</div>
          <div style="color:#E0ECFF; font-size:14px;">編集依頼を受けて稼ぐ</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid rgba(224,232,240,0.25);">
          <div style="font-weight:700; margin-bottom:4px; color:#FFFFFF;">コミュニティ管理人</div>
          <div style="color:#E0ECFF; font-size:14px;">広告収益の70%がコミュニティへ</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONCEPT -->
  <section>
    <!-- ===== CONCEPT SECTION ===== -->
    <div class="concept-wrap">

      <!-- 背景SVG：ライブハウスステージ -->
      <svg class="bg-stage" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <!-- 天井リグ -->
        <rect x="0" y="0" width="900" height="8" fill="#1e2a3a"/>
        <rect x="60" y="8" width="780" height="18" rx="3" fill="#162030"/>
        <!-- ライトバー -->
        <rect x="80" y="14" width="740" height="10" rx="3" fill="#1a2840"/>
        <circle cx="140" cy="19" r="9" fill="#29B6CF" opacity="0.7"/>
        <circle cx="220" cy="19" r="9" fill="#E53935" opacity="0.6"/>
        <circle cx="300" cy="19" r="9" fill="#fff" opacity="0.35"/>
        <circle cx="380" cy="19" r="9" fill="#29B6CF" opacity="0.6"/>
        <circle cx="460" cy="19" r="9" fill="#fff" opacity="0.3"/>
        <circle cx="540" cy="19" r="9" fill="#E53935" opacity="0.5"/>
        <circle cx="620" cy="19" r="9" fill="#29B6CF" opacity="0.55"/>
        <circle cx="700" cy="19" r="9" fill="#fff" opacity="0.3"/>
        <circle cx="760" cy="19" r="9" fill="#E53935" opacity="0.4"/>
        <!-- ライトビーム -->
        <polygon points="140,28 100,320 180,320" fill="#29B6CF" opacity="0.07"/>
        <polygon points="380,28 320,320 440,320" fill="#fff" opacity="0.04"/>
        <polygon points="460,28 390,380 530,380" fill="#29B6CF" opacity="0.06"/>
        <polygon points="620,28 560,320 680,320" fill="#E53935" opacity="0.05"/>
        <polygon points="760,28 700,300 820,300" fill="#29B6CF" opacity="#29B6CF"/>
        <!-- ステージ -->
        <rect x="0" y="340" width="900" height="12" rx="0" fill="#1e2a3a"/>
        <rect x="0" y="352" width="900" height="160" fill="#0d1117"/>
        <!-- スピーカースタック左 -->
        <rect x="20" y="200" width="90" height="155" rx="3" fill="#0d1117"/>
        <rect x="28" y="210" width="74" height="72" rx="36" fill="#111820"/>
        <circle cx="65" cy="246" r="28" fill="#0a0f17"/>
        <circle cx="65" cy="246" r="18" fill="#0d1520"/>
        <rect x="36" y="292" width="58" height="42" rx="2" fill="#111820"/>
        <circle cx="65" cy="313" r="12" fill="#0a0f17"/>
        <!-- スピーカースタック右 -->
        <rect x="790" y="200" width="90" height="155" rx="3" fill="#0d1117"/>
        <rect x="798" y="210" width="74" height="72" rx="36" fill="#111820"/>
        <circle cx="835" cy="246" r="28" fill="#0a0f17"/>
        <circle cx="835" cy="246" r="18" fill="#0d1520"/>
        <rect x="806" y="292" width="58" height="42" rx="2" fill="#111820"/>
        <circle cx="835" cy="313" r="12" fill="#0a0f17"/>
        <!-- ドラムセット -->
        <ellipse cx="450" cy="338" rx="60" ry="8" fill="#111820"/>
        <ellipse cx="390" cy="330" rx="28" ry="6" fill="#0d1520"/>
        <ellipse cx="510" cy="330" rx="28" ry="6" fill="#0d1520"/>
        <rect x="430" y="290" width="40" height="50" rx="3" fill="#111820"/>
        <!-- マイクスタンド中央 -->
        <line x1="450" y1="340" x2="450" y2="270" stroke="#2a3a4a" stroke-width="3"/>
        <ellipse cx="450" cy="264" rx="7" ry="10" fill="#2a3a4a"/>
        <!-- マイクスタンド左 -->
        <line x1="320" y1="340" x2="320" y2="285" stroke="#2a3a4a" stroke-width="2.5"/>
        <ellipse cx="320" cy="280" rx="5" ry="8" fill="#2a3a4a"/>
        <!-- マイクスタンド右 -->
        <line x1="580" y1="340" x2="580" y2="285" stroke="#2a3a4a" stroke-width="2.5"/>
        <ellipse cx="580" cy="280" rx="5" ry="8" fill="#2a3a4a"/>
        <!-- 群衆シルエット -->
        <ellipse cx="80" cy="440" rx="30" ry="52" fill="#070b10"/>
        <ellipse cx="150" cy="430" rx="27" ry="48" fill="#070b10"/>
        <ellipse cx="220" cy="445" rx="29" ry="54" fill="#070b10"/>
        <ellipse cx="290" cy="435" rx="28" ry="50" fill="#070b10"/>
        <ellipse cx="360" cy="448" rx="30" ry="56" fill="#070b10"/>
        <ellipse cx="430" cy="438" rx="28" ry="52" fill="#070b10"/>
        <ellipse cx="500" cy="445" rx="29" ry="54" fill="#070b10"/>
        <ellipse cx="570" cy="432" rx="27" ry="48" fill="#070b10"/>
        <ellipse cx="640" cy="446" rx="30" ry="55" fill="#070b10"/>
        <ellipse cx="710" cy="436" rx="28" ry="50" fill="#070b10"/>
        <ellipse cx="780" cy="443" rx="29" ry="52" fill="#070b10"/>
        <ellipse cx="850" cy="434" rx="27" ry="48" fill="#070b10"/>
        <!-- 腕を上げている人 -->
        <line x1="150" y1="400" x2="128" y2="358" stroke="#070b10" stroke-width="7" stroke-linecap="round"/>
        <line x1="360" y1="395" x2="338" y2="350" stroke="#070b10" stroke-width="7" stroke-linecap="round"/>
        <line x1="500" y1="398" x2="522" y2="352" stroke="#070b10" stroke-width="7" stroke-linecap="round"/>
        <line x1="710" y1="400" x2="732" y2="355" stroke="#070b10" stroke-width="7" stroke-linecap="round"/>
        <line x1="780" y1="395" x2="758" y2="352" stroke="#070b10" stroke-width="7" stroke-linecap="round"/>
        <!-- スモーク -->
        <ellipse cx="200" cy="340" rx="120" ry="20" fill="#29B6CF" opacity="0.04"/>
        <ellipse cx="700" cy="340" rx="100" ry="18" fill="#E53935" opacity="0.03"/>
        <ellipse cx="450" cy="335" rx="160" ry="22" fill="#fff" opacity="0.02"/>
      </svg>

      <div class="bg-grid"></div>
      <div class="spotlight"></div>
      <div class="spotlight-red"></div>
      <div class="spotlight-red2"></div>

      <div class="concept-inner">

        <div class="c-label">
          <span class="c-label-text">Concept</span>
          <span class="c-label-line"></span>
        </div>

        <h2 class="c-heading">生の瞬間には、<br><em>2種類</em>ある。</h2>

        <p class="c-body">ひとつは現場レポート。ライブハウス、劇場、フェス。その場にいた人だけが撮れる映像を、有料コンテンツとして販売する。もうひとつはリアルタイム生配信。コメント、投げ銭、ファンとのリアルな交流。その熱量ごとアーカイブとして積み上げていく。どちらも流れて消えるんじゃなく、積み上がる資産になる。</p>

        <div class="metal-divider">
          <div class="metal-divider-line"></div>
          <div class="metal-divider-diamonds"><span></span><span></span><span></span></div>
          <div class="metal-divider-line"></div>
        </div>

        <p class="flow-title">— Ecosystem Flow</p>

        <div class="flow-steps">
          <!-- 01 -->
          <div class="flow-step">
            <div class="flow-box">
              <span class="flow-num">01</span>
              <div class="flow-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="8" y="2" width="12" height="22" rx="2" stroke="#29B6CF" stroke-width="1.5"/>
                  <circle cx="14" cy="18" r="2.5" fill="#29B6CF"/>
                  <rect x="11" y="5" width="6" height="1.5" rx=".75" fill="rgba(41,182,207,0.4)"/>
                </svg>
              </div>
              <div class="flow-name">現場で<br>スマホ撮影</div>
              <div class="flow-desc">ファンが現場へ</div>
            </div>
          </div>
          <div class="flow-arrow">›</div>
          <!-- 02 -->
          <div class="flow-step">
            <div class="flow-box">
              <span class="flow-num">02</span>
              <div class="flow-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="5" width="20" height="15" rx="2" stroke="#29B6CF" stroke-width="1.5"/>
                  <path d="M8 12 L12 8 L16 12 L20 8" stroke="#29B6CF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 22 L14 19 L21 22" stroke="#29B6CF" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flow-name">編集者に<br>依頼</div>
              <div class="flow-desc">報酬は自由設定</div>
            </div>
          </div>
          <div class="flow-arrow">›</div>
          <!-- 03 -->
          <div class="flow-step">
            <div class="flow-box">
              <span class="flow-num">03</span>
              <div class="flow-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="10" stroke="#29B6CF" stroke-width="1.5"/>
                  <path d="M11 9.5 L11 18.5 L20 14 Z" fill="#29B6CF"/>
                </svg>
              </div>
              <div class="flow-name">有料コンテンツ<br>として販売</div>
              <div class="flow-desc">売上90%還元</div>
            </div>
          </div>
          <div class="flow-arrow">›</div>
          <!-- 04 -->
          <div class="flow-step">
            <div class="flow-box">
              <span class="flow-num">04</span>
              <div class="flow-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="10" cy="10" r="4" stroke="#29B6CF" stroke-width="1.5"/>
                  <circle cx="20" cy="10" r="3" stroke="#29B6CF" stroke-width="1.5"/>
                  <path d="M3 23 C3 18 6 15 10 15 C14 15 17 18 17 23" stroke="#29B6CF" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M20 15 C23 15 25 18 25 23" stroke="#29B6CF" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flow-name">コミュニティ<br>へ届く</div>
              <div class="flow-desc">世界に広がる</div>
            </div>
          </div>
          <div class="flow-arrow">›</div>
          <!-- 05 -->
          <div class="flow-step">
            <div class="flow-box">
              <span class="flow-num">05</span>
              <div class="flow-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4 L14 14" stroke="#29B6CF" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 10 L14 4 L20 10" stroke="#29B6CF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
                  <rect x="5" y="18" width="18" height="7" rx="1" stroke="#29B6CF" stroke-width="1.5"/>
                  <line x1="9" y1="21.5" x2="19" y2="21.5" stroke="#29B6CF" stroke-width="1"/>
                </svg>
              </div>
              <div class="flow-name">次のライブ<br>告知・集客</div>
              <div class="flow-desc">資産が循環する</div>
            </div>
          </div>
        </div>

        <div class="pullquote">
          <span class="pullquote-mark">"</span>
          AIには絶対に作れない、<br>一度きりの記録。
        </div>

        <h3 class="level-heading">Live Streaming Revenue</h3>
        <p class="level-sub">有料動画は固定90％還元、ライブ配信収益はレベルや所属によって収益分配が決定されます</p>
        <table class="level-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>事務所所属</th>
              <th>個人</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-top">
              <td><span class="level-badge">Level 4</span></td>
              <td><span class="pct-top">95%</span></td>
              <td><span class="pct-top">75%</span></td>
            </tr>
            <tr>
              <td><span class="level-badge">Level 3</span></td>
              <td><span class="pct">90%</span></td>
              <td><span class="pct">70%</span></td>
            </tr>
            <tr>
              <td><span class="level-badge">Level 2</span></td>
              <td><span class="pct">80%</span></td>
              <td><span class="pct">60%</span></td>
            </tr>
            <tr>
              <td><span class="level-badge">Level 1</span></td>
              <td><span class="pct">70%</span></td>
              <td><span class="pct">50%</span></td>
            </tr>
          </tbody>
        </table>
        <p class="level-note">※タレントのマネージメントコスト、トラブル防止コストの観点より。</p>

      </div>
    </div>
  </section>

  <!-- NUMBERS -->
  <section style="background:#1B2838;">
    <div style="max-width:960px; margin:0 auto; padding:64px 48px;">
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 32px; color:#FFFFFF;">
        数字で見るRawStock。
      </h2>
      <div style="display:flex; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.2); border-bottom:1px solid rgba(255,255,255,0.2);">
        <div style="flex:1 1 0; min-width:220px; padding:20px 16px; border-right:1px solid rgba(255,255,255,0.2);">
          <div style="color:#E0ECFF; font-size:13px; margin-bottom:6px;">有料動画</div>
          <div style="color:#E53935; font-size:34px; font-weight:700; margin-bottom:4px;">90%</div>
          <div style="color:#E0ECFF; font-size:13px;">売上の90%があなたへ</div>
        </div>
        <div style="flex:1 1 0; min-width:220px; padding:20px 16px; border-right:1px solid rgba(255,255,255,0.2);">
          <div style="color:#E0ECFF; font-size:13px; margin-bottom:6px;">ライブ配信</div>
          <div style="color:#E53935; font-size:34px; font-weight:700; margin-bottom:4px;">95%</div>
          <div style="color:#E0ECFF; font-size:13px;">最大95%還元</div>
        </div>
        <div style="flex:1 1 0; min-width:220px; padding:20px 16px;">
          <div style="color:#E0ECFF; font-size:13px; margin-bottom:6px;">手数料設計</div>
          <div style="color:#E53935; font-size:34px; font-weight:700; margin-bottom:4px;">0%</div>
          <div style="color:#E0ECFF; font-size:13px; white-space:pre-line;">手数料は決済サービスの約3.5％のみ\n払う側が負担する</div>
        </div>
      </div>
    </div>
  </section>

  <!-- REVENUE -->
  <section>
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 24px; color:#1B2838;">
        稼ぎ方は一つじゃない。
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:10px 8px; border-bottom:2px solid #29B6CF; color:#546A82;">対象</th>
            <th style="text-align:left; padding:10px 8px; border-bottom:2px solid #29B6CF; color:#546A82;">収益の仕組み</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">有料動画販売</td>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">売上90%還元。編集者・撮影者・出演者への分配もアプリ上で自由設定、自動分配。</td>
          </tr>
          <tr>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">ライブ配信</td>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">レベル制度で最大95%還元。個人でも最大75%。</td>
          </tr>
          <tr>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">コミュニティ広告</td>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">メンバー数×7円/日。収益の70%がコミュニティへ。</td>
          </tr>
          <tr>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">動画編集依頼</td>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">編集クリエイターとして登録。報酬設定は自由。</td>
          </tr>
          <tr>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">ツーショット予約</td>
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">ファンとの特別な時間を販売。</td>
          </tr>
          <tr>
            <td style="padding:10px 8px;">事務所所属</td>
            <td style="padding:10px 8px;">事務所経由でLevel4から参加可能。</td>
          </tr>
        </tbody>
      </table>

      <div style="background:#f4f8fb; border:1px solid #e0e8f0; padding:18px 16px; border-radius:4px; margin-bottom:18px;">
        <div style="font-family:'DM Serif Display', 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:30px; color:#29B6CF; margin-bottom:10px;">
          メンバー数 × 7円 / 日（最低10,000円〜）
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:13px; color:#546A82;">
          <div>RawStock 20%</div>
          <div>／ イベント積立 10%</div>
          <div>／ 管理人・モデレーター 70%</div>
        </div>
      </div>
      <div style="font-size:14px; line-height:1.9; color:#546A82;">
        <p style="margin:0 0 4px;">ジャンルページにも広告枠があります。</p>
        <p style="margin:0 0 4px;">ジャンル広告費 = ジャンル全体メンバー数合計 × 5円／日</p>
        <p style="margin:0;">ジャンル管理人：毎月1日に、そのジャンルで最もメンバーが多いコミュニティの管理人が自動的に就任</p>
      </div>
    </div>
  </section>

  <!-- COMMUNITY -->
  <section style="background:#f4f8fb;">
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 20px; color:#1B2838;">
        コミュニティが、自走する。
      </h2>
      <p style="font-size:15px; line-height:1.9; color:#546A82; margin:0;">
        広告収益の70%は管理人・モデレーターへ。10%はイベント資金として自動積立。10万円に到達したらメンバーの投票でコンテストやイベントを開催できる。賞金もコミュニティのお金から出せる。プラットフォームじゃなく、コミュニティが主役の経済圏。不信任制度でコミュニティの健全さを保つ。ジュークボックス機能でメンバーとYouTube・オリジナル動画を同時視聴できる。
      </p>
    </div>
  </section>

  <!-- VISION -->
  <section>
    <!-- ===== VISION SECTION ===== -->
    <div class="vision-wrap">
      <div class="vision-inner">

        <div class="v-label">
          <span class="v-label-text">Vision</span>
          <span class="v-label-line"></span>
        </div>

        <h2 class="v-heading">次のステージへ。</h2>

        <p class="v-body">日本のインディーズシーンを、世界中のファンに届ける。ベルリンのバンドが、ソウルのライバーが、ニューヨークのファンが、RawStockに集まる未来を作っています。言語の壁はAIが超える。音楽の熱量はそのまま伝わる。</p>

        <div class="v-divider"></div>

        <p class="v-close">今はまだ小さい。でも、仕組みは最初から世界を見て設計しています。一緒に育ててくれる人を待っています。</p>

      </div>
    </div>
  </section>

  <!-- HONEST -->
  <section>
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 20px; color:#1B2838;">
        個人開発です。正直に言います。
      </h2>
      <p style="font-size:15px; line-height:1.9; color:#546A82; margin:0;">
        まだ完成していない機能があります。ライブ配信・決済機能は現在開発中です。でも、クリエイターに不利な設計は最初から入れていません。手数料はクリエイターではなく購入者が負担する。還元率は最初から高く設定する。大きくなってから還元率を下げるつもりもありません。小さく始めて、一緒に育てていきたいと思っています。
      </p>
    </div>
  </section>

  <!-- CONTACT -->
  <section style="background:#1B2838;">
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 16px; color:#FFFFFF;">
        まず、話を聞かせてください。
      </h2>
      <p style="font-size:14px; line-height:1.9; color:#E0ECFF; margin:0 0 10px;">
        配信者・コミュニティ運営者・広告出稿・展示会や営業資料のご請求はメールにて。
      </p>
      <p style="font-size:14px; color:#29B6CF; margin:0 0 20px;">
        rawstock.infomation@gmail.com
      </p>
      <button id="lp-contact-bottom" style="border:none; cursor:pointer; padding:10px 24px; background:#FFFFFF; color:#1B2838; font-size:14px; font-weight:500;">
        お問い合わせ
      </button>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="background:#1B2838; border-top:1px solid rgba(255,255,255,0.16); padding:24px 48px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; font-size:11px; color:#FFFFFF;">
    <div>© 2026 RawStock — 鹿之賦 宏美</div>
    <div>〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C</div>
  </footer>
</div>
`;

export default function LpScreen() {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#FFFFFF",
        color: "#1B2838",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* ボタンの挙動だけはReact側で紐づける */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            var start = document.getElementById('lp-start-free');
            var contactTop = document.getElementById('lp-contact');
            var contactBottom = document.getElementById('lp-contact-bottom');
            function goContact() {
              window.location.href = 'mailto:rawstock.infomation@gmail.com';
            }
            if (contactTop) contactTop.addEventListener('click', goContact);
            if (contactBottom) contactBottom.addEventListener('click', goContact);
          })();
        `,
        }}
      />
    </div>
  );
}

