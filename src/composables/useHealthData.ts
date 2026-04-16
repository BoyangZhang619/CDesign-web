import { ref, computed, reactive } from 'vue'

export interface HealthData {
  gender?: string
  birthday?: string
  height?: number
  currentWeight?: number
  targetWeight?: number
  dietPreferences?: string[]
  healthGoals?: string[]
  allergies?: string
  sleepHabit?: string
  activityLevel?: string
  lastUpdated?: string
}

const HEALTH_DATA_KEY = 'health_data_setup'

export function useHealthData() {
  const healthData = reactive<HealthData>({})
  const isLoaded = ref(false)

  // 从 localStorage 加载数据
  function loadHealthData() {
    try {
      const stored = localStorage.getItem(HEALTH_DATA_KEY)
      if (stored) {
        const data = JSON.parse(stored) as HealthData
        Object.assign(healthData, data)
        isLoaded.value = true
      }
    } catch (error) {
      console.error('加载健康数据失败:', error)
    }
  }

  // 保存数据到 localStorage
  function saveHealthData(data: HealthData) {
    try {
      const dataToSave: HealthData = {
        ...data,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(HEALTH_DATA_KEY, JSON.stringify(dataToSave))
      Object.assign(healthData, dataToSave)
      isLoaded.value = true
    } catch (error) {
      console.error('保存健康数据失败:', error)
    }
  }

  // 更新健康数据
  function updateHealthData(newData: Partial<HealthData>) {
    const updated: HealthData = {
      ...healthData,
      ...newData,
      lastUpdated: new Date().toISOString()
    }
    saveHealthData(updated)
  }

  // 清除数据
  function clearHealthData() {
    Object.keys(healthData).forEach(key => {
      delete (healthData as any)[key]
    })
    localStorage.removeItem(HEALTH_DATA_KEY)
    isLoaded.value = false
  }

  // 计算年龄
  const age = computed(() => {
    if (!healthData.birthday) return null
    const today = new Date()
    const birthDate = new Date(healthData.birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  })

  // 计算 BMI
  const bmi = computed(() => {
    if (!healthData.currentWeight || !healthData.height) return null
    const heightInMeters = healthData.height / 100
    return (healthData.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
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
    if (!healthData.currentWeight || !healthData.targetWeight) return null
    return (healthData.currentWeight - healthData.targetWeight).toFixed(1)
  })

  // 获取健康等级 (基于多个因素的加权评分)
  const healthLevel = computed(() => {
    // 如果没有完整的档案数据，返回 0
    if (!hasCompleteProfile.value) return 0

    let actualScore = 0

    // 1. 活动水平评分 (占 25 分)
    const activityScores: Record<string, number> = {
      'extremely-active': 25,
      'very-active': 20,
      'moderate': 15,
      'light': 10,
      'sedentary': 5
    }
    actualScore += activityScores[healthData.activityLevel || 'moderate'] || 15

    // 2. BMI 评分 (占 25 分)
    if (bmiCategory.value === '正常') {
      actualScore += 25
    } else if (bmiCategory.value === '偏瘦') {
      actualScore += 20
    } else if (bmiCategory.value === '超重') {
      actualScore += 15
    } else {
      actualScore += 5 // 肥胖
    }

    // 3. 体重目标进度评分 (占 25 分)
    if (healthData.currentWeight && healthData.targetWeight) {
      const totalDiff = Math.abs(healthData.currentWeight - healthData.targetWeight)
      if (totalDiff === 0) {
        actualScore += 25
      } else if (totalDiff <= 2) {
        actualScore += 23
      } else if (totalDiff <= 5) {
        actualScore += 20
      } else if (totalDiff <= 10) {
        actualScore += 15
      } else if (totalDiff <= 20) {
        actualScore += 10
      } else {
        actualScore += 5
      }
    } else {
      actualScore += 15
    }

    // 4. 有健康目标加分 (占 25 分)
    if (healthData.healthGoals && healthData.healthGoals.length > 0) {
      actualScore += 25
    } else {
      actualScore += 5
    }

    // 5. 睡眠习惯加分 (占额外 5 分,使总分可能超过 100)
    const sleepScores: Record<string, number> = {
      'early-bird': 5,
      'moderate': 4,
      'night-owl': 2,
      'irregular': 1
    }
    actualScore += sleepScores[healthData.sleepHabit || 'moderate'] || 3

    return Math.min(100, actualScore)
  })

  // 获取健康状态文本描述
  const healthStatus = computed(() => {
    const level = healthLevel.value
    if (level >= 80) return '优秀'
    if (level >= 60) return '良好'
    if (level >= 40) return '一般'
    return '需要改善'
  })

  // 检查是否有完整的健康档案
  const hasCompleteProfile = computed(() => {
    return !!(
      healthData.gender &&
      healthData.birthday &&
      healthData.height &&
      healthData.currentWeight &&
      healthData.targetWeight &&
      healthData.sleepHabit &&
      healthData.activityLevel
    )
  })

  // 初始化时加载数据
  if (!isLoaded.value) {
    loadHealthData()
  }

  return {
    healthData,
    isLoaded,
    age,
    bmi,
    bmiCategory,
    weightDifference,
    healthLevel,
    healthStatus,
    hasCompleteProfile,
    loadHealthData,
    saveHealthData,
    updateHealthData,
    clearHealthData
  }
}
