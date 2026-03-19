<template>
  <header class="header">
    <div class="left">
      <router-link to="/" class="logo">StuHeal</router-link>
    </div>

    <div class="right">
      <div class="user-info" v-if="authStore.isLoggedIn">
        <span class="username">{{ authStore.userInfo?.email }}</span>
      </div>
      
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/profile">个人中心</router-link>
      </nav>

      <button @click="handleLogout" :disabled="loading" class="logout-btn">
        {{ loading ? '登出中...' : '登出' }}
      </button>
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
.header {
  height: 60px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  text-decoration: none;
  transition: color 0.3s;
}

.logo:hover {
  color: #0ea5e9;
}

.right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  color: #6b7280;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav a {
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  transition: color 0.3s;
}

.nav a:hover,
.nav a.router-link-active {
  color: #111827;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 14px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover:not(:disabled) {
  background: #1f2937;
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .right {
    gap: 12px;
  }

  .nav {
    gap: 8px;
  }

  .username {
    display: none;
  }

  .logout-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
