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
      <!-- 页面标题 -->
      <section class="trends-header">
        <div class="header-content">
          <h1 class="page-title">趋势分析</h1>
          <p class="page-subtitle">了解您的健康数据变化演进</p>
        </div>
      </section>

      <!-- 时间范围选择 -->
      <section class="trends-controls">
        <div class="date-range-selector">
          <button
            v-for="range in dateRanges"
            :key="range.value"
            @click="selectedRange = range.value"
            :class="['range-btn', { active: selectedRange === range.value }]"
          >
            {{ range.label }}
          </button>
        </div>
      </section>

      <!-- 三大指标趋势图 -->
      <section class="collapsible-section">
        <div class="section-header" @click="toggleSection('charts')">
          <div class="section-title-group">
            <h2 class="section-title">三大指标趋势</h2>
            <span class="toggle-icon" :class="{ collapsed: !expandedSections.charts }">▼</span>
          </div>
        </div>
        <div class="section-content" :class="{ collapsed: !expandedSections.charts }">
          <div class="trends-charts">
            <!-- 运动趋势 -->
            <div class="chart-card">
              <div class="chart-header">
                <h2 class="chart-title">运动趋势</h2>
                <div class="chart-stats">
                  <span class="stat">平均: {{ `${stats.avgExercise}` }}分钟</span>
                  <span class="stat">最高: {{ `${stats.maxExercise}` }}分钟</span>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="exerciseChart" class="chart"></canvas>
              </div>
            </div>

            <!-- 饮食趋势 -->
            <div class="chart-card">
              <div class="chart-header">
                <h2 class="chart-title">饮食趋势</h2>
                <div class="chart-stats">
                  <span class="stat">平均: {{ `${stats.avgMealCalories}` }}kcal</span>
                  <span class="stat">最高: {{ `${stats.maxMealCalories}` }}kcal</span>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="mealChart" class="chart"></canvas>
              </div>
            </div>

            <!-- 睡眠趋势 -->
            <div class="chart-card">
              <div class="chart-header">
                <h2 class="chart-title">睡眠趋势</h2>
                <div class="chart-stats">
                  <span class="stat">平均: {{ `${stats.avgSleep}` }}小时</span>
                  <span class="stat">最高: {{ `${stats.maxSleep}` }}小时</span>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="sleepChart" class="chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 关键指标卡片 -->
      <section class="collapsible-section">
        <div class="section-header" @click="toggleSection('metrics')">
          <div class="section-title-group">
            <h2 class="section-title">关键指标变化</h2>
            <span class="toggle-icon" :class="{ collapsed: !expandedSections.metrics }">▼</span>
          </div>
        </div>
        <div class="section-content" :class="{ collapsed: !expandedSections.metrics }">
          <div class="metrics-grid">
            <div class="metric-trend-card">
              <div class="metric-header">
                <span class="metric-icon">🔥</span>
                <span class="metric-name">卡路里消耗</span>
              </div>
              <div class="metric-value">{{ `${stats.totalCalories}` }}</div>
              <div class="metric-unit">kcal/周</div>
              <div class="trend-indicator" :class="{ up: stats.caloriesTrend > 0 }">
                {{ stats.caloriesTrend > 0 ? '↑' : '↓' }}
                {{ Math.abs(stats.caloriesTrend) }}%
              </div>
            </div>

            <div class="metric-trend-card">
              <div class="metric-header">
                <span class="metric-icon">⏱️</span>
                <span class="metric-name">运动时长</span>
              </div>
              <div class="metric-value">{{ `${stats.totalExerciseTime}` }}</div>
              <div class="metric-unit">小时/周</div>
              <div class="trend-indicator" :class="{ up: stats.exerciseTrend > 0 }">
                {{ stats.exerciseTrend > 0 ? '↑' : '↓' }}
                {{ Math.abs(stats.exerciseTrend) }}%
              </div>
            </div>

            <div class="metric-trend-card">
              <div class="metric-header">
                <span class="metric-icon">💤</span>
                <span class="metric-name">睡眠时长</span>
              </div>
              <div class="metric-value">{{ `${stats.totalSleepTime}` }}</div>
              <div class="metric-unit">小时/周</div>
              <div class="trend-indicator" :class="{ up: stats.sleepTrend > 0 }">
                {{ stats.sleepTrend > 0 ? '↑' : '↓' }}
                {{ Math.abs(stats.sleepTrend) }}%
              </div>
            </div>

            <div class="metric-trend-card">
              <div class="metric-header">
                <span class="metric-icon">📊</span>
                <span class="metric-name">综合评分</span>
              </div>
              <div class="metric-value">{{ `${stats.healthScore}` }}</div>
              <div class="metric-unit">分</div>
              <div class="trend-indicator" :class="{ up: stats.scoreTrend > 0 }">
                {{ stats.scoreTrend > 0 ? '↑' : '↓' }}
                {{ Math.abs(stats.scoreTrend) }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 习惯养成进度 -->
      <section class="collapsible-section">
        <div class="section-header" @click="toggleSection('habits')">
          <div class="section-title-group">
            <h2 class="section-title">习惯养成进度</h2>
            <span class="toggle-icon" :class="{ collapsed: !expandedSections.habits }">▼</span>
          </div>
        </div>
        <div class="section-content" :class="{ collapsed: !expandedSections.habits }">
          <div class="habits-list">
            <div
              v-for="habit in habits"
              :key="habit.id"
              class="habit-card"
              :class="{ completed: habit.progress === 100 }"
            >
              <div class="habit-header">
                <div class="habit-info">
                  <h3 class="habit-title">{{ habit.title }}</h3>
                  <p class="habit-description">{{ habit.description }}</p>
                </div>
                <div class="habit-days">{{ habit.days }}天</div>
              </div>
              <div class="habit-progress-bar">
                <div class="habit-progress" :style="{ width: habit.progress + '%' }"></div>
              </div>
              <div class="habit-stats">
                <span class="stat">{{ habit.progress }}% 完成</span>
                <span class="stat">目标: {{ habit.target }}天</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 对比分析 -->
      <section class="collapsible-section">
        <div class="section-header" @click="toggleSection('comparison')">
          <div class="section-title-group">
            <h2 class="section-title">本周 vs 上周</h2>
            <span class="toggle-icon" :class="{ collapsed: !expandedSections.comparison }">▼</span>
          </div>
        </div>
        <div class="section-content" :class="{ collapsed: !expandedSections.comparison }">
          <div class="comparison-grid">
            <div class="comparison-card">
              <h3 class="comparison-title">运动频率</h3>
              <div class="comparison-stats">
                <div class="stats-item">
                  <span class="label">本周</span>
                  <span class="value">{{ `${comparison.exerciseFrequencyCurrent}` }}天</span>
                </div>
                <div class="stats-item">
                  <span class="label">上周</span>
                  <span class="value">{{ `${Math.round(comparison.exerciseFrequencyPrev)}` }}天</span>
                </div>
              </div>
              <div class="comparison-result" :class="{ positive: comparison.exerciseTrend >= 0, negative: comparison.exerciseTrend < 0 }">
                <span>{{ comparison.exerciseTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.exerciseTrend) }}% 增长</span>
              </div>
            </div>

            <div class="comparison-card">
              <h3 class="comparison-title">平均睡眠</h3>
              <div class="comparison-stats">
                <div class="stats-item">
                  <span class="label">本周</span>
                  <span class="value">{{ `${comparison.sleepCurrent}` }}h</span>
                </div>
                <div class="stats-item">
                  <span class="label">上周</span>
                  <span class="value">{{ `${comparison.sleepPrev}` }}h</span>
                </div>
              </div>
              <div class="comparison-result" :class="{ positive: comparison.sleepTrend >= 0, negative: comparison.sleepTrend < 0 }">
                <span>{{ comparison.sleepTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.sleepTrend) }}% 增长</span>
              </div>
            </div>

            <div class="comparison-card">
              <h3 class="comparison-title">饮食均衡度</h3>
              <div class="comparison-stats">
                <div class="stats-item">
                  <span class="label">本周</span>
                  <span class="value">{{ `${comparison.mealBalanceCurrent}` }}分</span>
                </div>
                <div class="stats-item">
                  <span class="label">上周</span>
                  <span class="value">{{ `${Math.round(comparison.mealBalancePrev)}` }}分</span>
                </div>
              </div>
              <div class="comparison-result" :class="{ positive: comparison.mealTrend >= 0, negative: comparison.mealTrend < 0 }">
                <span>{{ comparison.mealTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.mealTrend) }}% 增长</span>
              </div>
            </div>
          </div>
        </div>
      </section>
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

const exerciseChart = ref<HTMLCanvasElement | null>(null)
const mealChart = ref<HTMLCanvasElement | null>(null)
const sleepChart = ref<HTMLCanvasElement | null>(null)

// 每日数据用于图表 - 初始为空
const chartData = ref<Array<{date: string; exercise: number; meal: number; sleep: number}>>([])

// 时间范围选项
const dateRanges = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
]

// Section 展开状态
const expandedSections = ref({
  charts: true,
  metrics: true,
  habits: true,
  comparison: true
})

// 统计数据 - 初始为空
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

// 习惯养成数据 - 初始为空
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

// Toggle section 展开/折叠
function toggleSection(section: keyof typeof expandedSections.value) {
  expandedSections.value[section] = !expandedSections.value[section]
}

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
        });

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
