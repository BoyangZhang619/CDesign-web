import { ref } from 'vue'
import { fetchWithRefresh } from '../api/http'
import { type HealthData } from './useHealthData'

export function useHealthInfoCheck() {
  // 唯一的数据源 - 响应式 ref
  const healthData = ref<HealthData>({})
  const isLoading = ref(false)

  /**
   * 获取并更新健康信息
   */
  async function checkAndFetchHealthInfo() {
    isLoading.value = true

    try {
      const response = await fetchWithRefresh('/api/health-info/get-health-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.log('未获取到健康信息')
        return
      }

      const data = await response.json()
      const remoteHealthInfo = data.data?.healthInfo || data.data || data

      // 将 API 返回的数据映射到 HealthData
      healthData.value = {
        gender: remoteHealthInfo.gender,
        birthday: remoteHealthInfo.birthday,
        height: remoteHealthInfo.height,
        currentWeight: remoteHealthInfo.current_weight || remoteHealthInfo.currentWeight,
        targetWeight: remoteHealthInfo.target_weight || remoteHealthInfo.targetWeight,
        dietPreferences: remoteHealthInfo.diet_preferences || remoteHealthInfo.dietPreferences || [],
        healthGoals: remoteHealthInfo.health_goals || remoteHealthInfo.healthGoals || [],
        allergies: remoteHealthInfo.allergies,
        sleepHabit: remoteHealthInfo.sleep_habit || remoteHealthInfo.sleepHabit,
        activityLevel: remoteHealthInfo.activity_level || remoteHealthInfo.activityLevel,
        lastUpdated: remoteHealthInfo.updated_at || new Date().toISOString()
      }

      console.log('健康数据已更新:', healthData.value)
    } catch (error: any) {
      console.warn('获取健康信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    healthData,
    isLoading,
    checkAndFetchHealthInfo
  }
}


