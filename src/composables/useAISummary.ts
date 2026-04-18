import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'
import type { AISummaryData } from '../types/aiSummary'

export function useAISummary() {
  const summary = ref<AISummaryData | null>(null)
  const loading = ref(false)
  const error = ref('')
  const pollIntervalId = ref<number | null>(null)

  /**
   * 获取当日 AI 总结
   */
  async function getAISummary(): Promise<AISummaryData | null> {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchWithRefresh('/exercise-checkin/checkin/exercise/ai-summary/all', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok && data.data) {
        summary.value = data.data
        return data.data
      } else {
        error.value = data.message || 'Failed to fetch AI summary'
        return null
      }
    } catch (err) {
      error.value = String(err)
      console.error('Error fetching AI summary:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 启动实时轮询，每 10 秒获取一次最新总结
   */
  function startPolling(interval: number = 10000) {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value)
    }

    // 立即获取一次
    getAISummary()

    // 设置轮询
    pollIntervalId.value = window.setInterval(() => {
      getAISummary()
    }, interval)
  }

  /**
   * 获取一次 AI 总结（不轮询）
   */
  async function fetchOnce(): Promise<AISummaryData | null> {
    return await getAISummary()
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value)
      pollIntervalId.value = null
    }
  }

  /**
   * 获取指定维度的 AI 总结
   */
  function getSummaryByType(type: 'exercise' | 'meal' | 'sleep' | 'total'): string | null {
    if (!summary.value) return null

    const summaryMap: Record<string, keyof AISummaryData> = {
      exercise: 'exercise_ai_summary',
      meal: 'meal_ai_summary',
      sleep: 'sleep_ai_summary',
      total: 'total_ai_summary'
    }

    const key = summaryMap[type]
    return (summary.value[key] as string | null) || null
  }

  /**
   * 检查指定维度是否已更新
   */
  function isUpdated(type: 'exercise' | 'meal' | 'sleep' | 'total'): boolean {
    if (!summary.value) return false
    return summary.value.updated_flags[type] || false
  }

  /**
   * 获取所有已更新的类型
   */
  const updatedTypes = computed(() => {
    if (!summary.value) return []

    return (['exercise', 'meal', 'sleep', 'total'] as const).filter(
      type => summary.value?.updated_flags[type]
    )
  })

  /**
   * 检查是否所有维度都已更新
   */
  const isAllUpdated = computed(() => {
    if (!summary.value) return false
    return (
      summary.value.updated_flags.exercise &&
      summary.value.updated_flags.meal &&
      summary.value.updated_flags.sleep
    )
  })

  return {
    summary,
    loading,
    error,
    getAISummary,
    fetchOnce,
    startPolling,
    stopPolling,
    getSummaryByType,
    isUpdated,
    updatedTypes,
    isAllUpdated
  }
}
