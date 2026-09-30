import type { Ingredient, LocationState, RecognitionResult } from '../types';
import { AppError } from '../types';
import { INGREDIENTS } from '../data/mockData';
import { API_BASE_URL, USE_MOCK_RECOGNITION, fetchWithTimeout, sleep } from './config';
import { analyzeImage, blobToBase64, downscaleToJpeg, type ImageStats } from './imageUtils';

// ============================================================
// 画像 → 食材の認識
//
// 本番:  画像をバックエンド（/api/recognize）に送り、AI Vision で判定。
//        APIキーはバックエンドのみが保持する。
// 開発:  APIなしでも体験を確認できるよう、画像の色からモック認識する。
// ============================================================

const byId = (id: string) => INGREDIENTS.find((i) => i.id === id);

/** 撮影品質チェック：暗すぎる・のっぺりした画像は認識不可とする */
function isTooPoor(stats: ImageStats) {
  return stats.brightness < 28 || stats.contrast < 5;
}

/**
 * モック認識：画像中央の主な色から、それらしい食材を推定する。
 * （あくまで開発用。実際の判定は AI Vision API が行う）
 */
function mockPick(stats: ImageStats): { id: string; confidence: number } {
  const { hue: h, saturation: s, lightness: l } = stats;
  if (s < 0.16) {
    if (l > 0.7) return { id: 'burrata', confidence: 0.82 };
    if (l > 0.42) return { id: 'parmigiano', confidence: 0.74 };
    return { id: 'porcini', confidence: 0.66 };
  }
  const red = h >= 330 || h < 18;
  if (red && l > 0.62) return { id: 'guanciale', confidence: 0.78 };
  if (red && l >= 0.33) return { id: 'pomodoro', confidence: 0.86 };
  if (red || (h >= 275 && h < 330)) return { id: 'radicchio', confidence: 0.84 };
  if (h >= 18 && h < 42) return l < 0.45 ? { id: 'porcini', confidence: 0.8 } : { id: 'guanciale', confidence: 0.7 };
  if (h >= 42 && h < 68) return l > 0.6 ? { id: 'taleggio', confidence: 0.72 } : { id: 'parmigiano', confidence: 0.76 };
  if (h >= 68 && h < 175) return { id: 'cime-di-rapa', confidence: 0.88 };
  // 青系など食材らしくない色：低信頼で候補を返す
  const fallback = ['burrata', 'parmigiano', 'taleggio'];
  return { id: fallback[Math.floor(h) % fallback.length], confidence: 0.52 };
}

interface RecognizeApiResponse {
  recognized: boolean;
  ingredientId?: string | null;
  ingredient?: Partial<Omit<Ingredient, 'id'>> | null;
  confidence?: number;
}

async function recognizeViaApi(imageSrc: string, location: LocationState): Promise<RecognitionResult> {
  const jpeg = await downscaleToJpeg(imageSrc, 1024);
  const image = await blobToBase64(jpeg);
  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image,
        mimeType: 'image/jpeg',
        // 既知の食材リストを渡し、該当すればIDで返してもらう（表記ゆれ防止）
        candidates: INGREDIENTS.map((i) => ({ id: i.id, nameItalian: i.nameItalian })),
        location:
          location.status === 'ready'
            ? { city: location.city, region: location.regionName, country: location.country }
            : undefined,
      }),
    });
  } catch {
    throw new AppError('api');
  }
  // 無料枠の上限・アクセス集中
  if (res.status === 429) throw new AppError('busy');
  if (!res.ok) throw new AppError('api', `recognize ${res.status}`);
  const json = (await res.json()) as RecognizeApiResponse;

  if (!json.recognized) return { kind: 'not-recognized' };
  const known = json.ingredientId ? byId(json.ingredientId) : undefined;
  const confidence = json.confidence ?? 0.7;
  if (known) return { kind: 'recognized', ingredient: known, confidence, isMock: false };

  const ext = json.ingredient;
  if (!ext?.nameItalian) return { kind: 'not-recognized' };
  return {
    kind: 'recognized',
    confidence,
    isMock: false,
    ingredient: {
      id: `ext:${ext.nameItalian.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      nameItalian: ext.nameItalian,
      nameJapanese: ext.nameJapanese ?? '',
      reading: ext.reading,
      category: ext.category ?? '食材',
      description: ext.description ?? '',
    },
  };
}

/**
 * 撮影画像から食材を認識する。
 * @param imageSrc  object URL もしくは data URL
 */
export async function recognizeImage(imageSrc: string, location: LocationState): Promise<RecognitionResult> {
  let stats: ImageStats;
  try {
    stats = await analyzeImage(imageSrc);
  } catch {
    return { kind: 'not-recognized' };
  }
  if (isTooPoor(stats)) return { kind: 'not-recognized' };

  if (!USE_MOCK_RECOGNITION) return recognizeViaApi(imageSrc, location);

  await sleep(900); // API呼び出しの体感を再現
  const pick = mockPick(stats);
  const ingredient = byId(pick.id);
  if (!ingredient) return { kind: 'not-recognized' };
  return { kind: 'recognized', ingredient, confidence: pick.confidence, isMock: true };
}

/** 開発用：撮影せずに特定の食材の認識結果を作る */
export async function mockRecognizeById(id: string): Promise<RecognitionResult> {
  await sleep(500);
  const ingredient = byId(id);
  return ingredient
    ? { kind: 'recognized', ingredient, confidence: 0.95, isMock: true }
    : { kind: 'not-recognized' };
}

export const DEMO_INGREDIENTS = INGREDIENTS;
