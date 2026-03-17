<template>
  <div class="register-page">
    <div class="register-card">
      <h1>CDesign - 注册</h1>

      <div class="form-item">
        <label>邮箱</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱地址"
          @keyup.enter="handleRegister"
        />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码（至少6位）"
          @keyup.enter="handleRegister"
        />
      </div>

      <div class="form-item">
        <label>确认密码</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          @keyup.enter="handleRegister"
        />
      </div>

      <button class="register-btn" @click="handleRegister" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <div class="links">
        <router-link to="/login" class="link">已有账号？登录</router-link>
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
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
const successMsg = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

async function handleRegister() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.email || !form.password || !form.confirmPassword) {
    errorMsg.value = '请填写所有字段'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      email: form.email,
      password: form.password
    })

    successMsg.value = '注册成功，请登录'
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.message ||
      error?.message ||
      '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-card {
  width: 360px;
  background: #fff;
  padding: 32px 24px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 24px;
  text-align: center;
  font-size: 24px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.form-item input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-item input:focus {
  outline: none;
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
}

.register-btn {
  width: 100%;
  padding: 10px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 16px;
}

.register-btn:hover:not(:disabled) {
  background: #1f2937;
}

.register-btn:disabled {
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
}

.success {
  color: #16a34a;
  font-size: 12px;
  margin-top: 12px;
  text-align: center;
}
</style>
