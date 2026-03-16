<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="card">
        <h2>个人中心</h2>

        <div v-if="authStore.userInfo">
          <pre>{{ JSON.stringify(authStore.userInfo, null, 2) }}</pre>
        </div>

        <div v-else>
          <p>当前还没有用户信息，请先去首页点击“获取用户信息”。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.content {
  padding: 24px;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
}
</style>