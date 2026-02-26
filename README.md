# UC体調記録 — 潰瘍性大腸炎 日次記録アプリ

毎日30秒で体調を記録するPWAアプリ。

## 機能

- **排便記録** — 回数、血便、便の状態、腹痛
- **服薬チェック** — 薬の追加・編集・削除（自由にカスタマイズ）
- **食事記録** — テキスト入力 + タグ（脂質、香辛料、FODMAP等）
- **睡眠** — 就寝・起床時刻、自動で睡眠時間計算
- **仕事** — 勤務形態、勤務時間、ストレス度
- **体調スコア** — 1-10のスライダー
- **履歴カレンダー** — 月別表示、体調スコアで色分け
- **PWA対応** — ホーム画面に追加でネイティブアプリ風に動作

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/あなたのユーザー名/uc-tracker.git
cd uc-tracker
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. ローカルで開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリが起動します。

### 4. ビルド確認

```bash
npm run build
npm start
```

## Vercelデプロイ手順

### Step 1: GitHubにpush

```bash
git init
git add .
git commit -m "Initial commit: UC tracker PWA"

# GitHub CLIの場合
gh repo create uc-tracker --private --push

# または手動の場合
git remote add origin https://github.com/あなたのユーザー名/uc-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Vercelでデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New Project」をクリック
3. `uc-tracker` リポジトリを選択
4. 「Deploy」をクリック — 自動でビルド＆公開されます

→ `https://uc-tracker-xxxxx.vercel.app` のようなURLが発行されます。

### Step 3: スマホでPWAとして使う

**iPhone:**
1. Safariで上記URLにアクセス
2. 共有ボタン → 「ホーム画面に追加」

**Android:**
1. Chromeで上記URLにアクセス
2. メニュー → 「ホーム画面に追加」 or 自動で表示されるインストールバナーをタップ

## 将来のGoogle Play Store公開

このプロジェクトはPlay Store公開に対応する設計になっています。

### 準備済みの項目
- `public/manifest.json` — TWA要件を満たすmanifest（display: standalone, アイコン全サイズ）
- `public/.well-known/assetlinks.json` — Digital Asset Links プレースホルダー
- アイコン — 192x192, 512x512, maskable含む全サイズ

### Play Store公開手順

```bash
# 1. Bubblewrap CLIをインストール
npm install -g @nickvdh/nickvdh

# 2. 別フォルダで作業（重要: Next.jsプロジェクト内で実行しない）
mkdir ../uc-tracker-android
cd ../uc-tracker-android

# 3. PWAのmanifestを指定して初期化
bubblewrap init --manifest https://your-app.vercel.app/manifest.json

# 4. ビルド
bubblewrap build
# → app-release-bundle.aab（Play Store用）
# → app-release-signed.apk（テスト用）

# 5. SHA256フィンガープリントを確認
bubblewrap fingerprint

# 6. assetlinks.jsonを更新してデプロイ
# public/.well-known/assetlinks.json のフィンガープリントを置き換え
```

Google Play Developer アカウント（$25 一回きり）が必要です。

## プロジェクト構成

```
uc-tracker/
├── app/
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト（PWAメタデータ）
│   └── page.tsx            # メインページ
├── components/
│   ├── UCTracker.tsx       # メインアプリコンポーネント
│   ├── IMEInput.tsx        # 日本語入力対応インプット
│   └── ui.tsx              # 共通UIコンポーネント
├── lib/
│   ├── constants.ts        # テーマ・定数
│   └── storage.ts          # データ保存（localStorage）
├── public/
│   ├── icons/              # PWAアイコン
│   ├── manifest.json       # PWAマニフェスト
│   ├── sw.js               # Service Worker
│   └── .well-known/
│       └── assetlinks.json # Digital Asset Links
├── next.config.js
├── tsconfig.json
└── package.json
```

## 今後の開発予定

- [ ] Supabase連携（データのクラウド同期・バックアップ）
- [ ] Claude API食事テキスト自動タグ付け
- [ ] 血液検査OCR（Claude Vision API）
- [ ] 分析ダッシュボード（相関分析、パターン検出）
- [ ] プッシュ通知（21:00 未入力リマインダー）
- [ ] Google Play Store公開

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **localStorage** → 将来 Supabase に差し替え予定
- **PWA** (Service Worker + Web App Manifest)
