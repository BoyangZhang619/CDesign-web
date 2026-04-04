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
    proxy: {
      // 只要前端请求以 /api 开头，Vite 就会自动转发到本地 3000 端口
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 如果后端接口没有 /api 前缀，可以开启重写
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})