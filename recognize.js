// Vercel Function: POST /api/recognize
// 写真から食材を認識する（Gemini API 無料枠）
import { HttpError, checkRateLimit, isAllowedOrigin, recognizeIngredient } from './_lib/gemini.js';

/**
 * @param {import('node:http').IncomingMessage & { body?: any }} req
 * @param {import('node:http').ServerResponse} res
 */
export default async function handler(req, res) {
  const send = (/** @type {number} */ status, /** @type {unknown} */ body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };

  if (req.method !== 'POST') return send(405, { error: 'method-not-allowed' });
  if (!isAllowedOrigin(req.headers.origin)) return send(403, { error: 'forbidden' });

  try {
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
    checkRateLimit(ip);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return send(200, await recognizeIngredient(body));
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status >= 500) console.error('[recognize]', e.code);
      return send(e.status, { error: e.code });
    }
    console.error('[recognize]', e);
    return send(500, { error: 'internal' });
  }
}
