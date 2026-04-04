<template>
  <div class="page">
    <AppHeader />
    
    <main class="home-main">
      <!-- 欢迎时段卡片 -->
      <section class="greeting-section">
        <div class="greeting-card" :style="{ borderLeftColor: timeOfDay.color }">
          <div class="greeting-header">
            <span class="greeting-emoji">{{ timeOfDay.emoji }}</span>
            <div class="greeting-text">
              <h2 class="greeting-title">{{ generateDynamicGreeting() }}</h2>
              <p class="greeting-time">{{ currentDate }}</p>
            </div>
          </div>
          <div class="greeting-footer">
            <p class="quote">「{{ motivationalQuote.text }}」</p>
          </div>
        </div>
      </section>

      <!-- 健康指数卡片 -->
      <section class="health-score-section">
        <div class="health-score-card">
          <div class="score-visual">
            <div class="score-meter">
              <div class="meter-fill" :style="{ width: healthScore.score + '%' }"></div>
              <div class="meter-label">{{ healthScore.score }}/100</div>
            </div>
          </div>
          <div class="score-info">
            <h3 class="score-title">{{ healthScore.emoji }} {{ healthScore.level }}</h3>
            <p class="score-description">{{ healthScore.description }}</p>
            <!-- 薄弱点提示 -->
            <div v-if="healthScore.weakPoints && healthScore.weakPoints.length > 0" class="weak-points-warning">
              <div v-for="(point, index) in healthScore.weakPoints" :key="index" class="weak-point-item">
                <span class="weak-point-indicator">•</span>
                <span class="weak-point-text">{{ point }}</span>
              </div>
            </div>
            <div class="score-tags">
              <span class="tag">运动: {{ exerciseCheckin.records.value.length }}次</span>
              <span class="tag">饮食: {{ mealCheckin.records.value.length }}顿</span>
              <span class="tag">睡眠: {{ sleepCheckin.records.value.length > 0 ? parseFloat(String(sleepCheckin.records.value[0].sleep_duration_hours)).toFixed(1) : '0' }}h</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 今日统计卡片 -->
      <section v-if="todayStats.length > 0" class="stats-section">
        <div class="stats-header">
          <h3 class="section-title">📊 今日打卡统计</h3>
          <button class="add-checkin-btn" @click="showCheckinMenu = true">+ 添加打卡</button>
        </div>
        <div class="stats-grid">
          <div v-for="stat in todayStats" :key="stat.label" class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">{{ getStatIcon(stat.label) }}</span>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速导航 -->
      <section class="quick-nav-section">
        <h3 class="section-title">⚡ 快速导航</h3>
        <div class="nav-grid">
          <router-link to="/exercise/checkin" class="nav-card exercise">
            <span class="nav-icon">💪</span>
            <span class="nav-label">运动打卡</span>
            <span class="nav-arrow">→</span>
          </router-link>
          <router-link to="/meal/checkin" class="nav-card meal">
            <span class="nav-icon">🍽️</span>
            <span class="nav-label">饮食打卡</span>
            <span class="nav-arrow">→</span>
          </router-link>
          <router-link to="/sleep/checkin" class="nav-card sleep">
            <span class="nav-icon">😴</span>
            <span class="nav-label">睡眠打卡</span>
            <span class="nav-arrow">→</span>
          </router-link>
          <router-link to="/health/history" class="nav-card history">
            <span class="nav-icon">📈</span>
            <span class="nav-label">历史记录</span>
            <span class="nav-arrow">→</span>
          </router-link>
        </div>
      </section>

      <!-- 最近打卡 -->
      <section v-if="recentRecords.length > 0" class="recent-section">
        <div class="recent-header">
          <h3 class="section-title">🎯 最近打卡</h3>
          <router-link to="/health/history" class="view-all">查看全部 →</router-link>
        </div>
        <div class="recent-list">
          <div v-for="(record, index) in recentRecords.slice(0, 5)" :key="index" class="recent-item">
            <div class="recent-type">{{ record.type }}</div>
            <div class="recent-info">
              <div class="recent-title">{{ record.title }}</div>
              <div class="recent-time">{{ record.time }}</div>
            </div>
            <div class="recent-value">{{ record.value }}</div>
          </div>
        </div>
      </section>

      <!-- 底部空白 -->
      <div class="home-footer-spacing"></div>

      <!-- 打卡浮窗 -->
      <Teleport to="body" v-if="showCheckinMenu">
        <div class="checkin-modal-overlay" @click="showCheckinMenu = false">
          <div class="checkin-modal" @click.stop>
            <button class="modal-close" @click="showCheckinMenu = false">✕</button>
            <h3 class="modal-title">选择打卡类型</h3>
            <div class="checkin-options">
              <button class="checkin-option" @click="openExerciseCheckin">
                <span class="option-icon">◆</span>
                <span class="option-label">运动打卡</span>
              </button>
              <button class="checkin-option" @click="openMealCheckin">
                <span class="option-icon">▤</span>
                <span class="option-label">饮食打卡</span>
              </button>
              <button class="checkin-option" @click="openSleepCheckin">
                <span class="option-icon">◇</span>
                <span class="option-label">睡眠打卡</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
// import AppFooter from '../components/AppFooter.vue'
import { useHomePageLogic } from '../composables/useHomePageLogic'

const {
  timeOfDay,
  currentDate,
  motivationalQuote,
  healthScore,
  todayStats,
  recentRecords,
  showCheckinMenu,
  exerciseCheckin,
  mealCheckin,
  sleepCheckin,
  generateDynamicGreeting,
  getStatIcon,
  openExerciseCheckin,
  openMealCheckin,
  openSleepCheckin,
  loadAllData,
  refreshTimeData
} = useHomePageLogic()

// 初始化
onMounted(() => {
  loadAllData()
  
  // 每分钟更新一次时间和日期
  const timer = setInterval(() => {
    refreshTimeData()
  }, 60000)

  return () => clearInterval(timer)
})
</script>

<style scoped>
@import '@/css/HomeView.css';
</style>
