// ============================================================
// 料理ビジュアル（モック用）
//
// MVPでは実写真の配信元がないため、料理ごとの色・形から
// 真上から見た「皿の上の料理」SVGを生成して data URI で返す。
// 本番では Dish.imageUrl に CDN / API の実写真URLを入れるだけで置き換わる。
// ============================================================

export type DishArtStyle =
  | 'short-pasta' // オレキエッテ、リガトーニ等
  | 'long-pasta' // スパゲッティ、タリアテッレ等
  | 'risotto'
  | 'soup' // パッパ、ブロード
  | 'burrata'
  | 'grill' // グリル野菜、ソーセージ
  | 'layered' // パルミジャーナ
  | 'polenta'
  | 'bread'; // パンツァネッラ、フリゼッラ

export interface DishArtSpec {
  style: DishArtStyle;
  /** テーブルの色 */
  table: string;
  /** 料理のベース色 */
  base: string;
  /** ソース/ハイライト色 */
  accent: string;
  /** 散らす具材の色 */
  garnish: string[];
}

/** 文字列から決定的な疑似乱数列を作る */
function seeded(seedText: string) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 600;
const CX = W / 2;
const CY = H / 2 + 10;

/** 皿の中（半径 r）にランダムな点を置く */
function pointInPlate(rand: () => number, r: number) {
  const a = rand() * Math.PI * 2;
  const d = Math.sqrt(rand()) * r;
  return { x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d };
}

