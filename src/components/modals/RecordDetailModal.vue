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
            <div v-if="exerciseRecord.evaluation" class="detail-item full-width ai-section">
              <span class="detail-label">AI 评价</span>
              <p class="detail-value">{{ exerciseRecord.evaluation }}</p>
            </div>
            <div v-if="exerciseRecord.suggestion" class="detail-item full-width ai-section">
              <span class="detail-label">AI 建议</span>
              <p class="detail-value">{{ exerciseRecord.suggestion }}</p>
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
              <span class="detail-value">{{ formatDateTime(mealRecord.meal_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">来源</span>
              <span class="detail-value">{{ mealRecord.food_source }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">热量</span>
              <span class="detail-value">{{ mealRecord.calories }} kcal</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">蛋白质</span>
              <span class="detail-value">{{ mealRecord.protein_g }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">脂肪</span>
              <span class="detail-value">{{ mealRecord.fat_g }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">碳水化合物</span>
              <span class="detail-value">{{ mealRecord.carbohydrate_g }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">纤维</span>
              <span class="detail-value">{{ mealRecord.fiber_g }} g</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">糖分</span>
              <span class="detail-value">{{ mealRecord.sugar_g }} g</span>
            </div>
            <div v-if="mealRecord.food_detail" class="detail-item full-width">
              <span class="detail-label">备注</span>
              <p class="detail-value">{{ mealRecord.food_detail }}</p>
            </div>
            <div v-if="mealRecord.evaluation" class="detail-item full-width ai-section">
              <span class="detail-label">AI 评价</span>
              <p class="detail-value">{{ mealRecord.evaluation }}</p>
            </div>
            <div v-if="mealRecord.suggestion" class="detail-item full-width ai-section">
              <span class="detail-label">AI 建议</span>
              <p class="detail-value">{{ mealRecord.suggestion }}</p>
            </div>
          </div>

          <!-- 睡眠记录详情 -->
          <div v-if="recordType === 'sleep' && sleepRecord" class="detail-section">
            <div class="detail-item">
              <span class="detail-label">入睡时间</span>
              <span class="detail-value">{{ formatDateTime(sleepRecord.sleep_start_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">醒来时间</span>
              <span class="detail-value">{{ formatDateTime(sleepRecord.wake_up_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">睡眠时长</span>
              <span class="detail-value">{{ sleepRecord.sleep_duration_hours }} 小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">睡眠质量</span>
              <span class="detail-value quality-badge" :class="`quality-${getQualityLevel(sleepRecord.sleep_quality_score)}`">
                {{ getQualityText(sleepRecord.sleep_quality_score) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">质量评分</span>
              <span class="detail-value">{{ sleepRecord.sleep_quality_score }} / 100</span>
            </div>
            <div v-if="sleepRecord.note" class="detail-item full-width">
              <span class="detail-label">备注</span>
              <p class="detail-value">{{ sleepRecord.note }}</p>
            </div>
            <div v-if="sleepRecord.evaluation" class="detail-item full-width ai-section">
              <span class="detail-label">AI 评价</span>
              <p class="detail-value">{{ sleepRecord.evaluation }}</p>
            </div>
            <div v-if="sleepRecord.suggestion" class="detail-item full-width ai-section">
              <span class="detail-label">AI 建议</span>
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
  evaluation?: string | null
  suggestion?: string | null
}

interface MealRecord {
  meal_record_id?: string
  food_name: string
  meal_time: string
  amount: number
  food_source: string
  unit: string
  calories: number
  protein_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  carbohydrate_g: number
  food_detail?: string
  suggestion?: string | null
  evaluation?: string | null
}

interface SleepRecord {
  sleep_record_id?: string
  sleep_start_time: string
  wake_up_time: string
  sleep_duration_hours: number
  sleep_quality_score: number
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
console.log('props:', props)
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

<style lang="scss" scoped src="@/scss/components/modals/RecordDetailModal.scss"></style>
