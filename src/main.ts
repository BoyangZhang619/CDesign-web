import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { App as CapApp } from '@capacitor/app'

// Design tokens & global base styles
import './scss/_tokens.scss'
import './scss/_base.scss'

// Apply saved theme before app mounts (avoid flash of wrong theme)
const saved = localStorage.getItem('stuheal-theme') as 'light' | 'dark' | null
if (saved) {
  document.documentElement.setAttribute('data-theme', saved)
}

// 原生平台：立即全屏 + 设置初始状态栏颜色
if (Capacitor.isNativePlatform()) {
  const isDark = saved === 'dark'
  StatusBar.setBackgroundColor({ color: isDark ? '#1A1D22' : '#F0F4F8' })
  StatusBar.hide()
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 全局错误处理 — 防止未捕获异常导致整个应用白屏
app.config.errorHandler = (err, _instance, info) => {
  console.error('[全局错误]', err)
  console.error('[错误来源]', info)
  if (import.meta.env.PROD) {
    // TODO: 接入错误监控服务
  }
}

// 全局警告处理
app.config.warnHandler = (msg, _instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn(`[Vue 警告] ${msg}`, trace)
  }
}

app.mount('#app')

// Capacitor Android 返回按钮/侧滑 — 先回退路由历史，到底了再退出
CapApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
  if (canGoBack) {
    router.back()
  } else {
    CapApp.exitApp()
  }
})