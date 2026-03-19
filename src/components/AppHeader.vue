<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <router-link to="/" class="logo">
          <span class="logo-icon">🏥</span>
          <span class="logo-text">StuHeal</span>
        </router-link>
      </div>

      <nav class="header-nav">
        <router-link to="/home" class="nav-link">导航</router-link>
        <router-link to="/ai-chat" class="nav-link">AI助手</router-link>
        <router-link to="/profile/basic-info" class="nav-link">个人资料</router-link>
      </nav>

      <div class="header-right">
        <div class="user-section" v-if="authStore.isLoggedIn && authStore.userInfo">
          <span class="user-email">{{ authStore.userInfo.email }}</span>
          <span class="user-credits" title="剩余额度">
            💎 {{ authStore.userInfo.credits || 0 }}
          </span>
        </div>

        <button @click="handleLogout" :disabled="loading" class="logout-btn">
          {{ loading ? '...' : '登出' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

async function handleLogout() {
  if (!confirm('确定要登出吗？')) {
    return
  }

  loading.value = true
  try {
    await authStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('登出失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* =============== 颜色系统 =============== */
:root {
  --color-bg-primary: #fafaf9;
  --color-card-bg: #ffffff;
  --color-text-primary: #2d2d2a;
  --color-text-secondary: #6f6f6a;
  --color-text-tertiary: #999993;
  --color-border-light: #f0ebe5;
  --color-accent-warm: #d8a88f;
  --color-accent-cool: #8fb3d4;
}

/* =============== 头部布局 =============== */
.app-header {
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* =============== 左侧 - Logo =============== */
.header-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;
}

/* =============== 中间 - 导航 =============== */
.header-nav {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-link:hover {
  color: var(--color-accent-warm);
  background: rgba(216, 168, 143, 0.05);
}

.nav-link.router-link-active {
  color: var(--color-accent-warm);
  background: rgba(216, 168, 143, 0.1);
}

/* =============== 右侧 - 用户信息和操作 =============== */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-left: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
}

.user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-credits {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent-warm);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.logout-btn {
  padding: 8px 16px;
  background: var(--color-accent-warm);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(216, 168, 143, 0.15);
}

.logout-btn:hover:not(:disabled) {
  background: #d09680;
  box-shadow: 0 4px 12px rgba(216, 168, 143, 0.25);
  transform: translateY(-1px);
}

.logout-btn:active:not(:disabled) {
  transform: translateY(0);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =============== 响应式 =============== */
@media (max-width: 1024px) {
  .header-container {
    gap: 16px;
    padding: 0 16px;
  }

  .header-nav {
    gap: 0;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
    height: 56px;
    gap: 8px;
  }

  .logo-text {
    display: none;
  }

  .logo-icon {
    font-size: 20px;
  }

  .header-nav {
    display: none;
  }

  .user-section {
    display: none;
  }

  .logout-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 8px;
  }

  .logout-btn {
    padding: 6px 10px;
  }
}
</style>

