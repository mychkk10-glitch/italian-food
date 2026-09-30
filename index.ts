// ============================================================
// ドメイン型
// ============================================================

export interface Ingredient {
  id: string;
  nameItalian: string;
  nameJapanese: string;
  /** 読み（カタカナ）。例: チーマ・ディ・ラーパ */
  reading?: string;
  category: string;
  description: string;
  /** この食材と特に結びつきの強い地域（任意） */
  associatedRegionIds?: string[];
}

export interface Region {
  id: string;
  name: string;
  nameJapanese: string;
}

/**
 * 料理が「伝統料理」かどうかの確からしさ。
 * - traditional: その地域の伝統料理として広く知られている
 * - regional:    地域でよく食べられるが、伝統料理とは断定しない
 * - modern:      現代的な食べ方・アレンジ
 */
export type DishTradition = 'traditional' | 'regional' | 'modern';

export interface RecipeIngredient {
  nameItalian: string;
  nameJapanese: string;
  amount: string;
  /** 認識した食材と対応付けるためのID（任意） */
  ingredientId?: string;
}

export interface Dish {
  id: string;
  nameItalian: string;
  nameJapanese: string;
  regionId: string;
  description: string;
  imageUrl: string;
  ingredients: RecipeIngredient[];
  /** この料理の主役となる食材ID（推薦ロジックで使用） */
  keyIngredientIds: string[];
  tradition: DishTradition;
  servings: number;
}

// ============================================================
// サービス層の入出力
// ============================================================

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** 現在地の解決結果 */
export type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | {
      status: 'ready';
      point: GeoPoint;
      city?: string;
      /** 行政上の州・地域名（例: Lombardia） */
      regionName?: string;
      /** 料理データ上の地域（対応データがない場合は undefined） */
      region?: Region;
      country?: string;
      countryCode?: string;
      /** 逆ジオコーディングに失敗し、座標から地域を推定した場合 true */
      approximate?: boolean;
    }
  | { status: 'denied' }
  | { status: 'unavailable'; reason: 'unsupported' | 'timeout' | 'error' };

export type RecognitionResult =
  | {
      kind: 'recognized';
      ingredient: Ingredient;
      /** 0〜1 */
      confidence: number;
      /** モック認識（APIなし）で得た結果か */
      isMock: boolean;
    }
  | { kind: 'not-recognized' };

export interface DishRecommendation {
  dish: Dish;
  region: Region;
  /** 現在地の地域の料理か */
  isLocal: boolean;
}

export interface Recommendations {
  /** 現在地の地域の料理（優先表示） */
  local: DishRecommendation[];
  /** 他の地域の料理（補足） */
  others: DishRecommendation[];
}

/** サービス層で投げる、UIに表示可能なエラー */
export class AppError extends Error {
  constructor(
    public readonly code: 'camera-denied' | 'camera-unavailable' | 'not-recognized' | 'api' | 'busy',
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}
