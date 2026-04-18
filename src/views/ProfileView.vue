<template>
  <div class="profile-layout">
    <!-- 侧边栏 -->
    <Sidebar ref="sidebarRef" />

    <!-- 主内容区 -->
    <div class="main-content">
      <TopHeader @toggle-sidebar="toggleSidebar" @toggle-ai-chat="toggleAIChat" :title="'个人资料'" :subtitle="'查看和编辑您的个人信息'" />

      <div class="content-area">
        <!-- 左侧: 用户基本信息卡片 -->
        <ProfileLeftSidebar :userInfo="userInfo" />

        <!-- 右侧: 用户详细信息 -->
        <ProfileRightContent :userInfo="userInfo" :healthProfile="healthProfile" @edit="navigateToEdit"
          @logout="handleLogout" @setup-health="handleSetupHealth" />
      </div>
    </div>
    <!-- Health Setup Modal -->
    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess" />
  </div>
  <!-- AI 聊天浮窗 -->
  <AIChatFloatingWindow :isOpen="isAIChatOpen" @close="closeAIChat" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import ProfileLeftSidebar from '../components/profileView/ProfileLeftSidebar.vue'
import ProfileRightContent from '../components/profileView/ProfileRightContent.vue'
import { useAuthStore } from '../stores/auth'
import { useUserProfile } from '../composables/useUserProfile'
import AIChatFloatingWindow from '../components/AIChatFloatingWindow.vue'
import { useTrendsView } from '../composables/useTrendsView'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import http from '@/api/http'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, loadUserInfo } = useUserProfile()
const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const healthProfile = ref<any>(null)
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const navigateToEdit = () => {
  router.push('/profile/edit')
}

const handleSetupHealth = () => {
  showHealthSetupModal.value = true
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
  // 加载健康档案状态
  await loadHealthProfileStatus()
  // 加载完整的健康档案数据
  await loadFullHealthProfile()
})

const loadHealthProfileStatus = async () => {
  try {
    const response = await fetch(
      `${http.defaults.baseURL}/health-info/check-health-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        credentials: 'include'
      }
    )

    if (response.ok) {
      const data = await response.json()
      // 根据 API 返回值设置 healthProfile
      // needHealthInfo: true 表示未设置，false 表示已设置
      healthProfile.value = {
        is_completed: !data.data?.needHealthInfo,
        setup_date: data.data?.setup_date || null
      }
    }
  } catch (error) {
    console.error('加载健康档案状态失败:', error)
    healthProfile.value = {
      is_completed: false,
      setup_date: null
    }
  }
}

const loadFullHealthProfile = async () => {
  try {
    const response = await fetch(
      `${http.defaults.baseURL}/health-info/get-health-info`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        credentials: 'include'
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.data?.healthInfo) {
        // 合并健康档案的详细信息
        healthProfile.value = {
          ...healthProfile.value,
          ...data.data.healthInfo
        }
      }
    }
  } catch (error) {
    console.error('加载完整健康档案失败:', error)
  }
}
</script>

<style scoped>
@import '@/css/ProfileView.css';
</style>
