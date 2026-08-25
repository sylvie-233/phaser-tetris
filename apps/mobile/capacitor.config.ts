import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tetris.game',
  appName: '俄罗斯方块',
  webDir: 'dist',
  server: {
    // 调试时可指向 Vite dev server(本机局域网地址)
    // url: 'http://192.168.x.x:5174',
    cleartext: true,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
