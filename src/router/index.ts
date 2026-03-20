import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import HealthSetupView from '../views/HealthSetupView.vue'
import ProfileView from '../views/ProfileView.vue'
import AIChatView from '../views/AIChatView.vue'
import DailyCheckinDisplayView from '../views/DailyCheckinDisplayView.vue'
import DailyCheckinEditView from '../views/DailyCheckinEditView.vue'
import HistoryView from '../views/HistoryView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      return authStore.isLoggedIn ? '/home' : '/auth'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 导航中心'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'StuHeal - 登录/注册'
    }
  },
  {
    path: '/health-setup',
    name: 'health-setup',
    component: HealthSetupView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康档案设置'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 个人中心'
    }
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: AIChatView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - AI健康助手'
    }
  },
  {
    path: '/profile/basic-info',
    name: 'basic-info',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 个人基础信息'
    }
  },
  {
    path: '/health/daily-checkin',
    name: 'daily-checkin',
    component: DailyCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康打卡'
    }
  },
  {
    path: '/health/daily-checkin-edit',
    name: 'daily-checkin-edit',
    component: DailyCheckinEditView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 编辑打卡'
    }
  },
  {
    path: '/health/history',
    name: 'history',
    component: HistoryView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 历史记录'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/auth'
  }

  // 如果已登录且访问认证页，重定向到首页
  if (to.path === '/auth' && authStore.isLoggedIn) {
    return '/'
  }

  // 如果已登录，尝试获取最新的用户信息（仅在首次访问或从认证页进来时）
  if (authStore.isLoggedIn && (from.path === '/auth' || from.path === '')) {
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
