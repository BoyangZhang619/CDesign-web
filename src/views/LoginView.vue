<template>
  <div class="login-page">
    <div class="login-card">
      <h1>CDesign - 登录</h1>

      <div class="form-item">
        <label>邮箱</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱地址"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>

      <button class="login-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div class="links">
        <router-link to="/register" class="link">还没有账号？注册</router-link>
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  errorMsg.value = ''

  if (!form.email || !form.password) {
    errorMsg.value = '请输入邮箱和密码'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: form.email,
      password: form.password
    })

    router.push('/')
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.message ||
      error?.message ||
      '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 360px;
  background: #fff;
  padding: 32px 24px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

h1 {
  margin: 0 0 24px;
  text-align: center;
  font-size: 24px;
  color: #111827;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-item input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
}

.login-btn {
  width: 100%;
  padding: 10px;
  border: none;
  background: #111827;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 16px;
}

.login-btn:hover:not(:disabled) {
  background: #1f2937;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-top: 12px;
}

.link {
  color: #0ea5e9;
  text-decoration: none;
  font-size: 12px;
}

.link:hover {
  text-decoration: underline;
}

.error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 12px;
  text-align: center;
  padding: 8px;
  background: #fee2e2;
  border-radius: 4px;
}
</style>
