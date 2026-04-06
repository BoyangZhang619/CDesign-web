<template>
  <div class="trends-page">
    <AppHeader />

    <!-- 健康档案设置浮窗 -->
    <HealthSetupModal
      :show="showHealthSetupModal"
      :force-complete="true"
      @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess"
    />

    <!-- 主内容区 -->
    <main class="trends-main" v-if="!showHealthSetupModal">
      <div class="trends-wrapper">
        <!-- 页面头部 -->
        <div class="trends-header">
          <h1 class="trends-title">健康趋势</h1>
          <p class="trends-subtitle">追踪您的健康数据变化演进</p>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
          <div class="control-panel-header" @click="isControlPanelOpen = !isControlPanelOpen">
            <span class="control-panel-title">时间范围</span>
            <span class="control-panel-toggle" :class="{ open: isControlPanelOpen }">▼</span>
          </div>

          <div v-show="isControlPanelOpen" class="control-panel-content">
            <div class="range-buttons">
              <button
                v-for="range in dateRanges"
                :key="range.value"
                @click="selectRange(range.value)"
                :class="['range-btn', { active: selectedRange === range.value }]"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 健康概览卡片 -->
        <div class="overview-card">
          <div class="overview-header">
            <h2 class="overview-title">健康概览</h2>
            <div class="loading-indicator" v-if="loading">
              <span class="spinner"></span>
              <span>加载中...</span>
            </div>
          </div>

          <div class="overview-grid">
            <div class="overview-stat">
              <div class="stat-icon">🏃</div>
              <div class="stat-content">
                <div class="stat-label">平均运动</div>
                <div class="stat-value">{{ Math.round(stats.avgExercise) }}</div>
                <div class="stat-unit">分钟/天</div>
              </div>
              <div class="stat-trend" :class="{ positive: stats.exerciseTrend >= 0 }">
                <span class="trend-arrow">{{ stats.exerciseTrend > 0 ? '↑' : '↓' }}</span>
                <span class="trend-value">{{ Math.abs(stats.exerciseTrend) }}%</span>
              </div>
            </div>

            <div class="overview-stat">
              <div class="stat-icon">🍽️</div>
              <div class="stat-content">
                <div class="stat-label">平均热量</div>
                <div class="stat-value">{{ Math.round(stats.avgMealCalories) }}</div>
                <div class="stat-unit">kcal/天</div>
              </div>
              <div class="stat-trend" :class="{ positive: stats.caloriesTrend >= 0 }">
                <span class="trend-arrow">{{ stats.caloriesTrend > 0 ? '↑' : '↓' }}</span>
                <span class="trend-value">{{ Math.abs(stats.caloriesTrend) }}%</span>
              </div>
            </div>

            <div class="overview-stat">
              <div class="stat-icon">😴</div>
              <div class="stat-content">
                <div class="stat-label">平均睡眠</div>
                <div class="stat-value">{{ stats.avgSleep.toFixed(1) }}</div>
                <div class="stat-unit">小时/天</div>
              </div>
              <div class="stat-trend" :class="{ positive: stats.sleepTrend >= 0 }">
                <span class="trend-arrow">{{ stats.sleepTrend > 0 ? '↑' : '↓' }}</span>
                <span class="trend-value">{{ Math.abs(stats.sleepTrend) }}%</span>
              </div>
            </div>

            <div class="overview-stat">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <div class="stat-label">健康评分</div>
                <div class="stat-value">{{ Math.round(stats.healthScore) }}</div>
                <div class="stat-unit">总体得分</div>
              </div>
              <div class="stat-trend" :class="{ positive: stats.scoreTrend >= 0 }">
                <span class="trend-arrow">{{ stats.scoreTrend > 0 ? '↑' : '↓' }}</span>
                <span class="trend-value">{{ Math.abs(stats.scoreTrend) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 趋势图表区 -->
        <div class="chart-section">
          <h2 class="section-heading">趋势图表</h2>
          <div class="charts-grid">
            <!-- 运动趋势图 -->
            <div class="chart-container-card">
              <div class="chart-card-header">
                <h3 class="chart-card-title">运动趋势</h3>
                <div class="chart-stats">
                  <span class="stat-badge">最高: {{ Math.round(stats.maxExercise) }}分钟</span>
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="exerciseChart" class="chart-canvas"></canvas>
              </div>
            </div>

            <!-- 饮食趋势图 -->
            <div class="chart-container-card">
              <div class="chart-card-header">
                <h3 class="chart-card-title">饮食趋势</h3>
                <div class="chart-stats">
                  <span class="stat-badge">最高: {{ Math.round(stats.maxMealCalories) }}kcal</span>
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="mealChart" class="chart-canvas"></canvas>
              </div>
            </div>

            <!-- 睡眠趋势图 -->
            <div class="chart-container-card">
              <div class="chart-card-header">
                <h3 class="chart-card-title">睡眠趋势</h3>
                <div class="chart-stats">
                  <span class="stat-badge">最高: {{ stats.maxSleep.toFixed(1) }}小时</span>
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="sleepChart" class="chart-canvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 习惯养成 -->
        <div v-if="habits.length > 0" class="habits-section">
          <h2 class="section-heading">习惯养成进度</h2>
          <div class="habits-grid">
            <div
              v-for="habit in habits"
              :key="habit.id"
              class="habit-item"
              :class="{ completed: habit.progress >= 100 }"
            >
              <div class="habit-header">
                <h3 class="habit-title">{{ habit.title }}</h3>
                <div class="habit-progress-badge">{{ habit.progress }}%</div>
              </div>
              <p class="habit-description">{{ habit.description }}</p>
              <div class="habit-progress-container">
                <div class="habit-progress-bar">
                  <div class="habit-progress-fill" :style="{ width: habit.progress + '%' }"></div>
                </div>
              </div>
              <div class="habit-footer">
                <span class="habit-target">目标: {{ habit.target }}天</span>
                <span class="habit-current">已坚持: {{ habit.days }}天</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 周期对比 -->
        <div class="comparison-section">
          <h2 class="section-heading">周期对比分析</h2>
          <div class="comparison-grid">
            <div class="comparison-item">
              <div class="comparison-label">本期运动</div>
              <div class="comparison-values">
                <div class="comparison-value">
                  <span class="value">{{ Math.round(comparison.exerciseFrequencyCurrent) }}</span>
                  <span class="unit">天</span>
                </div>
                <div class="comparison-vs">VS</div>
                <div class="comparison-value secondary">
                  <span class="value">{{ Math.round(comparison.exerciseFrequencyPrev) }}</span>
                  <span class="unit">天</span>
                </div>
              </div>
              <div class="comparison-trend" :class="{ up: comparison.exerciseTrend > 0, down: comparison.exerciseTrend < 0 }">
                {{ comparison.exerciseTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.exerciseTrend) }}%
              </div>
            </div>

            <div class="comparison-item">
              <div class="comparison-label">本期睡眠</div>
              <div class="comparison-values">
                <div class="comparison-value">
                  <span class="value">{{ comparison.sleepCurrent.toFixed(1) }}</span>
                  <span class="unit">h</span>
                </div>
                <div class="comparison-vs">VS</div>
                <div class="comparison-value secondary">
                  <span class="value">{{ comparison.sleepPrev.toFixed(1) }}</span>
                  <span class="unit">h</span>
                </div>
              </div>
              <div class="comparison-trend" :class="{ up: comparison.sleepTrend > 0, down: comparison.sleepTrend < 0 }">
                {{ comparison.sleepTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.sleepTrend) }}%
              </div>
            </div>

            <div class="comparison-item">
              <div class="comparison-label">本期饮食</div>
              <div class="comparison-values">
                <div class="comparison-value">
                  <span class="value">{{ Math.round(comparison.mealBalanceCurrent) }}</span>
                  <span class="unit">分</span>
                </div>
                <div class="comparison-vs">VS</div>
                <div class="comparison-value secondary">
                  <span class="value">{{ Math.round(comparison.mealBalancePrev) }}</span>
                  <span class="unit">分</span>
                </div>
              </div>
              <div class="comparison-trend" :class="{ up: comparison.mealTrend > 0, down: comparison.mealTrend < 0 }">
                {{ comparison.mealTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.mealTrend) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useAuthForm } from '../composables/useAuthForm'
