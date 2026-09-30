import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → 通常のPWAビルド（dist/）
// `npm run build:single` → 1ファイルHTML（プレビュー/Artifact用, dist-single/）
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      target: 'es2019', // iOS Safari 14+ を想定
    },
    server: {
      // 開発時のバックエンドプロキシ（server/ を起動した場合）
      proxy: {
        '/api': 'http://localhost:8787',
      },
    },
  };
});
