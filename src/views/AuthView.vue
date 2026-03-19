<template>
  <div class="auth-page">
    <!-- 左侧品牌区 -->
    <div class="auth-brand">
      <!-- 装饰元素 -->
      <div class="brand-decorations">
        <div class="decoration decoration-1"></div>
        <div class="decoration decoration-2"></div>
        <div class="decoration decoration-3"></div>
        <div class="decoration decoration-4"></div>
        <div class="decoration decoration-5"></div>
        <div class="decoration decoration-6"></div>
        <div class="decoration decoration-7"></div>
      </div>

      <div class="brand-content">
        <h1 class="brand-title">StuHeal</h1>
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
import { useAuthForm } from '../composables/useAuthForm'

const {
  isLoginMode,
  loading,
  errorMsg,
  successMsg,
  loginForm,
  registerForm,
  toggleMode,
  handleLogin,
  handleRegister
} = useAuthForm()
</script>

<style src="../css/AuthView.css"></style>
