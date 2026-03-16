import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '../utils/token'
import { loginApi, getUserInfoApi, logoutApi } from '../api/modules/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(formData:any) {
      const res = await loginApi(formData)

      /**
       * 这里你根据自己后端返回结构改
       * 比如：
       * const token = res.data.data.token
       */
      const token = res.data?.token || res.data?.data?.token || ''

      if (!token) {
        throw new Error('未获取到 token，请检查后端返回结构')
      }

      this.token = token
      setToken(token)

      return res
    },

    async fetchUserInfo() {
      const res = await getUserInfoApi()

      /**
       * 这里你根据自己后端返回结构改
       */
      this.userInfo = res.data?.user || res.data?.data || null

      return res
    },

    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.warn('logout api error:', error)
      } finally {
        this.token = ''
        this.userInfo = null
        removeToken()
      }
    }
  }
})