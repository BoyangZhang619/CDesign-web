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
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifyRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

// ── 共享的 Token 刷新逻辑 ─────────────────────────────────────

/**
 * 调用后端刷新 access token，并更新全局状态。
 * 同时用于 Axios 拦截器和 fetchWithRefresh，消除重复代码。
 */
async function refreshAccessToken(): Promise<string> {
  const authStore = useAuthStore()

  const response = await axios.post(
    `${http.defaults.baseURL}/auth/refresh`,
    {},
    { withCredentials: true, timeout: 30000 }
  )

  if (!response.data?.success || !response.data?.data?.accessToken) {
    throw new Error('Token刷新失败')
  }

  const newToken = response.data.data.accessToken
  authStore.token = newToken
  setToken(newToken)
  return newToken
}

/**
 * 带排队机制的 token 刷新入口。
 * 如果已有刷新正在进行，挂起等待；否则发起刷新并广播结果。
 */
async function refreshTokenWithQueue(): Promise<string> {
  if (isRefreshing) {
    return new Promise(resolve => {
      onRefreshed((token: string) => resolve(token))
    })
  }

  isRefreshing = true
  try {
    const newToken = await refreshAccessToken()
    notifyRefreshed(newToken)
    return newToken
  } finally {
    isRefreshing = false
  }
}

/**
 * Token 刷新失败时的统一清理逻辑。
 */
function handleRefreshFailure(err: any): never {
  const authStore = useAuthStore()
  console.error('Token刷新失败:', err?.response?.data || err?.message)
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
