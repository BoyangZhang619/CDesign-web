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
  bio?: string
  website?: string
  location?: string
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
      const response = await fetchWithRefresh(`/auth/me`, {
        method: 'GET'
      })

      const result = await response.json();
      const data = result.data.user;
      console.log('API response for user info:', result)

      if (response.ok && data) {
        userInfo.value = data
        editInfo.value = { ...data }
        console.log('Loaded user info:', userInfo.value, editInfo.value)
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

    if (editInfo.value.bio && editInfo.value.bio.length > 500) {
      errorMsg.value = '个人简介长度不能超过500个字符'
      return false
    }

    if (editInfo.value.website && editInfo.value.website.length > 255) {
      errorMsg.value = '网站URL长度不能超过255个字符'
      return false
    }

    if (editInfo.value.location && editInfo.value.location.length > 100) {
      errorMsg.value = '地址长度不能超过100个字符'
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
      const response = await fetchWithRefresh(`/auth/update-user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: editInfo.value.nickname || null,
          phone: editInfo.value.phone || null,
          avatar_url: editInfo.value.avatar_url || null,
          bio: editInfo.value.bio || null,
          website: editInfo.value.website || null,
          location: editInfo.value.location || null
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
      editInfo.value.avatar_url !== userInfo.value.avatar_url ||
      editInfo.value.bio !== userInfo.value.bio ||
      editInfo.value.website !== userInfo.value.website ||
      editInfo.value.location !== userInfo.value.location
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
