import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      // 鍙鍓嶇璇锋眰浠?/api 寮€澶达紝Vite 灏变細鑷姩杞彂鍒版湰鍦?3000 绔彛
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 濡傛灉鍚庣鎺ュ彛娌℃湁 /api 鍓嶇紑锛屽彲浠ュ紑鍚噸鍐?        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
