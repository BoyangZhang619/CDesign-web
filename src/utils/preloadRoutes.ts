/**
 * 路由懒加载页面后台静默预加载
 *
 * 在用户浏览完当前页面后，利用浏览器空闲时间在后台静默预加载
 * 尚未被访问过的懒加载页面 chunk，提升后续导航体验。
 *
 * 使用 requestIdleCallback 确保不影响用户交互，低端设备自动降级。
 */
import type { Router } from 'vue-router'

/**
 * 当前已被访问过的路由路径集合
 * 首次加载的页面不需要再预加载（已缓存）
 */
const visited = new Set<string>()

/**
 * 预加载是否已触发
 */
let preloadTriggered = false

/**
 * 各路由对应的动态 import 函数
 * key 为路由 name，值为 import() 的工厂函数
 *
 * 注意：这里的函数必须与 src/router/index.ts 中的路由懒加载定义保持一致！
 */
const routeImporters: Record<string, () => Promise<unknown>> = {
  home: () => import('../views/HomeView.vue'),
  auth: () => import('../views/AuthView.vue'),
  'profile': () => import('../views/ProfileView.vue'),
  'profile-edit': () => import('../views/ProfileEditView.vue'),
  'ai-chat': () => import('../views/AIChatView.vue'),
  history: () => import('../views/HistoryView.vue'),
  portrait: () => import('../views/PortraitView.vue'),
  trends: () => import('../views/TrendsView.vue'),
  todolist: () => import('../views/TodolistView.vue'),
  explore: () => import('../views/ExploreView.vue'),
  settings: () => import('../views/SettingsView.vue'),
  checkin: () => import('../views/CheckinView.vue'),
  'avatar-editor': () => import('../views/AvatarEditorView.vue'),
  'avatar-picker': () => import('../views/AvatarPickerView.vue'),
}

/**
 * 使用 requestIdleCallback 在浏览器空闲时执行任务，
 * 不支持的环境自动降级为 setTimeout
 */
function whenIdle(callback: () => void, timeout = 2000): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 300)
  }
}

/**
 * 后台预加载单个路由组件 chunk
 * 加载失败则静默忽略——不影响用户体验
 */
function preloadChunk(name: string, importer: () => Promise<unknown>): void {
  importer()
    .then(() => {
      if (import.meta.env.DEV) {
        console.debug(`[Preload] ✓ ${name}`)
      }
    })
    .catch(() => {
      // 静默失败：网络波动或 chunk 不存在都不应影响用户
      if (import.meta.env.DEV) {
        console.debug(`[Preload] ✗ ${name} (ignored)`)
      }
    })
}

/**
 * 核心预加载调度：
 * 1. 排除当前已访问的路由
 * 2. 剩余路由用 requestIdleCallback 逐个排队，避免一次性拥堵
 */
function schedulePreload(currentRouteName: string | symbol | null | undefined): void {
  const names = Object.keys(routeImporters).filter(
    (name) => !visited.has(name) && name !== currentRouteName,
  )

  if (names.length === 0) return

  if (import.meta.env.DEV) {
    console.debug(`[Preload] 计划预加载 ${names.length} 个页面:`, names)
  }

  // 逐个排队 —— 每次空闲时加载下一个，不抢主线程
  let index = 0
  const loadNext = () => {
    if (index >= names.length) return
    const name = names[index]!
    preloadChunk(name, routeImporters[name]!)
    index++
    if (index < names.length) {
      whenIdle(loadNext, 3000)
    }
  }
  whenIdle(loadNext, 2000)
}

/**
 * 安装预加载：监听路由变化，首次导航完成后触发后台预加载
 *
 * 用法：在 main.ts 的 app.mount 之后调用 installPreload(router)
 */
export function installPreload(router: Router): void {
  router.afterEach((to) => {
    // 记录已访问的路由
    if (to.name) {
      visited.add(String(to.name))
    }

    // 仅首次触发预加载
    if (preloadTriggered) return
    preloadTriggered = true

    // 等页面完全渲染后再开始预加载
    whenIdle(() => {
      schedulePreload(to.name)
    }, 3000)
  })
}
