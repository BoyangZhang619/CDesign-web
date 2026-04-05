<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 左侧：菜单按钮 + Logo -->
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar" title="打开菜单">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
        <button class="logo" @click="goToHome" title="返回首页">
          <span class="logo-text">StuHeal</span>
        </button>
      </div>

      <!-- 中间：搜索栏 -->
      <div class="header-center">
        <div class="search-wrapper">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="搜索或与 AI 聊天..."
            @focus="showAIChatWindow = true"
            readonly
          />
        </div>
      </div>

      <!-- 右侧：用户头像 + 菜单 -->
      <div class="header-right">
        <button
          class="user-avatar-btn"
          @click="goToProfile"
          :title="`前往个人信息 (${authStore.userInfo?.email || '用户'})`"
          aria-label="用户头像"
        >
          <img
            v-if="authStore.userInfo?.avatar && headerAvatarLoaded"
            :src="authStore.userInfo.avatar"
            :alt="authStore.userInfo.email"
            class="user-avatar-img"
            @error="handleHeaderAvatarError"
          />
          <svg
            v-else
            class="user-avatar-default"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </button>

        <button
          class="more-menu-btn"
          @click="toggleMoreMenu"
          title="更多选项"
          aria-label="更多选项"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        <!-- 下拉菜单 -->
        <div v-if="moreMenuOpen" class="more-menu">
          <button @click="handleLogout" :disabled="loading" class="menu-item logout-item">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
              />
            </svg>
            {{ loading ? '登出中...' : '登出' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 侧栏组件 -->
    <AppSidebar :isOpen="sidebarOpen" @close="closeSidebar" />

    <!-- AI Chat 浮窗 -->
    <AIChatFloatingWindow :isOpen="showAIChatWindow" @close="showAIChatWindow = false" />
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppSidebar from './AppSidebar.vue'
import AIChatFloatingWindow from './AIChatFloatingWindow.vue'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const moreMenuOpen = ref(false)
const loading = ref(false)
const headerAvatarLoaded = ref(true)
const headerAvatarRetry = ref(0)
const showAIChatWindow = ref(false)

// 切换侧栏
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  moreMenuOpen.value = false
}

// 关闭侧栏
function closeSidebar() {
  sidebarOpen.value = false
}

// 切换更多菜单
function toggleMoreMenu() {
  moreMenuOpen.value = !moreMenuOpen.value
}

// 关闭菜单
function closeMenus() {
  moreMenuOpen.value = false
}

// 处理头像加载失败（Header）
function handleHeaderAvatarError() {
  headerAvatarRetry.value++
  if (headerAvatarRetry.value < 3) {
    // 重试最多3次，延迟后重新加载
    setTimeout(() => {
      headerAvatarLoaded.value = false
      setTimeout(() => {
        headerAvatarLoaded.value = true
      }, 100)
    }, 500 * headerAvatarRetry.value)
  } else {
    // 3次都失败，显示默认头像
    headerAvatarLoaded.value = false
    console.warn(`头像加载失败已重试${headerAvatarRetry.value}次，已放弃`)
  }
}

// 跳转到首页
function goToHome() {
  closeSidebar()
  closeMenus()
  router.push('/')
}

// 跳转到个人资料
function goToProfile() {
  closeSidebar()
  closeMenus()
  router.push('/profile')
}

// 登出
async function handleLogout() {
  if (!confirm('确定要登出吗？')) {
    return
  }

  loading.value = true
  try {
    await authStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('登出失败:', error)
  } finally {
    loading.value = false
  }
}

// 点击页面其他地方关闭菜单
function handleClickOutside(e) {
  const header = document.querySelector('.app-header')
  if (header && !header.contains(e.target)) {
    closeMenus()
  }
}

// 初始化
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
  @import "@/css/components/AppHeader.css";
</style>

