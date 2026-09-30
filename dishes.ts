import type { Dish, DishRecommendation, Ingredient, Recommendations, Region } from '../types';
import { AppError } from '../types';
import { DISHES } from '../data/mockData';
import { findRegionById } from '../data/regions';
import { sleep } from './config';

// ============================================================
// 料理候補の生成
//
// 方針：AIに料理を自由生成させない。
//   認識食材 + 現在地の地域 + 地域の食文化（キュレーションした料理DB）
//   を突き合わせて候補を選ぶ。
//   将来は DishProvider を差し替えてバックエンドの料理DBに接続する。
// ============================================================

export interface DishProvider {
  findByIngredient(ingredientId: string): Promise<Dish[]>;
  getById(id: string): Promise<Dish | undefined>;
}

/** ローカル（モック）料理DB */
const localProvider: DishProvider = {
  async findByIngredient(ingredientId) {
    await sleep(250);
    return DISHES.filter((d) => d.keyIngredientIds.includes(ingredientId));
  },
  async getById(id) {
    return DISHES.find((d) => d.id === id);
  },
};

let provider: DishProvider = localProvider;

/** 将来：バックエンドの料理DBに差し替える */
export function setDishProvider(p: DishProvider) {
  provider = p;
}

const MAX_RESULTS = 5;
const TRADITION_ORDER = { traditional: 0, regional: 1, modern: 2 } as const;

function toRegion(regionId: string): Region {
  const r = findRegionById(regionId);
  return r
    ? { id: r.id, name: r.name, nameJapanese: r.nameJapanese }
    : { id: regionId, name: regionId, nameJapanese: regionId };
}

/**
 * 食材と現在地の地域から料理候補を返す。
 * 1. 現在地の地域の料理（その食材を主役にしたもの）を最優先
 * 2. 次に、その食材と結びつきの強い地域（産地）の料理
 * 3. それ以外の地域の料理
 * 各グループ内では「伝統料理 → 地域でよく見られる料理 → 現代的な食べ方」の順。
 */
export async function getRecommendations(
  ingredient: Ingredient,
  currentRegion: Region | undefined,
): Promise<Recommendations> {
  let dishes: Dish[];
  try {
    dishes = await provider.findByIngredient(ingredient.id);
  } catch {
    throw new AppError('api');
  }

  const origin = new Set(ingredient.associatedRegionIds ?? []);
  const score = (d: Dish) => {
    const regionScore = d.regionId === currentRegion?.id ? 0 : origin.has(d.regionId) ? 1 : 2;
    // 主役食材が先頭にある料理を優先
    const keyScore = d.keyIngredientIds[0] === ingredient.id ? 0 : 1;
    return regionScore * 100 + TRADITION_ORDER[d.tradition] * 10 + keyScore;
  };

  const sorted = [...dishes].sort((a, b) => score(a) - score(b)).slice(0, MAX_RESULTS);
  const recs: DishRecommendation[] = sorted.map((dish) => ({
    dish,
    region: toRegion(dish.regionId),
    isLocal: !!currentRegion && dish.regionId === currentRegion.id,
  }));

  return {
    local: recs.filter((r) => r.isLocal),
    others: recs.filter((r) => !r.isLocal),
  };
}

export async function getDishById(id: string): Promise<Dish | undefined> {
  return provider.getById(id);
}

export function regionOfDish(dish: Dish): Region {
  return toRegion(dish.regionId);
}
