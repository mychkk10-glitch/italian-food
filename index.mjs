// ============================================================
// ローカル開発用 API サーバー（依存なし / Node 18+）
// 本番（Vercel）では api/recognize.js が同じ処理を担う。
//
//   GEMINI_API_KEY=xxxx npm run api      → http://localhost:8787
//   別ターミナルで                        → npm run dev:ai
// ============================================================
import http from 'node:http';
import { HttpError, checkRateLimit, isAllowedOrigin, recognizeIngredient } from '../api/_lib/gemini.js';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 4 * 1024 * 1024;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'too-large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'invalid-json'));
      }
    });
    req.on('error', reject);
  });
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    try {
      if (req.method === 'POST' && url.pathname === '/api/recognize') {
        if (!isAllowedOrigin(req.headers.origin)) return send(res, 403, { error: 'forbidden' });
        checkRateLimit(req.socket.remoteAddress ?? 'local');
        return send(res, 200, await recognizeIngredient(await readJson(req)));
      }
      send(res, 404, { error: 'not-found' });
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.code });
      console.error(e);
      send(res, 500, { error: 'internal' });
    }
  })
  .listen(PORT, () => console.log(`API server: http://localhost:${PORT}`));
