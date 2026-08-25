import { defineConfig } from 'vite';

export default defineConfig({
  // 相对路径, 便于 Capacitor 以本地文件方式加载
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  // 内部包以 TS 源码形式消费, 不预打包
  optimizeDeps: {
    exclude: ['@tetris/core', '@tetris/ui'],
  },
});
