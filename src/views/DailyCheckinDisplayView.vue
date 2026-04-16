<template>
  <div class="daily-checkin-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'每日健康中心'" :subtitle="'您的健康数据一览'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="daily-checkin-container">
          <!-- 左栏：日期选择和快速统计 -->
          <div class="daily-checkin-left-panel">
            <!-- 日期选择器 -->
            <div class="date-selector-section">
              <label class="date-label">选择日期</label>
              <input 
                v-model="selectedDate" 
                type="date" 
                class="date-input"
                @change="loadDailyData"
              />
              <button @click="selectToday" class="today-btn">今天</button>
            </div>

            <!-- 今日总结卡片 -->
            <div class="summary-card">
              <div class="summary-header">
                <h3 class="summary-title">📊 今日概览</h3>
              </div>
              <div class="summary-stats">
                <div class="stat-item">
                  <div class="stat-icon">✓</div>
                  <div class="stat-content">
                    <div class="stat-label">已完成</div>
                    <div class="stat-value">{{ completedCount }}/{{ totalCount }}</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-content">
                    <div class="stat-label">完成率</div>
                    <div class="stat-value">{{ completionRate }}%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快速导航按钮 -->
            <div class="quick-nav-section">
              <p class="nav-title">快速导航</p>
              <button class="nav-btn" @click="refreshAllData" title="刷新所有数据">
                <span class="nav-icon">🔄</span>
                <span class="nav-text">刷新数据</span>
              </button>
            </div>
          </div>

          <!-- 右栏：打卡卡片网格 -->
          <div class="daily-checkin-right-panel">
            <div class="checkin-cards-grid">
              <!-- 运动打卡卡片 -->
              <div class="checkin-card" :class="{ 'completed': dailyData.exercise?.status === 'completed' }">
                <div class="card-header">
                  <span class="card-icon">🏃</span>
                  <h2 class="card-title">运动</h2>
                  <span class="card-status" :class="dailyData.exercise?.status">
                    {{ getStatusText(dailyData.exercise?.status) }}
                  </span>
                </div>
                <div class="card-content">
                  <div class="content-main">
                    <div v-if="dailyData.exercise?.data" class="metric-display">
                      <div class="metric-item">
                        <span class="metric-label">时长</span>
                        <span class="metric-value">{{ dailyData.exercise.data.duration || '-' }}</span>
                        <span class="metric-unit">分钟</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">消耗</span>
                        <span class="metric-value">{{ dailyData.exercise.data.calories || '-' }}</span>
                        <span class="metric-unit">kcal</span>
                      </div>
                    </div>
                    <div v-else class="empty-message">
                      暂无数据，点击下方查看详情
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/exercise/checkin" class="card-link">
                    <span>查看详情</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>

              <!-- 饮食打卡卡片 -->
              <div class="checkin-card" :class="{ 'completed': dailyData.meal?.status === 'completed' }">
                <div class="card-header">
                  <span class="card-icon">🍽️</span>
                  <h2 class="card-title">饮食</h2>
                  <span class="card-status" :class="dailyData.meal?.status">
                    {{ getStatusText(dailyData.meal?.status) }}
                  </span>
                </div>
                <div class="card-content">
                  <div class="content-main">
                    <div v-if="dailyData.meal?.data" class="metric-display">
                      <div class="metric-item">
                        <span class="metric-label">热量</span>
                        <span class="metric-value">{{ dailyData.meal.data.calories || '-' }}</span>
                        <span class="metric-unit">kcal</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">蛋白</span>
                        <span class="metric-value">{{ dailyData.meal.data.protein || '-' }}</span>
                        <span class="metric-unit">g</span>
                      </div>
                    </div>
                    <div v-else class="empty-message">
                      暂无数据，点击下方查看详情
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/meal/checkin" class="card-link">
                    <span>查看详情</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>

              <!-- 睡眠打卡卡片 -->
              <div class="checkin-card" :class="{ 'completed': dailyData.sleep?.status === 'completed' }">
                <div class="card-header">
                  <span class="card-icon">😴</span>
                  <h2 class="card-title">睡眠</h2>
                  <span class="card-status" :class="dailyData.sleep?.status">
                    {{ getStatusText(dailyData.sleep?.status) }}
                  </span>
                </div>
                <div class="card-content">
                  <div class="content-main">
                    <div v-if="dailyData.sleep?.data" class="metric-display">
                      <div class="metric-item">
                        <span class="metric-label">时长</span>
                        <span class="metric-value">{{ dailyData.sleep.data.duration || '-' }}</span>
                        <span class="metric-unit">小时</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">质量</span>
                        <span class="metric-value">{{ dailyData.sleep.data.quality || '-' }}</span>
                        <span class="metric-unit"></span>
                      </div>
                    </div>
                    <div v-else class="empty-message">
                      暂无数据，点击下方查看详情
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/sleep/checkin" class="card-link">
                    <span>查看详情</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>

              <!-- 健康趋势卡片 -->
              <div class="checkin-card trends-card">
                <div class="card-header">
                  <img src="/noun-sidebar-trend.svg" alt="趋势分析" class="grid-svg"/>
                  <h2 class="card-title">趋势分析</h2>
                </div>
                <div class="card-content">
                  <div class="trends-preview">
                    <p class="trends-text">查看您的健康数据变化趋势</p>
                    <div class="trends-indicators">
                      <div class="indicator">
                        <span class="indicator-label">周趋势</span>
                        <span class="indicator-value">↗</span>
                      </div>
                      <div class="indicator">
                        <span class="indicator-label">月趋势</span>
                        <span class="indicator-value">→</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/analysis/trends" class="card-link">
                    <span>查看趋势</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>

              <!-- 历史记录卡片 -->
              <div class="checkin-card history-card">
                <div class="card-header">
                  <img src="/noun-sidebar-history.svg" alt="历史记录" class="grid-svg"/>
                  <h2 class="card-title">历史记录</h2>
                </div>
                <div class="card-content">
                  <div class="history-preview">
                    <p class="history-text">回顾之前的健康打卡记录</p>
                    <div class="history-stats">
                      <div class="history-stat">
                        <span class="stat-number">{{ totalRecords }}</span>
                        <span class="stat-desc">条记录</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/health/history" class="card-link">
                    <span>查看历史</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>

              <!-- AI分析卡片 -->
              <div class="checkin-card ai-card">
                <div class="card-header">
                  <span class="card-icon">✨</span>
                  <h2 class="card-title">AI分析</h2>
                </div>
                <div class="card-content">
                  <div class="ai-preview">
                    <p class="ai-text">获取您的个性化健康建议</p>
                    <div class="ai-badge">智能分析中</div>
                  </div>
                </div>
                <div class="card-footer">
                  <router-link to="/ai-chat" class="card-link">
                    <span>咨询AI</span>
                    <span class="arrow">→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import { getLocalISOString } from '@/utils/dateTime'

