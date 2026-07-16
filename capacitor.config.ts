import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xin.zbyblq.cdw',
  appName: 'StuHeal',
  webDir: 'dist',
  backgroundColor: '#F0F4F8',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false, // WebView 在状态栏下方
      // style + backgroundColor 由 useTheme.ts 根据亮/暗动态设置
    },
    SplashScreen: {
      launchShowDuration: 0,    // 应用启动后立即隐藏原生闪屏
      backgroundColor: '#F0F4F8',
    },
  },
};

export default config;