function drawFood(spec: DishArtSpec, rand: () => number): string {
  const parts: string[] = [];
  const { base, accent, garnish } = spec;
  const g = (i: number) => garnish[i % garnish.length];

  switch (spec.style) {
    case 'short-pasta': {
      parts.push(`<circle cx="${CX}" cy="${CY}" r="150" fill="${accent}" opacity=".35"/>`);
      for (let i = 0; i < 70; i++) {
        const p = pointInPlate(rand, 140);
        const rot = rand() * 360;
        parts.push(
          `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rot.toFixed(0)})">` +
            `<ellipse rx="17" ry="13" fill="${base}"/>` +
            `<ellipse rx="10" ry="7" cx="1" cy="1" fill="#000" opacity=".12"/></g>`,
        );
      }
      for (let i = 0; i < 26; i++) {
        const p = pointInPlate(rand, 140);
        parts.push(
          `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(10 + rand() * 12).toFixed(1)}" ry="${(6 + rand() * 6).toFixed(1)}" transform="rotate(${(rand() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})" fill="${g(i)}"/>`,
        );
      }
      break;
    }
    case 'long-pasta': {
      parts.push(`<circle cx="${CX}" cy="${CY}" r="148" fill="${base}"/>`);
      for (let i = 0; i < 46; i++) {
        const r = 20 + rand() * 120;
        const start = rand() * Math.PI * 2;
        const sweep = 0.9 + rand() * 1.6;
        const x1 = CX + Math.cos(start) * r;
        const y1 = CY + Math.sin(start) * r;
        const x2 = CX + Math.cos(start + sweep) * r;
        const y2 = CY + Math.sin(start + sweep) * r;
        parts.push(
          `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${i % 3 === 0 ? '#000' : base}" stroke-opacity="${i % 3 === 0 ? 0.1 : 1}" stroke-width="${i % 3 === 0 ? 3 : 7}" fill="none" stroke-linecap="round"/>`,
        );
      }
      parts.push(`<circle cx="${CX}" cy="${CY}" r="70" fill="${accent}" opacity=".85"/>`);
      for (let i = 0; i < 30; i++) {
        const p = pointInPlate(rand, 120);
        parts.push(
          `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${(10 + rand() * 10).toFixed(1)}" height="${(7 + rand() * 6).toFixed(1)}" rx="3" fill="${g(i)}" transform="rotate(${(rand() * 90).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`,
        );
      }
      break;
    }
    case 'risotto':
    case 'polenta': {
      parts.push(`<circle cx="${CX}" cy="${CY}" r="150" fill="${base}"/>`);
      parts.push(`<circle cx="${CX - 30}" cy="${CY - 30}" r="90" fill="#fff" opacity=".12"/>`);
      if (spec.style === 'risotto') {
        for (let i = 0; i < 260; i++) {
          const p = pointInPlate(rand, 145);
          parts.push(
            `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="5" ry="2.6" fill="${accent}" opacity=".55" transform="rotate(${(rand() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`,
          );
        }
      } else {
        parts.push(`<circle cx="${CX}" cy="${CY}" r="80" fill="${accent}" opacity=".9"/>`);
      }
      for (let i = 0; i < 22; i++) {
        const p = pointInPlate(rand, 125);
        parts.push(
          `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(8 + rand() * 12).toFixed(1)}" ry="${(6 + rand() * 7).toFixed(1)}" fill="${g(i)}"/>`,
        );
      }
      break;
    }
    case 'soup': {
      parts.push(`<circle cx="${CX}" cy="${CY}" r="150" fill="${base}"/>`);
      for (let i = 0; i < 40; i++) {
        const p = pointInPlate(rand, 135);
        parts.push(
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(6 + rand() * 14).toFixed(1)}" fill="${accent}" opacity=".7"/>`,
        );
      }
      for (let i = 0; i < 12; i++) {
        const p = pointInPlate(rand, 120);
        parts.push(
          `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="14" ry="7" fill="${g(i)}" transform="rotate(${(rand() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`,
        );
      }
      parts.push(
        `<path d="M${CX - 80} ${CY + 40} q80 -40 160 0" stroke="#e2b714" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`,
      );
      break;
    }
    case 'burrata': {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + rand() * 0.2;
        const d = 118 + rand() * 18;
        const x = CX + Math.cos(a) * d;
        const y = CY + Math.sin(a) * d;
        parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(18 + rand() * 6).toFixed(1)}" fill="${g(i)}"/>`);
        parts.push(`<circle cx="${(x - 5).toFixed(1)}" cy="${(y - 6).toFixed(1)}" r="4" fill="#fff" opacity=".5"/>`);
      }
      parts.push(`<circle cx="${CX}" cy="${CY}" r="92" fill="${base}"/>`);
      parts.push(`<circle cx="${CX - 25}" cy="${CY - 28}" r="40" fill="#fff" opacity=".6"/>`);
      parts.push(
        `<path d="M${CX - 10} ${CY - 10} q40 30 20 70 q-30 -10 -40 -40z" fill="${accent}" opacity=".9"/>`,
      );
      break;
    }
    case 'grill': {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 180 - 90 + rand() * 10;
        parts.push(
          `<g transform="rotate(${a.toFixed(0)} ${CX} ${CY})">` +
            `<path d="M${CX} ${CY - 20} C${CX + 40} ${CY - 60} ${CX + 150} ${CY - 40} ${CX + 150} ${CY} C${CX + 150} ${CY + 40} ${CX + 40} ${CY + 60} ${CX} ${CY + 20}z" fill="${g(i)}"/>` +
            `<path d="M${CX + 10} ${CY} L${CX + 140} ${CY}" stroke="${base}" stroke-width="5" opacity=".8"/>` +
            `<path d="M${CX + 60} ${CY - 34} l0 68 M${CX + 100} ${CY - 34} l0 68" stroke="#1c1917" stroke-width="6" opacity=".35"/></g>`,
        );
      }
      break;
    }
    case 'layered': {
      parts.push(`<rect x="${CX - 140}" y="${CY - 100}" width="280" height="200" rx="24" fill="${accent}"/>`);
      for (let i = 0; i < 18; i++) {
        const x = CX - 120 + rand() * 240;
        const y = CY - 80 + rand() * 160;
        parts.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(20 + rand() * 16).toFixed(1)}" ry="${(14 + rand() * 10).toFixed(1)}" fill="${base}" opacity=".9"/>`);
      }
      for (let i = 0; i < 10; i++) {
        const x = CX - 110 + rand() * 220;
        const y = CY - 70 + rand() * 140;
        parts.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="14" ry="8" fill="${g(i)}" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
      }
      break;
    }
    case 'bread': {
      for (let i = 0; i < 20; i++) {
        const p = pointInPlate(rand, 120);
        parts.push(
          `<rect x="${(p.x - 22).toFixed(1)}" y="${(p.y - 18).toFixed(1)}" width="44" height="36" rx="9" fill="${base}" transform="rotate(${(rand() * 90).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`,
        );
      }
      for (let i = 0; i < 30; i++) {
        const p = pointInPlate(rand, 130);
        parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(10 + rand() * 10).toFixed(1)}" fill="${i % 3 === 0 ? accent : g(i)}"/>`);
      }
      break;
    }
  }
  return parts.join('');
}

/** 料理ビジュアルを data URI として返す */
export function dishArt(seed: string, spec: DishArtSpec): string {
  const rand = seeded(seed);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<radialGradient id="t" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="${spec.table}"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>` +
    `<radialGradient id="p" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7e2da"/></radialGradient>` +
    `<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-opacity=".35"/></filter>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="${spec.table}"/>` +
    `<rect width="${W}" height="${H}" fill="url(#t)"/>` +
    // リネンのナプキンとフォーク
    `<rect x="590" y="60" width="160" height="420" rx="10" fill="#f5efe6" opacity=".9" transform="rotate(8 670 270)"/>` +
    `<g transform="rotate(8 670 270)" fill="#cfc8bd"><rect x="662" y="120" width="12" height="300" rx="6"/><rect x="650" y="100" width="36" height="70" rx="8"/></g>` +
    `<circle cx="${CX}" cy="${CY}" r="225" fill="url(#p)" filter="url(#s)"/>` +
    `<circle cx="${CX}" cy="${CY}" r="178" fill="none" stroke="#d6cfc4" stroke-width="3"/>` +
    drawFood(spec, rand) +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
