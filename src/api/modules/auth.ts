import http from '../http'

/**
 * 用户注册
 * 请求体: { username: string, password: string }
 * 返回: { success, message, data: { message } }
 */
export function registerApi(data: { username: string; password: string }) {
  return http.post('/api/auth/register', data)
}

/**
 * 用户登录
 * 请求体: { username: string, password: string }
 * 返回: { success, message, data: { accessToken, user: { id, username } } }
 * 同时在Cookie中设置refreshToken
 */
export function loginApi(data: { username: string; password: string }) {
  return http.post('/api/auth/login', data)
}

/**
 * 刷新Token
 * 请求: 无需请求体，使用Cookie中的refreshToken
 * 返回: { success, message, data: { accessToken, user: { id, email, credits } } }
 * 同时在Cookie中设置新的refreshToken
 */
export function refreshTokenApi() {
  return http.post('/api/auth/refresh')
}

/**
 * 获取当前用户信息
 * 需要Bearer Token认证
 * 返回: { success, message, data: { user: { id, email, credits, created_at } } }
 */
export function getUserInfoApi() {
  return http.get('/api/auth/me')
}

/**
 * 单设备登出
 * 请求: 无需请求体，使用Cookie中的refreshToken
 * 返回: { success, message, data: { message } }
 * 删除当前设备的refreshToken
 */
export function logoutApi() {
  return http.post('/api/auth/logout')
}

/**
 * 全设备登出
 * 需要Bearer Token认证
 * 返回: { success, message, data: { message } }
 * 撤销所有设备的refreshToken
 */
export function logoutAllApi() {
  return http.post('/api/auth/logout-all')
}