interface DailyData {
  exercise?: { status: string; data?: any }
  meal?: { status: string; data?: any }
  sleep?: { status: string; data?: any }
}

const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const selectedDate = ref(getLocalISOString().split('T')[0])
const dailyData = ref<DailyData>({})
const totalRecords = ref(0)

// 计算完成数量
const completedCount = computed(() => {
  let count = 0
  if (dailyData.value.exercise?.status === 'completed') count++
  if (dailyData.value.meal?.status === 'completed') count++
  if (dailyData.value.sleep?.status === 'completed') count++
  return count
})

// 计算总数
const totalCount = computed(() => 3)

// 计算完成率
const completionRate = computed(() => {
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const getStatusText = (status?: string): string => {
  switch (status) {
    case 'completed':
      return '已打卡'
    case 'pending':
      return '进行中'
    default:
      return '未打卡'
  }
}

const selectToday = () => {
  selectedDate.value = getLocalISOString().split('T')[0]
  loadDailyData()
}

const loadDailyData = () => {
  // TODO: 从API加载指定日期的打卡聚合数据
  console.log('加载每日数据:', selectedDate.value)
  // 示例数据
  dailyData.value = {
    exercise: { 
      status: 'completed', 
      data: { duration: 45, calories: 250 } 
    },
    meal: { 
      status: 'completed', 
      data: { calories: 1800, protein: 65 } 
    },
    sleep: { 
      status: 'pending', 
      data: { duration: 7.5, quality: '良好' } 
    }
  }
  totalRecords.value = 12
}

const refreshAllData = () => {
  console.log('刷新所有数据')
  loadDailyData()
}

onMounted(() => {
  loadDailyData()
})
</script>

<style scoped>
@import '@/css/DailyCheckinDisplay.css';
</style>
