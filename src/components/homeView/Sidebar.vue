<template>
    <aside class="sidebar" :class="{ expanded: isExpanded }">
        <!-- Logo -->
        <div class="sidebar-logo" @click="toggleSidebarFromHeader">
            <img src="/logo-stuheal.svg" alt="StuHeal Logo" class="logo-icon">
            <span class="logo-text" v-if="isExpanded == true">StuHeal</span>
        </div>

        <!-- Navigation Items -->
        <nav class="sidebar-nav">
            <div v-for="item in navItems" :key="item.path" class="nav-item"
                :class="{ active: $route.path === item.path }" @click="handleNavClick(item.path)">
                <div class="nav-icon-wrapper" :style="{ '--svg-scale': item.scale }">
                    <img v-if="item.svg" :src="`/${item.svg}`" :alt="item.label" class="nav-svg" />
                    <span v-else class="nav-emoji">{{ item.icon }}</span>
                </div>
                <span class="nav-label">{{ item.label }}</span>
            </div>
        </nav>
        
        <!-- Bottom Actions (Help & Logout) -->
        <div class="sidebar-bottom">
            <div class="nav-item" @click="openModal('help')">
                <div class="nav-icon-wrapper" :style="{ '--svg-scale': 1.1 }">
                    <img src="/noun-sidebar-question.svg" alt="帮助中心" class="nav-svg" />
                </div>
                <span class="nav-label">帮助中心</span>
            </div>
            <div class="nav-item" @click="openModal('logout')">
                <div class="nav-icon-wrapper" :style="{ '--svg-scale': 1.1 }">
                    <img src="/noun-sidebar-logout.svg" alt="退出登录" class="nav-svg" />
                </div>
                <span class="nav-label">退出登录</span>
            </div>
        </div>
    </aside>

    <!-- Overlay for closing sidebar when expanded -->
    <div v-if="isExpanded" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Modal for Help and Logout -->
    <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <!-- Help Modal -->
                <template v-if="modalType === 'help'">
                    <div class="modal-header">
                        <h2>帮助中心</h2>
                        <button class="modal-close" @click="closeModal">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="help-section">
                            <h3>常见问题</h3>
                            <ul>
                                <li><strong>Q: 如何查看健康数据？</strong><br>A: 点击左侧菜单的"健康画像"查看详细数据。</li>
                                <li><strong>Q: 如何进行健康打卡？</strong><br>A: 在"健康打卡"页面录入今日健康数据。</li>
                                <li><strong>Q: 如何与AI助手交流？</strong><br>A: 点击"AI对话"进行健康咨询。</li>
                            </ul>
                        </div>
                        <div class="help-section">
                            <h3>技术支持</h3>
                            <p>如有问题，请联系: boyangzhang246@gmail.com</p>
                            <p>工作时间: 23:59 - 00:00 (周一至周天)</p>
                        </div>
                    </div>
                </template>

                <!-- Logout Modal -->
                <template v-else-if="modalType === 'logout'">
                    <div class="modal-header">
                        <h2>确认退出</h2>
                        <button class="modal-close" @click="closeModal">✕</button>
                    </div>
                    <div class="modal-body">
                        <p class="logout-confirm">您确定要退出登录吗？</p>
                        <p class="logout-tip">退出后，您需要重新登录才能访问您的数据。</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-cancel" @click="closeModal" :disabled="isLoggingOut">取消</button>
                        <button class="btn btn-logout" @click="handleLogout" :disabled="isLoggingOut">
                            {{ isLoggingOut ? '正在退出...' : '确认退出' }}
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isExpanded = ref(false)
const showModal = ref(false)
const modalType = ref<'help' | 'logout' | null>(null)
const isLoggingOut = ref(false)

const navItems = [
    { path: '/home', icon: '🏠', label: '主页', svg: 'noun-sidebar-dashboard.svg', scale: 1 },
    { path: '/todolist', icon: '✓', label: 'TodoList', svg: 'noun-sidebar-todolist.svg', scale: 1.05 },
    { path: '/health/daily-checkin', icon: '✓', label: '健康打卡', svg: 'noun-sidebar-checkin.svg', scale: 1.25 },
    { path: '/health/history', icon: '📋', label: '历史记录', svg: 'noun-sidebar-history.svg', scale: 1.25 },
    { path: '/analysis/portrait', icon: '🎨', label: '健康画像', svg: 'noun-sidebar-portrait.svg', scale: 1.25 },
    { path: '/analysis/trends', icon: '📈', label: '趋势分析', svg: 'noun-sidebar-trend.svg', scale: 1.1 },
    { path: '/ai-chat', icon: '💬', label: 'AI对话', svg: 'noun-sidebar-ai.svg', scale: 1.8 },
    { path: '/profile', icon: '👤', label: '个人信息', svg: 'noun-sidebar-settings.svg', scale: 1 },
]

function handleNavClick(path: string) {
    // 仅当侧栏打开时才跳转
    if (isExpanded.value) {
        isExpanded.value = false // 点击导航项后自动关闭侧栏
        setTimeout(() => {
            router.push(path)
        }, 300) // 等待侧栏关闭动画完成后再跳转
    } else {
        // 如果侧栏关闭，先打开侧栏
        isExpanded.value = true
    }
}

function openModal(type: 'help' | 'logout') {
    isExpanded.value = false // 打开模态框时自动关闭侧栏
    modalType.value = type
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    modalType.value = null
}

function handleLogout() {
    // 调用登出 API
    isLoggingOut.value = true
    authStore.logout()
        .then(() => {
            closeModal()
            // 跳转到登录页面
            router.push('/auth')
        })
        .catch((error) => {
            console.error('Logout failed:', error)
            closeModal()
            isLoggingOut.value = false
        })
}

function closeSidebar() {
    isExpanded.value = false
}

function toggleSidebarFromHeader() {
    isExpanded.value = !isExpanded.value
}

onMounted(() => {
    isExpanded.value = false
})

// 暴露给父组件
defineExpose({
    toggleSidebarFromHeader
})

</script>

<style scoped>
@import '../../css/homeView/sideBar.css';
</style>