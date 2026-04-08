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
import { useAuthStore } from '../stores/auth'

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
        router.push(path)
    } else {
        // 如果侧栏关闭，先打开侧栏
        isExpanded.value = true
    }
}

function openModal(type: 'help' | 'logout') {
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
        })
        .finally(() => {
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
.sidebar {
    /* 桌面端：相对定位 */
    position: relative;
    left: 0;
    top: 0;
    width: 75px;
    height: calc(100vh - 9px);
    background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

.sidebar.expanded {
    width: 250px;
}

.sidebar-logo {
    margin-bottom: 40px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
    width: 50px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    cursor: pointer;
}

.sidebar.expanded .sidebar-logo {
    width: 200px;
}

.logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    flex-shrink: 0;
    filter: brightness(0) saturate(100%) invert(1);
}

.logo-text {
    font-size: 24px;
    font-weight: thin;
    color: white;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
    display: none;
}

.sidebar.expanded .logo-text {
    display: block;
    opacity: 1;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
    flex: 1;
    padding: 0 10px;
}

.sidebar-bottom {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    align-items: center;
    padding: 20px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    padding: 12px 15px;
    border-radius: 12px;
    cursor: pointer;
    width: 50px;
    position: relative;
    user-select: none;
}

.sidebar.expanded .nav-item {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    gap: 15px;
}

.nav-item:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
    color: #C9B89C;
    background: rgba(201, 184, 156, 0.15);
}

.sidebar.expanded .nav-item.active {
    background: rgba(255, 255, 255, 0.1);
}

.nav-icon-wrapper {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    --svg-scale: 1;
}

.nav-emoji {
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.8;
    transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
    filter: brightness(0) saturate(100%) invert(1);
    transform: scale(var(--svg-scale));
}

.nav-label {
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    white-space: nowrap;
    max-width: 0;
    opacity: 0;
    transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
    overflow: hidden;
    display: none;
}

.sidebar.expanded .nav-label {
    display: inline-block;
    max-width: 150px;
    opacity: 1;
}

/* Sidebar Overlay */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* background: rgba(0, 0, 0, 0.4); */
    z-index: 999;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: #f0f0f0;
    color: #2c3e50;
}

.modal-body {
    padding: 24px;
}

.help-section {
    margin-bottom: 24px;
}

.help-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 12px 0;
}

.help-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.help-section li {
    margin-bottom: 12px;
    font-size: 14px;
    color: #555;
    line-height: 1.6;
}

.help-section p {
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    margin: 8px 0;
}

.logout-confirm {
    font-size: 16px;
    color: #2c3e50;
    font-weight: 600;
    margin: 0 0 12px 0;
}

.logout-tip {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
}

.modal-footer {
    display: flex;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid #f0f0f0;
}

.btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-cancel {
    background: #f0f0f0;
    color: #2c3e50;
}

.btn-cancel:hover:not(:disabled) {
    background: #e0e0e0;
}

.btn-logout {
    background: linear-gradient(135deg, #A9787B 0%, #8E6A6E 100%);
    color: white;
}

.btn-logout:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
    transform: translateY(30px);
}

/* ============================================
   响应式设计 - 手机端
   ============================================ */

@media (max-width: 768px) {
    .sidebar {
        /* 手机端：固定定位 */
        position: fixed;
        left: 0;
        top: 0;
        width: 75px;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar.expanded {
        transform: translateX(0);
        width: 250px;
    }

    .sidebar-logo {
        margin-bottom: 30px;
    }

    .sidebar-nav {
        gap: 15px;
    }

    .sidebar-bottom {
        padding: 15px 10px;
        gap: 12px;
    }

    .nav-item {
        padding: 10px 12px;
    }

    .nav-emoji {
        font-size: 18px;
    }
}
</style>