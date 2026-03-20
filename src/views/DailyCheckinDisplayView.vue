<template>
  <div class="display-page">
    <AppHeader v-if="displayData"/>

    <main class="display-content" v-if="displayData">
      <!-- 基础数据可视化 -->
      <section class="viz-section">
        <div class="stat-visual">
          <div class="stat-box weight">
            <div class="stat-icon">⚖️</div>
            <div class="stat-text">体重</div>
            <div class="stat-main">{{ displayData.body_weight_kg }}</div>
            <div class="stat-unit">kg</div>
          </div>
          <div class="stat-box sleep">
            <div class="stat-icon">😴</div>
            <div class="stat-text">睡眠</div>
            <div class="stat-main">{{ displayData.sleep_duration_hours }}</div>
            <div class="stat-unit">小时</div>
          </div>
          <div class="stat-box exercise">
            <div class="stat-icon">💪</div>
            <div class="stat-text">运动</div>
            <div class="stat-main">{{ displayData.exercise_duration_min }}</div>
            <div class="stat-unit">分钟</div>
          </div>
          <div class="stat-box water">
            <div class="stat-icon">💧</div>
            <div class="stat-text">饮水</div>
            <div class="stat-main">{{ displayData.water_intake_ml }}</div>
            <div class="stat-unit">ml</div>
          </div>
        </div>
      </section>

      <!-- 能量可视化 -->
      <section class="viz-section">
        <div class="energy-visual">
          <div class="energy-chart">
            <div class="energy-bar-group">
              <div class="energy-label">摄入</div>
              <div class="energy-bar intake-bar" :style="{ height: getEnergyHeight(displayData.total_calories_intake, maxCalories) }">
                <span class="energy-value">{{ displayData.total_calories_intake }}</span>
              </div>
              <div class="energy-amount">kcal</div>
            </div>
            <div class="energy-bar-group">
              <div class="energy-label">消耗</div>
              <div class="energy-bar burned-bar" :style="{ height: getEnergyHeight(displayData.total_calories_burned, maxCalories) }">
                <span class="energy-value">{{ displayData.total_calories_burned }}</span>
              </div>
              <div class="energy-amount">kcal</div>
            </div>
            <div class="balance-indicator" :class="calorieBalance > 0 ? 'surplus' : 'deficit'">
              <div class="balance-label">{{ calorieBalance > 0 ? '盈余' : '赤字' }}</div>
              <div class="balance-value">{{ Math.abs(calorieBalance) }}</div>
              <div class="balance-unit">kcal</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 健康状态可视化 -->
      <section class="viz-section">
        <div class="health-visual">
          <div class="health-item">
            <div class="health-circle sleep-quality">{{ getSleepQualityEmoji(displayData.sleep_quality) }}</div>
            <div class="health-label">睡眠</div>
            <div class="health-value">{{ getSleepQualityText(displayData.sleep_quality) }}</div>
          </div>
          <div class="health-item">
            <div class="health-circle mood">{{ getMoodEmoji(displayData.mood) }}</div>
            <div class="health-label">心情</div>
            <div class="health-value">{{ getMoodText(displayData.mood) }}</div>
          </div>
          <div class="health-item">
            <div class="health-circle energy">{{ getEnergyEmoji(displayData.energy_level) }}</div>
            <div class="health-label">精力</div>
            <div class="health-value">{{ displayData.energy_level }}/5</div>
          </div>
          <div class="health-item">
            <div class="health-circle time">🕐</div>
            <div class="health-label">睡眠时间</div>
            <div class="health-value">{{ displayData.sleep_start_time }}</div>
          </div>
        </div>
      </section>

      <!-- 饮食可视化 -->
      <section v-if="hasMeals" class="viz-section">
        <div class="meal-visual">
          <div v-if="displayData.breakfast" class="meal-item">
            <div class="meal-time">🌅</div>
            <div class="meal-name">早餐</div>
            <div class="meal-detail">{{ displayData.breakfast }}</div>
          </div>
          <div v-if="displayData.lunch" class="meal-item">
            <div class="meal-time">☀️</div>
            <div class="meal-name">午餐</div>
            <div class="meal-detail">{{ displayData.lunch }}</div>
          </div>
          <div v-if="displayData.dinner" class="meal-item">
            <div class="meal-time">🌙</div>
            <div class="meal-name">晚餐</div>
            <div class="meal-detail">{{ displayData.dinner }}</div>
          </div>
          <div v-if="displayData.midnight_snack" class="meal-item">
            <div class="meal-time">🌃</div>
            <div class="meal-name">宵夜</div>
            <div class="meal-detail">{{ displayData.midnight_snack }}</div>
          </div>
        </div>
      </section>

      <!-- AI分析可视化 -->
      <section v-if="displayData.ai_analysis_summary" class="viz-section">
        <div class="ai-visual">
          <div class="ai-icon">🤖</div>
          <div class="ai-text">{{ displayData.ai_analysis_summary }}</div>
        </div>
      </section>

      <!-- 备注可视化 -->
      <section v-if="displayData.note" class="viz-section">
        <div class="note-visual">
          <div class="note-icon">📝</div>
          <div class="note-text">{{ displayData.note }}</div>
        </div>
      </section>
    </main>

    <footer class="display-footer">
      <button @click="goToEdit" class="edit-btn-large">编辑这个打卡</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDailyCheckin } from '../composables/useDailyCheckin'