import { fetchWithRefresh } from '../api/http'

const { checkHealthInfoNeeded } = useAuthForm()

const showHealthSetupModal = ref(false)
const loading = ref(false)
const selectedRange = ref('month')
const isControlPanelOpen = ref(true)

const exerciseChart = ref<HTMLCanvasElement | null>(null)
const mealChart = ref<HTMLCanvasElement | null>(null)
const sleepChart = ref<HTMLCanvasElement | null>(null)

// 每日数据用于图表
const chartData = ref<Array<{date: string; exercise: number; meal: number; sleep: number}>>([])

// 时间范围选项
const dateRanges = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
]

// 统计数据
const stats = ref({
  avgExercise: 0,
  maxExercise: 0,
  avgMealCalories: 0,
  maxMealCalories: 0,
  avgSleep: 0,
  maxSleep: 0,
  totalCalories: 0,
  totalExerciseTime: 0,
  totalSleepTime: 0,
  healthScore: 0,
  caloriesTrend: 0,
  exerciseTrend: 0,
  sleepTrend: 0,
  scoreTrend: 0
})

// 习惯养成数据
const habits = ref<Array<{id: number; title: string; description: string; days: number; progress: number; target: number}>>([])

// 对比数据
const comparison = ref({
  exerciseFrequencyCurrent: 0,
  exerciseFrequencyPrev: 0,
  exerciseTrend: 0,
  sleepCurrent: 0,
  sleepPrev: 0,
  sleepTrend: 0,
  mealBalanceCurrent: 0,
  mealBalancePrev: 0,
  mealTrend: 0
})

// 处理健康档案关闭
function handleHealthSetupClose() {
  console.log('用户选择稍后设置健康档案')
}

// 处理健康档案成功
function handleHealthSetupSuccess() {
  showHealthSetupModal.value = false
  console.log('用户完成了健康档案设置！')
  loadTrendsData()
}

