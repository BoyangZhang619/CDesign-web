import { reactive, ref, computed } from 'vue'
import { useHealthData } from './useHealthData'
import { fetchWithRefresh } from '@/api/http'

export interface HealthInfo {
  gender: string
  birthday: string
  height?: number
  currentWeight?: number
  targetWeight?: number
  dietPreferences: string[]
  dietOther: boolean
  dietOtherText: string
  healthGoals: string[]
  goalOther: boolean
  goalOtherText: string
  allergies: string
  sleepHabit: string
  activityLevel: string
  diseases: string
  remark: string
}

export function useHealthSetup() {
  const loading = ref(false)
  const errorMsg = ref('')

  const dietOptions = [
    '素食',
    '无肉',
    '无乳制品',
    '无麸质',
    '低碳水',
    '高蛋白'
  ]

  const goalOptions = [
    '减重',
    '增肌',
    '增重',
    '保持',
    '改善心肺功能',
    '提高灵活性',
    '改善睡眠',
    '增强免疫力'
  ]

  const healthInfo = reactive<HealthInfo>({
    gender: '',
    birthday: '',
    height: undefined,
    currentWeight: undefined,
    targetWeight: undefined,
    dietPreferences: [],
    dietOther: false,
    dietOtherText: '',
    healthGoals: [],
    goalOther: false,
    goalOtherText: '',
    allergies: '',
    sleepHabit: '',
    activityLevel: '',
    diseases: '',
    remark: ''
  })

  /**
   * 初始化健康信息 - 从服务器加载已有数据
   */
  async function initializeHealthInfo() {
    try {
      const response = await fetchWithRefresh(`/health-info/get-health-info`, {
        method: 'GET'
      })

      if (!response.ok) {
        console.log('未获取到已有的健康信息')
        return
      }

      const data = await response.json()
      const remoteHealthInfo = data.data?.healthInfo || data.data

      if (remoteHealthInfo) {
        console.log('[useHealthSetup] 加载已有健康信息:', remoteHealthInfo)

        // 填充表单数据
        healthInfo.gender = remoteHealthInfo.gender || ''
        healthInfo.birthday = remoteHealthInfo.birthday || ''
        healthInfo.height = remoteHealthInfo.height_cm || remoteHealthInfo.heightCm
        healthInfo.currentWeight = remoteHealthInfo.current_weight_kg || remoteHealthInfo.currentWeight
        healthInfo.targetWeight = remoteHealthInfo.target_weight_kg || remoteHealthInfo.targetWeight

        // 处理数组字段
        if (remoteHealthInfo.dietary_preferences) {
          if (Array.isArray(remoteHealthInfo.dietary_preferences)) {
            healthInfo.dietPreferences = remoteHealthInfo.dietary_preferences
          } else if (typeof remoteHealthInfo.dietary_preferences === 'string') {
            try {
              healthInfo.dietPreferences = JSON.parse(remoteHealthInfo.dietary_preferences)
            } catch {
              healthInfo.dietPreferences = []
            }
          }
        }

        if (remoteHealthInfo.health_goals) {
          if (Array.isArray(remoteHealthInfo.health_goals)) {
            healthInfo.healthGoals = remoteHealthInfo.health_goals
          } else if (typeof remoteHealthInfo.health_goals === 'string') {
            try {
              healthInfo.healthGoals = JSON.parse(remoteHealthInfo.health_goals)
            } catch {
              healthInfo.healthGoals = []
            }
          }
        }

        healthInfo.allergies = remoteHealthInfo.allergies || ''
        healthInfo.sleepHabit = remoteHealthInfo.sleep_habit || remoteHealthInfo.sleepHabit || ''
        healthInfo.activityLevel = remoteHealthInfo.activity_level || remoteHealthInfo.activityLevel || ''
        healthInfo.diseases = remoteHealthInfo.diseases || ''
        healthInfo.remark = remoteHealthInfo.remark || ''
      }
    } catch (error) {
      console.error('[useHealthSetup] 加载健康信息失败:', error)
    }
  }

  const totalFields = 12
  const completedFields = computed(() => {
    let count = 0
    if (healthInfo.gender) count++
    if (healthInfo.birthday) count++
    if (healthInfo.height) count++
    if (healthInfo.currentWeight) count++
    if (healthInfo.targetWeight) count++
    if (healthInfo.dietPreferences.length > 0 || healthInfo.dietOtherText) count++
    if (healthInfo.healthGoals.length > 0 || healthInfo.goalOtherText) count++
    if (healthInfo.allergies) count++
    if (healthInfo.sleepHabit) count++
    if (healthInfo.activityLevel) count++
    if (healthInfo.diseases) count++
    if (healthInfo.remark) count++
    return count
  })

  const progressPercentage = computed(() => {
    return Math.round((completedFields.value / totalFields) * 100)
  })

  function validateForm(): boolean {
    function warningPrint(field: string): boolean {
         errorMsg.value = field;
            return false;
        }
    if (!healthInfo.gender) return warningPrint('请选择性别')
    if (!healthInfo.birthday) return warningPrint('请选择生日')
    if (!healthInfo.height) return warningPrint('请输入身高')
    if (!healthInfo.currentWeight) return warningPrint('请输入当前体重')
    if (!healthInfo.targetWeight) return warningPrint('请输入目标体重')
    if (healthInfo.dietPreferences.length === 0 && !healthInfo.dietOtherText) return warningPrint('请选择至少一个饮食偏好')
    if (healthInfo.healthGoals.length === 0 && !healthInfo.goalOtherText) return warningPrint('请选择至少一个健康目标')
    if (!healthInfo.sleepHabit) return warningPrint('请选择作息习惯')
    if (!healthInfo.activityLevel) return warningPrint('请选择日常活动水平')
    if (!healthInfo.diseases) return warningPrint('请填写疾病史')
    if (!healthInfo.remark) return warningPrint('请填写其他信息')
    return true
  }

  async function handleSubmit() {
    errorMsg.value = ''

    if (!validateForm()) {
      return
    }

    loading.value = true

    try {
      const { updateHealthData } = useHealthData()

      const response = await fetchWithRefresh(`/health-info/insert-health-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(healthInfo)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '保存失败')
      }

      // 保存到本地存储
      updateHealthData({
        gender: healthInfo.gender,
        birthday: healthInfo.birthday,
        height: healthInfo.height,
        currentWeight: healthInfo.currentWeight,
        targetWeight: healthInfo.targetWeight,
        dietPreferences: healthInfo.dietPreferences,
        healthGoals: healthInfo.healthGoals,
        allergies: healthInfo.allergies,
        sleepHabit: healthInfo.sleepHabit,
        activityLevel: healthInfo.activityLevel
      })

      errorMsg.value = ''
    } catch (error: any) {
      errorMsg.value = error?.message || '保存失败，请重试'
      console.error('健康档案保存错误:', error)
    } finally {
      loading.value = false
    }
  }

  function handleSkip() {
    // ...
    console.log('')
  }

  return {
    loading,
    errorMsg,
    healthInfo,
    dietOptions,
    goalOptions,
    totalFields,
    completedFields,
    progressPercentage,
    validateForm,
    handleSubmit,
    handleSkip,
    initializeHealthInfo
  }
}
