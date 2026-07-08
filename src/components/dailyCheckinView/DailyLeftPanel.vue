<template>
  <div class="daily-left-panel">

    <!-- 今日概览卡片 -->
    <div class="overview-card">
      <div class="overview-header">
        <h3 class="overview-title">📊 今日概览</h3>
      </div>

      <!-- 饮食情况 - 三等分圆环 -->
      <div class="overview-section">
        <div class="section-header">
          <span class="section-icon">🍽️</span>
          <span class="section-title">饮食情况</span>
        </div>
        <div class="section-content">
          <div v-if="mealStatus === 'completed'" class="meal-overview">
            <div class="meal-ring-container">
              <svg class="meal-ring" viewBox="0 0 120 120">
                <!-- 背景圆 -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E8E1D6" stroke-width="12" />

                <!-- 早餐 (0-120度) -->
                <circle cx="60" cy="60" r="50" fill="none" :stroke="hasMealType('breakfast') ? '#C9B89C' : '#E8E1D6'"
                  stroke-width="12" stroke-dasharray="104.7 314.1" stroke-dashoffset="0" class="meal-segment"
                  :class="{ active: hasMealType('breakfast') }" />

                <!-- 午餐 (120-240度) -->
                <circle cx="60" cy="60" r="50" fill="none" :stroke="hasMealType('lunch') ? '#9DB4A0' : '#E8E1D6'"
                  stroke-width="12" stroke-dasharray="104.7 314.1" stroke-dashoffset="-104.7" class="meal-segment"
                  :class="{ active: hasMealType('lunch') }" />

                <!-- 晚餐 (240-360度) -->
                <circle cx="60" cy="60" r="50" fill="none" :stroke="hasMealType('dinner') ? '#FF9A76' : '#E8E1D6'"
                  stroke-width="12" stroke-dasharray="104.7 314.1" stroke-dashoffset="-209.4" class="meal-segment"
                  :class="{ active: hasMealType('dinner') }" />
              </svg>

              <div class="meal-ring-center">
                <div class="ring-center-text">
                  <span class="calories-value">{{ mealData.calories }}</span>
                  <span class="calories-unit">卡</span>
                </div>
              </div>
            </div>

            <div class="meal-legend">
              <div class="legend-item">
                <span class="legend-dot" :class="{ active: hasMealType('breakfast') }"></span>
                <span class="legend-label">早餐</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" :class="{ active: hasMealType('lunch') }"></span>
                <span class="legend-label">午餐</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" :class="{ active: hasMealType('dinner') }"></span>
                <span class="legend-label">晚餐</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">—</span>
            <span class="empty-text">未记录</span>
          </div>
        </div>
      </div>

      <!-- 运动情况 - 甜甜圈图表 -->
      <div class="overview-section">
        <div class="section-header">
          <span class="section-icon">💪</span>
          <span class="section-title">运动情况</span>
        </div>
        <div class="section-content">
          <div v-if="exerciseStatus === 'completed'" class="exercise-overview">
            <div class="exercise-donut-container">
              <svg class="exercise-donut" viewBox="0 0 120 120">
                <!-- 背景圆 -->
                <circle cx="60" cy="60" r="45" fill="none" stroke="#E8E1D6" stroke-width="12" />

                <!-- 进度圆 -->
                <circle cx="60" cy="60" r="45" fill="none" stroke="url(#donutGradient)" stroke-width="12"
                  :stroke-dasharray="`${exerciseDonutLength} 282.7`" stroke-linecap="round" class="exercise-progress" />

                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#9DB4A0;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8FA591;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>

              <div class="donut-center">
                <div class="donut-percent">{{ exerciseProgressPercent.toFixed(0) }}%</div>
                <div class="donut-label">完成度</div>
              </div>
            </div>

            <div class="exercise-stats">
              <div class="stat-box">
                <span class="stat-number">{{ exerciseData.calories }}</span>
                <span class="stat-unit">卡</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ exerciseData.duration }}</span>
                <span class="stat-unit">分钟</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ recommendedCalories }}</span>
                <span class="stat-unit">目标卡</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">—</span>
            <span class="empty-text">未记录</span>
          </div>
        </div>
      </div>

      <!-- 睡眠情况 - 可视化睡眠时间 -->
      <div class="overview-section">
        <div class="section-header">
          <span class="section-icon">😴</span>
          <span class="section-title">睡眠情况</span>
        </div>
        <div class="section-content">
          <div v-if="sleepStatus === 'completed'" class="sleep-overview">
            <div class="sleep-timeline">
              <div class="timeline-item">
                <span class="timeline-label">入睡</span>
                <span class="timeline-time">{{ formatSleepTime(sleepStartTime) }}</span>
              </div>
              <div class="timeline-arrow">→</div>
              <div class="timeline-item">
                <span class="timeline-label">起床</span>
                <span class="timeline-time">{{ formatSleepTime(wakeUpTime) }}</span>
              </div>
            </div>

            <div class="sleep-info">
              <div class="sleep-item">
                <span class="sleep-label">睡眠时长</span>
                <span class="sleep-value">{{ sleepHours }}h {{ sleepMinutes }}m</span>
              </div>
              <div class="sleep-item">
                <span class="sleep-label">睡眠质量</span>
                <span class="sleep-quality" :class="sleepQualityClass">{{ sleepData.quality }}/100</span>
              </div>
              <div class="sleep-status-badge" :class="sleepStatusClass">
                {{ sleepStatusText }}
              </div>
            </div>

          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">—</span>
            <span class="empty-text">未记录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速导航按钮 -->
    <div class="quick-nav-section">
      <button class="nav-btn" @click="emit('refresh')" title="刷新所有数据">
        <span class="nav-text">刷新数据</span>
      </button>
    </div>

    <!-- AI 总结卡片 -->
    <AISummaryPanel :ai-summary="aiSummary" :loading="aiLoading" :error="aiError" @retry="emit('retry-ai-summary')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AISummaryPanel from './AISummaryPanel.vue'

