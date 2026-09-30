# 無料で世界に公開する手順

所要時間：約20〜30分　費用：0円（クレジットカード不要）

使うサービス（すべて無料プラン）

| サービス | 役割 |
| --- | --- |
| Google AI Studio | 食材認識AI（Gemini API）のキーを発行 |
| GitHub | コードの置き場所 |
| Vercel | 公開（URL発行・HTTPS・AI呼び出し用のサーバー） |

---

## 1. Gemini の APIキーを作る（5分）

1. https://aistudio.google.com を開き、Googleアカウントでログイン
2. 左メニューの **「Get API key」** → **「Create API key」**
3. 表示されたキー（`AIza...` で始まる文字列）をコピーしてメモ

> ⚠️ このキーは他人に見せない・GitHubに貼らない。Vercel の設定画面にだけ入力します。
> ⚠️ 請求先（Billing）は設定しないでください。設定しなければ無料枠を超えても課金されず、アプリには「混み合っています」と表示されるだけです。

## 2. GitHub にコードを置く（10分）

1. https://github.com でアカウントを作成（無料）
2. 右上の **「+」→「New repository」**
   - Repository name：`whats-this`（自由）
   - Public / Private：どちらでも可（Private でも Vercel 無料で公開できます）
   - 「Create repository」
3. 作成直後の画面にある **「uploading an existing file」** をクリック
4. `whats-this.zip` を解凍し、`whats-this` フォルダの**中身すべて**（`src`、`public`、`api`、`server`、`package.json` など）をブラウザにドラッグ＆ドロップ
5. 下の **「Commit changes」** を押す

> `node_modules` フォルダは入れないでください（zip には含まれていません）。

## 3. Vercel で公開する（5分）

1. https://vercel.com を開き **「Sign Up」→「Continue with GitHub」**（プランは **Hobby**＝無料）
2. **「Add New…」→「Project」** → 先ほどの `whats-this` の **「Import」**
3. Framework Preset が **Vite** になっていることを確認（自動で選ばれます）
4. **「Environment Variables」** を開いて追加
   - Key：`GEMINI_API_KEY`
   - Value：手順1でコピーしたキー
5. **「Deploy」** を押す → 1〜2分で完了
6. 表示された `https://whats-this-xxxx.vercel.app` が公開URLです

### URL を分かりやすくする（任意・無料）

Vercel のプロジェクト → **Settings → Domains** で `〇〇.vercel.app` の名前を変更できます（空いている名前のみ）。

## 4. iPhone でアプリとして使う

1. iPhone の **Safari** で公開URLを開く
2. 開くとすぐカメラと位置情報の許可を求められるので、どちらも **許可**（カメラ映像が画面いっぱいに映ります）
3. 画面下の共有ボタン（□↑）→ **「ホーム画面に追加」**

ホーム画面のアイコンから、アプリと同じように全画面で起動します。

## 5. 世界に広める

- URL をそのまま SNS・ブログ・メッセージで共有すれば、世界中の誰でも使えます（アプリストア不要・iPhone / Android / PC 対応）
- QRコードにしてポスターやカードに載せるのも有効です（無料のQRコード作成サイトで作れます）
- 独自ドメイン（例：`whatsthis.app`）を使う場合は年1,000〜数千円かかります。使うときは Vercel の環境変数に `ALLOWED_ORIGINS=https://あなたのドメイン` を追加して Redeploy してください

## 6. 修正したいとき

GitHub 上でファイルを編集（または再アップロード）して保存すると、Vercel が自動で再公開します。

---

## 無料で運用するうえでの注意

| 項目 | 内容 |
| --- | --- |
| Gemini 無料枠の上限 | 1分・1日あたりの回数に上限があります。超えると「ただいま混み合っています」と表示され、時間をおくと回復します。上限は AI Studio の「Rate limit」画面で確認できます |
| 送信した写真の扱い | 無料枠では送信内容が Google の製品改善に使われる場合があります（アプリ内「このアプリについて」に記載済み） |
| 不正利用対策 | 自分のサイト以外からのAI呼び出しを拒否し、1人あたり1分8回までに制限しています（環境変数 `RATE_LIMIT_PER_MINUTE` で変更可） |
| Vercel 無料プラン | 個人・非商用が条件です。有料販売・広告収益などを考える場合は有料プランが必要です |
| 地名データ | OpenStreetMap（無料）を利用し、アプリ内にクレジットを表示しています |
| 対応範囲 | 料理データはイタリアのみ。認識した食材がデータにない場合は、不確かな料理を出さずに「データはまだありません」と表示します |

## うまく動かないとき

| 症状 | 確認すること |
| --- | --- |
| 撮影後に「料理情報を取得できませんでした」 | Vercel の Environment Variables に `GEMINI_API_KEY` があるか。追加・変更後は **Deployments → 最新の「…」→ Redeploy** が必要 |
| 「ただいま混み合っています」が続く | Gemini 無料枠の上限。時間をおくか、環境変数 `GEMINI_MODEL=gemini-3.5-flash-lite`（上限が緩いことが多い軽量モデル）に変更して Redeploy |
| カメラが起動しない | URL が `https://` か。iPhone の 設定 › Safari › カメラ が「確認」または「許可」になっているか |
| 地域が表示されない | 設定 › プライバシーとセキュリティ › 位置情報サービス › Safari Webサイト が「使用中のみ」か |
| エラーの詳細を見たい | Vercel のプロジェクト → **Logs** |

## ローカルでAI認識を試す（開発者向け）

```bash
npm install
GEMINI_API_KEY=AIza... npm run api     # ターミナル1：APIサーバー（:8787）
npm run dev:ai                         # ターミナル2：アプリ（:5173）
```

`npm run dev` だけならAPIなし（モック認識）で動作します。
