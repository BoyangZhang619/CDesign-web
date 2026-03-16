import { defineStore } from 'pinia';
import { loginApi, meApi, logoutApi } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    user: null
  }),
  actions: {
    setAccessToken(token: string) {
      this.accessToken = token;
    },
    clearAuth() {
      this.accessToken = '';
      this.user = null;
    },
    async login(form: any) {
      const res = await loginApi(form);
      this.accessToken = res.data.accessToken;
      this.user = res.data.user;
      return res.data;
    },
    async fetchMe() {
      const res = await meApi();
      this.user = res.data.user;
      return res.data.user;
    },
    async logout() {
      try {
        await logoutApi();
      } finally {
        this.clearAuth();
      }
    }
  }
});