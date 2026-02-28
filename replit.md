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
- `constants/data.ts` — モックデータ（動画、ライブ配信、コミュニティ、クリエイター）
- `constants/colors.ts` — カラー定数

## 機能
- 新着動画・ライブ中の水平スクロール
- 有料動画・配信者ランキング（WEEKLY/MONTHLY/ALL フィルター）
- コミュニティ詳細（フォロー、動画依頼、クリエイター一覧）
- ライブ配信開始モーダル（公開範囲、料金設定）
- 動画購入フロー（¥500〜）
- サポーターレベル・収益管理
