# LiveStock - ライブ配信・動画プラットフォーム

## 概要
LiveStockはライブ配信・有料動画プラットフォームのモバイルアプリ（Expo React Native）。コミュニティ機能、ランキング、配信者統計を備える。

## アーキテクチャ
- **フロントエンド**: Expo Router（ファイルベースルーティング）
- **バックエンド**: Express + TypeScript（ポート5000）
- **状態管理**: AsyncStorage + React Context
- **データ取得**: @tanstack/react-query

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
- `lib/auth.tsx` — AuthContext (login/register/logout/updateProfile)
- `app/auth/login.tsx` — ログイン画面
- `app/auth/register.tsx` — 新規登録画面
- `user_accounts` テーブル (id, email, password_hash, name, bio, avatar, created_at)
- JWT認証（`SESSION_SECRET`、90日有効）、bcryptjs パスワードハッシュ
- デモアカウント: `demo@livestock.jp` / `password`
- プロフィール画面: 未ログイン時はゲスト状態表示、ログイン後に名前・アバター・bio表示
- プロフィール編集モーダル（名前・bio・アバターURL）、ログアウトボタン

### 認証API
- `POST /api/auth/register` — 新規登録 → JWT
- `POST /api/auth/login` — ログイン → JWT
- `GET /api/auth/me` — 現在ユーザー取得
- `PUT /api/auth/profile` — プロフィール更新（要JWT）

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
