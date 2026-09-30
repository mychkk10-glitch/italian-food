import type { GeoPoint, LocationState } from '../types';
import { REGIONS, approximateRegion, matchRegion } from '../data/regions';
import { fetchWithTimeout } from './config';

// ============================================================
// 現在地の取得
// ============================================================

/**
 * 開発・検証用：URLに ?lat=40.35&lng=18.17 を付けると、その座標を現在地として扱う。
 * （ユーザー向けの地域選択UIは設けない）
 */
function getDebugPoint(): GeoPoint | undefined {
  try {
    const q = new URLSearchParams(window.location.search);
    const lat = Number(q.get('lat'));
    const lng = Number(q.get('lng'));
    if (q.has('lat') && q.has('lng') && Number.isFinite(lat) && Number.isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }
    // #puglia のように州IDをハッシュで渡すと、その州の中心を現在地とみなす（プレビュー用）
    const hash = window.location.hash.replace('#', '');
    const region = REGIONS.find((r) => r.id === hash);
    if (region) return { latitude: region.center[0], longitude: region.center[1] };
  } catch {
    /* noop */
  }
  return undefined;
}

type PositionOutcome =
  | { ok: true; point: GeoPoint }
  | { ok: false; reason: 'denied' | 'unsupported' | 'timeout' | 'error' };

export function getCurrentPosition(): Promise<PositionOutcome> {
  const debug = getDebugPoint();
  if (debug) return Promise.resolve({ ok: true, point: debug });

  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve({ ok: false, reason: 'unsupported' });
  }
  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            ok: true,
            point: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) resolve({ ok: false, reason: 'denied' });
          else if (err.code === err.TIMEOUT) resolve({ ok: false, reason: 'timeout' });
          else resolve({ ok: false, reason: 'error' });
        },
        // 地域判定には高精度は不要。バッテリーと応答速度を優先する
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
      );
    } catch {
      resolve({ ok: false, reason: 'error' });
    }
  });
}

// ============================================================
// 逆ジオコーディング（緯度経度 → 都市 / 州）
// ============================================================

interface ReverseGeocodeResult {
  city?: string;
  regionName?: string;
  regionIsoCode?: string;
  country?: string;
  countryCode?: string;
}

const CACHE_PREFIX = 'wt:revgeo:';

function cacheKey(p: GeoPoint) {
  // 約1km単位で丸めてキャッシュ
  return `${CACHE_PREFIX}${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`;
}

function readCache(p: GeoPoint): ReverseGeocodeResult | undefined {
  try {
    const raw = sessionStorage.getItem(cacheKey(p));
    return raw ? (JSON.parse(raw) as ReverseGeocodeResult) : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(p: GeoPoint, v: ReverseGeocodeResult) {
  try {
    sessionStorage.setItem(cacheKey(p), JSON.stringify(v));
  } catch {
    /* プライベートモード等では保存できないことがある */
  }
}

interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    country?: string;
    country_code?: string;
    'ISO3166-2-lvl4'?: string;
  };
}

/**
 * 逆ジオコーディング（OpenStreetMap Nominatim・無料）。
 * 利用者ごとのブラウザから直接呼ぶ（サーバー1台に集中させない）ことで
 * Nominatim の利用規約（1秒1リクエスト程度まで）に収める。結果はセッション内でキャッシュ。
 */
export async function reverseGeocode(p: GeoPoint): Promise<ReverseGeocodeResult> {
  const cached = readCache(p);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=it&lat=${p.latitude.toFixed(4)}&lon=${p.longitude.toFixed(4)}`;

  const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 8000);
  if (!res.ok) throw new Error(`reverse-geocode ${res.status}`);
  const json = (await res.json()) as NominatimResponse;
  const a = json.address ?? {};
  const result: ReverseGeocodeResult = {
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? a.county,
    regionName: a.state ?? a.region,
    regionIsoCode: a['ISO3166-2-lvl4'],
    country: a.country,
    countryCode: a.country_code?.toUpperCase(),
  };
  writeCache(p, result);
  return result;
}

// ============================================================
// 現在地 → 料理地域
// ============================================================

export async function resolveLocation(): Promise<LocationState> {
  const pos = await getCurrentPosition();
  if (!pos.ok) {
    return pos.reason === 'denied'
      ? { status: 'denied' }
      : { status: 'unavailable', reason: pos.reason };
  }
  const { point } = pos;

  try {
    const geo = await reverseGeocode(point);
    const region = matchRegion({ isoCode: geo.regionIsoCode, name: geo.regionName });
    return {
      status: 'ready',
      point,
      city: geo.city,
      regionName: region?.name ?? geo.regionName,
      region: region ? { id: region.id, name: region.name, nameJapanese: region.nameJapanese } : undefined,
      country: geo.country,
      countryCode: geo.countryCode,
    };
  } catch {
    // オフライン等で逆ジオコーディングできない場合は、座標から近似推定する
    const region = approximateRegion(point.latitude, point.longitude);
    return {
      status: 'ready',
      point,
      regionName: region?.name,
      region: region ? { id: region.id, name: region.name, nameJapanese: region.nameJapanese } : undefined,
      countryCode: region ? 'IT' : undefined,
      approximate: true,
    };
  }
}

/** 表示用ラベル（例: "Milano, Lombardia"） */
export function formatLocationLabel(loc: LocationState): string | undefined {
  if (loc.status !== 'ready') return undefined;
  const parts = [loc.city, loc.regionName].filter(Boolean) as string[];
  const unique = parts.filter((v, i) => parts.indexOf(v) === i);
  if (unique.length === 0) return loc.country ?? '現在地';
  const label = unique.join(', ');
  return loc.approximate ? `${label} 付近` : label;
}
