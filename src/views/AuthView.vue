<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Brand -->
      <div class="auth-brand">
        <img src="/logo-stuheal.svg" alt="StuHeal" class="auth-logo" />
        <h1 class="auth-name">StuHeal</h1>
        <p class="auth-tagline">你的健康，值得记录</p>
      </div>

      <!-- Login Form -->
      <form v-if="isLoginMode" class="auth-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            placeholder="邮箱"
            autocomplete="email"
            class="input"
          />
        </div>
        <div class="input-group">
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            autocomplete="current-password"
            class="input"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>
      </form>

      <!-- Register Form -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="input-group">
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            placeholder="邮箱"
            autocomplete="email"
            class="input"
          />
        </div>
        <div class="input-group">
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            placeholder="密码（至少6位）"
            autocomplete="new-password"
            class="input"
          />
        </div>
        <div class="input-group">
          <input
            id="confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            autocomplete="new-password"
            class="input"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '注册中...' : '创建账户' }}
        </button>
        <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="msg msg-success">{{ successMsg }}</p>
      </form>

      <!-- Divider -->
      <div class="auth-divider">
        <span class="auth-divider__line"></span>
        <span class="auth-divider__text">或</span>
        <span class="auth-divider__line"></span>
      </div>

      <!-- Toggle -->
      <p class="auth-toggle">
        {{ isLoginMode ? '没有账户？' : '已有账户？' }}
        <button type="button" class="auth-toggle__btn" @click="toggleMode">
          {{ isLoginMode ? '注册' : '登录' }}
        </button>
      </p>
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

<style lang="scss" scoped>
// ── Page Layout ─────────────────────────────────────────────
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: var(--space-4);
  background: var(--color-bg-secondary);
}

// ── Card ────────────────────────────────────────────────────
.auth-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10) var(--space-8) var(--space-8);
  text-align: center;
}

// ── Brand ────────────────────────────────────────────────────
.auth-brand {
  margin-bottom: var(--space-8);
}

.auth-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-3);
}

.auth-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.auth-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

// ── Form ────────────────────────────────────────────────────
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.input-group {
  text-align: left;
}

.input {
  width: 100%;
  padding: var(--space-3) var(--space-2);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-fast);

  &::placeholder {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
  }

  &:focus {
    border-color: var(--color-accent);
    background: var(--color-bg);
  }
}

// ── Buttons ──────────────────────────────────────────────────
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-accent);
  color: #FFFFFF;
  border: none;

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ── Messages ─────────────────────────────────────────────────
.msg {
  font-size: var(--font-size-sm);
  padding: var(--space-2) 0;
}

.msg-error {
  color: var(--color-danger);
}

.msg-success {
  color: var(--color-success);
}

// ── Divider ──────────────────────────────────────────────────
.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-6) 0;
}

.auth-divider__line {
  flex: 1;
  height: 1px;
  background: var(--color-separator);
}

.auth-divider__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

// ── Toggle ───────────────────────────────────────────────────
.auth-toggle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  &__btn {
    color: var(--color-accent);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    padding: 0;
    border: none;
    background: none;

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}
</style>
