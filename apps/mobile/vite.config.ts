import { defineConfig } from 'vite';

// 移动壳的 Web 部分: 根目录为 web/, 产物输出到 dist/ 供 Capacitor 使用
export default defineConfig({
  root: 'web',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5174,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@tetris/core', '@tetris/ui'],
  },
});
