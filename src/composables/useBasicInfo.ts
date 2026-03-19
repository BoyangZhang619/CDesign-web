import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface BasicInfo {
  name: string
  studentId: string
  phone: string
  major: string
  grade: string
  medicalConditions: string[]
  emergencyContact: string
  notes: string
}

export function useBasicInfo() {
  const form = ref<BasicInfo>({
    name: '',
    studentId: '',
    phone: '',
    major: '',
    grade: '大一',
    medicalConditions: [],
    emergencyContact: '',
    notes: ''
  })

  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  // 医学条件选项
  const medicalOptions = [
    { label: '高血压', value: 'hypertension' },
    { label: '糖尿病', value: 'diabetes' },
    { label: '心脏病', value: 'heart_disease' },
    { label: '过敏症', value: 'allergies' },
    { label: '哮喘', value: 'asthma' },
    { label: '甲状腺疾病', value: 'thyroid_disease' }
  ]

  // 年级选项
  const gradeOptions = ['大一', '大二', '大三', '大四', '研一', '研二', '研三']

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.name?.trim()) {
      errorMsg.value = '请输入真实姓名'
      return false
    }

    if (!form.value.studentId?.trim()) {
      errorMsg.value = '请输入学号'
      return false
    }

    if (!form.value.phone?.trim()) {
      errorMsg.value = '请输入联系方式'
      return false
    }

    if (!/^1\d{10}$/.test(form.value.phone)) {
      errorMsg.value = '请输入有效的手机号'
      return false
    }

    if (!form.value.major?.trim()) {
      errorMsg.value = '请输入专业/院系'
      return false
    }

    if (!form.value.emergencyContact?.trim()) {
      errorMsg.value = '请输入紧急联系方式'
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
      const response = await fetchWithRefresh('/update-basic-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.value.name,
          studentId: form.value.studentId,
          phone: form.value.phone,
          major: form.value.major,
          grade: form.value.grade,
          medicalConditions: form.value.medicalConditions,
          emergencyContact: form.value.emergencyContact,
          notes: form.value.notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '基础信息已保存'
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
    if (form.value.name) count++
    if (form.value.studentId) count++
    if (form.value.phone) count++
    if (form.value.major) count++
    if (form.value.medicalConditions.length > 0) count++
    if (form.value.emergencyContact) count++
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
    medicalOptions,
    gradeOptions,
    validateForm,
    handleSubmit,
    completedFields,
    completionPercentage
  }
}
