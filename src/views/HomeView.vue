<template>
  <div class="home-page">
    <AppHeader />

    <!-- 健康档案设置浮窗 -->
    <HealthSetupModal
      :show="showHealthSetupModal"
      :force-complete="true"
      @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess"
    />

    <!-- 主内容区 -->
    <main class="home-main" v-if="!showHealthSetupModal">
      <div class="home-wrapper">
        <!-- 顶部欢迎区 -->
        <section class="welcome-banner">
          <div class="banner-content">
            <div class="greeting">
              <h1 class="greeting-title">{{ greeting }}</h1>
              <p class="greeting-date">{{ currentDate }}</p>
            </div>
            <div class="quote-box">
              <p class="quote-text">"{{ motivationalQuote }}"</p>
            </div>
          </div>
        </section>

        <!-- 快速打卡区 -->
        <section class="checkin-section">
          <h2 class="section-title">今日打卡</h2>
          <div class="checkin-buttons">
            <button
              class="checkin-btn exercise-btn"
              @click="openExerciseCheckin"
              :class="{ completed: exerciseCount > 0 }"
            >
              <div class="btn-icon">🏃</div>
              <div class="btn-label">运动</div>
              <div class="btn-count">{{ exerciseCount }}</div>
              <div class="btn-status" v-if="exerciseCount > 0">✓</div>
            </button>

            <button
              class="checkin-btn meal-btn"
              @click="openMealCheckin"
              :class="{ completed: mealCount > 0 }"
            >
              <div class="btn-icon">🍽️</div>
              <div class="btn-label">饮食</div>
              <div class="btn-count">{{ mealCount }}</div>
              <div class="btn-status" v-if="mealCount > 0">✓</div>
            </button>

            <button
              class="checkin-btn sleep-btn"
              @click="openSleepCheckin"
              :class="{ completed: sleepCount > 0 }"
            >
              <div class="btn-icon">😴</div>
              <div class="btn-label">睡眠</div>
              <div class="btn-count">{{ sleepCount }}</div>
              <div class="btn-status" v-if="sleepCount > 0">✓</div>
            </button>
          </div>
        </section>

        <!-- 健康评分卡片 -->
        <section class="health-score-section">
          <div class="score-card">
            <div class="score-left">
              <div class="score-circle">
                <div class="score-number">{{ scoreNumber }}</div>
                <div class="score-label">分</div>
              </div>
            </div>
            <div class="score-right">
              <h3 class="score-title">您今天的健康评分</h3>
              <p class="score-description">{{ scoreDescription }}</p>
              <div class="score-details">
                <div class="detail-item" v-for="stat in todayStats" :key="stat.label">
                  <span class="detail-icon">{{ stat.icon }}</span>
                  <span class="detail-text">{{ stat.label }}: {{ stat.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 最近打卡记录 -->
        <section class="recent-section" v-if="recentRecords.length > 0">
          <h2 class="section-title">最近打卡</h2>
          <div class="records-container">
            <div class="record-item" v-for="(record, index) in recentRecords" :key="index">
              <div class="record-icon">{{ record.type }}</div>
              <div class="record-content">
                <div class="record-name">{{ record.title }}</div>
                <div class="record-time">{{ record.time }}</div>
              </div>
              <div class="record-value">{{ record.value }}</div>
            </div>
          </div>
        </section>

        <!-- 功能导航 -->
        <section class="nav-section">
          <h2 class="section-title">功能中心</h2>
          <div class="nav-grid">
            <router-link to="/portrait" class="nav-card portrait-card">
              <div class="nav-icon">🎭</div>
              <div class="nav-name">健康画像</div>
              <div class="nav-desc">个人健康分析</div>
            </router-link>

            <router-link to="/history" class="nav-card history-card">
              <div class="nav-icon">📊</div>
              <div class="nav-name">打卡历史</div>
              <div class="nav-desc">查看历史数据</div>
            </router-link>

            <router-link to="/trends" class="nav-card trends-card">
              <div class="nav-icon">📈</div>
              <div class="nav-name">趋势分析</div>
              <div class="nav-desc">健康数据趋势</div>
            </router-link>

            <router-link to="/goals" class="nav-card goals-card">
              <div class="nav-icon">🎯</div>
              <div class="nav-name">健康目标</div>
              <div class="nav-desc">目标管理</div>
            </router-link>

            <router-link to="/ai-chat" class="nav-card chat-card">
              <div class="nav-icon">💬</div>
              <div class="nav-name">AI顾问</div>
              <div class="nav-desc">获取建议</div>
            </router-link>

            <router-link to="/todolist" class="nav-card todo-card">
              <div class="nav-icon">✓</div>
              <div class="nav-name">任务列表</div>
              <div class="nav-desc">任务管理</div>
            </router-link>
          </div>
        </section>

        <!-- 今日提示 -->
        <section class="tips-section">
          <div class="tips-card">
            <h3 class="tips-title">💡 今日提示</h3>
            <ul class="tips-list">
              <li class="tip-item" :class="{ done: exerciseCount > 0 }">
                完成一次<strong>运动打卡</strong>
              </li>
              <li class="tip-item" :class="{ done: mealCount > 0 }">
                记录<strong>三餐</strong>饮食
              </li>
              <li class="tip-item" :class="{ done: sleepCount > 0 }">
                记录<strong>睡眠</strong>时间
              </li>
              <li class="tip-item">
                查看<strong>健康画像</strong>和分析
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useAuthForm } from '../composables/useAuthForm'
import { useExerciseCheckin } from '../composables/useExerciseCheckin'
import { useMealCheckin } from '../composables/useMealCheckin'
import { useSleepCheckin } from '../composables/useSleepCheckin'
import { formatCSTDate, getTimeInCST } from '../utils/homePageUtils'

const router = useRouter()
const { checkHealthInfoNeeded } = useAuthForm()
const exerciseCheckin = useExerciseCheckin()
const mealCheckin = useMealCheckin()
const sleepCheckin = useSleepCheckin()

const showHealthSetupModal = ref(false)
const currentDate = ref(formatCSTDate(getTimeInCST()))
const motivationalQuote = ref('')
const todayStats = ref<any[]>([])
const recentRecords = ref<any[]>([])

// 计数
const exerciseCount = computed(() => exerciseCheckin.records.value.length)
const mealCount = computed(() => mealCheckin.records.value.length)
const sleepCount = computed(() => sleepCheckin.records.value.length)

// 计算健康评分
const scoreNumber = computed(() => {
  let score = 0
  
  // 运动评分
  const exerciseMinutes = exerciseCheckin.records.value.reduce((sum, r) => sum + (r.duration_min || 0), 0)
  const exerciseScore = Math.min((exerciseMinutes / 150) * 25, 25)
  score += exerciseScore

  // 饮食评分
  const mealCount = exerciseCheckin.records.value.length
  const totalCalories = mealCheckin.records.value.reduce((sum, r) => sum + (Number(r.calories) || 0), 0)
  let mealScore = 0
  if (mealCount >= 3) mealScore = 15
  else if (mealCount === 2) mealScore = 10
  
  let nutritionScore = 0
  if (mealCount > 0) {
    const avgCalories = totalCalories / mealCount
    if (avgCalories >= 500 && avgCalories <= 900) nutritionScore = 20
    else if (avgCalories >= 400 && avgCalories <= 1000) nutritionScore = 15
  }
  score += mealScore + nutritionScore

  // 睡眠评分
  const sleepHours = sleepCheckin.records.value.length > 0
    ? parseFloat(String(sleepCheckin.records.value[0].sleep_duration_hours))
    : 0
  let sleepScore = 0
  if (sleepHours >= 7 && sleepHours <= 9) sleepScore = 30
  else if (sleepHours >= 6.5 && sleepHours < 7) sleepScore = 25
  else if (sleepHours > 9 && sleepHours <= 10) sleepScore = 25
  else if (sleepHours > 0) sleepScore = Math.max(0, 30 - Math.abs(sleepHours - 8) * 5)
  score += sleepScore

  // 坚持打卡加分
  const checkinCount = (exerciseCheckin.records.value.length > 0 ? 1 : 0) +
                      (mealCheckin.records.value.length > 0 ? 1 : 0) +
                      (sleepCheckin.records.value.length > 0 ? 1 : 0)
  const checkinScore = checkinCount === 3 ? 10 : checkinCount > 0 ? 5 : 0
  score += checkinScore

  return Math.round(Math.max(0, Math.min(100, score)))
})

// 评分描述
const scoreDescription = computed(() => {
  const score = scoreNumber.value
  if (score >= 90) return '🏆 优秀！健康生活的典范'
  if (score >= 80) return '⭐ 很好！继续保持这个节奏'
  if (score >= 70) return '✨ 良好！再加一把劲'
  if (score >= 60) return '💪 中等！有所改善'
  return '📈 需要改进，开始健康生活吧'
})

// 获取动态问候
const greeting = computed(() => {
  const hour = getTimeInCST().getHours()
  let prefix = ''
  
  if (hour >= 5 && hour < 12) prefix = '早上好'
  else if (hour >= 12 && hour < 18) prefix = '下午好'
  else if (hour >= 18 && hour < 22) prefix = '晚上好'
  else prefix = '晚安'

  // 根据打卡情况添加提醒
  if (exerciseCount.value === 0 && hour >= 9 && hour < 22) {
    return `${prefix} 👋 今天还没运动呢，动起来吧！`
  }
  if (mealCount.value === 0 && hour >= 12 && hour < 22) {
    return `${prefix} 👋 记得记录您的饮食哦`
  }
  if (sleepCount.value === 0 && hour >= 23) {
    return `${prefix} 👋 早点休息，好好睡眠`
  }
  return `${prefix} 👋 欢迎回来`
})

// 生成今日统计
function generateTodayStats() {
  const stats: any[] = []
  
  const exerciseMinutes = exerciseCheckin.records.value.reduce((sum, r) => sum + (r.duration_min || 0), 0)
  stats.push({
    icon: '🏃',
    label: '运动',
    value: exerciseMinutes > 0 ? `${exerciseMinutes}分钟` : '未打卡'
  })

  const totalCalories = mealCheckin.records.value.reduce((sum, r) => sum + (Number(r.calories) || 0), 0)
  stats.push({
    icon: '🍽️',
    label: '饮食',
    value: mealCheckin.records.value.length > 0 ? `${Math.round(totalCalories)}卡` : '未打卡'
  })

  const sleepHours = sleepCheckin.records.value.length > 0
    ? parseFloat(String(sleepCheckin.records.value[0].sleep_duration_hours)).toFixed(1)
    : '未打卡'
  stats.push({
    icon: '😴',
    label: '睡眠',
    value: sleepHours !== '未打卡' ? `${sleepHours}h` : sleepHours
  })

  todayStats.value = stats
}

// 生成最近记录
function generateRecentRecords() {
  const records: any[] = []

  exerciseCheckin.records.value.slice(0, 2).forEach(r => {
    records.push({
      type: '🏃',
      title: r.activity_type || '运动',
      time: new Date(r.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: `${r.duration_min || 0}min`
    })
  })

  mealCheckin.records.value.slice(0, 2).forEach(r => {
    records.push({
      type: '🍽️',
      title: r.food_name || '饮食',
      time: new Date(r.meal_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: `${Math.round(Number(r.calories) || 0)}cal`
    })
  })

  sleepCheckin.records.value.slice(0, 2).forEach(r => {
    records.push({
      type: '😴',
      title: r.is_nap === 0 ? '夜间睡眠' : '午睡',
      time: new Date(r.sleep_start_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: `${Number(r.sleep_duration_hours).toFixed(1)}h`
    })
  })

  recentRecords.value = records.slice(0, 5)
}

function openExerciseCheckin() {
  router.push('/exercise/checkin')
}

function openMealCheckin() {
  router.push('/meal/checkin')
}

function openSleepCheckin() {
  router.push('/sleep/checkin')
}

function handleHealthSetupClose() {
  showHealthSetupModal.value = false
}

function handleHealthSetupSuccess() {
  showHealthSetupModal.value = false
  loadAllData()
}

async function loadAllData() {
  try {
    await exerciseCheckin.loadRecords()
    await mealCheckin.loadRecords()
    await sleepCheckin.loadRecords()
    
    generateTodayStats()
    generateRecentRecords()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(async () => {
  try {
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      showHealthSetupModal.value = true
      return
    }

    await loadAllData()
    
    // 设置励志名言
    motivationalQuote.value = '健康是最大的财富'

    // 每分钟刷新日期
    setInterval(() => {
      currentDate.value = formatCSTDate(getTimeInCST())
    }, 60000)
  } catch (error) {
    console.error('初始化失败:', error)
  }
})
</script>

<style scoped>
@import '@/css/HomeView.css';
</style>
