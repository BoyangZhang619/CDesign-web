<template>
    <!-- 侧栏遮罩层 -->
    <teleport to="body">
        <transition name="sidebar-fade">
            <div v-if="isOpen" class="sidebar-overlay" @click="closeSidebar"></div>
        </transition>
    </teleport>

    <!-- 侧栏导航 -->
    <nav class="sidebar" :class="{ open: isOpen }">
        <div class="sidebar-header">
            <h2>快速导航</h2>
            <button class="sidebar-close" @click="closeSidebar" aria-label="关闭侧栏">
                ✕
            </button>
        </div>

        <div class="sidebar-content">
            <!-- 核心功能区 -->
            <div class="sidebar-section">
                <div class="sidebar-section-label">核心功能</div>
                <router-link v-for="item in navigationItems" :key="item.id" :to="item.path" class="sidebar-link"
                    @click="closeSidebar">
                    <span class="sidebar-link-number">{{ item.id }}</span>
                    <span class="sidebar-link-title">{{ item.title }}</span>
                    <span class="sidebar-link-badge">{{ item.badge }}</span>
                </router-link>
            </div>

            <!-- 用户信息区 -->
            <div v-if="userInfo" class="sidebar-user-info">
                <div class="user-info-avatar">
                    <img
                        v-if="userInfo.avatar && sidebarAvatarLoaded"
                        :src="userInfo.avatar"
                        :alt="userInfo.email"
                        class="user-info-img"
                        @error="handleSidebarAvatarError"
                    />
                    <svg v-else viewBox="0 0 24 24" fill="currentColor" class="user-info-default">
                        <path
                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
                <div class="user-info-text">
                    <p class="user-info-email">{{ userInfo.email }}</p>
                    <p v-if="userInfo.credits" class="user-info-credits">
                        剩余额度: {{ userInfo.credits }}
                    </p>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

// Emits
const emit = defineEmits(['close'])

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 头像加载状态
const sidebarAvatarLoaded = ref(true)
const sidebarAvatarRetry = ref(0)

// 12 个核心功能导航项
const navigationItems = [
    {
        id: '00',
        title: '主页',
        path: '/home',
        badge: '首页'
    },
    {
        id: '01',
        title: '个人基础信息',
        path: '/profile',
        badge: '初始化'
    },
    {
        id: '02',
        title: '健康打卡',
        path: '/health/daily-checkin',
        badge: '数据采集'
    },
    {
        id: '03',
        title: '历史记录',
        path: '/health/history',
        badge: '数据回溯'
    },
    {
        id: '04',
        title: '健康画像',
        path: '/analysis/portrait',
        badge: '模型展示'
    },
    {
        id: '05',
        title: '趋势分析',
        path: '/analysis/trends',
        badge: '演化过程'
    },
    {
        id: '06',
        title: '未来预测',
        path: '/analysis/forecast',
        badge: '预测能力'
    },
    {
        id: '07',
        title: '情景模拟',
        path: '/analysis/simulation',
        badge: '可实验性'
    },
    {
        id: '08',
        title: '个性化建议',
        path: '/recommendations',
        badge: '干预指导'
    },
    {
        id: '09',
        title: '健康目标',
        path: '/goals',
        badge: '目标导向'
    },
    {
        id: '10',
        title: '校园饮食推荐',
        path: '/recommendations/campus-diet',
        badge: '落地方案'
    },
    {
        id: '11',
        title: '消息与提醒',
        path: '/notifications',
        badge: '行为引导'
    },
    {
        id: '12',
        title: 'AI 对话',
        path: '/ai-chat',
        badge: '智能助手'
    }
]

// 处理头像加载失败（Sidebar）
function handleSidebarAvatarError() {
    sidebarAvatarRetry.value++
    if (sidebarAvatarRetry.value < 3) {
        // 重试最多3次，延迟后重新加载
        setTimeout(() => {
            sidebarAvatarLoaded.value = false
            setTimeout(() => {
                sidebarAvatarLoaded.value = true
            }, 100)
        }, 500 * sidebarAvatarRetry.value)
    } else {
        // 3次都失败，显示默认头像
        sidebarAvatarLoaded.value = false
        console.warn(`侧栏头像加载失败已重试${sidebarAvatarRetry.value}次，已放弃`)
    }
}

// 关闭侧栏
function closeSidebar() {
    emit('close')
}
</script>

<style scoped>
  @import "@/css/components/AppSidebar.css";
</style>
