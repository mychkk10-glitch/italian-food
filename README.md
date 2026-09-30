# What's this?

旅先で見つけた「これは何だろう？」という食材を撮影し、**現在地の地域**に合わせた料理候補と、その料理に必要な材料を表示する Web アプリ（iOS Safari 優先 / PWA 対応）。

```
カメラで撮影 → 食材を認識 → 現在地から地域を判断 → 料理候補 → 料理を選ぶ → 材料
```

## すぐ動かす

```bash
npm install
npm run dev          # http://localhost:5173 （--host 付きなので同じLANのiPhoneからも開ける）
```

APIキーなしで全フローを確認できます（モック認識）。

- ホーム下部の「デモ：撮影せずに試す」から食材を選ぶと、撮影なしで結果画面に進めます。
- 実際に撮影した場合は、写真中央の色から食材を簡易推定します（緑→Cime di rapa、赤紫→Radicchio、白→Burrata など）。暗すぎる写真は「認識できませんでした」になります。
- 現在地を任意の座標にするには URL に `?lat=41.12&lng=16.87`（バーリ）などを付けます（開発用。ユーザー向けの地域選択UIはありません）。

### iPhone で試すときの注意

- カメラ（getUserMedia）と位置情報は **HTTPS** が必須です（localhost を除く）。LAN の iPhone から試す場合は `npx vite --host --https` 相当の証明書を用意するか、Vercel / Netlify / Cloudflare Pages などにデプロイしてください。
- アプリを開くとすぐ背面カメラの映像が全画面に映り、そのままシャッターで撮影できます（ホーム画面＝カメラ）。
- ライブカメラが使えない・拒否された場合は、`<input capture>` による iOS 標準カメラ／写真選択にフォールバックします。
- Safari の共有メニュー「ホーム画面に追加」で PWA として起動できます。

## ビルド

```bash
npm run build          # dist/        … PWA 本番ビルド（Service Worker 付き）
npm run build:single   # dist-single/ … 1ファイルHTML（プレビュー配布用）
```

## 公開（無料）

**[DEPLOY.md](./DEPLOY.md) に、Gemini API（無料枠）＋ GitHub ＋ Vercel で世界に公開する手順をまとめています。**

## AI 画像認識のしくみ

APIキーは**フロントエンドに埋め込みません**。`api/recognize.js`（Vercel Function）が Google Gemini API を呼び出します。キーは Vercel の環境変数 `GEMINI_API_KEY` にだけ置きます。

| 環境 | 認識方法 |
| --- | --- |
| `npm run dev` / `build:single` | モック（APIなし） |
| 本番ビルド（Vercel） | 同じサイトの `/api/recognize` → Gemini |
| `npm run api` + `npm run dev:ai` | ローカルAPIサーバー（`server/index.mjs`）→ Gemini |

`POST /api/recognize`：`{ image(base64), mimeType, candidates[], location }` → `{ recognized, ingredientId, ingredient, confidence }`

- 既知の食材IDを候補として渡し、該当すればIDで返させる（表記ゆれ防止）
- 自サイト以外からの呼び出し拒否、1IPあたり毎分8回の制限、画像サイズ制限
- 無料枠の上限（429）はアプリに「ただいま混み合っています」と表示

| 環境変数 | 説明 |
| --- | --- |
| `GEMINI_API_KEY` | 必須 |
| `GEMINI_MODEL` | 既定 `gemini-3.5-flash` |
| `ALLOWED_ORIGINS` | 独自ドメイン使用時に `https://example.com`（カンマ区切り） |
| `RATE_LIMIT_PER_MINUTE` | 既定 8 |

逆ジオコーディング（OpenStreetMap Nominatim）は、利用規約に沿うよう利用者のブラウザから直接呼び出し、結果をセッション内でキャッシュします。

## 料理データの方針

料理は AI に自由生成させず、`src/data/mockData.ts` のキュレーション済みデータから **認識食材 × 現在地の地域 × 食材の産地** で選びます（`src/services/dishes.ts`）。

1. 現在地の地域の料理を最優先
2. 次に食材の産地の料理
3. その他の地域

各料理は `tradition`（`traditional` / `regional` / `modern`）を持ち、伝統料理と断定できないものは「地域でよく食べられる」「現代的な食べ方」と表示します。データにない食材は、不確かな料理を出さずに「データはまだありません」と表示します。料理 DB をサーバーに移す場合は `setDishProvider()` で差し替えます。

## 料理写真

MVP では検証済みの写真配信元がないため、料理ごとの色・形から生成したイラスト（`src/data/dishArt.ts`）を `imageUrl` に入れています。`Dish.imageUrl` に実写真の URL を入れれば、そのまま写真表示に切り替わります（読み込み失敗時はプレースホルダー）。

## 構成

```
src/
├── components/   PhotoPicker, DishCard, DishImage, IngredientList,
│                 LoadingView, LocationBadge, TopBar, ErrorView, TraditionBadge, icons
├── pages/        Home, RecognitionResult, DishDetail, About（プライバシー）
├── services/     geolocation.ts（現在地・逆ジオコーディング・地域判定）
│                 recognition.ts（AI認識 / モック）, dishes.ts（料理候補）, imageUtils.ts, config.ts
├── hooks/        useCamera.ts（ライブカメラ）, useLocation.ts
├── data/         mockData.ts（食材・料理）, regions.ts（20州）, dishArt.ts
├── types/        index.ts
├── App.tsx       画面遷移（History API と同期 → iOS のスワイプバック対応）
└── main.tsx
api/              Vercel Functions（recognize.js）と共通処理（_lib/gemini.js）
server/index.mjs  ローカル開発用APIサーバー
public/           manifest, Service Worker, アイコン
```

## 意図的に実装していないもの（MVP）

買い物リスト・保存・履歴・詳細な調理手順・地域の手動選択・アカウント。型（`Dish` / `DishProvider` など）とサービス層を分けてあるので、後から追加できます。
