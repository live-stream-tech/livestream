# RawStock - ライブ配信・動画プラットフォーム

## 概要
RawStockはライブ配信・有料動画プラットフォームのWebアプリ（Expo React Native Web / PWA）。コミュニティ機能、ランキング、配信者統計を備える。Webブラウザのみで動作（Expo Go不使用）。

## アーキテクチャ
- **フロントエンド**: Expo Router（ファイルベースルーティング）、Webブラウザ専用（ポート8081）
- **バックエンド**: Express + TypeScript（ポート5000、Expoへのプロキシ）
- **状態管理**: AsyncStorage + React Context
- **データ取得**: @tanstack/react-query

## 投稿機能
- `app/upload.tsx` — 活動記録画面
  - 写真（任意）＋テキスト（必須）で投稿可能
  - 動画不要、タイトルのみで投稿可
  - 投稿ボタン：「活動を記録」
  - Web環境ではファイルピッカーで写真選択
- `app/(tabs)/index.tsx` の `VideoCard` — 写真投稿対応
  - `duration === "00:00"` の場合に「写真」バッジを表示
  - サムネイルなし投稿もプレースホルダーで表示

## 画面構成

### タブ画面
- `app/(tabs)/index.tsx` — ホーム（新着動画、ライブ中、ランキング）
- `app/(tabs)/community.tsx` — コミュニティ（検索、カテゴリ、一覧）
- `app/(tabs)/live.tsx` — 配信（LIVE NOW/BOOKING、配信開始モーダル）
- `app/(tabs)/dm.tsx` — DM（Following Feed、参加コミュニティ）
- `app/(tabs)/profile.tsx` — マイページ（プロフィール、収益管理、投稿）

### 詳細画面
- `app/community/[id].tsx` — コミュニティ詳細
- `app/video/[id].tsx` — 動画詳細・購入

## カラーパレット
- 背景: `#1B2838`（ダークネイビー）
- サーフェス: `#1E3045`
- アクセント: `#29B6CF`（ティール）
- ライブバッジ: `#E53935`（赤）
- ランキング: `#FF8B00`（オレンジ）

## データ
- `constants/colors.ts` — カラー定数
- `constants/data.ts` — 詳細画面（video/[id], community/[id], upload）用のモックデータ（一部残存）

## バックエンド API
- **DB**: PostgreSQL + Drizzle ORM (`server/schema.ts`, `server/db.ts`)
- **ルート**: `server/routes.ts`
- `GET /api/videos` — 新着動画
- `GET /api/videos/ranked` — 有料動画ランキング
- `POST /api/videos` — 動画投稿
- `GET /api/live-streams` — ライブ中配信
- `GET /api/communities` — コミュニティ一覧
- `GET /api/creators` — 配信者ランキング
- `GET /api/booking-sessions?category=` — 予約セッション（カテゴリフィルター付き）
- `POST /api/booking-sessions/:id/book` — 予約確定
- `GET /api/dm-messages` — DMリスト
- `POST /api/dm-messages/:id/read` — 既読マーク

## DBテーブル
`communities`, `videos`, `live_streams`, `creators`, `booking_sessions`, `dm_messages`

## 認証システム
- `lib/auth.tsx` — AuthContext (login/loginWithToken/register/logout/updateProfile)
- `app/auth/login.tsx` — メールアドレスログイン画面
- `app/auth/register.tsx` — 新規登録画面
- `user_accounts` テーブル (id, email, password_hash, name, bio, avatar, line_id, created_at)
- JWT認証（`SESSION_SECRET`、90日有効）、bcryptjs パスワードハッシュ
- デモアカウント: `demo@livestage.jp` / `password`
- プロフィール画面: 未ログイン時は「LINEでログイン」ボタン表示、ログイン後に名前・アバター・bio表示
- プロフィール編集モーダル（名前・bio・アバターURL）、ログアウトボタン

