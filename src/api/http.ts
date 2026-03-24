import axios from 'axios'
import { getToken, setToken, removeToken } from '../utils/token.js'
import { useAuthStore } from '../stores/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin',
  timeout: 30000, // 根据API文档，请求超时为30秒
  withCredentials: true // 自动发送Cookie中的refreshToken
})

// 标记是否正在刷新Token，避免多个请求同时刷新
let isRefreshing = false
// 等待刷新Token完成的请求队列
let refreshSubscribers: ((token: string) => void)[] = []

/**
 * 订阅Token刷新完成事件
 * @param callback 刷新完成后的回调
 */
function onRefreshed(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者Token已刷新
 * @param token 新的Token
 */
function notifyRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

/**
 * 请求拦截器：统一添加Authorization请求头和error处理
 * 根据API文档，每个请求都需要在Authorization请求头中添加Bearer Token
 */
http.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * 响应拦截器：统一处理错误和Token刷新
 * 
 * 根据API文档：
 * - 401错误：Token无效或过期，尝试用refreshToken刷新
 * - 其他错误：根据状态码和错误信息提示用户
 */
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error?.response?.status
    const authStore = useAuthStore()

    // 处理401 Unauthorized错误
    if (status === 401 && config && !config.__isRetry) {
      // 如果已经在刷新Token，则等待刷新完成后重试
      if (isRefreshing) {
        return new Promise((resolve) => {
          onRefreshed((token) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(http(config))
          })
        })
      }

      // 开始刷新Token
      isRefreshing = true

      try {
        // 调用刷新Token接口
        // 注意：刷新接口不需要传入参数，使用Cookie中的refreshToken
        console.log("api url:", `${import.meta.env.VITE_API_URL}`)
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            timeout: 30000
          }
        )

        if (response.data?.success && response.data?.data?.accessToken) {
          const newToken = response.data.data.accessToken
          authStore.token = newToken
          setToken(newToken)  // ✅ 保存到 localStorage

          // 通知所有等待的请求
          notifyRefreshed(newToken)

          // 使用新Token重试原始请求
          config.headers.Authorization = `Bearer ${newToken}`
          config.__isRetry = true
          return http(config)
        } else {
          throw new Error('Token刷新失败')
        }
      } catch (refreshError: any) {
        // Token刷新失败，清除登录状态
        console.error('Token刷新失败:', refreshError?.response?.data || refreshError?.message)
        authStore.token = ''
        authStore.userInfo = null
        removeToken()
        // 重定向到登录页
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 其他错误处理
    if (status === 403) {
      console.error('没有权限访问此资源')
    }

    if (status === 404) {
      console.error('请求的资源不存在')
    }

    if (status === 500) {
      console.error('服务器错误，请稍后重试')
    }

    return Promise.reject(error)
  }
)

/**
 * 使用 fetch API 发送请求，支持自动 token 刷新
 * @param url 请求 URL
 * @param options fetch 选项
 * @returns 响应对象
 */
export async function fetchWithRefresh(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore()
  
  // 添加 Authorization 请求头
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authStore.token}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })

  // 如果返回 401，尝试刷新 token
  if (response.status === 401) {
    try {
      // 调用刷新 token 接口
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: 30000
        }
      )

      if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
        const newToken = refreshResponse.data.data.accessToken
        authStore.token = newToken
        setToken(newToken)  // ✅ 保存到 localStorage

        // 使用新 token 重试原始请求
        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }

        response = await fetch(url, {
          ...options,
          headers: newHeaders,
          credentials: 'include'
        })
      } else {
        throw new Error('Token 刷新失败')
      }
    } catch (error: any) {
      // token 刷新失败，清除登录状态
      console.error('Token刷新失败:', error?.response?.data || error?.message)
      authStore.token = ''
      authStore.userInfo = null
      removeToken()
      window.location.href = '/auth'
      throw error
    }
  }

  return response
}

export default http