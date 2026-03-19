import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function useAuthForm() {
  const router = useRouter()
  const authStore = useAuthStore()

  const isLoginMode = ref(true)
  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  const loginForm = reactive({
    email: '',
    password: ''
  })

  const registerForm = reactive({
    email: '',
    password: '',
    confirmPassword: ''
  })

  function toggleMode() {
    isLoginMode.value = !isLoginMode.value
    errorMsg.value = ''
    successMsg.value = ''
    loginForm.email = ''
    loginForm.password = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  }

  function validateLoginForm(): boolean {
    if (!loginForm.email || !loginForm.password) {
      errorMsg.value = '请输入邮箱和密码'
      return false
    }

    if (loginForm.password.length < 6) {
      errorMsg.value = '密码至少需要6位'
      return false
    }

    return true
  }

  function validateRegisterForm(): boolean {
    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      errorMsg.value = '请填写所有字段'
      return false
    }

    if (registerForm.password.length < 6) {
      errorMsg.value = '密码至少需要6位'
      return false
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      errorMsg.value = '两次输入的密码不一致'
      return false
    }

    return true
  }

  async function checkHealthInfoNeeded(): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'
      const response = await fetch(`${apiUrl}/api/health-info/check-health-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        console.warn('检查健康信息状态失败:', response.status)
        return false
      }

      const data = await response.json()

      if (data?.success && typeof data.data?.needHealthInfo === 'boolean') {
        return data.data.needHealthInfo
      }

      console.warn('健康信息检查响应结构异常:', data)
      return false
    } catch (error) {
      console.warn('检查健康信息出错:', error)
      return false
    }
  }

  async function handleLogin() {
    errorMsg.value = ''

    if (!validateLoginForm()) {
      return
    }

    loading.value = true

    try {
      await authStore.login({
        email: loginForm.email,
        password: loginForm.password
      })

      const needsHealthInfo = await checkHealthInfoNeeded()
      if (needsHealthInfo) {
        router.push('/health-setup')
      } else {
        router.push('/home')
      }
    } catch (error: any) {
      errorMsg.value =
        error?.response?.data?.message ||
        error?.message ||
        '登录失败，请检查邮箱和密码'
    } finally {
      loading.value = false
    }
  }

  async function handleRegister() {
    errorMsg.value = ''
    successMsg.value = ''

    if (!validateRegisterForm()) {
      return
    }

    loading.value = true

    try {
      await authStore.register({
        email: registerForm.email,
        password: registerForm.password
      })

      successMsg.value = '注册成功，请登录'

      setTimeout(() => {
        toggleMode()
        loginForm.email = registerForm.email
      }, 1500)
    } catch (error: any) {
      errorMsg.value = error?.response?.data?.message || error?.message || '注册失败'
    } finally {
      loading.value = false
    }
  }

  return {
    isLoginMode,
    loading,
    errorMsg,
    successMsg,
    loginForm,
    registerForm,
    toggleMode,
    handleLogin,
    handleRegister
  }
}
