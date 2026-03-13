import React from "react";
import { Platform } from "react-native";

const html = `
<style>
/* ============================================================
   DESIGN TOKENS — 全セクション共通
   ============================================================ */
:root {
  --bg-darkest:   #07090f;
  --bg-dark:      #0d1420;
  --bg-mid:       #1B2838;
  --bg-light:     #1E3045;
  --bg-lighter:   #243850;
  --accent:       #29B6CF;
  --accent-dark:  #1A8A9F;
  --red:          #E53935;
  --yellow:       #FFD600;
  --text:         #FFFFFF;
  --text-sec:     rgba(255,255,255,0.72);
  --text-muted:   rgba(255,255,255,0.4);
  --border:       rgba(41,182,207,0.25);
  --border-dim:   rgba(255,255,255,0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg-darkest);
  color: var(--text);
  font-family: 'Noto Sans JP', sans-serif;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }

/* ============================================================
   SHARED LAYOUT
   ============================================================ */
.section-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 48px;
}
.section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}
.section-label span {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .45em;
  color: var(--accent);
  text-transform: uppercase;
  flex-shrink: 0;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border), transparent);
}
.divider-diamonds {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 44px 0;
}
.divider-diamonds::before,
.divider-diamonds::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.divider-diamonds-inner {
  display: flex;
  gap: 5px;
}
.divider-diamonds-inner span {
  display: block;
  width: 5px;
  height: 5px;
  background: var(--accent);
  transform: rotate(45deg);
  opacity: 0.7;
}

/* ============================================================
   1. MASTHEAD
   ============================================================ */
.masthead {
  background: var(--bg-mid);
  border-bottom: 1px solid var(--border-dim);
  padding: 0 48px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.masthead-logo img {
  height: 36px;
  width: auto;
}
.masthead-tagline {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .25em;
  color: var(--text-muted);
}

/* ============================================================
   2. HERO
   ============================================================ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--bg-darkest);
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  filter: saturate(0.9);
}
.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(7,9,15,0.0) 0%,
    rgba(7,9,15,0.35) 55%,
    rgba(7,9,15,0.85) 100%
  );
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 120px 48px 100px;
}
.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.hero-label-dot {
  width: 6px;
  height: 6px;
  background: var(--red);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.hero-label-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .4em;
  color: var(--text-muted);
}
.hero-h1 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(42px, 7vw, 80px);
  font-weight: 800;
  line-height: 1.15;
  color: #F5FBFF;
  margin-bottom: 20px;
  letter-spacing: .01em;
  text-shadow:
    0 0 12px rgba(0,245,255,0.9),
    0 0 28px rgba(0,0,0,0.95);
}
.hero-h1 em {
  font-style: normal;
  color: var(--accent);
}
.hero-sub {
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(16px, 2vw, 20px);
  color: var(--accent);
  margin-bottom: 32px;
  letter-spacing: .05em;
}
.hero-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 15px;
  line-height: 2;
  color: var(--text-sec);
  max-width: 600px;
  margin-bottom: 48px;
  border-left: 2px solid var(--red);
  padding-left: 20px;
}
.hero-btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-block;
  padding: 14px 36px;
  background: transparent;
  border: 1.5px solid var(--text-muted);
  color: var(--text-muted);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .1em;
  cursor: not-allowed;
}
.btn-secondary {
  display: inline-block;
  padding: 14px 36px;
  background: transparent;
  border: 1.5px solid var(--accent);
  color: var(--accent);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .1em;
  cursor: pointer;
  transition: background .2s;
}
.btn-secondary:hover { background: rgba(41,182,207,0.1); }

/* ============================================================
   3. FOR YOU
   ============================================================ */
.for-you {
  background: var(--bg-light);
  padding: 80px 0;
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
}
.for-you-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 40px;
  text-shadow: 0 0 10px rgba(0,0,0,0.7);
}
.for-you-list { list-style: none; }
.for-you-item {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-dim);
}
.for-you-item:last-child { border-bottom: none; }
.for-you-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  min-width: 200px;
  flex-shrink: 0;
}
.for-you-desc {
  font-size: 14px;
  color: var(--text-sec);
  line-height: 1.7;
}

/* ============================================================
   4. CONCEPT
   ============================================================ */
.concept {
  position: relative;
  background: var(--bg-dark);
  padding: 96px 0;
  overflow: hidden;
}
/* ステージ背景SVG */
.concept-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.concept-bg svg {
  width: 100%;
  height: 100%;
  opacity: 0.14;
}
/* グリッド */
.concept-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(41,182,207,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(41,182,207,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
/* スポットライト */
.concept-light-c {
  position: absolute;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(ellipse, rgba(41,182,207,0.1) 0%, transparent 65%);
  z-index: 0;
  pointer-events: none;
}
.concept-light-l {
  position: absolute;
  top: -100px;
  left: -5%;
  width: 400px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(229,57,53,0.07) 0%, transparent 65%);
  z-index: 0;
  pointer-events: none;
}
.concept-light-r {
  position: absolute;
  top: -100px;
  right: -5%;
  width: 400px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(229,57,53,0.05) 0%, transparent 65%);
  z-index: 0;
  pointer-events: none;
}
.concept-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 48px;
}
.concept-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(28px, 4.5vw, 48px);
  font-weight: 800;
  color: var(--text);
  line-height: 1.25;
  margin-bottom: 28px;
  text-shadow: 0 0 12px rgba(0,0,0,0.85);
}
.concept-h2 em {
  font-style: italic;
  color: var(--accent);
  font-family: 'DM Serif Display', serif;
}
.concept-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 16px;
  line-height: 2;
  color: var(--text-sec);
  border-left: 2px solid var(--red);
  padding-left: 20px;
  margin-bottom: 0;
}
/* FLOW */
.flow-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 12px;
  letter-spacing: .35em;
  color: var(--accent);
  margin-bottom: 20px;
}
.flow-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 56px;
}
.flow-step { flex: 1; min-width: 0; }
.flow-box {
  border: 1px solid rgba(41,182,207,0.35);
  background: rgba(41,182,207,0.04);
  padding: 20px 8px 16px;
  text-align: center;
  position: relative;
  transition: border-color .2s, background .2s;
}
.flow-box:hover {
  border-color: var(--accent);
  background: rgba(41,182,207,0.09);
}
.flow-num {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--red);
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: .1em;
  padding: 2px 9px;
  white-space: nowrap;
}
.flow-icon {
  margin: 4px auto 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flow-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.45;
  letter-spacing: .03em;
}
.flow-desc {
  font-size: 9px;
  color: rgba(41,182,207,0.8);
  margin-top: 5px;
  line-height: 1.5;
}
.flow-arrow {
  width: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 18px;
  padding-bottom: 10px;
}
/* PULLQUOTE */
.pullquote {
  border-top: 1px solid rgba(41,182,207,0.25);
  border-bottom: 1px solid rgba(41,182,207,0.25);
  padding: 28px 0 28px 8px;
  margin: 52px 0;
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(18px, 2.5vw, 24px);
  color: var(--accent);
  line-height: 1.75;
  position: relative;
}
.pullquote-mark {
  font-family: 'DM Serif Display', serif;
  font-size: 80px;
  color: rgba(41,182,207,0.12);
  position: absolute;
  top: -16px;
  left: -4px;
  line-height: 1;
  pointer-events: none;
}
/* LEVEL TABLE */
.level-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: .15em;
  color: var(--text);
  margin-bottom: 4px;
}
.level-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 20px;
  letter-spacing: .04em;
}
.level-table {
  width: 100%;
  border-collapse: collapse;
}
.level-table thead tr {
  background: rgba(41,182,207,0.12);
  border-bottom: 2px solid var(--accent);
}
.level-table thead th {
  padding: 13px 20px;
  color: var(--accent);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: .12em;
  text-align: left;
  text-transform: uppercase;
}
.level-table thead th:not(:first-child) { text-align: center; }
.level-table tbody tr { border-bottom: 1px solid var(--border-dim); }
.level-table tbody tr:hover { background: rgba(41,182,207,0.04); }
.level-table tbody tr.row-top { background: rgba(229,57,53,0.06); }
.level-table tbody td {
  padding: 16px 20px;
  font-size: 13px;
  color: var(--text-sec);
  font-weight: 500;
}
.level-table tbody td:not(:first-child) { text-align: center; }
.level-badge {
  display: inline-block;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
  letter-spacing: .08em;
}
.pct {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  color: var(--red);
  font-style: italic;
}
.pct-top {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--red);
  font-style: italic;
}
.level-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 14px;
  letter-spacing: .04em;
}

/* ============================================================
   5. NUMBERS
   ============================================================ */
.numbers {
  background: var(--bg-mid);
  padding: 80px 0;
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
}
.numbers-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 40px;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
}
.numbers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border-dim);
  border: 1px solid var(--border-dim);
}
.number-card {
  background: var(--bg-mid);
  padding: 32px 28px;
}
.number-label {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: .1em;
  margin-bottom: 12px;
}
.number-value {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(40px, 5vw, 60px);
  color: var(--accent);
  font-style: italic;
  line-height: 1;
  margin-bottom: 10px;
}
.number-desc {
  font-size: 12px;
  color: var(--text-sec);
  line-height: 1.6;
}

/* ============================================================
   6. REVENUE
   ============================================================ */
.revenue {
  background: var(--bg-dark);
  padding: 96px 0;
  border-top: 1px solid var(--border-dim);
}
.revenue-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(26px, 4vw, 42px);
  font-weight: 800;
  color: var(--yellow);
  margin-bottom: 40px;
  text-shadow:
    0 0 14px rgba(255,214,0,0.8),
    0 0 26px rgba(0,0,0,0.9);
}
.revenue-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}
.revenue-table thead tr {
  border-bottom: 1px solid var(--accent);
}
.revenue-table thead th {
  padding: 10px 0;
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
  letter-spacing: .1em;
  text-align: left;
}
.revenue-table thead th:last-child { text-align: left; }
.revenue-table tbody tr { border-bottom: 1px solid var(--border-dim); }
.revenue-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.revenue-table tbody td {
  padding: 18px 0;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  vertical-align: top;
}
.revenue-table tbody td:first-child {
  min-width: 160px;
  color: var(--text-sec);
  font-size: 13px;
}
.revenue-ad-box {
  border: 1px solid var(--border);
  padding: 24px 28px;
  margin-top: 0;
}
.revenue-ad-main {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(20px, 3vw, 28px);
  color: var(--accent);
  letter-spacing: .05em;
  margin-bottom: 8px;
}
.revenue-ad-split {
  font-size: 13px;
  color: var(--text-sec);
  margin-bottom: 16px;
}
.revenue-ad-genre {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.7;
  border-top: 1px solid var(--border-dim);
  padding-top: 14px;
}

/* ============================================================
   7. ECOSYSTEM
   ============================================================ */
.ecosystem {
  background: var(--bg-light);
  padding: 96px 0;
  border-top: 1px solid var(--border-dim);
}
.ecosystem-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
}
.ecosystem-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 15px;
  line-height: 2;
  color: var(--text-sec);
  max-width: 680px;
}

/* ============================================================
   8. COMMUNITY
   ============================================================ */
.community {
  background: var(--bg-mid);
  padding: 96px 0;
  border-top: 1px solid var(--border-dim);
}
.community-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
}
.community-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 15px;
  line-height: 2;
  color: var(--text-sec);
  max-width: 680px;
}

/* ============================================================
   9. VISION — public/image.png 世界地図
   ============================================================ */
.vision {
  position: relative;
  background: linear-gradient(180deg, #141c29 0%, #1B2838 55%, #202b3a 100%);
  padding: 96px 0;
  overflow: hidden;
  border-top: 1px solid var(--border-dim);
}
.vision-map-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.vision-map-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 1;
  mix-blend-mode: multiply;
}
.vision-map-fade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    /* 上部：紺をうっすら乗せる（画像をちゃんと見せる） */
    linear-gradient(180deg, rgba(27,40,56,0.25) 0%, rgba(27,40,56,0.25) 35%, rgba(27,40,56,0.0) 70%),
    /* 下部：ブルーグレーで締めつつフェードアウト（横方向マスクなし） */
    linear-gradient(180deg, rgba(20,28,41,0.0) 0%, rgba(20,28,41,0.55) 80%, rgba(20,28,41,0.9) 100%);
}
.vision-inner {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 48px;
}
.vision-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(26px, 4.5vw, 48px);
  font-weight: 800;
  color: var(--text);
  line-height: 1.3;
  margin-bottom: 32px;
}
.vision-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 17px;
  line-height: 2;
  color: rgba(255,255,255,0.82);
  max-width: 680px;
}
.vision-divider {
  width: 100%;
  max-width: 680px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(41,182,207,0.35), transparent);
  margin: 36px 0;
}
.vision-close {
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(17px, 2vw, 20px);
  color: var(--accent);
  line-height: 1.9;
  max-width: 680px;
}

/* ============================================================
   10. HONEST
   ============================================================ */
.honest {
  background: var(--bg-darkest);
  padding: 96px 0;
  border-top: 1px solid var(--border-dim);
}
.honest-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 800;
  color: rgba(255,255,255,0.75);
  margin-bottom: 24px;
}
.honest-body {
  font-family: 'Shippori Mincho', serif;
  font-size: 15px;
  line-height: 2;
  color: rgba(255,255,255,0.55);
  max-width: 680px;
}

/* ============================================================
   11. CONTACT
   ============================================================ */
.contact {
  background: var(--bg-light);
  padding: 96px 0;
  border-top: 1px solid var(--border-dim);
}
.contact-h2 {
  font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
}
.contact-sub {
  font-size: 14px;
  color: var(--text-sec);
  margin-bottom: 28px;
  line-height: 1.8;
}
.contact-email {
  color: var(--accent);
  font-size: 15px;
  margin-bottom: 28px;
  display: block;
}

/* ============================================================
   12. FOOTER
   ============================================================ */
.footer {
  background: var(--bg-darkest);
  border-top: 1px solid var(--border-dim);
  padding: 28px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-copy {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: .04em;
}
.footer-address {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  line-height: 1.6;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 700px) {
  .section-inner,
  .concept-inner,
  .vision-inner { padding: 0 24px; }
  .masthead { padding: 0 24px; }
  .hero-inner { padding: 80px 24px 72px; }
  .footer { padding: 24px; flex-direction: column; align-items: flex-start; }
  .footer-address { text-align: left; }
  .numbers-grid { grid-template-columns: 1fr; }
  .flow-steps { flex-direction: column; align-items: stretch; gap: 20px; }
  .flow-arrow { transform: rotate(90deg); margin: -8px auto; padding: 0; }
  .for-you-item { flex-direction: column; gap: 6px; }
  .for-you-name { min-width: unset; }
}
</style>

<!-- ===== 1. MASTHEAD ===== -->
<header class="masthead">
  <a href="/lp" class="masthead-logo">
    <img src="/logo-200x70-v2.png" alt="RawStock my haven">
  </a>
  <span class="masthead-tagline">LIVE &amp; COMMUNITY PLATFORM / JAPAN 2026</span>
</header>

<!-- ===== 2. HERO ===== -->
<section class="hero">
  <div class="hero-bg">
    <img src="/assets/haikeihaikei.png" alt="">
    <div class="hero-bg-overlay"></div>
  </div>
  <div class="hero-inner">
    <div class="hero-label">
      <span class="hero-label-dot"></span>
      <span class="hero-label-text">Cover Story</span>
    </div>
    <h1 class="hero-h1">個人開発×AIで、<br>還元率<em>90%</em>。</h1>
    <p class="hero-sub">AIに作れない現場の記憶が売れる。</p>
    <p class="hero-body">個人開発だから、余計なコストがない。AIを活用して作ったから、少人数で回せる。だから有料動画は売上の90%をクリエイターに還元できる。手数料は決済サービスの約3.5%のみ払う側が負担する。クリエイターの論理だけで設計できた、それが個人×AI開発の強みです。</p>
    <div class="hero-btns">
      <span class="btn-primary">近日公開</span>
      <a href="mailto:rawstock.infomation@gmail.com" class="btn-secondary">資料請求・お問い合わせ</a>
    </div>
  </div>
</section>

<!-- ===== 3. FOR YOU ===== -->
<section class="for-you">
  <div class="section-inner">
    <div class="section-label"><span>For You</span></div>
    <h2 class="for-you-h2">こんな人のために作りました。</h2>
    <ul class="for-you-list">
      <li class="for-you-item">
        <span class="for-you-name">インディーズバンド・アーティスト</span>
        <span class="for-you-desc">現場の熱量を動画にして売る</span>
      </li>
      <li class="for-you-item">
        <span class="for-you-name">ライバー</span>
        <span class="for-you-desc">生配信で最大95%還元</span>
      </li>
      <li class="for-you-item">
        <span class="for-you-name">メンタルコーチ・講師</span>
        <span class="for-you-desc">有料コンテンツ販売・個別セッション（ツーショット）・有料ライブ配信で稼ぐ。</span>
      </li>
      <li class="for-you-item">
        <span class="for-you-name">動画編集者</span>
        <span class="for-you-desc">編集依頼を受けて稼ぐ</span>
      </li>
      <li class="for-you-item">
        <span class="for-you-name">コミュニティ管理人</span>
        <span class="for-you-desc">広告収益の70%がコミュニティへ</span>
      </li>
    </ul>
  </div>
</section>

<!-- ===== 4. CONCEPT ===== -->
<section class="concept">
  <div class="concept-bg">
    <!-- ここにステージSVG（省略可。元HTMLのSVGをそのまま貼り付けてもOK） -->
  </div>
  <div class="concept-grid"></div>
  <div class="concept-light-c"></div>
  <div class="concept-light-l"></div>
  <div class="concept-light-r"></div>

  <div class="concept-inner">
    <div class="section-label"><span>Concept</span></div>
    <h2 class="concept-h2">生の瞬間には、<br><em>２種類</em>ある。</h2>
    <p class="concept-body">
      ひとつは現場レポート。ライブハウス、劇場、フェス。その場にいた人だけが撮れる映像を、有料コンテンツとして販売する。<br>
      もうひとつはリアルタイム生配信。コメント、投げ銭、ファンとのリアルな交流。その熱量ごとアーカイブとして積み上げていく。<br>
      どちらも流れて消えるんじゃなく、積み上がる資産になる。
    </p>

    <div class="divider-diamonds">
      <div class="divider-diamonds-inner">
        <span></span><span></span><span></span>
      </div>
    </div>

    <p class="flow-label">— Ecosystem Flow</p>

    <div class="flow-steps">
      <div class="flow-step">
        <div class="flow-box">
          <span class="flow-num">01</span>
          <div class="flow-icon">📱</div>
          <div class="flow-name">現場で<br>スマホ撮影</div>
          <div class="flow-desc">ファンが現場へ</div>
        </div>
      </div>
      <div class="flow-arrow">›</div>
      <div class="flow-step">
        <div class="flow-box">
          <span class="flow-num">02</span>
          <div class="flow-icon">✂️</div>
          <div class="flow-name">編集者に<br>依頼</div>
          <div class="flow-desc">報酬は自由設定</div>
        </div>
      </div>
      <div class="flow-arrow">›</div>
      <div class="flow-step">
        <div class="flow-box">
          <span class="flow-num">03</span>
          <div class="flow-icon">💰</div>
          <div class="flow-name">有料コンテンツ<br>として販売</div>
          <div class="flow-desc">売上90%還元</div>
        </div>
      </div>
      <div class="flow-arrow">›</div>
      <div class="flow-step">
        <div class="flow-box">
          <span class="flow-num">04</span>
          <div class="flow-icon">👥</div>
          <div class="flow-name">コミュニティ<br>へ届く</div>
          <div class="flow-desc">世界に広がる</div>
        </div>
      </div>
      <div class="flow-arrow">›</div>
      <div class="flow-step">
        <div class="flow-box">
          <span class="flow-num">05</span>
          <div class="flow-icon">📣</div>
          <div class="flow-name">次のライブ<br>告知・集客</div>
          <div class="flow-desc">資産が循環する</div>
        </div>
      </div>
    </div>

    <div class="pullquote">
      <span class="pullquote-mark">"</span>
      AIには絶対に作れない、<br>一度きりの記録。
    </div>

    <h3 class="level-title">Live Streaming Revenue</h3>
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
</section>

<!-- ===== 5. NUMBERS ===== -->
<section class="numbers">
  <div class="section-inner">
    <div class="section-label"><span>Numbers</span></div>
    <h2 class="numbers-h2">数字で見るRawStock。</h2>
    <div class="numbers-grid">
      <div class="number-card">
        <div class="number-label">有料動画</div>
        <div class="number-value">90%</div>
        <div class="number-desc">売上の90%があなたへ</div>
      </div>
      <div class="number-card">
        <div class="number-label">ライブ配信</div>
        <div class="number-value">95%</div>
        <div class="number-desc">最大95%還元</div>
      </div>
      <div class="number-card">
        <div class="number-label">手数料設計</div>
        <div class="number-value">0%</div>
        <div class="number-desc">手数料は決済サービスの約3.5％のみ払う側が負担する</div>
      </div>
    </div>
  </div>
</section>

<!-- ===== 6. REVENUE ===== -->
<section class="revenue">
  <div class="section-inner">
    <div class="section-label"><span>Revenue</span></div>
    <h2 class="revenue-h2">稼ぎ方は一つじゃない。</h2>
    <table class="revenue-table">
      <thead>
        <tr>
          <th>対象</th>
          <th>収益の仕組み</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>有料動画販売</td>
          <td>売上90%還元。編集者・撮影者・出演者への分配もアプリ上で自由設定、自動分配。</td>
        </tr>
        <tr>
          <td>ライブ配信</td>
          <td>レベル制度で最大95%還元。個人でも最大75%。</td>
        </tr>
        <tr>
          <td>コミュニティ広告</td>
          <td>メンバー数×7円/日。収益の70%がコミュニティへ。</td>
        </tr>
        <tr>
          <td>動画編集依頼</td>
          <td>編集クリエイターとして登録。報酬設定は自由。</td>
        </tr>
        <tr>
          <td>ツーショット予約</td>
          <td>ファンとの特別な時間を販売。</td>
        </tr>
        <tr>
          <td>事務所所属</td>
          <td>事務所経由でLevel4から参加可能。</td>
        </tr>
      </tbody>
    </table>

    <div class="revenue-ad-box">
      <div class="revenue-ad-main">メンバー数 × 7円 / 日（最低10,000円〜）</div>
      <div class="revenue-ad-split">RawStock 20% ／ イベント積立 10% ／ 管理人・モデレーター 70%</div>
      <div class="revenue-ad-genre">
        ジャンルページにも広告枠があります。ジャンル広告費 = ジャンル全体メンバー数合計 × 5円／日。ジャンル管理人は毎月1日に、そのジャンルで最もメンバーが多いコミュニティの管理人が自動的に就任。
      </div>
    </div>
  </div>
</section>

<!-- ===== 7. ECOSYSTEM ===== -->
<section class="ecosystem">
  <div class="section-inner">
    <div class="section-label"><span>Ecosystem</span></div>
    <h2 class="ecosystem-h2">撮る人と、編る人と、演る人が、出会う場所。</h2>
    <p class="ecosystem-body">
      現場でスマホで撮ったファンの動画が売れる。アーティスト・撮影者・編集者で分配比率を事前設定。公演を登録したアーティストが比率を決める。外部チケットリンクも掲載できる。全員がクリエイター、誰が何をしたかちゃんとお金に変わる。撮影可能な公演・アーティスト公認の場合のみ販売可能。著作権・肖像権はアーティスト登録時の同意で解決。
    </p>
  </div>
</section>

<!-- ===== 8. COMMUNITY ===== -->
<section class="community">
  <div class="section-inner">
    <div class="section-label"><span>Community</span></div>
    <h2 class="community-h2">コミュニティが、自走する。</h2>
    <p class="community-body">
      広告収益の70%は管理人・モデレーターへ。10%はイベント資金として自動積立。10万円に到達したらメンバーの投票でコンテストやイベントを開催できる。賞金もコミュニティのお金から出せる。プラットフォームじゃなく、コミュニティが主役の経済圏。不信任制度でコミュニティの健全さを保つ。プラットフォームに依存しない、自立した場所を作れる。ジュークボックス機能でメンバーとYouTube・オリジナル動画を同時視聴できる。
    </p>
  </div>
</section>

<!-- ===== 9. VISION ===== -->
<section class="vision">
  <div class="vision-map-img"><img src="/image.png" alt=""></div>
  <div class="vision-map-fade"></div>
  <div class="vision-inner">
    <div class="section-label"><span>Vision</span></div>
    <h2 class="vision-h2">次のステージへ。</h2>
    <p class="vision-body">
      まだ見ぬ世界の誰かに、この音を届けたい。日本のインディーズが、ベルリンの夜に、ソウルの路地に、ニューヨークの部屋に響く未来。言葉はAIが繋ぐ。でも震えとか、叫びとか、胸が熱くなる瞬間は――絶対に機械じゃ再現できない。RawStockはそれを、そのまま届ける場所。
    </p>
    <div class="vision-divider"></div>
    <p class="vision-close">今はちっちゃいけど、最初から世界を狙ってる。一緒にこのシーンをデカくしていきませんか？</p>
  </div>
</section>

<!-- ===== 10. HONEST ===== -->
<section class="honest">
  <div class="section-inner">
    <div class="section-label"><span>Honest</span></div>
    <h2 class="honest-h2">個人開発です。正直に言います。</h2>
    <p class="honest-body">
      まだ完成していない機能があります。ライブ配信・決済機能は現在開発中です。でも、クリエイターに不利な設計は最初から入れていません。手数料はクリエイターではなく購入者が負担する。還元率は最初から高く設定する。大きくなってから還元率を下げるつもりもありません。小さく始めて、一緒に育てていきたいと思っています。
    </p>
  </div>
</section>

<!-- ===== 11. CONTACT ===== -->
<section class="contact">
  <div class="section-inner">
    <div class="section-label"><span>Contact</span></div>
    <h2 class="contact-h2">まず、話を聞かせてください。</h2>
    <p class="contact-sub">
      配信者・コミュニティ運営者・広告出稿・展示会や営業資料のご請求はメールにて。
    </p>
    <a href="mailto:rawstock.infomation@gmail.com" class="contact-email">rawstock.infomation@gmail.com</a>
  </div>
</section>

<!-- ===== 12. FOOTER ===== -->
<footer class="footer">
  <div class="footer-copy">© 2026 RawStock — 鹿之賦 宏美</div>
  <div class="footer-address">
    〒150-0043 東京都渋谷区道玄坂1丁目10番8号<br>
    渋谷道玄坂東急ビル2F-C
  </div>
</footer>
`;

export default function LpScreen() {
  if (Platform.OS !== "web") return null;
  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

