<template>
  <div class="login-page">
    <div class="login-card">
      <h1>登录</h1>

      <div class="form-item">
        <label>邮箱/用户名</label>
        <input
          v-model="form.account"
          type="text"
          placeholder="请输入邮箱或用户名"
        />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
        />
      </div>

      <button class="login-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

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
  account: '',
  password: ''
})

async function handleLogin() {
  errorMsg.value = ''

  if (!form.account || !form.password) {
    errorMsg.value = '请输入账号和密码'
    return
  }

  loading.value = true

  try {
    /**
     * 这里的字段名你根据后端改
     * 例如后端要 email/password，就改成 email: form.account
     */
    await authStore.login({
      account: form.account,
      password: form.password
    })

    router.push('/')
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.message ||
      error?.message ||
      '登录失败'
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
}

.login-card {
  width: 360px;
  background: #fff;
  padding: 32px 24px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 24px;
  text-align: center;
}

.form-item {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}

input:focus {
  border-color: #111827;
}

.login-btn {
  width: 100%;
  height: 42px;
  border: none;
  background: #111827;
  color: #fff;
  border-radius: 6px;
  margin-top: 8px;
}

.error {
  margin-top: 12px;
  color: #dc2626;
  font-size: 14px;
}
</style>