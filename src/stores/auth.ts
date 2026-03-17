import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '../utils/token'
import { loginApi, registerApi, getUserInfoApi, logoutApi, refreshTokenApi, logoutAllApi } from '../api/modules/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    userInfo: null as any,
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    /**
     * 用户注册
     * 根据API文档，响应结构为: { success, message, data: { message } }
     */
    async register(formData: { email: string; password: string }) {
      try {
        this.loading = true
        const res = await registerApi(formData)
        
        if (!res.data?.success) {
          throw new Error(res.data?.message || '注册失败')
        }

        return res.data
      } finally {
        this.loading = false
      }
    },

    /**
     * 用户登录
     * 根据API文档，响应结构为: { success, message, data: { accessToken, user: { id, email } } }
     * Refresh Token 自动在Cookie中设置
     */
    async login(formData: { email: string; password: string }) {
      try {
        this.loading = true
        const res = await loginApi(formData)

        if (!res.data?.success) {
          throw new Error(res.data?.message || '登录失败')
        }

        const token = res.data?.data?.accessToken

        if (!token) {
          throw new Error('未获取到 accessToken，请检查后端返回结构')
        }

        this.token = token
        this.userInfo = res.data?.data?.user || null
        setToken(token)

        return res.data
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新Token
     * 根据API文档，响应结构为: { success, message, data: { accessToken, user } }
     * 新的Refresh Token 自动在Cookie中设置
     */
    async refreshToken() {
      try {
        const res = await refreshTokenApi()

        if (!res.data?.success) {
          throw new Error(res.data?.message || 'Token刷新失败')
        }

        const token = res.data?.data?.accessToken

        if (!token) {
          throw new Error('未获取到新的 accessToken')
        }

        this.token = token
        this.userInfo = res.data?.data?.user || this.userInfo
        setToken(token)

        return res.data
      } catch (error) {
        // Token 刷新失败，清除本地登录状态
        this.token = ''
        this.userInfo = null
        removeToken()
        throw error
      }
    },

    /**
     * 获取当前用户信息
     * 根据API文档，响应结构为: { success, message, data: { user: { id, email, credits, created_at } } }
     */
    async fetchUserInfo() {
      try {
        const res = await getUserInfoApi()

        if (!res.data?.success) {
          throw new Error(res.data?.message || '获取用户信息失败')
        }

        this.userInfo = res.data?.data?.user || null

        return res.data
      } catch (error) {
        console.error('fetchUserInfo error:', error)
        throw error
      }
    },

    /**
     * 登出当前设备
     * 根据API文档，删除当前设备的Refresh Token
     */
    async logout() {
      try {
        this.loading = true
        await logoutApi()
      } catch (error) {
        console.warn('logout api error:', error)
      } finally {
        this.token = ''
        this.userInfo = null
        removeToken()
        this.loading = false
      }
    },

    /**
     * 全设备登出
     * 根据API文档，撤销所有设备的Refresh Token
     */
    async logoutAll() {
      try {
        this.loading = true
        await logoutAllApi()
      } catch (error) {
        console.warn('logout all api error:', error)
      } finally {
        this.token = ''
        this.userInfo = null
        removeToken()
        this.loading = false
      }
    }
  }
})