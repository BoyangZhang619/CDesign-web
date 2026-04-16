<template>
  <section class="health-stats">
    <div class="stats-overview">
      <!-- 健康状态 -->
      <div class="stat-item">
        <div class="stat-icon" :class="healthStatusClass">
          {{ healthStatusEmoji }}
        </div>
        <div class="stat-text">
          <p class="stat-label">健康状态</p>
          <p class="stat-value">{{ healthStatus }}</p>
          <p v-if="healthLevel" class="stat-detail">评分: {{ healthLevel }}/100</p>
        </div>
      </div>
      <div class="stat-divider"></div>

      <!-- 完成度 -->
      <div class="stat-item">
        <div class="stat-icon completion-icon">
          ✓
        </div>
        <div class="stat-text">
          <p class="stat-label">档案完成度</p>
          <p class="stat-value">{{ completionPercentage }}%</p>
          <p v-if="!hasCompleteProfile" class="stat-detail">请完成健康档案</p>
          <p v-else class="stat-detail">档案已完成</p>
        </div>
      </div>

    </div>

      <div class="divider"></div>
    <!-- 信息卡片 (如果有完整档案) -->
    <div v-if="hasCompleteProfile && showDetailInfo" class="info-cards">
      <div class="info-grid">
        <!-- BMI 信息 -->
        <div class="info-item">
          <span class="info-label">BMI</span>
          <span class="info-value" :class="bmiCategoryClass">
            {{ bmi }}
            <span class="bmi-category">({{ bmiCategory }})</span>
          </span>
        </div>

        <!-- 年龄 -->
        <div class="info-item">
          <span class="info-label">年龄</span>
          <span class="info-value">{{ age }}岁</span>
        </div>

        <!-- 体重目标 -->
        <div v-if="weightDifference" class="info-item">
          <span class="info-label">体重差异</span>
          <span class="info-value" :class="weightDiffClass">
            {{ parseFloat(weightDifference) > 0 ? '+' : '' }}{{ weightDifference }}kg
          </span>
        </div>

        <!-- 活动水平 -->
        <div v-if="props.healthData?.activityLevel" class="info-item">
          <span class="info-label">活动水平</span>
          <span class="info-value">{{ activityLevelText }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type HealthData } from '../../../composables/useHealthData'

// 接收来自 LeftContent 的 health-data prop
const props = defineProps<{
  healthData?: HealthData
}>()

// 判断是否有完整档案
const hasCompleteProfile = computed(() => {
  return !!(
    props.healthData?.gender ||
    props.healthData?.birthday ||
    props.healthData?.height ||
    props.healthData?.currentWeight ||
    props.healthData?.targetWeight
  )
})

