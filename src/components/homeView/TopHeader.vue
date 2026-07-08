<template>
    <header class="top-header">
        <div class="header-content">
            <!-- 手机端菜单按钮和Logo -->
            <div class="mobile-menu-logo">
                <button class="mobile-menu-btn" @click="$emit('toggle-sidebar')" aria-label="打开菜单">
                    <img src="/logo-stuheal.svg" alt="Menu" class="mobile-logo">
                </button>
            </div>

            <div class="header-left">
                <h1 class="greeting">{{ props.title || `Hi, ${currentUser.name}` }}</h1>
                <p class="subtitle">{{ props.subtitle || '既来之则安(da)之(ka)!' }}</p>
            </div>
            <div class="header-right">
                <div @click="toggleAIChat" class="search-btn-wrapper" title="AI 健康助手">
                    <img src="/noun-main-topbar-search.svg" class="search-btn" alt="AI 助手">
                </div>
                <!-- <div class="notification-wrapper">
                    <img src="/noun-main-topbar-bell.svg" class="notification-btn" alt="">
                    <span class="notification-badge">{{ notificationCount }}</span>
                </div> -->
                <div class="user-profile" @click="openProfile">
                    <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.name"
                        class="profile-avatar" />
                    <img v-else :src="`/noun-main-topbar-user.svg`" :alt="currentUser.name" class="profile-avatar" />
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useAIChatStore } from '../../stores/aiChat'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const aiChatStore = useAIChatStore()
const router = useRouter()

const emit = defineEmits<{
    'toggle-sidebar': []
}>()

const props = defineProps<{
    title?: string
    subtitle?: string
}>()

// 从认证 store 获取用户信息
const currentUser = computed(() => ({
    name: authStore.userInfo?.email?.split('@')[0] || 'User',
    avatar: authStore.userInfo?.avatar || null,
    email: authStore.userInfo?.email || 'user@example.com'
}))

const openProfile = () => {
    // 这里可以添加打开用户个人信息的逻辑，例如跳转到个人信息页
    router.push(`/profile`)
}

// 切换 AI 聊天 - 使用全局 Store
function toggleAIChat() {
    console.log('Toggling AI Chat')
    aiChatStore.toggleChat()
}

// 页面挂载时获取用户信息
onMounted(async () => {
    if (authStore.isLoggedIn && !authStore.userInfo) {
        try {
            await authStore.fetchUserInfo()
        } catch (error) {
            console.error('Failed to fetch user info:', error)
        }
    }
})
</script>

<style lang="scss" scoped src="@/scss/components/homeView/TopHeader.scss"></style>
