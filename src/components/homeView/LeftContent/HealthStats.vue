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
const healthData = computed(() => props.healthData)
console.log('HealthStats received healthData:', healthData.value)
// 判断是否有完整档案
const hasCompleteProfile = computed(() => {
  return !!(
    healthData.value?.gender ||
    healthData.value?.birthday ||
    healthData.value?.height ||
    healthData.value?.currentWeight ||
    healthData.value?.targetWeight
  )
})

// 计算年龄
const age = computed(() => {
  if (!healthData.value?.birthday) return null
  const today = new Date()
  const birthDate = new Date(healthData.value.birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// 计算 BMI
const bmi = computed(() => {
  console.log('计算 BMI 输入:', healthData.value?.currentWeight, healthData.value?.height)
  if (!healthData.value?.currentWeight || !healthData.value?.height) return null
  const heightInMeters = healthData.value.height / 100
  console.log('计算 BMI:', healthData.value.currentWeight, heightInMeters)
  return (healthData.value.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
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
  if (!healthData.value?.currentWeight || !healthData.value?.targetWeight) return null
  return (healthData.value.currentWeight - healthData.value.targetWeight).toFixed(1)
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
  score += activityScores[healthData.value?.activityLevel || 'moderate'] || 15

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
  if (healthData.value?.currentWeight && healthData.value?.targetWeight) {
    const diff = Math.abs(healthData.value.currentWeight - healthData.value.targetWeight)
    if (diff === 0) score += 25
    else if (diff <= 2) score += 23
    else if (diff <= 5) score += 20
    else if (diff <= 10) score += 15
    else if (diff <= 20) score += 10
    else score += 5
  }

  // 健康目标评分 (占 25 分)
  score += (healthData.value?.healthGoals?.length || 0) > 0 ? 25 : 10

  // 睡眠习惯加分 (占 5 分)
  if (healthData.value?.sleepHabit) score += 5

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
  if (healthData.value?.gender) count++
  if (healthData.value?.birthday) count++
  if (healthData.value?.height) count++
  if (healthData.value?.currentWeight) count++
  if (healthData.value?.targetWeight) count++
  if (healthData.value?.sleepHabit) count++
  if (healthData.value?.activityLevel) count++
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
  return levels[healthData.value?.activityLevel || ''] || '-'
})

const showDetailInfo = computed(() => hasCompleteProfile.value)
</script>

<style lang="scss" scoped src="@/scss/components/homeView/LeftContent/HealthStats.scss"></style>
