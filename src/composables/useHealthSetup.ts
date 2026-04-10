import { reactive, ref, computed } from 'vue'

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
    activityLevel: ''
  })

  const totalFields = 10
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
    return true
  }

  async function handleSubmit() {
    errorMsg.value = ''

    if (!validateForm()) {
      return
    }

    loading.value = true

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'
      const response = await fetch(`${apiUrl}/api/health-info/insert-health-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('StuHeal_access_token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(healthInfo)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '保存失败')
      }
    } catch (error: any) {
      errorMsg.value = error?.message || '保存失败，请重试'
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
    handleSkip
  }
}
