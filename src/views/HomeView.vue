<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="card">
        <h2>首页</h2>
        <p>你已经登录成功了。</p>

        <div class="actions">
          <button @click="loadUserInfo">获取用户信息</button>
        </div>

        <pre class="result">{{ displayText }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const displayText = ref('点击按钮测试接口')

async function loadUserInfo() {
  try {
    await authStore.fetchUserInfo()
    displayText.value = JSON.stringify(authStore.userInfo, null, 2)
  } catch (error) {
    displayText.value =
      error?.response?.data?.message ||
      error?.message ||
      '获取失败'
  }
}
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

.actions {
  margin: 16px 0;
}

button {
  border: none;
  background: #111827;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
}

.result {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>