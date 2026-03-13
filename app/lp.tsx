import React from "react";
import { Platform } from "react-native";
import { router } from "expo-router";

const html = `
<div style="font-family: 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#FFFFFF; color:#1B2838;">
  <!-- MASTHEAD -->
  <header style="background:#1B2838; padding:20px clamp(16px,5vw,48px); display:flex; align-items:center; justify-content:space-between;">
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
      <h1 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(32px,6vw,54px); line-height:1.25; margin:0 0 16px; color:#1B2838; font-weight:800;">
        AIに作れないものを、<br />売れる場所。
      </h1>
      <p style="font-size:clamp(14px,3.2vw,18px); color:#29B6CF; margin:0 0 24px;">
        還元率90%。これが個人開発にしかできないこと。
      </p>
      <div style="border-left:4px solid #E53935; padding-left:20px; margin-bottom:28px;">
        <p style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(14px,3.4vw,17px); line-height:1.9; margin:0; color:#1B2838;">
          個人開発だから、余計なコストがない。AIを活用して作ったから、少人数で回せる。だから有料動画は売上の90%をクリエイターに還元できる。手数料は受け取る側じゃなく、払う側が負担する。クリエイターの論理だけで設計できた、それが個人×AI開発の強みです。
        </p>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        <button id="lp-start-free" style="border:none; cursor:default; padding:12px 28px; background:#1B2838; color:#FFFFFF; font-size:14px; font-weight:600; letter-spacing:0.06em; opacity:0.6;">
          近日公開
        </button>
        <button id="lp-contact" style="border:1px solid #1B2838; cursor:pointer; padding:12px 28px; background:transparent; color:#1B2838; font-size:14px; font-weight:500; letter-spacing:0.06em;">
          資料請求・お問い合わせ
        </button>
      </div>
    </section>
  </main>

  <!-- FOR YOU -->
  <section style="background:#f4f8fb;">
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <div style="font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:#29B6CF; margin-bottom:8px;">
        For You
      </div>
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(24px,4.4vw,36px); margin:0 0 24px; color:#1B2838;">
        こんな人のために作りました。
      </h2>
      <div style="border-top:1px solid #e0e8f0;">
        <div style="padding:12px 0; border-bottom:1px solid #e0e8f0;">
          <div style="font-weight:700; margin-bottom:4px;">インディーズバンド・アーティスト</div>
          <div style="color:#546A82; font-size:14px;">現場の熱量を動画にして売る</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid #e0e8f0;">
          <div style="font-weight:700; margin-bottom:4px;">ライバー</div>
          <div style="color:#546A82; font-size:14px;">生配信で最大95%還元</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid #e0e8f0;">
          <div style="font-weight:700; margin-bottom:4px;">メンタルコーチ・講師</div>
          <div style="color:#546A82; font-size:14px;">有料コンテンツ販売・個別セッション（ツーショット）・有料ライブ配信で稼ぐ。</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid #e0e8f0;">
          <div style="font-weight:700; margin-bottom:4px;">動画編集者</div>
          <div style="color:#546A82; font-size:14px;">編集依頼を受けて稼ぐ</div>
        </div>
        <div style="padding:12px 0; border-bottom:1px solid #e0e8f0;">
          <div style="font-weight:700; margin-bottom:4px;">コミュニティ管理人</div>
          <div style="color:#546A82; font-size:14px;">広告収益の70%がコミュニティへ</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONCEPT -->
  <section>
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 24px; color:#1B2838;">
        生の瞬間には、2種類ある。
      </h2>
      <p style="font-size:15px; line-height:1.9; color:#546A82; margin:0 0 20px;">
        ひとつは現場レポート。ライブハウス、劇場、フェス。その場にいた人だけが撮れる映像を、有料コンテンツとして販売する。もうひとつはリアルタイム生配信。コメント、投げ銭、ファンとのリアルな交流。その熱量ごとアーカイブとして積み上げていく。どちらも流れて消えるんじゃなく、積み上がる資産になる。
      </p>

      <!-- エコシステム図 -->
      <div style="margin-top:8px; background:#f4f8fb; border-radius:12px; padding:16px; overflow-x:auto;">
        <div style="min-width:560px;">
          <svg viewBox="0 0 560 150" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
            <!-- ステップボックス -->
            <rect x="10" y="40" width="90" height="60" rx="8" ry="8" fill="#FFFFFF" stroke="#29B6CF" />
            <rect x="120" y="40" width="90" height="60" rx="8" ry="8" fill="#FFFFFF" stroke="#29B6CF" />
            <rect x="230" y="40" width="110" height="60" rx="8" ry="8" fill="#FFFFFF" stroke="#29B6CF" />
            <rect x="360" y="40" width="110" height="60" rx="8" ry="8" fill="#FFFFFF" stroke="#29B6CF" />
            <rect x="490" y="40" width="60" height="60" rx="8" ry="8" fill="#FFFFFF" stroke="#29B6CF" />

            <!-- テキスト -->
            <text x="55" y="55" text-anchor="middle" font-size="16">📱</text>
            <text x="55" y="78" text-anchor="middle" font-size="11" fill="#1B2838">現場で</text>
            <text x="55" y="92" text-anchor="middle" font-size="11" fill="#1B2838">スマホ撮影</text>

            <text x="165" y="55" text-anchor="middle" font-size="16">✂️</text>
            <text x="165" y="78" text-anchor="middle" font-size="11" fill="#1B2838">編集者に</text>
            <text x="165" y="92" text-anchor="middle" font-size="11" fill="#1B2838">依頼</text>

            <text x="285" y="55" text-anchor="middle" font-size="16">💰</text>
            <text x="285" y="78" text-anchor="middle" font-size="11" fill="#1B2838">有料コンテンツ</text>
            <text x="285" y="92" text-anchor="middle" font-size="11" fill="#1B2838">として販売</text>

            <text x="415" y="55" text-anchor="middle" font-size="16">👥</text>
            <text x="415" y="78" text-anchor="middle" font-size="11" fill="#1B2838">ファン・</text>
            <text x="415" y="92" text-anchor="middle" font-size="11" fill="#1B2838">コミュニティ</text>

            <text x="520" y="55" text-anchor="middle" font-size="16">📣</text>
            <text x="520" y="78" text-anchor="middle" font-size="11" fill="#1B2838">次の</text>
            <text x="520" y="92" text-anchor="middle" font-size="11" fill="#1B2838">ライブ告知</text>

            <!-- 矢印 -->
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L10,3 L0,6 z" fill="#29B6CF" />
              </marker>
            </defs>
            <line x1="100" y1="70" x2="120" y2="70" stroke="#29B6CF" stroke-width="2" marker-end="url(#arrow)" />
            <line x1="210" y1="70" x2="230" y2="70" stroke="#29B6CF" stroke-width="2" marker-end="url(#arrow)" />
            <line x1="340" y1="70" x2="360" y2="70" stroke="#29B6CF" stroke-width="2" marker-end="url(#arrow)" />
            <line x1="470" y1="70" x2="490" y2="70" stroke="#29B6CF" stroke-width="2" marker-end="url(#arrow)" />
          </svg>
        </div>
      </div>

      <!-- ライブ配信収益分配テーブル -->
      <div style="margin-top:24px;">
        <h3 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:18px; margin:0 0 4px; color:#1B2838;">
          ライブ配信収益分配
        </h3>
        <p style="font-size:13px; color:#546A82; margin:0 0 12px;">
          クリエイターレベル制度により決定
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
          <thead>
            <tr>
              <th style="padding:8px 6px; background:#1B2838; color:#FFFFFF; text-align:left;">レベル</th>
              <th style="padding:8px 6px; background:#1B2838; color:#FFFFFF; text-align:center;">事務所所属</th>
              <th style="padding:8px 6px; background:#1B2838; color:#FFFFFF; text-align:center;">個人</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:rgba(41,182,207,0.08);">
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0;">Level 4</td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:16px; font-weight:700;">95%</span>
              </td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:16px; font-weight:700;">75%</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0;">Level 3</td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">90%</span>
              </td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">70%</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0;">Level 2</td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">80%</span>
              </td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">60%</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0;">Level 1</td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">70%</span>
              </td>
              <td style="padding:8px 6px; border-bottom:1px solid #e0e8f0; text-align:center;">
                <span style="color:#E53935; font-size:15px; font-weight:700;">50%</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:11px; color:#888888; margin:0;">
          ※個人クリエイターは事務所所属より20%低い設定
        </p>
      </div>
    </div>
  </section>

  <!-- NUMBERS -->
  <section style="background:#1B2838;">
    <div style="max-width:960px; margin:0 auto; padding:64px 48px;">
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 32px; color:#FFFFFF;">
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
          <div style="color:#E0ECFF; font-size:13px; white-space:pre-line;">手数料は受け取る側じゃなく\n払う側が負担する</div>
        </div>
      </div>
    </div>
  </section>

  <!-- REVENUE -->
  <section>
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 24px; color:#1B2838;">
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
            <td style="padding:10px 8px; border-bottom:1px solid #e0e8f0;">売上90%還元。編集者・撮影者・出演者への分配設定も自由。</td>
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
        <div style="font-family:'DM Serif Display', 'Shippori Mincho', serif; font-size:30px; color:#29B6CF; margin-bottom:10px;">
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
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 20px; color:#1B2838;">
        コミュニティが、自走する。
      </h2>
      <p style="font-size:15px; line-height:1.9; color:#546A82; margin:0;">
        広告収益の70%は管理人・モデレーターへ。10%はイベント資金として自動積立。10万円に到達したらメンバーの投票でコンテストやイベントを開催できる。賞金もコミュニティのお金から出せる。プラットフォームじゃなく、コミュニティが主役の経済圏。不信任制度でコミュニティの健全さを保つ。ジュークボックス機能でメンバーとYouTube・オリジナル動画を同時視聴できる。
      </p>
    </div>
  </section>

  <!-- HONEST -->
  <section>
    <div style="max-width:720px; margin:0 auto; padding:64px clamp(16px,5vw,48px);">
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 20px; color:#1B2838;">
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
      <h2 style="font-family:'Shippori Mincho', 'Noto Sans JP', serif; font-size:clamp(22px,4.4vw,30px); margin:0 0 16px; color:#FFFFFF;">
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

