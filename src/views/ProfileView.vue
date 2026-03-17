<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="card">
        <h2>个人中心</h2>

        <div v-if="authStore.userInfo" class="profile-info">
          <div class="info-item">
            <label>用户ID:</label>
            <span>{{ authStore.userInfo.id }}</span>
          </div>

          <div class="info-item">
            <label>邮箱:</label>
            <span>{{ authStore.userInfo.email || '未设置' }}</span>
          </div>

          <div class="info-item">
            <label>额度:</label>
            <span class="credits">{{ authStore.userInfo.credits || 0 }}</span>
          </div>

          <div class="info-item">
            <label>创建时间:</label>
            <span>{{ formatDate(authStore.userInfo.created_at) }}</span>
          </div>

          <div class="actions">
            <button @click="handleRefresh" :disabled="loading">
              {{ loading ? '刷新中...' : '刷新信息' }}
            </button>
            <button @click="handleLogoutAll" class="danger" :disabled="loading">
              全设备登出
            </button>
          </div>

          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
          <p v-if="successMsg" class="success">{{ successMsg }}</p>
        </div>

        <div v-else>
          <p>当前还没有用户信息</p>
          <button @click="loadUserInfo">获取用户信息</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { logoutAllApi } from '../api/modules/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function formatDate(dateStr) {
  if (!dateStr) return '未知'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadUserInfo() {
  try {
    errorMsg.value = ''
    await authStore.fetchUserInfo()
  } catch (error) {
    errorMsg.value = error?.response?.data?.message || error?.message || '获取失败'
  }
}

async function handleRefresh() {
  try {
    errorMsg.value = ''
    successMsg.value = ''
    loading.value = true
    await authStore.fetchUserInfo()
    successMsg.value = '信息已更新'
  } catch (error) {
    errorMsg.value = error?.response?.data?.message || error?.message || '更新失败'
  } finally {
    loading.value = false
  }
}

async function handleLogoutAll() {
  if (!confirm('确定要在所有设备上登出吗？')) {
    return
  }

  try {
    errorMsg.value = ''
    loading.value = true
    
    await logoutAllApi()
    
    successMsg.value = '已在所有设备上登出'
    authStore.token = ''
    authStore.userInfo = null
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMsg.value = error?.response?.data?.message || error?.message || '登出失败'
  } finally {
    loading.value = false
  }
}

// 初始化
loadUserInfo()
</script>

<style scoped>
.content {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

h2 {
  margin: 0 0 24px;
  font-size: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #111827;
}

.info-item label {
  font-weight: 500;
  color: #6b7280;
}

.info-item span {
  color: #111827;
  word-break: break-all;
}

.credits {
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  color: #92400e;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  padding: 10px 16px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #1f2937;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.danger {
  background: #dc2626;
}

button.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.error {
  color: #dc2626;
  font-size: 14px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fee2e2;
  border-radius: 6px;
}

.success {
  color: #16a34a;
  font-size: 14px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #dcfce7;
  border-radius: 6px;
}
</style>