interface AISummaryData {
  exercise_ai_summary: string | null
  meal_ai_summary: string | null
  sleep_ai_summary: string | null
  total_ai_summary: string | null
  updated_flags?: {
    exercise: boolean
    meal: boolean
    sleep: boolean
    total: boolean
  }
}

interface MealData {
  calories: number
  protein: number
}

interface ExerciseData {
  duration: number
  calories: number
}

interface SleepData {
  duration: number
  quality: number
  sleep_start_time?: string
  wake_up_time?: string
}

interface MealRecord {
  meal_type: string
  [key: string]: any
}

interface SleepRecord {
  sleep_start_time: string
  wake_up_time: string
  [key: string]: any
}

interface Props {
  selectedDate: string
  completedCount: number
  totalCount: number
  exerciseStatus: 'completed' | 'none'
  exerciseData: ExerciseData
  mealStatus: 'completed' | 'none'
  mealData: MealData
  mealRecords?: MealRecord[]
  sleepStatus: 'completed' | 'none'
  sleepData: SleepData
  sleepRecords?: SleepRecord[]
  aiSummary?: AISummaryData | null
  aiLoading?: boolean
  aiError?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  totalCount: 3,
  aiLoading: false,
  aiError: null,
  mealRecords: () => [],
  sleepRecords: () => []
})

const emit = defineEmits<{
  'date-change': [date: string]
  'today': []
  'refresh': []
  'retry-ai-summary': []
}>()

// 推荐每日卡路里消耗（假设为 2000 卡）
const recommendedCalories = 2000

// 计算运动卡路里进度百分比
const exerciseProgressPercent = computed(() => {
  const percent = (props.exerciseData.calories / recommendedCalories) * 100
  return Math.min(percent, 100)
})

// 计算甜甜圈图表的进度（周长）
const exerciseDonutLength = computed(() => {
  const maxLength = 282.7
  const length = (exerciseProgressPercent.value / 100) * maxLength
  return length
})

// 检查是否有某个时段的饭
const hasMealType = (type: string): boolean => {
  return props.mealRecords?.some(meal =>
    meal.meal_type?.toLowerCase().includes(type.toLowerCase())
  ) ?? false
}

// 获取第一条睡眠记录
const firstSleepRecord = computed(() => {
  if (!props.sleepRecords || props.sleepRecords.length === 0) {
    return null
  }
  
  // 选择睡眠时长最长的记录
  return props.sleepRecords.reduce((longest, current) => {
    const currentDuration = calculateSleepDuration(current)
    const longestDuration = calculateSleepDuration(longest)
    return currentDuration > longestDuration ? current : longest
  })
})

// 计算单条睡眠记录的时长
const calculateSleepDuration = (record: SleepRecord): number => {
  if (!record.sleep_start_time || !record.wake_up_time) {
    return 0
  }
  
  const start = new Date(record.sleep_start_time)
  const end = new Date(record.wake_up_time)
  const durationMs = end.getTime() - start.getTime()
  
  return durationMs / (1000 * 60 * 60)
}

// 提取睡眠开始和结束时间
const sleepStartTime = computed(() => {
  return firstSleepRecord.value?.sleep_start_time || props.sleepData.sleep_start_time || ''
})

const wakeUpTime = computed(() => {
  return firstSleepRecord.value?.wake_up_time || props.sleepData.wake_up_time || ''
})

// 根据 sleep_start_time 和 wake_up_time 计算睡眠时长（小时）
const calculatedSleepDuration = computed(() => {
  if (!sleepStartTime.value || !wakeUpTime.value) {
    return props.sleepData.duration || 0
  }

  const start = new Date(sleepStartTime.value)
  const end = new Date(wakeUpTime.value)
  const durationMs = end.getTime() - start.getTime()

  // 转换为小时
  return durationMs / (1000 * 60 * 60)
})

// 计算睡眠小时和分钟（基于计算的时长）
const sleepHours = computed(() => Math.floor(calculatedSleepDuration.value))
const sleepMinutes = computed(() => Math.round((calculatedSleepDuration.value % 1) * 60))

// 判断睡眠是否充足（>=7小时为充足）
const isSleepSufficient = computed(() => calculatedSleepDuration.value >= 7)

// 睡眠质量等级
const sleepQualityClass = computed(() => {
  const quality = props.sleepData.quality
  if (quality >= 80) return 'excellent'
  if (quality >= 60) return 'good'
  return 'fair'
})

// 睡眠状态文本和类
const sleepStatusClass = computed(() => {
  return isSleepSufficient.value ? 'sufficient' : 'insufficient'
})

const sleepStatusText = computed(() => {
  return isSleepSufficient.value ? '睡眠充足' : '睡眠不足'
})

// 格式化睡眠时间显示 (HH:MM)
const formatSleepTime = (timeStr: string): string => {
  if (!timeStr) return '--:--'
  try {
    const date = new Date(timeStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return '--:--'
  }
}
</script>

<style lang="scss" scoped src="@/scss/components/dailyCheckinView/DailyLeftPanel.scss"></style>
