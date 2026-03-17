/**
 * Token管理工具
 * 
 * 存储策略说明（根据API文档）：
 * - accessToken: 存储在localStorage（便于页面刷新后保持登录）
 * - refreshToken: 自动存储在HttpOnly Cookie中（浏览器JavaScript无法访问，更安全）
 * 
 * 认证流程：
 * 1. 用户登录 → 获得accessToken
 * 2. 每个API请求自动在Authorization请求头中添加Bearer Token
 * 3. 如果accessToken过期，自动使用refreshToken调用/api/auth/refresh
 * 4. 获得新的accessToken和refreshToken
 * 5. 继续请求
 */

const TOKEN_KEY = 'cdesign_access_token'

/**
 * 获取本地存储的accessToken
 * @returns {string} accessToken，如果不存在则返回空字符串
 */
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 设置accessToken到localStorage
 * @param {string} token - 要存储的accessToken
 */
export function setToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * 从localStorage删除accessToken
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 检查是否已登录（即是否存在有效的accessToken）
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken()
}