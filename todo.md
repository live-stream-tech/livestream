# RawStock Todo

- [x] PWA実装（manifest.json、サービスワーカー、アイコン）
- [x] アプリ名をLiveStageからRawStockに統一
- [x] ビルドエラー修正（@/lib/apiUrlインポート問題）
- [x] LINE認証フロー修正
- [x] DBスキーマ修正（followers_count/following_count追加）
- [x] ポーリング間隔最適化（再生中5秒・停止中10秒）
- [x] Jukeboxキューから再生済み曲をサーバー側でフィルタリング
- [x] 追加ボタンのタッチ領域拡大（hitSlop追加）
- [x] ページ移動時のSpotify風ミニプレイヤー実装
  - [x] jukebox/[id].tsx: バックボタン押下時に確認ダイアログ表示
  - [x] video/[id].tsx: バックボタン押下時に確認ダイアログ表示
  - [x] GlobalJukeboxPlayer: ページ離脱後も自動表示（dismissed=false）
  - [x] GlobalMyListPlayer: ページ離脱後も自動表示（dismissed=false）
  - [x] Spotify風バーUI（画面下部固定）に改善
- [x] PC表示時に最大幅430pxでセンタリング表示（左右余白あり）
- [x] Jukebox動画追加モーダルのサイズ修正（modalList maxHeight追加、modalSheet縮小）
- [x] PC表示時のDimensions.get("window").width問題を全ページで修正（上限430px）
