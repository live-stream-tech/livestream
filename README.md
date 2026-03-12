# SANCTUM HAVEN

## プロジェクト概要

- **サービス名**: SANCTUM HAVEN（旧：LiveStage / LiveStream / RawStock）
- **コンセプト**: 生ライブレポ＆生配信LIVEをストック資産に
- **技術スタック**: Expo (PWA) + Vercel + Neon (PostgreSQL) + Express API

---

## 環境構成

| 項目 | 技術 |
|------|------|
| フロント | Expo Router（Web / PWA 専用） |
| API | Express + TypeScript（Vercel Serverless Functions） |
| DB | Neon (PostgreSQL) + Drizzle ORM |
| 認証 | LINE OAuth + 電話番号 SMS 認証 + JWT |
| ストレージ | 未実装（Supabase Storage 予定） |
| 配信 | 未実装（Cloudflare Stream 予定） |

---

## 画面一覧

`app/` 以下のルート・画面ファイルです（レイアウト・404 等を除く）。

| パス | 説明 |
|------|------|
| `(tabs)/index.tsx` | ホーム（タブ） |
| `(tabs)/live.tsx` | ライブ一覧（タブ） |
| `(tabs)/community.tsx` | コミュニティ一覧（タブ） |
| `(tabs)/dm.tsx` | DM 一覧（タブ） |
| `(tabs)/profile.tsx` | プロフィール（タブ） |
| `community/[id].tsx` | コミュニティ詳細 |
| `community/create.tsx` | コミュニティ作成 |
| `community/genre/[genreId].tsx` | ジャンル別コミュニティ |
| `video/[id].tsx` | 動画詳細・視聴 |
| `live/[id].tsx` | ライブ視聴 |
| `dm/[id].tsx` | DM 会話 |
| `jukebox/[id].tsx` | ジュークボックス |
| `livers/index.tsx` | ライバー一覧 |
| `livers/[id].tsx` | ライバー詳細 |
| `twoshot-booking/[id].tsx` | ツーショット予約 |
| `twoshot-success.tsx` | ツーショット予約完了 |
| `auth/login.tsx` | ログイン |
| `auth/register.tsx` | 新規登録 |
| `account.tsx` | アカウント・登録情報編集 |
| `settings.tsx` | 設定 |
| `terms.tsx` | 利用規約 |
| `revenue.tsx` | 収益管理 |
| `payout-settings.tsx` | 払い出し設定 |
| `upload.tsx` | アップロード |
| `broadcast.tsx` | 配信 |
| `notifications.tsx` | 通知一覧 |
| `success.tsx` | 成功画面（汎用） |
| `+not-found.tsx` | 404 |

---

## API エンドポイント一覧

`server/routes.ts` で定義されているエンドポイントです。

### 認証・プロフィール

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/auth/me` | 自ユーザー取得 |
| PUT | `/api/auth/profile` | プロフィール更新 |
| GET | `/api/auth/line` | LINE 認証開始 |
| GET | `/api/auth/google` | Google 認証開始 |
| GET | `/api/auth/google-callback` | Google コールバック |
| GET | `/api/auth/callback/line` | LINE コールバック |
| GET | `/api/auth/line-callback` | LINE コールバック（別） |
| GET | `/api/profile/roles` | ロール一覧 |
| POST | `/api/profile/register-role` | ロール登録 |

### Stripe Connect・決済

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/connect/onboard` | Connect オンボード |
| GET | `/api/connect/status` | Connect 状態 |
| POST | `/api/banner/checkout` | バナー決済（Checkout） |
| POST | `/api/banner/confirm` | バナー決済確認 |
| POST | `/api/banner/checkout-session` | バナー Checkout セッション |
| POST | `/api/banner/confirm-session` | バナー セッション確認 |

