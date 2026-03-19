<template>
  <div class="auth-page">
    <!-- 左侧品牌区 -->
    <div class="auth-brand">
      <div class="brand-content">
        <h1 class="brand-title">CDesign</h1>
        <p class="brand-subtitle">个性化健康智能平台</p>
        <p class="brand-description">
          精准的健康数据分析，专业的个性化建议，让您的健康之路更清晰
        </p>
      </div>
    </div>

    <!-- 右侧认证表单 -->
    <div class="auth-form-container">
      <div class="auth-form-wrapper">
        <div class="form-header">
          <h2 class="form-title">{{ isLoginMode ? '登录账户' : '创建账户' }}</h2>
          <p class="form-subtitle">
            {{ isLoginMode ? '使用邮箱和密码登录' : '填写信息完成注册' }}
          </p>
        </div>

        <!-- 登录表单 -->
        <template v-if="isLoginMode">
          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="login-email" class="form-label">邮箱地址</label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
                @keyup.enter="handleLogin"
              />
            </div>

            <div class="form-group">
              <label for="login-password" class="form-label">密码</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                class="form-input"
                placeholder="请输入密码"
                @keyup.enter="handleLogin"
              />
            </div>

            <button type="submit" class="form-button" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>

            <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

            <div class="form-divider">
              <span>没有账户？</span>
            </div>

            <button
              type="button"
              class="form-toggle-btn"
              @click="toggleMode"
            >
              创建新账户
            </button>
          </form>
        </template>

        <!-- 注册表单 -->
        <template v-else>
          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="register-email" class="form-label">邮箱地址</label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
              />
            </div>

            <div class="form-group">
              <label for="register-password" class="form-label">密码</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                class="form-input"
                placeholder="至少6位密码"
              />
            </div>

            <div class="form-group">
              <label for="confirm-password" class="form-label">确认密码</label>
              <input
                id="confirm-password"
                v-model="registerForm.confirmPassword"
                type="password"
                class="form-input"
                placeholder="再次输入密码"
                @keyup.enter="handleRegister"
              />
            </div>

            <button type="submit" class="form-button" :disabled="loading">
              {{ loading ? '注册中...' : '创建账户' }}
            </button>

            <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
            <p v-if="successMsg" class="form-success">{{ successMsg }}</p>

            <div class="form-divider">
              <span>已有账户？</span>
            </div>

            <button
              type="button"
              class="form-toggle-btn"
              @click="toggleMode"
            >
              返回登录
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  errorMsg.value = ''
  successMsg.value = ''
  loginForm.email = ''
  loginForm.password = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

async function handleLogin() {
  errorMsg.value = ''

  if (!loginForm.email || !loginForm.password) {
    errorMsg.value = '请输入邮箱和密码'
    return
  }

  if (loginForm.password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    })

    // 检查是否需要填写健康信息
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      router.push('/health-setup')
    } else {
      router.push('/home')
    }
  } catch (error: any) {
    errorMsg.value =
      error?.response?.data?.message ||
      error?.message ||
      '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    errorMsg.value = '请填写所有字段'
    return
  }

  if (registerForm.password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      email: registerForm.email,
      password: registerForm.password
    })

    successMsg.value = '注册成功，请登录'

    setTimeout(() => {
      toggleMode()
      loginForm.email = registerForm.email
    }, 1500)
  } catch (error: any) {
    errorMsg.value = error?.response?.data?.message || error?.message || '注册失败'
  } finally {
    loading.value = false
  }
}

/**
 * 检查用户是否需要填写健康信息
 * TODO: 后端返回检查结果
 */
async function checkHealthInfoNeeded(): Promise<boolean> {
  // 暂时留空，等后端 API
  return false
}
</script>

<style scoped lang="css">
/* =============== 布局与基础结构 =============== */
.auth-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: #fafaf8;
}

.auth-brand {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  overflow: hidden;
  position: relative;
}

.auth-brand::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.02) 10px,
    rgba(255, 255, 255, 0.02) 20px
  );
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #f5f5f5;
  max-width: 480px;
}

.brand-title {
  margin: 0;
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 16px;
  color: #fffaf0;
}

.brand-subtitle {
  margin: 0;
  font-size: 20px;
  font-weight: 400;
  color: #d4af9c;
  margin-bottom: 32px;
  letter-spacing: 1px;
}

.brand-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #b0a09a;
  font-weight: 300;
}

/* =============== 认证表单容器 =============== */
.auth-form-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 60px;
  background: #fafaf8;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 420px;
}

/* =============== 表单标题与副标题 =============== */
.form-header {
  margin-bottom: 40px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 28px;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.form-subtitle {
  margin: 0;
  font-size: 13px;
  color: #8a8a85;
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* =============== 表单元素 =============== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #3a3a38;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.form-input {
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #e0dcd8;
  background: #ffffff;
  color: #2c2c2c;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  letter-spacing: 0.3px;
}

.form-input:focus {
  outline: none;
  border-color: #8a8a85;
  background: #fdfdfb;
  box-shadow: inset 0 0 0 1px #e8e6e2, 0 0 0 3px rgba(138, 138, 133, 0.08);
}

.form-input::placeholder {
  color: #a8a8a3;
}

/* =============== 按钮 =============== */
.form-button {
  padding: 13px 24px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: #2c2c2c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
}

.form-button:hover:not(:disabled) {
  background: #3a3a38;
  box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
  transform: translateY(-1px);
}

.form-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-toggle-btn {
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 400;
  color: #8a8a85;
  background: transparent;
  border: 1px solid #e0dcd8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.4px;
}

.form-toggle-btn:hover {
  border-color: #8a8a85;
  background: rgba(138, 138, 133, 0.04);
  color: #3a3a38;
}

/* =============== 提示信息 =============== */
.form-error,
.form-success {
  margin: 0;
  padding: 12px 16px;
  font-size: 13px;
  border-radius: 4px;
  text-align: center;
  letter-spacing: 0.3px;
}

.form-error {
  color: #7a3c3c;
  background: #f5e6e6;
  border: 1px solid #e8d4d4;
}

.form-success {
  color: #3a5a4a;
  background: #e6f0eb;
  border: 1px solid #d4e8e0;
}

/* =============== 分割线 =============== */
.form-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 0 20px;
  font-size: 12px;
  color: #a8a8a3;
  letter-spacing: 0.3px;
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0dcd8;
}

/* =============== 响应式设计 =============== */
@media (max-width: 1024px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    min-height: 280px;
    padding: 40px 20px;
  }

  .brand-title {
    font-size: 36px;
  }

  .brand-subtitle {
    font-size: 16px;
  }

  .auth-form-container {
    padding: 40px 20px;
  }
}

@media (max-width: 640px) {
  .auth-brand {
    min-height: 240px;
  }

  .brand-title {
    font-size: 28px;
  }

  .brand-subtitle {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .brand-description {
    font-size: 12px;
  }

  .auth-form-wrapper {
    max-width: 100%;
  }

  .form-title {
    font-size: 22px;
  }
}
</style>
