import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface DailyCheckin {
  date: string
  mealIntake: string // 早中晚三餐评分
  waterIntake: number // 每天喝水杯数
  exercise: string // 运动类型和时长
  weight: number // 当前体重
  sleepHours: number // 睡眠时间
  sleepQuality: string // 睡眠质量评分
  mood: string // 心情状态
  energy: string // 精力状态
  notes: string // 备注
}

export function useDailyCheckin() {
  const form = ref<DailyCheckin>({
    date: new Date().toISOString().split('T')[0],
    mealIntake: 'normal',
    waterIntake: 8,
    exercise: 'moderate',
    weight: 70,
    sleepHours: 8,
    sleepQuality: 'good',
    mood: 'happy',
    energy: 'normal',
    notes: ''
  })

  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  // 饮食评分选项
  const mealOptions = [
    { label: '🥗 很健康', value: 'healthy' },
    { label: '✅ 正常', value: 'normal' },
    { label: '🍔 不太健康', value: 'unhealthy' },
    { label: '❌ 很不健康', value: 'very_unhealthy' }
  ]

  // 运动选项
  const exerciseOptions = [
    { label: '🚫 没有运动', value: 'none' },
    { label: '🚶 轻度运动', value: 'light' },
    { label: '🏃 中等运动', value: 'moderate' },
    { label: '💪 剧烈运动', value: 'intense' }
  ]

  // 睡眠质量选项
  const sleepQualityOptions = [
    { label: '😴 很好', value: 'excellent' },
    { label: '😊 良好', value: 'good' },
    { label: '😐 一般', value: 'fair' },
    { label: '😫 很差', value: 'poor' }
  ]

  // 心情选项
  const moodOptions = [
    { label: '😄 很开心', value: 'very_happy' },
    { label: '😊 开心', value: 'happy' },
    { label: '😐 平常', value: 'neutral' },
    { label: '😔 有点低落', value: 'sad' },
    { label: '😠 很沮丧', value: 'very_sad' }
  ]

  // 精力选项
  const energyOptions = [
    { label: '⚡ 精力充沛', value: 'very_high' },
    { label: '👍 精力充足', value: 'high' },
    { label: '➡️ 正常', value: 'normal' },
    { label: '😴 有点疲劳', value: 'tired' },
    { label: '🔋 很疲劳', value: 'very_tired' }
  ]

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.date) {
      errorMsg.value = '请选择日期'
      return false
    }

    if (form.value.weight <= 0) {
      errorMsg.value = '请输入有效的体重'
      return false
    }

    if (form.value.sleepHours < 0 || form.value.sleepHours > 24) {
      errorMsg.value = '睡眠时间应在 0-24 小时之间'
      return false
    }

    if (form.value.waterIntake < 0) {
      errorMsg.value = '喝水杯数不能为负'
      return false
    }

    return true
  }

  // 提交表单
  async function handleSubmit() {
    if (!validateForm()) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const response = await fetchWithRefresh('/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkinDate: form.value.date,
          mealIntake: form.value.mealIntake,
          waterIntake: form.value.waterIntake,
          exercise: form.value.exercise,
          weight: form.value.weight,
          sleepHours: form.value.sleepHours,
          sleepQuality: form.value.sleepQuality,
          mood: form.value.mood,
          energy: form.value.energy,
          notes: form.value.notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '打卡成功！'
        // 重置表单
        form.value.date = new Date().toISOString().split('T')[0]
        form.value.notes = ''
        setTimeout(() => {
          successMsg.value = ''
        }, 3000)
      } else {
        errorMsg.value = data.message || '保存失败，请重试'
      }
    } catch (error) {
      errorMsg.value = '网络错误，请检查连接后重试'
      console.error('Submit error:', error)
    } finally {
      loading.value = false
    }
  }

  // 计算完成度
  const completedFields = computed(() => {
    let count = 0
    if (form.value.date) count++
    if (form.value.weight > 0) count++
    if (form.value.sleepHours >= 0) count++
    if (form.value.waterIntake >= 0) count++
    if (form.value.exercise) count++
    if (form.value.mood) count++
    return count
  })

  const totalFields = 6
  const completionPercentage = computed(
    () => Math.round((completedFields.value / totalFields) * 100)
  )

  return {
    form,
    loading,
    errorMsg,
    successMsg,
    mealOptions,
    exerciseOptions,
    sleepQualityOptions,
    moodOptions,
    energyOptions,
    validateForm,
    handleSubmit,
    completedFields,
    completionPercentage
  }
}
