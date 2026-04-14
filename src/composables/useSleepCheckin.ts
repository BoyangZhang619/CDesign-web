import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'
import { getLocalISOString } from '@/utils/dateTime'

export interface SleepRecord {
  id: string
  user_id: number
  daily_checkin_id: number
  sleep_start_time: string
  wake_up_time: string
  sleep_duration_hours: number
  sleep_quality_score: number | null
  is_nap: 0 | 1
  wake_up_times: number
  sleep_feeling: string
  suggestion: string | null
  evaluation: string | null
  created_at: string
  updated_at: string
}

export interface SleepCheckinForm {
  sleep_start_time: string
  wake_up_time: string
  is_nap?: 0 | 1
  wake_up_times?: number
  sleep_feeling?: string
}

export interface SleepStatistics {
  days: number
  statistics: {
    record_count: number
    avg_sleep_duration: string
    avg_quality_score: number
    max_quality_score: number
    min_quality_score: number
    night_sleep_count: number
    nap_count: number
  }
}

export function useSleepCheckin() {
  const form = ref<SleepCheckinForm>({
    sleep_start_time: '',
    wake_up_time: '',
    is_nap: 0,
    wake_up_times: 0,
    sleep_feeling: ''
  })

  const records = ref<SleepRecord[]>([])
  const statistics = ref<SleepStatistics | null>(null)
  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')
  const pollIntervalId = ref<number | null>(null)
  const selectedRecordId = ref<string | null>(null)

  // 初始化表单时间
  const initializeForm = () => {
    const now = new Date()
    form.value = {
      sleep_start_time: getLocalISOString(now),
      wake_up_time: getLocalISOString(new Date(now.getTime() + 8 * 60 * 60 * 1000)),
      is_nap: 0,
      wake_up_times: 0,
      sleep_feeling: ''
    }
  }

  // 选项
  const napTypeOptions = [
    { label: '夜间睡眠', value: 0 },
    { label: '午睡', value: 1 }
  ]

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.sleep_start_time?.trim()) {
      errorMsg.value = '请输入入睡时间'
      return false
    }

    if (!form.value.wake_up_time?.trim()) {
      errorMsg.value = '请输入起床时间'
      return false
    }

    const startTime = new Date(form.value.sleep_start_time)
    const wakeTime = new Date(form.value.wake_up_time)

    if (wakeTime <= startTime) {
      errorMsg.value = '起床时间必须晚于入睡时间'
      return false
    }

    const durationMs = wakeTime.getTime() - startTime.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)

    if (durationHours < 0.25) {
      errorMsg.value = '睡眠时长至少需要15分钟'
      return false
    }

    if (durationHours > 24) {
      errorMsg.value = '睡眠时长不能超过24小时'
      return false
    }

    return true
  }

  // 添加新睡眠记录
  async function addSleepRecord() {
    if (!validateForm()) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const payload: SleepCheckinForm = {
        sleep_start_time: getLocalISOString(new Date(form.value.sleep_start_time)),
        wake_up_time: getLocalISOString(new Date(form.value.wake_up_time)),
        is_nap: form.value.is_nap || 0,
        wake_up_times: form.value.wake_up_times || 0,
        sleep_feeling: form.value.sleep_feeling || ''
      }

      const response = await fetchWithRefresh('/api/sleep-checkin/checkin/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已保存，AI正在分析睡眠数据...'
        initializeForm()
        await loadRecords()
        startPolling()
      } else {
        errorMsg.value = data.message || '保存失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Add sleep record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 加载今天的所有睡眠记录
  async function loadRecords() {
    try {
      const response = await fetchWithRefresh('/api/sleep-checkin/checkin/sleep', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        const rawRecords = data.data.records || []
        records.value = rawRecords.map((record: any) => ({
          ...record,
          sleep_duration_hours: Number(record.sleep_duration_hours) || 0,
          sleep_quality_score: record.sleep_quality_score ? Number(record.sleep_quality_score) : null,
          is_nap: Number(record.is_nap) as 0 | 1,
          wake_up_times: Number(record.wake_up_times) || 0
        }))
      } else {
        console.error('Load records error:', data.message)
      }
    } catch (error) {
      console.error('Load records error:', error)
    }
  }

  // 更新睡眠记录
  async function updateSleepRecord(recordId: string, updateData: Partial<SleepCheckinForm>) {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const payload: any = {}

      if (updateData.sleep_start_time) {
        payload.sleep_start_time = getLocalISOString(new Date(updateData.sleep_start_time))
      }
      if (updateData.wake_up_time) {
        payload.wake_up_time = getLocalISOString(new Date(updateData.wake_up_time))
      }
      if (updateData.is_nap !== undefined) {
        payload.is_nap = updateData.is_nap
      }
      if (updateData.wake_up_times !== undefined) {
        payload.wake_up_times = updateData.wake_up_times
      }
      if (updateData.sleep_feeling !== undefined) {
        payload.sleep_feeling = updateData.sleep_feeling
      }

      const response = await fetchWithRefresh(`/api/sleep-checkin/checkin/sleep/${recordId}`, {
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
        errorMsg.value = data.message || '更新失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Update sleep record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除睡眠记录
  async function deleteSleepRecord(recordId: string) {
    if (!confirm('确定要删除这条记录吗？')) {
      return
    }

    loading.value = true
    errorMsg.value = ''

    try {
      const response = await fetchWithRefresh(`/api/sleep-checkin/checkin/sleep/${recordId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已删除'
        selectedRecordId.value = null
        await loadRecords()
      } else {
        errorMsg.value = data.message || '删除失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Delete sleep record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 开始轮询以获取最新数据
  function startPolling() {
    if (pollIntervalId.value) return

    pollIntervalId.value = window.setInterval(async () => {
      await loadRecords()
      // 检查是否有记录还在计算中（sleep_quality_score 为 null）
      const hasCalculating = records.value.some(r => r.sleep_quality_score === null)
      if (!hasCalculating) {
        stopPolling()
      }
    }, 2000) // 每2秒检查一次
  }

  // 停止轮询
  function stopPolling() {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value)
      pollIntervalId.value = null
    }
  }

  // 加载统计数据
  async function loadStatistics(days: 7 | 30 = 7) {
    try {
      const response = await fetchWithRefresh(`/api/sleep-checkin/checkin/sleep/statistics?days=${days}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        statistics.value = data.data
      } else {
        console.error('Load statistics error:', data.message)
      }
    } catch (error) {
      console.error('Load statistics error:', error)
    }
  }

  // 计算睡眠时长文本
  const formatSleepDuration = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  // 获取睡眠类型文本
  const getNapTypeText = (isNap: 0 | 1): string => {
    return isNap === 1 ? '午睡' : '夜间睡眠'
  }

  // 判断是否在计算中
  const isCalculating = (record: SleepRecord): boolean => record.sleep_quality_score === null

  // 计算今天的统计
  const todayStatistics = computed(() => {
    const nightSleep = records.value.filter(r => r.is_nap === 0)
    const naps = records.value.filter(r => r.is_nap === 1)

    const totalNightHours = nightSleep.reduce((sum, r) => sum + (r.sleep_duration_hours || 0), 0)
    const totalNapHours = naps.reduce((sum, r) => sum + (r.sleep_duration_hours || 0), 0)
    const avgQualityScore = records.value.length > 0
      ? Math.round(records.value.reduce((sum, r) => sum + (r.sleep_quality_score || 0), 0) / records.value.length)
      : 0

    return {
      totalRecords: records.value.length,
      nightSleepCount: nightSleep.length,
      napCount: naps.length,
      totalNightHours: parseFloat(totalNightHours.toFixed(2)),
      totalNapHours: parseFloat(totalNapHours.toFixed(2)),
      avgQualityScore
    }
  })

  return {
    form,
    records,
    statistics,
    loading,
    errorMsg,
    successMsg,
    selectedRecordId,
    napTypeOptions,
    todayStatistics,
    initializeForm,
    validateForm,
    addSleepRecord,
    loadRecords,
    updateSleepRecord,
    deleteSleepRecord,
    startPolling,
    stopPolling,
    loadStatistics,
    formatSleepDuration,
    getNapTypeText,
    isCalculating
  }
}
