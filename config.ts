/**
 * 実行時設定。
 *
 * 画像認識は、本番ではバックエンド（api/recognize.js → Gemini API）を使う。
 * ※ AIのAPIキーはフロントエンドに置かない。バックエンド側の環境変数で管理する。
 */
const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

/**
 * - 本番ビルド（Vercel）: 同じサイトの /api を使う（設定不要）
 * - npm run dev / build:single（プレビュー用）: APIなし＝モック認識
 * - VITE_API_BASE_URL を設定すれば、それが優先される
 */
export const API_BASE_URL: string | undefined =
  envBase || (import.meta.env.PROD && import.meta.env.MODE !== 'single' ? '/api' : undefined);

export const USE_MOCK_RECOGNITION = !API_BASE_URL;

/** 通信のタイムアウト（ms） */
export const REQUEST_TIMEOUT_MS = 20000;

export async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
