import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Design tokens & global base styles
import './scss/_tokens.scss'
import './scss/_base.scss'

// Apply saved theme before app mounts (avoid flash of wrong theme)
const saved = localStorage.getItem('stuheal-theme') as 'light' | 'dark' | null
if (saved) {
  document.documentElement.setAttribute('data-theme', saved)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 全局错误处理 — 防止未捕获异常导致整个应用白屏
app.config.errorHandler = (err, instance, info) => {
  console.error('[全局错误]', err)
  console.error('[错误来源]', info)
  if (import.meta.env.PROD) {
    // TODO: 接入错误监控服务
  }
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn(`[Vue 警告] ${msg}`, trace)
  }
}

app.mount('#app')