const router = useRouter()

const {
  displayData,
  loadDailyCheckin
} = useDailyCheckin()

const maxCalories = 3000

// const formatDate = (dateStr: string) => {
//   const date = new Date(dateStr + 'T00:00:00')
//   return date.toLocaleDateString('zh-CN', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     weekday: 'long'
//   }).replace(/\//g, '-')
// }

const getEnergyHeight = (calories: number, max: number) => {
  return Math.min((calories / max) * 100, 100) + '%'
}

const calorieBalance = computed(() => {
  if (!displayData.value) return 0
  return displayData.value.total_calories_intake - displayData.value.total_calories_burned
})

const hasMeals = computed(() => {
  if (!displayData.value) return false
  return !!(displayData.value.breakfast || displayData.value.lunch || displayData.value.dinner || displayData.value.midnight_snack)
})

// 睡眠质量映射
const sleepQualityMap = {
  excellent: { emoji: '😴', text: '很好' },
  good: { emoji: '😊', text: '良好' },
  fair: { emoji: '😐', text: '一般' },
  poor: { emoji: '😫', text: '很差' }
}

const getSleepQualityEmoji = (value: string) => sleepQualityMap[value as keyof typeof sleepQualityMap]?.emoji || '❓'
const getSleepQualityText = (value: string) => sleepQualityMap[value as keyof typeof sleepQualityMap]?.text || value

// 心情映射
const moodMap = {
  very_happy: { emoji: '😄', text: '很开心' },
  happy: { emoji: '😊', text: '开心' },
  neutral: { emoji: '😐', text: '平常' },
  sad: { emoji: '😔', text: '有点低落' },
  very_sad: { emoji: '😠', text: '很沮丧' }
}

const getMoodEmoji = (value: string) => moodMap[value as keyof typeof moodMap]?.emoji || '❓'
const getMoodText = (value: string) => moodMap[value as keyof typeof moodMap]?.text || value

// 精力水平映射
const getEnergyEmoji = (level: number) => {
  if (level >= 5) return '⚡'
  if (level >= 4) return '👍'
  if (level >= 3) return '➡️'
  if (level >= 2) return '😴'
  return '🔋'
}

const goToEdit = () => {
  router.push('/health/daily-checkin-edit')
}

onMounted(() => {
  loadDailyCheckin()
})
</script>

<style src="../css/DailyCheckinDisplay.css"></style>
