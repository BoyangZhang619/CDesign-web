import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'
import { getLocalISOString } from '@/utils/dateTime'

// 获取本地时间的 ISO 字符串（不转换为 UTC）

export interface ExerciseRecord {
  exercise_record_id: string | number
  user_id: number
  activity_type: string
  duration_min: number
  intensity: 'low' | 'medium' | 'high'
  calories_burned: number | null
  start_time: string
  end_time: string
  note: string
  ai_recognition_flag: number | boolean
  suggestion: string | null
  evaluation: string | null
  created_at: string
  updated_at: string
}

export interface ExerciseCheckinForm {
  activity_type: string
  intensity: 'low' | 'medium' | 'high'
  start_time: string
  end_time: string
  note?: string
}

export function useExerciseCheckin() {
  const form = ref<ExerciseCheckinForm>({
    activity_type: '跑步',
    intensity: 'medium',
    start_time: '',
    end_time: '',
    note: ''
  })

  const records = ref<ExerciseRecord[]>([])
  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')
  const pollIntervalId = ref<number | null>(null)
  const selectedRecordId = ref<string | number | null>(null)

  // 初始化表单时间
  const initializeForm = () => {
    const now = new Date()
    const endTime = new Date(now.getTime() + 30 * 60 * 1000) // 默认30分钟
    form.value = {
      activity_type: '跑步',
      intensity: 'medium',
      start_time: getLocalISOString(now),
      end_time: getLocalISOString(endTime),
      note: ''
    }
  }

  // 选项
  const activityTypeOptions = [
    { label: '跑步', value: '跑步' },
    { label: '步行', value: '步行' },
    { label: '力量训练', value: '力量训练' },
    { label: '球类', value: '球类' },
    { label: '游泳', value: '游泳' },
    { label: '骑车', value: '骑车' },
    { label: '瑜伽', value: '瑜伽' },
    { label: '其他', value: '其他' }
  ]

  const intensityOptions = [
    { label: '低', value: 'low' },
    { label: '中', value: 'medium' },
    { label: '高', value: 'high' }
  ]

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.activity_type?.trim()) {
      errorMsg.value = '请选择运动类型'
      return false
    }

    if (!form.value.start_time?.trim()) {
      errorMsg.value = '请输入开始时间'
      return false
    }

    if (!form.value.end_time?.trim()) {
      errorMsg.value = '请输入结束时间'
      return false
    }

    const startTime = new Date(form.value.start_time)
    const endTime = new Date(form.value.end_time)

    if (endTime <= startTime) {
      errorMsg.value = '结束时间必须晚于开始时间'
      return false
    }

    const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    if (durationMin < 1) {
      errorMsg.value = '运动时长至少需要1分钟'
      return false
    }

    if (durationMin > 1440) {
      errorMsg.value = '运动时长不能超过24小时'
      return false
    }

    return true
  }

  // 添加新运动记录
  async function addExerciseRecord() {
    if (!validateForm()) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const payload = {
        activity_type: form.value.activity_type,
        intensity: form.value.intensity,
        start_time: getLocalISOString(new Date(form.value.start_time)),
        end_time: getLocalISOString(new Date(form.value.end_time)),
        note: form.value.note || ''
      }

      const response = await fetchWithRefresh('/exercise-checkin/checkin/exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已保存，AI正在分析运动数据...'
        initializeForm()
        await loadRecords()
        startPolling()
      } else {
        errorMsg.value = data.error || data.message || '保存失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Add exercise record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 加载今天的所有运动记录
  async function loadRecords() {
    try {
      const response = await fetchWithRefresh('/exercise-checkin/checkin/exercise', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        const rawRecords = data.data.records || []
        records.value = (rawRecords as any[]).map((record: any) => ({
          ...record,
          duration_min: Number(record.duration_min) || 0,
          calories_burned: record.calories_burned ? Number(record.calories_burned) : null,
          intensity: record.intensity as 'low' | 'medium' | 'high'
        }))
      } else {
        console.error('Load records error:', data.error || data.message)
      }
    } catch (error) {
      console.error('Load records error:', error)
    }
  }

  // 更新运动记录
  async function updateExerciseRecord(recordId: string | number, updateData: Partial<ExerciseCheckinForm>) {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const payload: any = {}

      if (updateData.activity_type) {
        payload.activity_type = updateData.activity_type
      }
      if (updateData.intensity) {
        payload.intensity = updateData.intensity
      }
      if (updateData.start_time) {
        payload.start_time = getLocalISOString(new Date(updateData.start_time)).replace('T', ' ').slice(0, 19)
      }
      if (updateData.end_time) {
        payload.end_time = getLocalISOString(new Date(updateData.end_time)).replace('T', ' ').slice(0, 19)
      }
      if (updateData.note !== undefined) {
        payload.note = updateData.note
      }

      const response = await fetchWithRefresh(`/exercise-checkin/checkin/exercise/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已更新，AI正在重新分析...'
        selectedRecordId.value = null
        await loadRecords()
        startPolling()
      } else {
        errorMsg.value = data.error || data.message || '更新失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Update exercise record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除运动记录
  async function deleteExerciseRecord(recordId: string | number) {
    if (!confirm('确定要删除这条记录吗？')) {
      return
    }

    loading.value = true
    errorMsg.value = ''

    try {
      const response = await fetchWithRefresh(`/exercise-checkin/checkin/exercise/${recordId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已删除'
        selectedRecordId.value = null
        await loadRecords()
      } else {
        errorMsg.value = data.error || data.message || '删除失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Delete exercise record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 开始轮询以获取最新数据
  function startPolling() {
    if (pollIntervalId.value) return

    pollIntervalId.value = window.setInterval(async () => {
      await loadRecords()
      // 检查是否有记录还在计算中（calories_burned 为 null）
      const hasCalculating = records.value.some(r => r.calories_burned === null)
      if (!hasCalculating) {
        stopPolling()
      }
    }, 3000) // 每3秒检查一次（API通常在2-5秒内完成AI分析）
  }

  // 停止轮询
  function stopPolling() {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value)
      pollIntervalId.value = null
    }
  }

  // 计算运动消耗热量文本
  const formatCaloriesBurned = (calories: number | null): string => {
    if (calories === null) return '计算中'
    return `${Math.round(calories)} kcal`
  }

  // 获取运动类型文本
  const getActivityTypeText = (type: string): string => {
    const option = activityTypeOptions.find(o => o.value === type)
    return option?.label || type
  }

  // 获取强度文本
  const getIntensityText = (intensity: string): string => {
    const option = intensityOptions.find(o => o.value === intensity)
    return option?.label || intensity
  }

  // 判断是否在计算中
  const isCalculating = (record: ExerciseRecord): boolean => record.calories_burned === null

  // 计算今天的统计
  const todayStatistics = computed(() => {
    const totalDuration = records.value.reduce((sum, r) => sum + (r.duration_min || 0), 0)
    const totalCalories = records.value.reduce((sum, r) => sum + (r.calories_burned || 0), 0)
    const lowIntensity = records.value.filter(r => r.intensity === 'low').length
    const mediumIntensity = records.value.filter(r => r.intensity === 'medium').length
    const highIntensity = records.value.filter(r => r.intensity === 'high').length

    return {
      totalRecords: records.value.length,
      totalDuration: Math.round(totalDuration),
      totalCalories: parseFloat(totalCalories.toFixed(2)),
      lowIntensity,
      mediumIntensity,
      highIntensity,
      avgDuration: records.value.length > 0 ? Math.round(totalDuration / records.value.length) : 0
    }
  })

  return {
    form,
    records,
    loading,
    errorMsg,
    successMsg,
    selectedRecordId,
    activityTypeOptions,
    intensityOptions,
    todayStatistics,
    initializeForm,
    validateForm,
    addExerciseRecord,
    loadRecords,
    updateExerciseRecord,
    deleteExerciseRecord,
    startPolling,
    stopPolling,
    formatCaloriesBurned,
    getActivityTypeText,
    getIntensityText,
    isCalculating
  }
}
