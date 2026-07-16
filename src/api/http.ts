import axios from 'axios'
import { getToken, setToken, removeToken } from '../utils/token'
import { useAuthStore } from '../stores/auth'

const http = axios.create({
  baseURL: import.meta.env.DEVELOPMENT ? '/api' : `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000,
  withCredentials: true
})

if (import.meta.env.DEV) {
  console.log('API base URL:', http.defaults.baseURL)
}

// ── Token 刷新队列（共享状态）─────────────────────────────────
let isRefreshing = false
let refreshSubscribers: Array<{
  resolve: (token: string) => void
  reject: (err: Error) => void
}> = []

function onRefreshed(resolve: (token: string) => void, reject: (err: Error) => void) {
  refreshSubscribers.push({ resolve, reject })
}

function notifyRefreshed(token: string) {
  refreshSubscribers.forEach(s => s.resolve(token))
  refreshSubscribers = []
}

function failSubscribers(err: Error) {
  refreshSubscribers.forEach(s => s.reject(err))
  refreshSubscribers = []
}

// ── 共享的 Token 刷新逻辑 ─────────────────────────────────────

/**
 * 调用后端刷新 access token，失败时指数退避重试（最多 3 次）
 */
async function refreshAccessToken(): Promise<string> {
  const authStore = useAuthStore()
  let lastError: any

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await axios.post(
        `${http.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 30000 },
      )

      if (response.data?.success && response.data?.data?.accessToken) {
        const newToken = response.data.data.accessToken
        // 原子更新：先写 store 再写 localStorage
        authStore.token = newToken
        setToken(newToken)
        return newToken
      }

      // 服务端返回了错误但不是网络问题 → 不重试
      throw new Error('Token刷新失败')
    } catch (err: any) {
      lastError = err
      // 只有网络错误才重试，401/403 说明 refreshToken 本身无效
      const status = err?.response?.status
      if (status === 401 || status === 403) throw err
      if (attempt < 2) {
        const delay = 1000 * (1 << attempt) // 1s, 2s, 4s
        if (import.meta.env.DEV) console.warn(`[Token] 刷新失败，${delay}ms 后重试 (${attempt + 2}/3)`)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }

  throw lastError || new Error('Token刷新失败（已重试 3 次）')
}

/**
 * 带排队机制的 token 刷新入口。
 * 如果已有刷新正在进行，挂起等待；否则发起刷新并广播结果。
 * 失败时通知所有排队者，避免永久挂起。
 */
async function refreshTokenWithQueue(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      onRefreshed(resolve, reject)
    })
  }

  isRefreshing = true
  try {
    const newToken = await refreshAccessToken()
    notifyRefreshed(newToken)
    return newToken
  } catch (err) {
    failSubscribers(err instanceof Error ? err : new Error(String(err)))
    throw err
  } finally {
    isRefreshing = false
  }
}

/**
 * Token 刷新彻底失败时的统一清理逻辑。
 */
function handleRefreshFailure(err: any): never {
  const authStore = useAuthStore()
  console.error('[Token] 刷新彻底失败，跳转登录:', err?.response?.data || err?.message)
  authStore.token = ''
  authStore.userInfo = null
  removeToken()
  window.location.href = '/auth'
  throw err
}

// ── Axios 拦截器 ─────────────────────────────────────────────

http.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

http.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config
    const status = error?.response?.status

    if (status === 401 && config && !config.__isRetry) {
      try {
        const newToken = await refreshTokenWithQueue()
        config.headers.Authorization = `Bearer ${newToken}`
        config.__isRetry = true
        return http(config)
      } catch (refreshError: any) {
        handleRefreshFailure(refreshError)
      }
    }

    if (status === 403) console.error('没有权限访问此资源')
    if (status === 404) console.error('请求的资源不存在')
    if (status === 500) console.error('服务器错误，请稍后重试')

    return Promise.reject(error)
  }
)

// ── fetch 封装（SSE 等场景） ──────────────────────────────────

/**
 * 使用 fetch API 发送请求，复用同一套 token 刷新逻辑。
 */
export async function fetchWithRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const makeRequest = (token?: string) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(`${http.defaults.baseURL}${url}`, {
      ...options,
      headers,
      credentials: 'include'
    })
  }

  const token = getToken()
  let response = await makeRequest(token)

  if (response.status === 401) {
    try {
      const newToken = await refreshTokenWithQueue()
      response = await makeRequest(newToken)
    } catch (err: any) {
      handleRefreshFailure(err)
    }
  }

  return response
}

export default http