### コミュニティ

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/communities` | コミュニティ一覧 |
| GET | `/api/communities/me` | 参加中コミュニティ |
| GET | `/api/communities/:id` | コミュニティ詳細 |
| GET | `/api/communities/:id/editors` | 編集者一覧 |
| GET | `/api/communities/:id/creators` | クリエイター一覧 |
| GET | `/api/communities/:id/staff` | スタッフ一覧 |
| PATCH | `/api/communities/:id/staff` | スタッフ更新 |
| GET | `/api/communities/:id/members` | メンバー一覧 |
| GET | `/api/communities/:id/members/me` | 自分の参加状態 |
| POST | `/api/communities/:id/join` | 参加 |
| POST | `/api/communities` | コミュニティ作成 |
| GET | `/api/editors/:id` | 編集者詳細 |
| POST | `/api/editors/:id/request` | 編集依頼 |

### 動画

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/videos` | 動画一覧 |
| GET | `/api/videos/my` | 自分の動画 |
| GET | `/api/videos/ranked` | ランキング |
| GET | `/api/videos/:id` | 動画詳細 |
| GET | `/api/videos/:id/comments` | コメント一覧 |
| POST | `/api/videos/:id/comments` | コメント投稿 |
| POST | `/api/videos` | 動画投稿 |
| PATCH | `/api/videos/:id` | 動画更新 |
| DELETE | `/api/videos/:id` | 動画削除 |

### ライブ・配信

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/live-streams` | ライブ一覧 |
| GET | `/api/live-streams/:id` | ライブ詳細 |
| GET | `/api/live-streams/:id/chat` | ライブチャット取得 |
| POST | `/api/live-streams/:id/chat` | ライブチャット投稿 |
| POST | `/api/stream/create` | 配信作成（Cloudflare Stream） |

### クリエイター・予約

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/creators` | クリエイター一覧 |
| GET | `/api/booking-sessions` | 予約セッション一覧 |
| POST | `/api/booking-sessions/:id/book` | 予約 |

### DM・通知

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/dm-messages` | DM 一覧 |
| POST | `/api/dm-messages/:id/read` | 既読 |
| GET | `/api/dm-messages/:id/conversation` | 会話取得 |
| POST | `/api/dm-messages/:id/conversation` | 会話送信 |
| GET | `/api/notifications` | 通知一覧 |
| POST | `/api/notifications/read-all` | 一括既読 |
| POST | `/api/notifications/:id/read` | 通知既読 |

### ジュークボックス

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/jukebox/:communityId` | ジュークボックス状態 |
| POST | `/api/jukebox/:communityId/add` | 曲追加 |
| POST | `/api/jukebox/:communityId/next` | 次へ |
| POST | `/api/jukebox/:communityId/chat` | チャット投稿 |

### ツーショット予約

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/twoshot/publishable-key` | Stripe 公開鍵 |
| GET | `/api/twoshot/:streamId/bookings` | 予約一覧 |
| GET | `/api/twoshot/:streamId/queue-count` | 待ち人数 |
| POST | `/api/twoshot/:streamId/checkout` | チェックアウト |
| POST | `/api/twoshot/confirm-payment` | 決済確認 |
| POST | `/api/twoshot/:bookingId/notify` | 通知 |
| POST | `/api/twoshot/:bookingId/complete` | 完了 |
| POST | `/api/twoshot/:bookingId/cancel` | キャンセル |

### 収益・出金

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/revenue/record` | 収益記録 |
| GET | `/api/revenue/summary` | 収益サマリー |
| GET | `/api/revenue/earnings` | 収益一覧 |
| GET | `/api/revenue/monthly-rank` | 月間ランキング |
| GET | `/api/revenue/withdrawals` | 出金一覧 |
| POST | `/api/revenue/withdraw` | 出金申請 |

