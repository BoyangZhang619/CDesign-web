import axios from 'axios'
import { getToken, removeToken } from '../utils/token.js'

const http = axios.create({
  baseURL: '', // 这里留空，你自己填，比如 '/api'
  timeout: 10000,
  withCredentials: true // 如果你后端要 cookie，这里保留是安全的
})

// 请求拦截器：统一带 token
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

// 响应拦截器：统一处理错误
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    // 401 统一处理
    if (status === 401) {
      removeToken()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default http