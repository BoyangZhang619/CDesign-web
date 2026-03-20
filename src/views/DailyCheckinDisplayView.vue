<template>
  <div class="display-page">
    <header class="display-header" v-if="displayData">
      <h1>{{ formatDate(displayData.date) }}</h1>
      <button @click="goToEdit" class="edit-btn">✏️ 编辑</button>
    </header>

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
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDailyCheckin } from '../composables/useDailyCheckin'

const router = useRouter()

const {
  displayData,
  loadDailyCheckin
} = useDailyCheckin()

const maxCalories = 3000

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  }).replace(/\//g, '-')
}

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
  const today = new Date().toISOString().split('T')[0]
  loadDailyCheckin(today)
})
</script>

<style scoped>
.display-page {
  background: linear-gradient(135deg, #fafaf9 0%, #f5f5f5 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.display-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.display-header h1 {
  font-size: 24px;
  color: #2d2d2a;
  margin: 0;
  font-weight: 600;
}

.edit-btn {
  background: #d8a88f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(216, 168, 143, 0.3);
}

.display-content {
  flex: 1;
  padding: 20px 16px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.viz-section {
  margin-bottom: 20px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 基础数据可视化 */
.stat-visual {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat-box {
  aspect-ratio: 1;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-box.weight {
  background: linear-gradient(135deg, #d8a88f, #c89678);
}

.stat-box.sleep {
  background: linear-gradient(135deg, #8fb3d4, #7a9cbf);
}

.stat-box.exercise {
  background: linear-gradient(135deg, #a8d48f, #94c176);
}

.stat-box.water {
  background: linear-gradient(135deg, #8fd4d4, #7abfbf);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-text {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-main {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-unit {
  font-size: 11px;
  opacity: 0.8;
}

/* 能量可视化 */
.energy-visual {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.energy-chart {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: flex-end;
}

.energy-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.energy-label {
  font-size: 12px;
  color: #7a7a77;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
}

.energy-bar {
  width: 60px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  min-height: 40px;
}

.energy-bar.intake-bar {
  background: linear-gradient(to top, #d8a88f, #e8bfa5);
}

.energy-bar.burned-bar {
  background: linear-gradient(to top, #8fb3d4, #a5c5e0);
}

.energy-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  padding-bottom: 4px;
}

.energy-amount {
  font-size: 11px;
  color: #7a7a77;
  margin-top: 4px;
}

.balance-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 12px;
}

.balance-indicator.surplus {
  background: linear-gradient(135deg, #d8a88f15, #d8a88f30);
  border: 2px solid #d8a88f;
}

.balance-indicator.deficit {
  background: linear-gradient(135deg, #8fb3d415, #8fb3d430);
  border: 2px solid #8fb3d4;
}

.balance-label {
  font-size: 11px;
  color: #7a7a77;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 24px;
  font-weight: 600;
  color: #2d2d2a;
}

.balance-unit {
  font-size: 10px;
  color: #7a7a77;
  margin-top: 2px;
}

/* 健康状态可视化 */
.health-visual {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.health-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.health-circle {
  font-size: 40px;
  margin-bottom: 8px;
  line-height: 1;
}

.health-label {
  font-size: 11px;
  color: #7a7a77;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.health-value {
  font-size: 14px;
  font-weight: 600;
  color: #2d2d2a;
}

/* 饮食可视化 */
.meal-visual {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.meal-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #d8a88f;
}

.meal-time {
  font-size: 24px;
  margin-bottom: 8px;
}

.meal-name {
  font-size: 12px;
  color: #7a7a77;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.meal-detail {
  font-size: 13px;
  color: #2d2d2a;
  font-weight: 500;
}

/* AI分析可视化 */
.ai-visual {
  background: linear-gradient(135deg, #d8a88f08, #8fb3d408);
  border: 1px solid #d8a88f30;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
}

.ai-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.ai-text {
  flex: 1;
  color: #2d2d2a;
  line-height: 1.6;
  font-size: 14px;
}

/* 备注可视化 */
.note-visual {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #8fb3d4;
  display: flex;
  gap: 16px;
}

.note-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.note-text {
  flex: 1;
  color: #2d2d2a;
  line-height: 1.6;
  font-size: 14px;
}

.display-footer {
  padding: 20px 16px;
  text-align: center;
}

.edit-btn-large {
  background: #d8a88f;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
}

.edit-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(216, 168, 143, 0.3);
}

@media (max-width: 768px) {
  .display-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .energy-chart {
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: stretch;
  }

  .energy-bar {
    height: 80px;
  }

  .stat-visual,
  .health-visual,
  .meal-visual {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
