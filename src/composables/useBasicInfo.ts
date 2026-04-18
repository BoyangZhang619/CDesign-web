import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface BasicInfo {
  realname: string
  studentId: string
  gender: string
  birthday: string
  height_cm: number
  current_weight_kg: number
  target_weight_kg: number
  goal_type: string
  dietary_preference: string
  allergy_info: string
  work_rest_habit: string
  activity_level: string
  health_goal_desc: string
}

export function useBasicInfo() {
  const form = ref<BasicInfo>({
    realname: '',
    studentId: '',
    gender: 'male',
    birthday: '',
    height_cm: 170,
    current_weight_kg: 70,
    target_weight_kg: 70,
    goal_type: 'maintain',
    dietary_preference: '',
    allergy_info: '',
    work_rest_habit: '',
    activity_level: 'moderate',
    health_goal_desc: ''
  })

  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  // 性别选项
  const genderOptions = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
    { label: '其他', value: 'other' }
  ]

  // 目标类型选项
  const goalOptions = [
    { label: '保持现状', value: 'maintain' },
    { label: '减重', value: 'weight_loss' },
    { label: '增重', value: 'weight_gain' },
    { label: '增肌', value: 'muscle_gain' },
    { label: '提高体能', value: 'fitness' }
  ]

  // 活动水平选项
  const activityLevelOptions = [
    { label: '久坐不动', value: 'sedentary' },
    { label: '轻度活动', value: 'light' },
    { label: '中等活动', value: 'moderate' },
    { label: '高度活动', value: 'active' },
    { label: '非常活跃', value: 'very_active' }
  ]

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.realname?.trim()) {
      errorMsg.value = '请输入真实姓名'
      return false
    }

    if (!form.value.studentId?.trim()) {
      errorMsg.value = '请输入学号'
      return false
    }

    if (!form.value.birthday) {
      errorMsg.value = '请选择出生日期'
      return false
    }

    if (form.value.height_cm <= 0 || form.value.height_cm > 250) {
      errorMsg.value = '请输入有效的身高（1-250 cm）'
      return false
    }

    if (form.value.current_weight_kg <= 0 || form.value.current_weight_kg > 300) {
      errorMsg.value = '请输入有效的体重（1-300 kg）'
      return false
    }

    if (form.value.target_weight_kg <= 0 || form.value.target_weight_kg > 300) {
      errorMsg.value = '请输入有效的目标体重（1-300 kg）'
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
      const response = await fetchWithRefresh('/healthInfo/update-health-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          realname: form.value.realname,
          studentId: form.value.studentId,
          gender: form.value.gender,
          birthday: form.value.birthday,
          height_cm: form.value.height_cm,
          current_weight_kg: form.value.current_weight_kg,
          target_weight_kg: form.value.target_weight_kg,
          goal_type: form.value.goal_type,
          dietary_preference: form.value.dietary_preference,
          allergy_info: form.value.allergy_info,
          work_rest_habit: form.value.work_rest_habit,
          activity_level: form.value.activity_level,
          health_goal_desc: form.value.health_goal_desc
        })
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '健康信息已保存'
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

  // 加载健康信息
  async function loadHealthInfo() {
    loading.value = true
    errorMsg.value = ''

    try {
      const response = await fetchWithRefresh('/healthInfo/get-health-info', {
        method: 'GET'
      })

      const data = (await response.json())

      if (response.ok && data) {
        form.value = {
          realname: data.realname || '',
          studentId: data.studentId || '',
          gender: data.gender || 'male',
          birthday: data.birthday || '',
          height_cm: data.height_cm || 0,
          current_weight_kg: data.current_weight_kg || 0,
          target_weight_kg: data.target_weight_kg || 0,
          goal_type: data.goal_type || 'maintain',
          dietary_preference: data.dietary_preference || '',
          allergy_info: data.allergy_info || '',
          work_rest_habit: data.work_rest_habit || '',
          activity_level: data.activity_level || 'moderate',
          health_goal_desc: data.health_goal_desc || ''
        }
      }
    } catch (error) {
      console.warn('Load health info error:', error)
    } finally {
      loading.value = false
    }
  }

  // 计算完成度
  const completedFields = computed(() => {
    let count = 0
    if (form.value.realname) count++
    if (form.value.studentId) count++
    if (form.value.birthday) count++
    if (form.value.height_cm > 0) count++
    if (form.value.current_weight_kg > 0) count++
    if (form.value.target_weight_kg > 0) count++
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
    genderOptions,
    goalOptions,
    activityLevelOptions,
    validateForm,
    handleSubmit,
    loadHealthInfo,
    completedFields,
    completionPercentage,
    totalFields
  }
}
