// ============================================================
// 食材認識のコア処理（Google Gemini API 無料枠）
// Vercel Functions（api/recognize.js）とローカル開発サーバー（server/index.mjs）で共用
// ※ APIキーは環境変数 GEMINI_API_KEY からのみ読む（フロントエンドには渡さない）
// ============================================================

const DEFAULT_MODEL = 'gemini-3.5-flash';
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
/** base64 で約3MB（元画像 約2.2MB）まで */
const MAX_IMAGE_BASE64 = 3_000_000;

export class HttpError extends Error {
  /** @param {number} status @param {string} code */
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

/**
 * 公開時の不正利用対策：自分のサイト以外からの呼び出しを拒否する。
 * ALLOWED_ORIGINS（カンマ区切り）未設定なら、Vercel のデプロイURLと localhost を許可。
 * @param {string | undefined} origin
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // 同一オリジンの fetch では Origin が付かない場合がある
  const list = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length > 0) return list.includes(origin);
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

// ---- 簡易レート制限（インスタンス単位のベストエフォート）----
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 8);

/** @param {string} key */
export function checkRateLimit(key) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) throw new HttpError(429, 'rate-limited');
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
}

/**
 * @param {{ image?: unknown, mimeType?: unknown, candidates?: unknown, location?: any }} body
 */
export async function recognizeIngredient(body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new HttpError(500, 'missing-api-key');

  const image = typeof body?.image === 'string' ? body.image : '';
  const mimeType = typeof body?.mimeType === 'string' ? body.mimeType : 'image/jpeg';
  if (!image) throw new HttpError(400, 'image-required');
  if (image.length > MAX_IMAGE_BASE64) throw new HttpError(413, 'image-too-large');
  if (!ALLOWED_MIME.has(mimeType)) throw new HttpError(400, 'unsupported-type');

  const candidates = Array.isArray(body?.candidates)
    ? body.candidates
        .slice(0, 100)
        .filter((c) => c && typeof c.id === 'string' && typeof c.nameItalian === 'string')
    : [];
  const loc = body?.location ?? {};
  const place = [loc.city, loc.region, loc.country]
    .filter((v) => typeof v === 'string' && v.length < 100)
    .join(', ');

  const prompt = `あなたはイタリアの食材の専門家です。写真に写っている食材・食品・パッケージの商品名・メニューの文字から、主な食材を1つ特定してください。
${place ? `撮影場所: ${place}` : ''}
既知の食材ID（該当する場合は必ずこのIDを使う）:
${candidates.map((c) => `- ${c.id}: ${c.nameItalian}`).join('\n')}

次のJSONだけを返してください:
{"recognized": boolean, "ingredientId": string|null, "ingredient": {"nameItalian": string, "nameJapanese": string, "reading": string, "category": string, "description": string}|null, "confidence": number}
ルール:
- 食材を判別できない、食べ物が写っていない場合は {"recognized": false}
- 既知IDに該当しない場合は ingredientId を null にして ingredient を日本語で埋める（reading はカタカナ、description は2文以内）
- confidence は 0〜1。不確かな内容を断定しない`;

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ inline_data: { mime_type: mimeType, data: image } }, { text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    },
  );

  if (res.status === 429) throw new HttpError(429, 'quota-exceeded'); // 無料枠の上限
  if (!res.ok) throw new HttpError(502, `upstream-${res.status}`);

  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((/** @type {any} */ p) => p?.text ?? '')
    .join('');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return { recognized: false };

  let parsed;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { recognized: false };
  }

  const knownIds = new Set(candidates.map((c) => c.id));
  const ingredientId =
    typeof parsed.ingredientId === 'string' && knownIds.has(parsed.ingredientId) ? parsed.ingredientId : null;
  const ing = parsed.ingredient && typeof parsed.ingredient === 'object' ? parsed.ingredient : null;
  const str = (/** @type {unknown} */ v, max = 300) => (typeof v === 'string' ? v.slice(0, max) : undefined);

  return {
    recognized: !!parsed.recognized && (!!ingredientId || !!str(ing?.nameItalian)),
    ingredientId,
    ingredient: ing
      ? {
          nameItalian: str(ing.nameItalian, 80),
          nameJapanese: str(ing.nameJapanese, 80),
          reading: str(ing.reading, 80),
          category: str(ing.category, 30),
          description: str(ing.description, 300),
        }
      : null,
    confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.7,
  };
}
