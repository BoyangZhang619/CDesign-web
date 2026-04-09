<template>
  <div class="profile-layout">
    <!-- 侧边栏 -->
    <Sidebar ref="sidebarRef" />

    <!-- 主内容区 -->
    <div class="main-content">
      <TopHeader @toggle-sidebar="toggleSidebar" @toggle-ai-chat="toggleAIChat" />

      <div class="content-area">
        <!-- 左侧: 用户基本信息卡片 -->
        <div class="profile-left">
          <!-- 用户卡片 -->
          <div class="user-card">
            <div class="user-avatar-wrapper">
              <img v-if="userInfo?.avatar_url" :src="userInfo.avatar_url" :alt="userInfo.nickname || '用户头像'"
                class="user-avatar" />
              <div v-else class="user-avatar-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
            <h2 class="user-name">{{ userInfo?.nickname || userInfo?.email || '用户' }}</h2>
            <p class="user-email">{{ userInfo?.email }}</p>
            <p v-if="userInfo?.phone" class="user-phone">📱 {{ userInfo.phone }}</p>
          </div>

          <!-- 账户状态卡片 -->
          <div class="stats-card">
            <h3 class="card-title">账户状态</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">状态</span>
                <span :class="['stat-badge', userInfo?.status === 1 ? 'active' : 'inactive']">
                  {{ userInfo?.status === 1 ? '活跃' : '禁用' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">角色</span>
                <span :class="['stat-badge', userInfo?.admin === 1 ? 'admin' : 'user']">
                  {{ userInfo?.admin === 1 ? '管理员' : '用户' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 模型点数卡片 -->
          <div class="credits-card">
            <div class="credits-icon">💎</div>
            <div class="credits-content">
              <p class="credits-label">模型点数</p>
              <p class="credits-value">{{ userInfo?.credits || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- 右侧: 用户详细信息 -->
        <div class="profile-right">
          <!-- 基本信息区 -->
          <section class="info-section">
            <div class="section-header">
              <h3 class="section-title">基本信息</h3>
              <button class="edit-btn" @click="navigateToEdit">
                ✏️ 编辑
              </button>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">邮箱</span>
                <span class="info-value">{{ userInfo?.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">昵称</span>
                <span class="info-value">{{ userInfo?.nickname || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电话</span>
                <span class="info-value">{{ userInfo?.phone || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">角色</span>
                <span class="info-value">{{ userInfo?.role }}</span>
              </div>
            </div>
          </section>

          <!-- 时间信息区 -->
          <section class="info-section">
            <h3 class="section-title">时间信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">创建于</span>
                <span class="info-value">{{ formatDate(userInfo?.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后修改</span>
                <span class="info-value">{{ formatDate(userInfo?.updated_at) }}</span>
              </div>
              <div v-if="userInfo?.last_login_time" class="info-item">
                <span class="info-label">最后登录</span>
                <span class="info-value">{{ formatDate(userInfo.last_login_time) }}</span>
              </div>
            </div>
          </section>

          <!-- 健康档案信息区 -->
          <section class="info-section">
            <h3 class="section-title">健康档案</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">设置状态</span>
                <span :class="['info-value', 'status-' + (healthProfile?.is_completed ? 'complete' : 'incomplete')]">
                  {{ healthProfile?.is_completed ? '✓ 已完成' : '⊘ 未设置' }}
                </span>
              </div>
              <div v-if="healthProfile?.setup_date" class="info-item">
                <span class="info-label">设置于</span>
                <span class="info-value">{{ formatDate(healthProfile.setup_date) }}</span>
              </div>
            </div>
          </section>

          <!-- 操作按钮区 -->
          <div class="action-buttons">
            <button class="btn btn-primary" @click="navigateToEdit">
              编辑个人资料
            </button>
            <button class="btn btn-secondary" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- AI 聊天浮窗 -->
  <AIChatFloatingWindow :isOpen="isAIChatOpen" @close="closeAIChat" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useUserProfile } from '../composables/useUserProfile'
import AIChatFloatingWindow from '../components/AIChatFloatingWindow.vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, loadUserInfo } = useUserProfile()
const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const healthProfile = ref<any>(null)

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const navigateToEdit = () => {
  router.push('/profile/edit')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/auth')
  }
}
const isAIChatOpen = ref(false)

// 切换 AI 聊天浮窗
const toggleAIChat = () => {
  isAIChatOpen.value = !isAIChatOpen.value
  if (!isAIChatOpen.value) {
    closeAIChat()
  }
}

// 关闭 AI 聊天浮窗
const closeAIChat = () => {
  isAIChatOpen.value = false
}

onMounted(async () => {
  await loadUserInfo()
  // 这里可以加载健康档案信息
})
</script>

<style scoped>
@import '@/css/ProfileView.css';
</style>
