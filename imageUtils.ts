/**
 * 画像ユーティリティ（ブラウザ内処理）
 */

export interface ImageStats {
  /** 0〜255 の平均輝度 */
  brightness: number;
  /** 平均色 HSL */
  hue: number;
  saturation: number;
  lightness: number;
  /** 画像全体の輝度のばらつき（小さいとピンぼけ・真っ白/真っ黒の可能性） */
  contrast: number;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image-load-failed'));
    img.src = src;
  });
}

/** 長辺を maxSize に縮小した JPEG を返す（アップロード量の削減用） */
export async function downscaleToJpeg(src: string, maxSize = 1280, quality = 0.82): Promise<Blob> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode-failed'))), 'image/jpeg', quality),
  );
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result);
      resolve(s.slice(s.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

/** 画像中央部の色・明るさを解析する（モック認識と撮影品質チェックに使用） */
export async function analyzeImage(src: string): Promise<ImageStats> {
  const img = await loadImage(src);
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas-unavailable');
  // 中央60%を切り出して解析（被写体が中央にある前提）
  const sw = img.naturalWidth * 0.6;
  const sh = img.naturalHeight * 0.6;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  const lum: number[] = [];
  // 彩度の高い画素を重み付けして「被写体の色」を拾う
  let wr = 0;
  let wg = 0;
  let wb = 0;
  let wsum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    r += pr;
    g += pg;
    b += pb;
    lum.push(0.299 * pr + 0.587 * pg + 0.114 * pb);
    const { s } = rgbToHsl(pr, pg, pb);
    const w = 0.15 + s * s;
    wr += pr * w;
    wg += pg * w;
    wb += pb * w;
    wsum += w;
  }
  const n = data.length / 4;
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / n;
  const mean = lum.reduce((a, c) => a + c, 0) / n;
  const contrast = Math.sqrt(lum.reduce((a, c) => a + (c - mean) ** 2, 0) / n);
  const { h, s, l } = rgbToHsl(wr / wsum, wg / wsum, wb / wsum);
  return { brightness, hue: h, saturation: s, lightness: l, contrast };
}
