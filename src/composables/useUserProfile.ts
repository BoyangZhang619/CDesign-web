import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface UserProfile {
  id: number
  email: string
  password_hash: string
  nickname?: string
  avatar_url?: string
  phone?: string
  role: string
  status: number
  admin: number
  last_login_time?: string
  created_at: string
  updated_at: string
  deleted_at?: string
  credits: number
}

export function useUserProfile() {
  const userInfo = ref<UserProfile | null>(null)
  const editInfo = ref<Partial<UserProfile>>({})
  const loading = ref(false)
  const editing = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  // 加载用户信息
  async function loadUserInfo() {
    loading.value = true
    errorMsg.value = ''

    try {
      const response = await fetchWithRefresh('https://cda.api.zbyblq.xin/api/auth/me', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok && data) {
        userInfo.value = data
        editInfo.value = { ...data }
      } else {
        errorMsg.value = data.message || '加载用户信息失败'
      }
    } catch (error) {
      errorMsg.value = (error as any)?.message || '网络错误'
      console.error('Load user info error:', error)
    } finally {
      loading.value = false
    }
  }

  // 进入编辑模式
  function enterEditMode() {
    editing.value = true
    if (userInfo.value) {
      editInfo.value = { ...userInfo.value }
    }
  }

  // 退出编辑模式
  function exitEditMode() {
    editing.value = false
    errorMsg.value = ''
  }

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (editInfo.value.nickname && editInfo.value.nickname.length > 64) {
      errorMsg.value = '昵称长度不能超过64个字符'
      return false
    }

    if (editInfo.value.phone && !/^[\d\s\-+()]*$/.test(editInfo.value.phone)) {
      errorMsg.value = '手机号格式不正确'
      return false
    }

    if (editInfo.value.avatar_url && editInfo.value.avatar_url.length > 255) {
      errorMsg.value = '头像URL长度不能超过255个字符'
      return false
    }

    return true
  }

  // 保存用户信息
  async function saveUserInfo() {
    if (!validateForm()) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      // TODO: 更新用户信息接口 - PATCH /api/user/profile 或 PUT /api/user/update
      const response = await fetchWithRefresh('https://cda.api.zbyblq.xin/api/auth/update-user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: editInfo.value.nickname,
          phone: editInfo.value.phone,
          avatar_url: editInfo.value.avatar_url
        })
      })

      const data = await response.json()

      if (response.ok) {
        userInfo.value = { ...userInfo.value, ...editInfo.value } as UserProfile
        successMsg.value = '用户信息已保存'
        editing.value = false

        setTimeout(() => {
          successMsg.value = ''
        }, 3000)
      } else {
        errorMsg.value = data.message || '保存失败'
      }
    } catch (error) {
      errorMsg.value = (error as any)?.message || '网络错误'
      console.error('Save user info error:', error)
    } finally {
      loading.value = false
    }
  }

  // 计算字段是否已修改
  const hasChanges = computed(() => {
    if (!userInfo.value) return false
    return (
      editInfo.value.nickname !== userInfo.value.nickname ||
      editInfo.value.phone !== userInfo.value.phone ||
      editInfo.value.avatar_url !== userInfo.value.avatar_url
    )
  })

  return {
    userInfo,
    editInfo,
    loading,
    editing,
    errorMsg,
    successMsg,
    loadUserInfo,
    enterEditMode,
    exitEditMode,
    saveUserInfo,
    hasChanges
  }
}
