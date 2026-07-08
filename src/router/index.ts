import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'

// 路由懒加载 — 按需加载各页面，减小初始 bundle 体积
const HomeView = () => import('../views/HomeView.vue')
const AuthView = () => import('../views/AuthView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const ProfileEditView = () => import('../views/ProfileEditView.vue')
const AIChatView = () => import('../views/AIChatView.vue')
const DailyCheckinDisplayView = () => import('../views/DailyCheckinDisplayView.vue')
const HistoryView = () => import('../views/HistoryView.vue')
const MealCheckinDisplayView = () => import('../views/MealCheckinDisplayView.vue')
const SleepCheckinDisplayView = () => import('../views/SleepCheckinDisplayView.vue')
const ExerciseCheckinDisplayView = () => import('../views/ExerciseCheckinDisplayView.vue')
const PortraitView = () => import('../views/PortraitView.vue')
const TrendsView = () => import('../views/TrendsView.vue')
const TodolistView = () => import('../views/TodolistView.vue')
const ExploreView = () => import('../views/ExploreView.vue')
const SettingsView = () => import('../views/SettingsView.vue')
const CheckinView = () => import('../views/CheckinView.vue')
const AvatarEditorView = () => import('../views/AvatarEditorView.vue')

// 『』
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
      title: 'StuHeal-青愈「导航中心」'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'StuHeal-青愈「登录/注册」'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「个人中心」'
    }
  },
  {
    path: '/profile/edit',
    name: 'profile-edit',
    component: ProfileEditView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「编辑个人信息」'
    }
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: AIChatView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「AI健康助手」'
    }
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckinView,
    meta: {
      requiresAuth: true,
      title: '打卡'
    }
  },
  {
    path: '/health/daily-checkin',
    redirect: '/checkin',
  },
  {
    path: '/health/daily-checkin-legacy',
    name: 'daily-checkin-legacy',
    component: DailyCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「健康打卡」'
    }
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「历史记录」'
    }
  },
  {
    path: '/meal/checkin',
    name: 'meal-checkin',
    component: MealCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「饮食打卡」'
    }
  },
  {
    path: '/sleep/checkin',
    name: 'sleep-checkin',
    component: SleepCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「睡眠打卡」'
    }
  },
  {
    path: '/exercise/checkin',
    name: 'exercise-checkin',
    component: ExerciseCheckinDisplayView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「运动打卡」'
    }
  },
  {
    path: '/analysis/portrait',
    name: 'portrait',
    component: PortraitView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「健康画像」'
    }
  },
  {
    path: '/analysis/trends',
    name: 'trends',
    component: TrendsView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「健康趋势」'
    }
  },
  {
    path: '/todolist',
    name: 'todolist',
    component: TodolistView,
    meta: {
      requiresAuth: true,
      title: 'StuHeal-青愈「TodoList」'
    }
  },
  {
    path: '/explore',
    name: 'explore',
    component: ExploreView,
    meta: {
      requiresAuth: true,
      title: '探索'
    }
  },
  {
    path: '/avatar-editor',
    name: 'avatar-editor',
    component: AvatarEditorView,
    meta: { requiresAuth: true, title: '编辑头像' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
      title: '设置'
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
