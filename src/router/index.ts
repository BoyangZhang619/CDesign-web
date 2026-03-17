import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'CDesign - AI对话'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'CDesign - 登录'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'CDesign - 注册'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'CDesign - 个人中心'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫
 * 1. 检查认证状态
 * 2. 如果需要认证但未登录，重定向到登录页
 * 3. 如果已登录且访问登录/注册页，重定向到首页
 * 4. 尝试刷新用户信息（如果已登录）
 */
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }

  // 如果已登录且访问登录/注册页，重定向到首页
  if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
    return '/'
  }

  // 如果已登录，尝试获取最新的用户信息（仅在首次访问或从登录/注册页进来时）
  if (authStore.isLoggedIn && (from.path === '/login' || from.path === '/register' || from.path === '')) {
    try {
      await authStore.fetchUserInfo()
    } catch (error) {
      console.warn('获取用户信息失败:', error)
      // 即使获取失败也继续导航，避免影响用户体验
    }
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router