// 计算年龄
const age = computed(() => {
  if (!props.healthData?.birthday) return null
  const today = new Date()
  const birthDate = new Date(props.healthData.birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// 计算 BMI
const bmi = computed(() => {
  if (!props.healthData?.currentWeight || !props.healthData?.height) return null
  const heightInMeters = props.healthData.height / 100
  return (props.healthData.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
})

// 计算 BMI 等级
const bmiCategory = computed(() => {
  if (!bmi.value) return null
  const bmiNum = parseFloat(bmi.value)
  if (bmiNum < 18.5) return '偏瘦'
  if (bmiNum < 24.9) return '正常'
  if (bmiNum < 29.9) return '超重'
  return '肥胖'
})

// 计算体重差异
const weightDifference = computed(() => {
  if (!props.healthData?.currentWeight || !props.healthData?.targetWeight) return null
  return (props.healthData.currentWeight - props.healthData.targetWeight).toFixed(1)
})

// 计算健康等级
const healthLevel = computed(() => {
  if (!hasCompleteProfile.value) return 0

  let score = 0

  // 活动水平评分 (占 25 分)
  const activityScores: Record<string, number> = {
    'extremely-active': 25,
    'very-active': 20,
    'moderate': 15,
    'light': 10,
    'sedentary': 5
  }
  score += activityScores[props.healthData?.activityLevel || 'moderate'] || 15

  // BMI 评分 (占 25 分)
  if (bmiCategory.value === '正常') {
    score += 25
  } else if (bmiCategory.value === '偏瘦') {
    score += 20
  } else if (bmiCategory.value === '超重') {
    score += 15
  } else {
    score += 5
  }

  // 体重目标进度评分 (占 25 分)
  if (props.healthData?.currentWeight && props.healthData?.targetWeight) {
    const diff = Math.abs(props.healthData.currentWeight - props.healthData.targetWeight)
    if (diff === 0) score += 25
    else if (diff <= 2) score += 23
    else if (diff <= 5) score += 20
    else if (diff <= 10) score += 15
    else if (diff <= 20) score += 10
    else score += 5
  }

  // 健康目标评分 (占 25 分)
  score += (props.healthData?.healthGoals?.length || 0) > 0 ? 25 : 10

  // 睡眠习惯加分 (占 5 分)
  if (props.healthData?.sleepHabit) score += 5

  return Math.min(score, 100)
})

// 健康状态文本
const healthStatus = computed(() => {
  const level = healthLevel.value
  if (level === 0) return '未评估'
  if (level >= 80) return '优秀'
  if (level >= 60) return '良好'
  if (level >= 40) return '一般'
  return '需改善'
})

// 完成度百分比
const completionPercentage = computed(() => {
  let count = 0
  if (props.healthData?.gender) count++
  if (props.healthData?.birthday) count++
  if (props.healthData?.height) count++
  if (props.healthData?.currentWeight) count++
  if (props.healthData?.targetWeight) count++
  if (props.healthData?.sleepHabit) count++
  if (props.healthData?.activityLevel) count++
  return Math.round((count / 7) * 100)
})

// 健康状态 emoji
const healthStatusEmoji = computed(() => {
  const level = healthLevel.value
  if (level >= 80) return '🌟'
  if (level >= 60) return '😊'
  if (level >= 40) return '😐'
  return '😟'
})

const healthStatusClass = computed(() => {
  const level = healthLevel.value
  if (level >= 80) return 'excellent'
  if (level >= 60) return 'good'
  if (level >= 40) return 'fair'
  return 'poor'
})

// BMI 分类样式
const bmiCategoryClass = computed(() => {
  const category = bmiCategory.value
  if (category === '正常') return 'bmi-normal'
  if (category === '偏瘦') return 'bmi-light'
  if (category === '超重') return 'bmi-overweight'
  return 'bmi-obese'
})

// 体重差异样式
const weightDiffClass = computed(() => {
  if (!weightDifference.value) return ''
  const diff = parseFloat(weightDifference.value)
  if (diff > 0) return 'weight-above-target'
  if (diff < 0) return 'weight-below-target'
  return 'weight-on-target'
})

// 活动水平文本
const activityLevelText = computed(() => {
  const levels: Record<string, string> = {
    'sedentary': '久坐',
    'light': '轻度',
    'moderate': '中度',
    'very-active': '活跃',
    'extremely-active': '极活跃'
  }
  return levels[props.healthData?.activityLevel || ''] || '-'
})

const showDetailInfo = computed(() => hasCompleteProfile.value)
</script>

<style scoped>
.health-stats {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border-radius: 12px;
  padding: 20px;
  flex-direction: column;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  flex: 1;
  min-width: 150px;
}

.stat-icon {
  font-size: 28px;
  background: #E8F0ED;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* 健康状态等级颜色 */
.stat-icon.excellent {
  background: #E8F5E9;
  color: #2E7D32;
}

.stat-icon.good {
  background: #E3F2FD;
  color: #1565C0;
}

.stat-icon.fair {
  background: #FFF3E0;
  color: #E65100;
}

.stat-icon.poor {
  background: #FFEBEE;
  color: #C62828;
}

.stat-icon.completion-icon {
  background: #F3E5F5;
  color: #6A1B9A;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 2px 0 0 0;
}

.stat-detail {
  font-size: 11px;
  color: #95a5a6;
  margin: 2px 0 0 0;
}

.stat-divider {
  width: 1px;
  height: 70px;
  background: #D4C4B0;
  flex-shrink: 0;
}

/* 详细信息卡片 */
.info-cards {
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: row;
  /* min-width: 300px; */
}

.divider {
  width: 100%;
  height: 1px;
  background: #D4C4B0;
  margin-bottom: 0 auto 15px;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
  flex: 1;
}

.info-label {
  font-size: 11px;
  color: #95a5a6;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.bmi-category {
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 400;
  display: block;
  margin-top: 2px;
}

/* BMI 分类颜色 */
.bmi-normal {
  color: #27AE60;
}

.bmi-light {
  color: #3498DB;
}

.bmi-overweight {
  color: #F39C12;
}

.bmi-obese {
  color: #E74C3C;
}

/* 体重差异颜色 */
.weight-on-target {
  color: #27AE60;
}

.weight-above-target {
  color: #E74C3C;
}

.weight-below-target {
  color: #3498DB;
}

.stats-overview {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    flex-direction: row;
  }
}
</style>
