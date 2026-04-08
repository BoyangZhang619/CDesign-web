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
                <h1 class="greeting">Hi, {{ currentUser.name }}</h1>
                <p class="subtitle">既来之则安(da)之(ka)!</p>
            </div>
            <div class="header-right">
                <div @click="toggleAIChat" class="search-btn-wrapper" title="AI 健康助手">
                    <img src="/noun-main-topbar-search.svg" class="search-btn" alt="AI 助手">
                </div>
                <div class="notification-wrapper">
                    <img src="/noun-main-topbar-bell.svg" class="notification-btn" alt="">
                    <span class="notification-badge">{{ notificationCount }}</span>
                </div>
                <div class="user-profile">
                    <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.name" class="profile-avatar" />
                    <img v-else :src="`/noun-main-topbar-user.svg`" :alt="currentUser.name" class="profile-avatar" />
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const emit = defineEmits<{
  'toggle-sidebar': []
  'toggle-ai-chat': []
}>()

// 从认证 store 获取用户信息
const currentUser = computed(() => ({
    name: authStore.userInfo?.email?.split('@')[0] || 'User',
    avatar: authStore.userInfo?.avatar || null,
    email: authStore.userInfo?.email || 'user@example.com'
}))

const notificationCount = ref(3)

// 切换 AI 聊天
function toggleAIChat() {
  emit('toggle-ai-chat')
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

<style scoped>
.top-header {
    background: linear-gradient(135deg, #F5F2ED 0%, #EBE5DF 100%);
    padding: 20px 30px;
    border-bottom: 1px solid #D4C4B0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    gap: 20px;
}

.header-left {
    flex: 1;
}

.greeting {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
}

.subtitle {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-btn,
.notification-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.3s ease, opacity 0.3s ease, filter 0.3s ease;
    width: 52px;
    height: 52px;
    object-fit: contain;
    opacity: 0.8;
    filter: brightness(0) saturate(100%) invert(0);
}

.search-btn:hover,
.notification-btn:hover {
    transition: all 0.3s ease;
    transform: scale(1.05);
}

.notification-wrapper {
    position: relative;
}

.notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #A9787B;
    color: white;
    font-size: 10px;
    font-weight: 600;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-profile {
    margin-left: 10px;
}

.profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    /* background: linear-gradient(135deg, #C9B89C 0%, #A9787B 100%); */
    border: 2px solid #9DB4A0;
    cursor: pointer;
    transition: transform 0.3s ease;
    transform: translateY(0) scale(.9);
    object-fit: cover;
}

.profile-avatar:hover {
    transform: scale(1.05);
}

/* ============================================
   手机端菜单按钮
   ============================================ */

.mobile-menu-logo {
    display: none;
}

.mobile-menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mobile-logo {
    width: 40px;
    height: 40px;
    filter: brightness(0) saturate(100%);
    opacity: 0.7;
}

.mobile-menu-btn:active {
    transform: scale(0.95);
}

/* ============================================
   响应式设计 - 手机端
   ============================================ */

@media (max-width: 768px) {
    .top-header {
        padding: 15px 20px;
    }

    .header-content {
        gap: 10px;
    }

    .mobile-menu-logo {
        display: flex;
        flex-shrink: 0;
    }

    .header-left {
        flex: 1;
        min-width: 0;
    }

    .greeting {
        font-size: 18px;
        margin: 0 0 3px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .subtitle {
        font-size: 12px;
        display: none;
    }

    .header-right {
        gap: 10px;
        flex-shrink: 0;
    }

    .search-btn,
    .notification-btn {
        width: 44px;
        height: 44px;
        padding: 6px;
    }

    .profile-avatar {
        width: 36px;
        height: 36px;
        border: 1.5px solid #9DB4A0;
    }
}

@media (max-width: 480px) {
    .top-header {
        padding: 12px 15px;
    }

    .greeting {
        font-size: 16px;
    }

    .search-btn,
    .notification-btn {
        width: 40px;
        height: 40px;
    }

    .mobile-logo {
        width: 36px;
        height: 36px;
    }

    .profile-avatar {
        width: 32px;
        height: 32px;
    }
}
</style>
