# Vercel デプロイ手順（/api が 404 になる場合）

## 必須確認

### 1. Root Directory（プロジェクトのルート）

**Vercel のダッシュボード → プロジェクト → Settings → General → Root Directory**

- **「.」のまま、または未設定（空）にしてください。**
- ここを `frontend` や `packages/web` などにしていると、リポジトリ直下の `api/` がデプロイに含まれず、**Functions タブに api/index や api/[...path] が表示されません。**

### 2. Functions タブで api が表示されるか

デプロイ後、**Vercel のプロジェクト → Deployments → 最新のデプロイ → Functions タブ** を開く。

- **api/index** と **api/[...path]** の 2 つが表示されていれば、`/api/auth/line` などはこのサーバレス関数で処理されます。
- どちらも表示されていない場合は、**Root Directory がリポジトリルート（.）になっているか** を再度確認してください。

### 3. vercel.json の framework

`vercel.json` で **`"framework": null`** を指定しています。  
Expo プリセットだけに任せると `outputDirectory: "dist"` のとき api が認識されないことがあるため、明示的に null にして api フォルダもデプロイ対象にしています。

## まとめ

- **Root Directory = .（または未設定）**
- **Functions タブに api/index と api/[...path] が出ていること**

この 2 点を満たせば、`/api/auth/line` は 404 にならず、LINE ログインが動作する想定です。