### 認証API
- `POST /api/auth/register` — 新規登録 → JWT
- `POST /api/auth/login` — ログイン → JWT
- `GET /api/auth/me` — 現在ユーザー取得
- `PUT /api/auth/profile` — プロフィール更新（要JWT）
- `GET /api/auth/line` — LINE OAuth認可URLへリダイレクト
- `GET /api/auth/callback/line` — LINEコールバック処理 → JWT発行 → `/?line_token=...` へリダイレクト

### LINEログインフロー
1. ログイン画面の「LINEでログイン」タップ → **APIの** `/api/auth/line` へ遷移（`getApiUrl()` でAPIベースURLを参照）
2. LINE認証 → LINE Developers に登録した Callback URL へリダイレクト
3. サーバーがLINEプロフィール取得・DB保存・JWT発行後、**フロントのURL** `FRONTEND_URL/?line_token=JWT` へリダイレクト
4. `app/_layout.tsx` の `LineTokenHandler` がトークンを検出して保存 → マイページへ遷移

**LINE Developers に登録する Callback URL（必須）**  
`https://<APIのドメイン>/api/auth/callback/line`  
例: APIが `https://your-api.vercel.app` なら `https://your-api.vercel.app/api/auth/callback/line`

**本番で必要な環境変数（APIサーバー側）**
- `LINE_CHANNEL_ID` — LINE Login Channel ID
- `LINE_CHANNEL_SECRET` — LINE Login Channel Secret
- `LINE_CALLBACK_URL` — 上記と同一のCallback URL（例: `https://your-api.vercel.app/api/auth/callback/line`）
- `FRONTEND_URL` — ログイン完了後のリダイレクト先（ExpoアプリのURL。例: `https://your-app.vercel.app`、末尾スラッシュなし）
- `SESSION_SECRET` — JWT署名用シークレット（本番では必ず設定）

**フロント（Vercel の Expo ビルド）**
- `EXPO_PUBLIC_DOMAIN` — APIのベースURL（例: `https://your-api.vercel.app`）。未設定だとローカルでは `http://localhost:5000` を使用

※ NextAuth は未使用のため `NEXTAUTH_URL` / `NEXTAUTH_SECRET` は不要。

### Vercel デプロイ（API を Serverless で動かす）
- **静的**: `vercel.json` の `buildCommand` で `npx expo export --platform web`、`outputDirectory`: `dist`
- **API**: `api/index.ts` と `api/[...path].ts` が Express API を Serverless として提供。`server/vercel-app.ts` が API 専用アプリを生成。
- **同一オリジン**: フロントも API も同じ Vercel プロジェクトにデプロイする場合、`EXPO_PUBLIC_DOMAIN` と `LINE_CALLBACK_URL` のベースURL は同じ（例: `https://your-app.vercel.app`）。`FRONTEND_URL` も同じURL（末尾スラッシュなし）。
- **環境変数**: Vercel の Project Settings → Environment Variables に `.env.example` の変数を設定。特に `DATABASE_URL`（PostgreSQL）が必須。

## 収益管理
- `app/revenue.tsx` — 残高カード、収益グラフ（6ヶ月SVGバーチャート）、引き出し申請
- `earnings`, `withdrawals` テーブル
- API: `/api/revenue/summary|earnings|withdrawals|withdraw`

## エニアグラムチャート
- プロフィール画面下部にSVGレーダーチャート表示
- AsyncStorage保存（`enneagram_scores` キー）、編集モーダルで±1調整

## 機能
- ホーム・コミュニティ・ライブ・DM の各タブ画面はすべて React Query でAPIからデータ取得
- 新着動画・ライブ中の水平スクロール
- 有料動画・配信者ランキング（WEEKLY/MONTHLY/ALL フィルター）
- コミュニティ詳細（フォロー、動画依頼、クリエイター一覧）
- ライブ配信開始モーダル（公開範囲、料金設定）
- 動画購入フロー（¥500〜）
- サポーターレベル・収益管理
- PWA対応（manifest.json、Service Worker）
- ベルアイコンタップ → 通知画面の購入タブ表示
- ツーショット予約（禁止事項にハラスメント禁止）
