<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ recordType === 'exercise' ? '🏃 运动详情' : recordType === 'meal' ? '🍽️ 饮食详情' : '😴 睡眠详情' }}</h2>
          <button class="modal-close" @click="close">✕</button>
        </div>

        <div class="modal-body">
          <!-- 运动记录详情 -->
          <div v-if="recordType === 'exercise' && exerciseRecord" class="detail-section">
            <div class="detail-item">
              <span class="detail-label">运动类型</span>
              <span class="detail-value">{{ exerciseRecord.activity_type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">开始时间</span>
              <span class="detail-value">{{ formatDateTime(exerciseRecord.start_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结束时间</span>
              <span class="detail-value">{{ formatDateTime(exerciseRecord.end_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">运动时长</span>
              <span class="detail-value">{{ exerciseRecord.duration_min }} 分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">强度等级</span>
              <span class="detail-value" :class="`intensity-${exerciseRecord.intensity}`">
                {{ getIntensityText(exerciseRecord.intensity) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">消耗热量</span>
              <span class="detail-value">{{ exerciseRecord.calories_burned }} kcal</span>
            </div>
            <div v-if="exerciseRecord.note" class="detail-item full-width">
              <span class="detail-label">备注</span>
              <p class="detail-value">{{ exerciseRecord.note }}</p>
            </div>
          </div>

          <!-- 饮食记录详情 -->
          <div v-if="recordType === 'meal' && mealRecord" class="detail-section">
            <div class="detail-item">
              <span class="detail-label">食物名称</span>
              <span class="detail-value">{{ mealRecord.food_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">摄入时间</span>
              <span class="detail-value">{{ formatDateTime(mealRecord.intake_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">摄入量</span>
              <span class="detail-value">{{ mealRecord.amount }} {{ mealRecord.unit }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">热量</span>
              <span class="detail-value">{{ mealRecord.calories }} kcal</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">蛋白质</span>
              <span class="detail-value">{{ mealRecord.protein }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">脂肪</span>
              <span class="detail-value">{{ mealRecord.fat }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">碳水化合物</span>
              <span class="detail-value">{{ mealRecord.carbs }} g</span>
            </div>
            <div v-if="mealRecord.note" class="detail-item full-width">
              <span class="detail-label">备注</span>
              <p class="detail-value">{{ mealRecord.note }}</p>
            </div>
            <div v-if="mealRecord.evaluation" class="detail-item full-width ai-section">
              <span class="detail-label">🤖 AI 评价</span>
              <p class="detail-value">{{ mealRecord.evaluation }}</p>
            </div>
            <div v-if="mealRecord.suggestion" class="detail-item full-width ai-section">
              <span class="detail-label">💡 AI 建议</span>
              <p class="detail-value">{{ mealRecord.suggestion }}</p>
            </div>
          </div>

          <!-- 睡眠记录详情 -->
          <div v-if="recordType === 'sleep' && sleepRecord" class="detail-section">
            <div class="detail-item">
              <span class="detail-label">入睡时间</span>
              <span class="detail-value">{{ formatDateTime(sleepRecord.sleep_start) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">醒来时间</span>
              <span class="detail-value">{{ formatDateTime(sleepRecord.sleep_end) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">睡眠时长</span>
              <span class="detail-value">{{ sleepRecord.sleep_duration }} 小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">睡眠质量</span>
              <span class="detail-value quality-badge" :class="`quality-${getQualityLevel(sleepRecord.sleep_quality)}`">
                {{ getQualityText(sleepRecord.sleep_quality) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">质量评分</span>
              <span class="detail-value">{{ sleepRecord.sleep_quality }} / 10</span>
            </div>
            <div v-if="sleepRecord.note" class="detail-item full-width">
              <span class="detail-label">备注</span>
              <p class="detail-value">{{ sleepRecord.note }}</p>
            </div>
            <div v-if="sleepRecord.evaluation" class="detail-item full-width ai-section">
              <span class="detail-label">🤖 AI 评价</span>
              <p class="detail-value">{{ sleepRecord.evaluation }}</p>
            </div>
            <div v-if="sleepRecord.suggestion" class="detail-item full-width ai-section">
              <span class="detail-label">💡 AI 建议</span>
              <p class="detail-value">{{ sleepRecord.suggestion }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="close">关闭</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'

interface ExerciseRecord {
  exercise_record_id?: string
  activity_type: string
  start_time: string
  end_time: string
  duration_min: number
  intensity: 'low' | 'medium' | 'high'
  calories_burned: number
  note?: string
}

interface MealRecord {
  meal_record_id?: string
  food_name: string
  intake_time: string
  amount: number
  unit: string
  calories: number
  protein: number
  fat: number
  carbs: number
  note?: string
  suggestion?: string | null
  evaluation?: string | null
}

interface SleepRecord {
  sleep_record_id?: string
  sleep_start: string
  sleep_end: string
  sleep_duration: number
  sleep_quality: number
  note?: string
  suggestion?: string | null
  evaluation?: string | null
}

interface Props {
  visible: boolean
  recordType?: 'exercise' | 'meal' | 'sleep'
  record?: ExerciseRecord | MealRecord | SleepRecord | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  recordType: 'exercise',
  record: null
})

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const exerciseRecord = computed(() => {
  return props.recordType === 'exercise' ? (props.record as ExerciseRecord) : null
})

const mealRecord = computed(() => {
  return props.recordType === 'meal' ? (props.record as MealRecord) : null
})

const sleepRecord = computed(() => {
  return props.recordType === 'sleep' ? (props.record as SleepRecord) : null
})

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getIntensityText = (intensity: string) => {
  const map: Record<string, string> = {
    low: '低强度',
    medium: '中强度',
    high: '高强度'
  }
  return map[intensity] || intensity
}

const getQualityLevel = (quality: number) => {
  if (quality >= 8) return 'excellent'
  if (quality >= 6) return 'good'
  if (quality >= 4) return 'fair'
  return 'poor'
}

const getQualityText = (quality: number) => {
  if (quality >= 8) return '优秀'
  if (quality >= 6) return '良好'
  if (quality >= 4) return '一般'
  return '较差'
}

// 防止滚动
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}, { immediate: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #2c3e50;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item.full-width {
  grid-template-columns: 1fr;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 13px;
}

.detail-value {
  color: #2c3e50;
  font-size: 14px;
  word-break: break-word;
}

.detail-value.intensity-low,
.detail-value.intensity-medium,
.detail-value.intensity-high {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.detail-value.intensity-low {
  background: #e3f2fd;
  color: #1976d2;
}

.detail-value.intensity-medium {
  background: #fff3e0;
  color: #f57c00;
}

.detail-value.intensity-high {
  background: #ffebee;
  color: #d32f2f;
}

.quality-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.quality-badge.quality-excellent {
  background: #e8f5e9;
  color: #2e7d32;
}

.quality-badge.quality-good {
  background: #e3f2fd;
  color: #1976d2;
}

.quality-badge.quality-fair {
  background: #fff3e0;
  color: #f57c00;
}

.quality-badge.quality-poor {
  background: #ffebee;
  color: #d32f2f;
}

.ai-section {
  border-left: 3px solid #ff9800 !important;
  background: #fff8f0 !important;
}

.ai-section .detail-label {
  color: #ff9800;
  font-weight: 700;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e0e0e0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .modal-title {
    font-size: 16px;
  }

  .detail-item {
    grid-template-columns: 80px 1fr;
    gap: 8px;
    padding: 8px;
  }

  .detail-label {
    font-size: 12px;
  }

  .detail-value {
    font-size: 13px;
  }
}
</style>
