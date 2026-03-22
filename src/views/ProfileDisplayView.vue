<template>
  <div class="page">
    <AppHeader />

    <main class="profile-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 数据不存在 -->
      <div v-else-if="!userInfo" class="empty-state">
        <p>暂无用户信息</p>
      </div>

      <!-- 数据展示 -->
      <div v-else class="profile-container">
        <!-- 头部卡片 - 用户头像和基本信息 -->
        <section class="profile-header-card">
          <div class="avatar-wrapper">
            <img v-if="userInfo.avatar_url" :src="userInfo.avatar_url" :alt="userInfo.nickname || '用户头像'"
              class="avatar-image" />
            <div v-else class="avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <div class="header-info">
            <h1 class="user-name">{{ userInfo.nickname || userInfo.email }}</h1>
            <p class="user-email">{{ userInfo.email }}</p>
            <p v-if="userInfo.phone" class="user-phone">{{ userInfo.phone }}</p>
          </div>
        </section>

        <!-- 账户信息卡片 -->
        <section class="profile-section">
          <h2 class="section-title">账户信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">昵称</span>
              <span class="info-value">{{ userInfo.nickname || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">电话</span>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">角色</span>
              <span class="info-value">{{ userInfo.role }}</span>
            </div>
          </div>
        </section>

        <!-- 账户状态卡片 -->
        <section class="profile-section">
          <h2 class="section-title">账户状态</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">账户状态</span>
              <span :class="['status-badge', userInfo.status === 1 ? 'active' : 'inactive']">
                {{ userInfo.status === 1 ? '活跃' : '已禁用' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">账户类型</span>
              <span :class="['status-badge', userInfo.admin === 1 ? 'admin' : 'normal']">
                {{ userInfo.admin === 1 ? '管理员' : '普通用户' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">模型点数</span>
              <span class="status-value-large">{{ userInfo.credits }}</span>
            </div>
          </div>
        </section>

        <!-- 时间信息卡片 -->
        <section class="profile-section">
          <h2 class="section-title">时间信息</h2>
          <div class="time-grid">
            <div class="time-item">
              <span class="time-label">创建时间</span>
              <span class="time-value">{{ formatDate(userInfo.created_at) }}</span>
              <span class="time-detail">{{ formatTime(userInfo.created_at) }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">最后修改</span>
              <span class="time-value">{{ formatDate(userInfo.updated_at) }}</span>
              <span class="time-detail">{{ formatTime(userInfo.updated_at) }}</span>
            </div>
            <div v-if="userInfo.last_login_time" class="time-item">
              <span class="time-label">最后登录</span>
              <span class="time-value">{{ formatDate(userInfo.last_login_time) }}</span>
              <span class="time-detail">{{ formatTime(userInfo.last_login_time) }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 底部操作栏 -->
    <footer v-if="userInfo" class="profile-footer">
      <button @click="goToEdit" class="btn-edit">编辑资料</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '../composables/useUserProfile'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()
const { userInfo, loading, loadUserInfo } = useUserProfile()

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const goToEdit = () => {
  router.push('/profile/edit')
}

onMounted(async () => {
  await loadUserInfo()
})
</script>

<style scoped>
@import '@/css/ProfileDisplayView.css';
</style>
