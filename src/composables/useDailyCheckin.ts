import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface DailyCheckin {
  date: string
  breakfast: string // 早餐内容
  lunch: string // 午餐内容
  dinner: string // 晚餐内容
  midnight_snack: string // 夜宵内容
  water_intake_ml: number // 每天喝水毫升数
  exercise_duration_min: number // 运动时长（分钟）
  sleep_start_time: string // 睡眠开始时间
  sleep_duration_hours: number // 睡眠时长（小时）
  body_weight_kg: number // 体重（公斤）
  energy_level: number // 当日精力水平评分 0-5
  note: string // 备注
  mood: string // 心情状态
  sleep_quality: string // 睡眠质量评分
}

export interface DailyCheckinResponse extends DailyCheckin {
  total_calories_intake: number // 总摄入卡路里
  total_calories_burned: number // 总消耗卡路里
  ai_analysis_summary: string // AI分析总结
}

export function useDailyCheckin() {
  const form = ref<DailyCheckin>({
    date: new Date().toISOString().split('T')[0],
    breakfast: '',
    lunch: '',
    dinner: '',
    midnight_snack: '',
    water_intake_ml: 0,
    exercise_duration_min: 0,
    sleep_start_time: '22:00',
    sleep_duration_hours: 8,
    body_weight_kg: 70,
    energy_level: 3,
    note: '',
    mood: 'neutral',
    sleep_quality: 'good'
  })

  const displayData = ref<DailyCheckinResponse | null>(null)
  const loading = ref(false)
  const editing = ref(false)
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

    if (form.value.body_weight_kg <= 0) {
      errorMsg.value = '请输入有效的体重'
      return false
    }

    if (form.value.sleep_duration_hours < 0 || form.value.sleep_duration_hours > 24) {
      errorMsg.value = '睡眠时间应在 0-24 小时之间'
      return false
    }

    if (form.value.water_intake_ml < 0) {
      errorMsg.value = '喝水毫升数不能为负'
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
      const response = await fetchWithRefresh('https://cda.api.zbyblq.xin/api/daily-checkin/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form.value)
      })

      const data = await response.json()

      if (response.ok) {
        displayData.value = data
        successMsg.value = '打卡成功！'
        editing.value = false
        // 重置表单
        form.value.date = new Date().toISOString().split('T')[0]
        form.value.note = ''
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

  // 加载数据
  async function loadDailyCheckin() {
    loading.value = true
    errorMsg.value = ''

    try {
      const response = await fetchWithRefresh(`https://cda.api.zbyblq.xin/api/daily-checkin/get`, {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok && data) {
        displayData.value = data
        form.value = { ...data }
      } else {
        errorMsg.value = data.message || '加载失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误，请检查连接后重试'
      console.error('Load error:', error)
    } finally {
      loading.value = false
    }
  }

  // 进入编辑模式
  function enterEditMode() {
    editing.value = true
    if (displayData.value) {
      form.value = { ...displayData.value }
    }
  }

  // 取消编辑
  function cancelEdit() {
    editing.value = false
    if (displayData.value) {
      form.value = { ...displayData.value }
    }
  }

  // 计算完成度
  const completedFields = computed(() => {
    let count = 0
    if (form.value.date) count++
    if (form.value.body_weight_kg > 0) count++
    if (form.value.sleep_duration_hours >= 0) count++
    if (form.value.water_intake_ml >= 0) count++
    if (form.value.exercise_duration_min >= 0) count++
    if (form.value.mood) count++
    return count
  })

  const totalFields = 6
  const completionPercentage = computed(
    () => Math.round((completedFields.value / totalFields) * 100)
  )

  return {
    form,
    displayData,
    editing,
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
    loadDailyCheckin,
    enterEditMode,
    cancelEdit,
    completedFields,
    completionPercentage
  }
}