### ライバー

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/livers` | ライバー一覧 |
| GET | `/api/livers/:id` | ライバー詳細 |
| GET | `/api/livers/:id/reviews` | レビュー一覧 |
| POST | `/api/livers/:id/reviews` | レビュー投稿 |
| GET | `/api/livers/:id/availability` | 予約可能枠 |
| POST | `/api/livers/:id/availability` | 予約可能枠登録 |
| DELETE | `/api/livers/:id/availability/:slotId` | 予約可能枠削除 |

### その他

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/youtube/search` | YouTube 検索 |
| GET | `/api/announcements` | お知らせ一覧 |
| POST | `/api/seed` | シード実行 |
| POST | `/api/seed-editors` | 編集者シード |

※ ヘルスチェックは `server/index.ts` で定義: `GET /healthcheck`, `GET /api/healthcheck`

---

## DB テーブル一覧

`server/schema.ts`（Drizzle）で定義されているテーブルです。

| テーブル名 | 説明 |
|------------|------|
| `communities` | コミュニティ |
| `community_moderators` | コミュニティモデレーター |
| `community_members` | コミュニティメンバー |
| `videos` | 動画 |
| `video_comments` | 動画コメント |
| `live_streams` | ライブ配信一覧 |
| `streams` | Cloudflare Stream Live Input 管理 |
| `creators` | クリエイター |
| `booking_sessions` | 予約セッション |
| `notifications` | 通知 |
| `live_stream_chat` | ライブチャット |
| `dm_conversation_messages` | DM 会話メッセージ |
| `jukebox_state` | ジュークボックス状態 |
| `jukebox_queue` | ジュークボックスキュー |
| `jukebox_chat` | ジュークボックスチャット |
| `dm_messages` | DM 一覧用 |
| `users` | ユーザー（LINE・電話番号・Stripe Connect） |
| `phone_verifications` | 電話番号認証コード |
| `wallets` | ウォレット（分配・出金） |
| `transactions` | 取引履歴 |
| `video_editors` | 動画編集者 |
| `video_edit_requests` | 動画編集依頼 |
| `earnings` | 収益 |
| `withdrawals` | 出金 |
| `twoshot_bookings` | ツーショット予約 |
| `liver_reviews` | ライバーレビュー |
| `liver_availability` | ライバー予約可能枠 |
| `announcements` | お知らせ |

---

## 環境変数一覧

`.env.example` およびコード内で参照している主な環境変数です。  
本番では `.env.local` や Vercel の Environment Variables で設定してください。

### 必須

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Neon (PostgreSQL) 接続文字列 |
| `LINE_CHANNEL_ID` | LINE Login チャネル ID |
| `LINE_CHANNEL_SECRET` | LINE Login チャネルシークレット |
| `LINE_CALLBACK_URL` | LINE コールバック URL（例: `https://your-app.vercel.app/api/auth/line-callback`） |
| `FRONTEND_URL` | フロントエンドの URL（例: `https://your-app.vercel.app`） |
| `SESSION_SECRET` | JWT 署名用シークレット（32 文字以上推奨） |
| `EXPO_PUBLIC_DOMAIN` | フロントの API ベース URL（Vercel のドメイン等） |

### オプション

| 変数名 | 説明 |
|--------|------|
| `STRIPE_SECRET_KEY` | Stripe シークレットキー |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公開鍵 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID（配信用） |
| `CLOUDFLARE_STREAM_TOKEN` | Cloudflare Stream API トークン |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアント ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット |
| `GOOGLE_CALLBACK_URL` | Google コールバック URL |
| `YOUTUBE_API_KEY` | YouTube Data API キー（ジュークボックス等） |
| `APP_URL` | アプリのベース URL（開発時等） |
| `PORT` | API サーバーポート（デフォルト: 5000） |

---

## 未実装・Coming Soon

- ライブ配信（Cloudflare Stream）
- 画像・動画アップロード（Supabase Storage）
- 決済（Stripe 代替を検討中）
- フィルター機能（Banuba / FaceUnity）

---

## 既知の問題・TODO

- 特商法表記ページ未作成
- プライバシーポリシー未作成
- `/api/healthcheck` が 404（Vercel デプロイ構成によりルーティング未反映の可能性）
