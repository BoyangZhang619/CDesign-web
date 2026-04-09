<template>
  <div class="profile-layout">
    <!-- 侧边栏 -->
    <Sidebar ref="sidebarRef" />

    <!-- 主内容区 -->
    <div class="main-content">
      <TopHeader @toggle-sidebar="toggleSidebar" @toggle-ai-chat="toggleAIChat" />

      <div class="content-area">
        <!-- 左侧: 用户基本信息卡片 -->
        <ProfileLeftSidebar :userInfo="userInfo" />

        <!-- 右侧: 用户详细信息 -->
        <ProfileRightContent
          :userInfo="userInfo"
          :healthProfile="healthProfile"
          @edit="navigateToEdit"
          @logout="handleLogout"
        />
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
import ProfileLeftSidebar from '../components/profileView/ProfileLeftSidebar.vue'
import ProfileRightContent from '../components/profileView/ProfileRightContent.vue'
import { useAuthStore } from '../stores/auth'
import { useUserProfile } from '../composables/useUserProfile'
import AIChatFloatingWindow from '../components/AIChatFloatingWindow.vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, loadUserInfo } = useUserProfile()
const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const healthProfile = ref<any>(null)

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
