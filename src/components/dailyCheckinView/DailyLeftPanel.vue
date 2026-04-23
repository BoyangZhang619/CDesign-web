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

<style scoped>
.daily-left-panel {
  flex: 5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 今日概览卡片 */
.overview-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
}

.overview-header {
  margin-bottom: 12px;
}

.overview-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

/* 各个章节 */
.overview-section {
  padding: 12px 0;
  border-bottom: 1px solid #E1D9D0;
}

.overview-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #5A7A87;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  color: #9DB4A0;
  font-size: 12px;
}

.empty-icon {
  font-size: 20px;
}

.empty-text {
  font-weight: 500;
}

/* ========== 饮食情况 - 三等分圆环 ========== */
.meal-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-ring-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 140px;
}

.meal-ring {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

.meal-segment {
  transition: stroke 0.3s ease;
  transform-origin: 60px 60px;
}

.meal-segment.active {
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.1));
}

.meal-ring-center {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ring-center-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.calories-value {
  font-size: 20px;
  font-weight: 700;
  color: #5A7A87;
}

.calories-unit {
  font-size: 11px;
  color: #8B9FA0;
  font-weight: 500;
}

.meal-legend {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: white;
  border-radius: 6px;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  flex: 1;
  justify-content: center;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E8E1D6;
  transition: background 0.3s ease;
}

.legend-dot:nth-child(1) {
  background: #C9B89C;
}

.legend-item:nth-child(2) .legend-dot {
  background: #E8E1D6;
}

.legend-item:nth-child(2) .legend-dot.active {
  background: #9DB4A0;
}

.legend-item:nth-child(3) .legend-dot {
  background: #E8E1D6;
}

.legend-item:nth-child(3) .legend-dot.active {
  background: #FF9A76;
}

.legend-label {
  color: #5A7A87;
  font-weight: 500;
}

/* ========== 运动情况 - 甜甜圈图表 ========== */
.exercise-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-donut-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 140px;
}

.exercise-donut {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
  transform: rotate(-90deg);
}

.exercise-progress {
  transition: stroke-dasharray 0.3s ease;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.donut-percent {
  font-size: 22px;
  font-weight: 700;
  color: #9DB4A0;
}

.donut-label {
  font-size: 10px;
  color: #8B9FA0;
  font-weight: 500;
  margin-top: 2px;
}

.exercise-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.stat-number {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
}

.stat-unit {
  font-size: 10px;
  color: #8B9FA0;
  margin-top: 2px;
  font-weight: 500;
}

/* ========== 睡眠情况 - 时间轴 ========== */
.sleep-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sleep-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 6px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.timeline-label {
  font-size: 11px;
  color: #8B9FA0;
  font-weight: 500;
}

.timeline-time {
  font-size: 13px;
  font-weight: 700;
  color: #5A7A87;
}

.timeline-arrow {
  font-size: 16px;
  color: #8B9FA0;
  margin: 0 8px;
  font-weight: 600;
}

.sleep-info {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 8px;
}

.sleep-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  font-size: 12px;
}

.sleep-label {
  color: #5A7A87;
  font-weight: 500;
}

.sleep-value {
  font-weight: 700;
  color: #5A7A87;
}

.sleep-quality {
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.sleep-quality.excellent {
  color: #9DB4A0;
  background: #E8F5E9;
}

.sleep-quality.good {
  color: #C9B89C;
  background: #F5E8D8;
}

.sleep-quality.fair {
  color: #D4A5A8;
  background: #F5E8E8;
}

.sleep-status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 22px;
}

.sleep-status-badge.sufficient {
  background: #E8F5E9;
  color: #9DB4A0;
}

.sleep-status-badge.insufficient {
  background: #F5E8E8;
  color: #D4A5A8;
}

/* 快速导航按钮 */
.quick-nav-section {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
}

.nav-btn {
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.3);
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-weight: 600;
}


.section-content {
  padding: 0 12px;
}


/* 响应式布局 */
@media (max-width: 1024px) {
  .daily-left-panel {
    gap: 12px;
  }

  .overview-card {
    padding: 12px;
  }

  .section-content {
    padding: 0 8px;
  }

  .meal-ring-container,
  .exercise-donut-container {
    height: 120px;
  }

  .meal-ring,
  .exercise-donut {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 768px) {
  .daily-left-panel {
    gap: 12px;
  }

  .overview-card {
    padding: 12px;
  }

  .overview-title {
    font-size: 14px;
  }

  .section-title {
    font-size: 12px;
  }

  .meal-ring-container,
  .exercise-donut-container {
    height: 110px;
  }

  .meal-ring,
  .exercise-donut {
    width: 90px;
    height: 90px;
  }

  .meal-ring-center,
  .donut-center {
    width: 65px;
    height: 65px;
  }

  .calories-value,
  .donut-percent {
    font-size: 18px;
  }

  .exercise-stats {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.today-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.today-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(90, 122, 135, 0.3);
}

.today-btn:active {
  transform: translateY(0);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff8;
  border: 1px solid rgba(90, 122, 135, 0.15);
  border-radius: 12px;
}

.summary-header {
  margin: 0;
}

.summary-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.quick-nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #5A7A87;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  border-color: #5A7A87;
  background: linear-gradient(135deg, rgba(90, 122, 135, 0.05) 0%, rgba(90, 122, 135, 0.02) 100%);
  transform: translateY(-2px);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-weight: 600;
}

@media (max-width: 768px) {
  .daily-left-panel {
    padding-bottom: 15px;
  }

}
</style>