// 选择时间范围
function selectRange(range: string) {
  selectedRange.value = range
}

// 加载趋势数据
async function loadTrendsData() {
  loading.value = true
  try {
    const response = await fetchWithRefresh(
      `/api/analysis/trends?range=${selectedRange.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data?.success && data.data) {
        const trendsData = data.data
        Object.assign(stats.value, {
          avgExercise: trendsData.avgExercise || 0,
          maxExercise: trendsData.maxExercise || 0,
          avgMealCalories: trendsData.avgMealCalories || 0,
          maxMealCalories: trendsData.maxMealCalories || 0,
          avgSleep: trendsData.avgSleep || 0,
          maxSleep: trendsData.maxSleep || 0,
          totalCalories: trendsData.totalCalories || 0,
          totalExerciseTime: trendsData.totalExerciseTime || 0,
          totalSleepTime: trendsData.totalSleepTime || 0,
          healthScore: trendsData.healthScore || 0,
          caloriesTrend: trendsData.caloriesTrend || 0,
          exerciseTrend: trendsData.exerciseTrend || 0,
          sleepTrend: trendsData.sleepTrend || 0,
          scoreTrend: trendsData.scoreTrend || 0
        })

        // 更新对比数据
        if (trendsData.weekComparison) {
          const wc = trendsData.weekComparison
          Object.assign(comparison.value, {
            exerciseFrequencyCurrent: wc.exerciseFrequency || 0,
            exerciseFrequencyPrev: wc.exerciseFrequencyPrev || 0,
            exerciseTrend: wc.exerciseFrequencyTrend || 0,
            sleepCurrent: wc.avgSleepCurrent || 0,
            sleepPrev: wc.avgSleepPrev || 0,
            sleepTrend: wc.sleepTrend || 0,
            mealBalanceCurrent: wc.mealBalance || 0,
            mealBalancePrev: (wc.mealBalance || 0) * (1 - (wc.mealBalanceTrend || 0) / 100),
            mealTrend: wc.mealBalanceTrend || 0
          })
        }

        // 更新每日数据用于图表
        if (trendsData.dailyData && trendsData.dailyData.length > 0) {
          chartData.value = trendsData.dailyData
          await nextTick()
          initCharts()
        }

        // 更新习惯养成数据
        if (trendsData.habits && trendsData.habits.length > 0) {
          habits.value = trendsData.habits
        } else {
          habits.value = []
        }
      }
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
function initCharts() {
  const dates = chartData.value.map(d => d.date)
  const exerciseData = chartData.value.map(d => d.exercise)
  const mealData = chartData.value.map(d => d.meal)
  const sleepData = chartData.value.map(d => d.sleep)

  if (exerciseChart.value && exerciseData.length > 0) {
    drawChart(exerciseChart.value, dates, exerciseData, '#e8b4b8')
  }

  if (mealChart.value && mealData.length > 0) {
    drawChart(mealChart.value, dates, mealData, '#daa76f')
  }

  if (sleepChart.value && sleepData.length > 0) {
    drawChart(sleepChart.value, dates, sleepData, '#a79368')
  }
}

// 绘制图表
function drawChart(
  canvas: HTMLCanvasElement,
  dates: string[],
  data: number[],
  color: string
) {
  if (data.length === 0) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 600
  canvas.height = 300

  const padding = 40
  const graphWidth = canvas.width - 2 * padding
  const graphHeight = canvas.height - 2 * padding - 20
  const maxValue = Math.max(...data) * 1.2
  const xStep = graphWidth / (dates.length - 1)
  const scale = graphHeight / maxValue

  // 绘制网格线
  ctx.strokeStyle = '#e0d9d1'
  ctx.lineWidth = 1

  for (let i = 0; i <= 5; i++) {
    const y = padding + (graphHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }

  // 绘制数据线和区域
  ctx.fillStyle = color + '33'
  ctx.beginPath()
  ctx.moveTo(padding, canvas.height - padding)

  data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = canvas.height - padding - value * scale
    ctx.lineTo(x, y)
  })

  ctx.lineTo(canvas.width - padding, canvas.height - padding)
  ctx.closePath()
  ctx.fill()

  // 绘制数据线
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = canvas.height - padding - value * scale
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // 绘制数据点
  ctx.fillStyle = color
  data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = canvas.height - padding - value * scale
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // 绘制 X 轴标签
  ctx.fillStyle = '#6d6d6d'
  ctx.font = '12px Montserrat, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  dates.forEach((date, index) => {
    const x = padding + index * xStep
    ctx.fillText(date, x, canvas.height - padding + 10)
  })
}

// 初始化
onMounted(async () => {
  try {
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      showHealthSetupModal.value = true
      return
    }

    await loadTrendsData()
    await nextTick()
    if (chartData.value.length > 0) {
      initCharts()
    }
  } catch (err) {
    console.error('页面初始化错误:', err)
  }
})

// 监听时间范围变化
watch(selectedRange, async () => {
  await loadTrendsData()
})
</script>

<style scoped>
@import '@/css/TrendsView.css';
</style>
