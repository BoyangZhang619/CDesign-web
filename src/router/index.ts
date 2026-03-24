import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import HealthSetupView from '../views/HealthSetupView.vue'
import ProfileDisplayView from '../views/ProfileDisplayView.vue'
import ProfileEditView from '../views/ProfileEditView.vue'
import AIChatView from '../views/AIChatView.vue'
import DailyCheckinDisplayView from '../views/DailyCheckinDisplayView.vue'
import HistoryView from '../views/HistoryView.vue'
import MealCheckinDisplayView from '../views/MealCheckinDisplayView.vue'
import SleepCheckinDisplayView from '../views/SleepCheckinDisplayView.vue'
import ExerciseCheckinDisplayView from '../views/ExerciseCheckinDisplayView.vue'
import PortraitView from '../views/PortraitView.vue'
import RecommendationsView from '../views/RecommendationsView.vue'
import TrendsView from '../views/TrendsView.vue'
import ForecastView from '../views/ForecastView.vue'
import SimulationView from '../views/SimulationView.vue'
import GoalsView from '../views/GoalsView.vue'
import CampusDietView from '../views/CampusDietView.vue'
import NotificationsView from '../views/NotificationsView.vue'

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
    component: ProfileDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 个人中心'
    }
  },
  {
    path: '/profile/edit',
    name: 'profile-edit',
    component: ProfileEditView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 编辑个人信息'
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
    path: '/health/daily-checkin',
    name: 'daily-checkin',
    component: DailyCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康打卡'
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
  },
  {
    path: '/meal/checkin',
    name: 'meal-checkin',
    component: MealCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 饮食打卡'
    }
  },
  {
    path: '/sleep/checkin',
    name: 'sleep-checkin',
    component: SleepCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 睡眠打卡'
    }
  },
  {
    path: '/exercise/checkin',
    name: 'exercise-checkin',
    component: ExerciseCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 运动打卡'
    }
  },
  {
    path: '/analysis/portrait',
    name: 'portrait',
    component: PortraitView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康画像'
    }
  },
  {
    path: '/recommendations',
    name: 'recommendations',
    component: RecommendationsView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 个性化建议'
    }
  },
  {
    path: '/analysis/trends',
    name: 'trends',
    component: TrendsView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康趋势'
    }
  },
  {
    path: '/analysis/forecast',
    name: 'forecast',
    component: ForecastView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康预测'
    }
  },
  {
    path: '/analysis/simulation',
    name: 'simulation',
    component: SimulationView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 健康模拟'
    }
  },
  {
    path: '/goals',
    name: 'goals',
    component: GoalsView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 目标设定'
    }
  },
  {
    path: '/recommendations/campus-diet',
    name: 'campus-diet',
    component: CampusDietView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 校园饮食推荐'
    }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal - 通知中心'
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
