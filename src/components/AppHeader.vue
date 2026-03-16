<template>
  <header class="header">
    <div class="left">
      <router-link to="/">我的网站</router-link>
    </div>

    <div class="right">
      <router-link to="/">首页</router-link>
      <router-link to="/profile">个人中心</router-link>
      <button @click="handleLogout">退出</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
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
}

.left {
  font-size: 18px;
  font-weight: bold;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

button {
  border: none;
  background: #111827;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}
</style>