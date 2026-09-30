import type { Region } from '../types';

/**
 * イタリア20州の定義。
 * - isoCode: ISO 3166-2（逆ジオコーディング結果との照合に使用）
 * - aliases: 伊語/英語/独語などの表記ゆれ
 * - center: 逆ジオコーディングに失敗した際の近似判定用の概略中心点
 */
export interface RegionRecord extends Region {
  isoCode: string;
  aliases: string[];
  center: [number, number];
}

export const REGIONS: RegionRecord[] = [
  { id: 'piemonte', name: 'Piemonte', nameJapanese: 'ピエモンテ', isoCode: 'IT-21', aliases: ['piemonte', 'piedmont'], center: [45.05, 7.92] },
  { id: 'valle-daosta', name: "Valle d'Aosta", nameJapanese: 'ヴァッレ・ダオスタ', isoCode: 'IT-23', aliases: ["valle d'aosta", 'vallee d aoste', 'aosta valley', "vallée d'aoste"], center: [45.74, 7.43] },
  { id: 'lombardia', name: 'Lombardia', nameJapanese: 'ロンバルディア', isoCode: 'IT-25', aliases: ['lombardia', 'lombardy'], center: [45.62, 9.77] },
  { id: 'trentino-alto-adige', name: 'Trentino-Alto Adige', nameJapanese: 'トレンティーノ＝アルト・アディジェ', isoCode: 'IT-32', aliases: ['trentino', 'alto adige', 'südtirol', 'sudtirol', 'south tyrol'], center: [46.43, 11.17] },
  { id: 'veneto', name: 'Veneto', nameJapanese: 'ヴェネト', isoCode: 'IT-34', aliases: ['veneto'], center: [45.65, 11.85] },
  { id: 'friuli-venezia-giulia', name: 'Friuli-Venezia Giulia', nameJapanese: 'フリウリ＝ヴェネツィア・ジュリア', isoCode: 'IT-36', aliases: ['friuli'], center: [46.15, 13.05] },
  { id: 'liguria', name: 'Liguria', nameJapanese: 'リグーリア', isoCode: 'IT-42', aliases: ['liguria'], center: [44.3, 8.7] },
  { id: 'emilia-romagna', name: 'Emilia-Romagna', nameJapanese: 'エミリア＝ロマーニャ', isoCode: 'IT-45', aliases: ['emilia-romagna', 'emilia romagna'], center: [44.53, 11.03] },
  { id: 'toscana', name: 'Toscana', nameJapanese: 'トスカーナ', isoCode: 'IT-52', aliases: ['toscana', 'tuscany'], center: [43.45, 11.1] },
  { id: 'umbria', name: 'Umbria', nameJapanese: 'ウンブリア', isoCode: 'IT-55', aliases: ['umbria'], center: [42.97, 12.49] },
  { id: 'marche', name: 'Marche', nameJapanese: 'マルケ', isoCode: 'IT-57', aliases: ['marche', 'the marches'], center: [43.35, 13.1] },
  { id: 'lazio', name: 'Lazio', nameJapanese: 'ラツィオ', isoCode: 'IT-62', aliases: ['lazio', 'latium'], center: [41.98, 12.77] },
  { id: 'abruzzo', name: 'Abruzzo', nameJapanese: 'アブルッツォ', isoCode: 'IT-65', aliases: ['abruzzo'], center: [42.23, 13.85] },
  { id: 'molise', name: 'Molise', nameJapanese: 'モリーゼ', isoCode: 'IT-67', aliases: ['molise'], center: [41.68, 14.6] },
  { id: 'campania', name: 'Campania', nameJapanese: 'カンパーニア', isoCode: 'IT-72', aliases: ['campania'], center: [40.85, 14.8] },
  { id: 'puglia', name: 'Puglia', nameJapanese: 'プーリア', isoCode: 'IT-75', aliases: ['puglia', 'apulia'], center: [40.98, 16.62] },
  { id: 'basilicata', name: 'Basilicata', nameJapanese: 'バジリカータ', isoCode: 'IT-77', aliases: ['basilicata'], center: [40.5, 16.08] },
  { id: 'calabria', name: 'Calabria', nameJapanese: 'カラブリア', isoCode: 'IT-78', aliases: ['calabria'], center: [39.07, 16.35] },
  { id: 'sicilia', name: 'Sicilia', nameJapanese: 'シチリア', isoCode: 'IT-82', aliases: ['sicilia', 'sicily'], center: [37.6, 14.15] },
  { id: 'sardegna', name: 'Sardegna', nameJapanese: 'サルデーニャ', isoCode: 'IT-88', aliases: ['sardegna', 'sardinia'], center: [40.08, 9.03] },
];

export function findRegionById(id: string): RegionRecord | undefined {
  return REGIONS.find((r) => r.id === id);
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'");
}

/** ISOコードまたは地域名から料理データ上の地域を判定する */
export function matchRegion(opts: { isoCode?: string; name?: string }): RegionRecord | undefined {
  if (opts.isoCode) {
    const byCode = REGIONS.find((r) => r.isoCode === opts.isoCode);
    if (byCode) return byCode;
  }
  if (opts.name) {
    const n = normalize(opts.name);
    return REGIONS.find((r) => r.aliases.some((a) => n.includes(normalize(a))));
  }
  return undefined;
}

/** イタリアのおおよその範囲内なら、最も近い州の中心から地域を推定する */
export function approximateRegion(lat: number, lng: number): RegionRecord | undefined {
  const inItaly = lat > 35.4 && lat < 47.2 && lng > 6.5 && lng < 18.7;
  if (!inItaly) return undefined;
  let best: RegionRecord | undefined;
  let bestD = Infinity;
  for (const r of REGIONS) {
    const dLat = r.center[0] - lat;
    const dLng = (r.center[1] - lng) * Math.cos((lat * Math.PI) / 180);
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  // 最寄りの州中心から約1.6度（〜180km）以上離れている場合は判定しない
  return bestD < 1.6 * 1.6 ? best : undefined;
}
