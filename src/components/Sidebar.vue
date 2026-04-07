<template>
    <aside class="sidebar" :class="{ expanded: isExpanded }">
        <!-- Logo -->
        <div class="sidebar-logo">
            <img src="/logo-stuheal.svg" alt="StuHeal Logo" class="logo-icon">
            <span class="logo-text" v-if="isExpanded == true">StuHeal</span>
        </div>

        <!-- Navigation Items -->
        <nav class="sidebar-nav">
            <div v-for="item in navItems" :key="item.path" class="nav-item"
                :class="{ active: $route.path === item.path }" @click="handleNavClick(item.path)">
                <div class="nav-icon-wrapper">
                    <span class="nav-emoji">{{ item.icon }}</span>
                </div>
                <span class="nav-label">{{ item.label }}</span>
            </div>
        </nav>
    </aside>

    <!-- Overlay for closing sidebar when expanded -->
    <div v-if="isExpanded" class="sidebar-overlay" @click="closeSidebar"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isExpanded = ref(false)

const navItems = [
    { path: '/home', icon: '🏠', label: '主页' },
    { path: '/todolist', icon: '✓', label: 'TodoList' },
    { path: '/health/daily-checkin', icon: '✓', label: '健康打卡' },
    { path: '/health/history', icon: '📋', label: '历史记录' },
    { path: '/analysis/portrait', icon: '🎨', label: '健康画像' },
    { path: '/analysis/trends', icon: '📈', label: '趋势分析' },
    { path: '/ai-chat', icon: '💬', label: 'AI对话' },
    { path: '/profile', icon: '👤', label: '个人信息' },
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

function closeSidebar() {
    isExpanded.value = false
}

onMounted(() => {
    isExpanded.value = false
})

</script>

<style scoped>
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 75px;
    height: 100vh;
    background: rgb(14, 14, 14);
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
}

.sidebar.expanded .sidebar-logo {
    width: 200px;
}

.logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    flex-shrink: 0;
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
    color: #f39c12;
    background: rgba(255, 255, 255, 0.05);
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
}

.nav-emoji {
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
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
    left: 100px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
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
</style>
