// /**
//  * 前端API集成测试和使用示例
//  * 
//  * 这个文件展示了如何在Vue组件中使用认证相关的API
//  * 
//  * 确保已配置环境变量：
//  * - .env.development: VITE_API_URL=http://localhost:8080
//  * - .env.production: VITE_API_URL=https://cda.api.zbyblq.xin
//  */

// import { useAuthStore } from '../stores/auth'
// import type { AxiosError } from 'axios'

// /**
//  * 示例1：用户注册
//  * 
//  * 使用方式：在注册表单提交时调用
//  */
// export async function exampleRegister() {
//   const authStore = useAuthStore()

//   try {
//     const result = await authStore.register({
//       username: 'newuser',
//       password: 'password123'
//     })

//     console.log('✅ 注册成功:', result)
//     return result
//   } catch (error: unknown) {
//     const err = error as AxiosError
//     console.error('❌ 注册失败:', err.response?.data || err.message)
//     throw error
//   }
// }

// /**
//  * 示例2：用户登录
//  * 
//  * 使用方式：在登录表单提交时调用
//  */
// export async function exampleLogin() {
//   const authStore = useAuthStore()

//   try {
//     const result = await authStore.login({
//       username: 'testuser',
//       password: 'password123'
//     })

//     console.log('✅ 登录成功:', result)
//     console.log('📝 用户信息:', authStore.userInfo)
//     console.log('🔑 Access Token:', authStore.token)

//     // 登录成功后，自动跳转到首页
//     // router.push('/')

//     return result
//   } catch (error: unknown) {
//     const err = error as AxiosError
//     console.error('❌ 登录失败:', err.response?.data || err.message)
//     throw error
//   }
// }

// /**
//  * 示例3：获取用户信息
//  * 
//  * 使用方式：进入个人中心或需要显示用户信息时调用
//  */
// export async function exampleFetchUserInfo() {
//   const authStore = useAuthStore()

//   try {
//     const result = await authStore.fetchUserInfo()

//     console.log('✅ 获取用户信息成功:', result)
//     console.log('👤 用户信息:', {
//       id: authStore.userInfo?.id,
//       email: authStore.userInfo?.email,
//       credits: authStore.userInfo?.credits,
//       created_at: authStore.userInfo?.created_at
//     })

//     return result
//   } catch (error: unknown) {
//     const err = error as AxiosError
//     console.error('❌ 获取用户信息失败:', err.response?.data || err.message)
//     throw error
//   }
// }

// /**
//  * 示例4：手动刷新Token
//  * 
//  * 使用方式：Token即将过期时调用（通常由HTTP拦截器自动处理）
//  */
// export async function exampleRefreshToken() {
//   const authStore = useAuthStore()

//   try {
//     const result = await authStore.refreshToken()

//     console.log('✅ Token刷新成功:', result)
//     console.log('🔑 新的 Access Token:', authStore.token)

//     return result
//   } catch (error: unknown) {
//     const err = error as AxiosError
//     console.error('❌ Token刷新失败:', err.response?.data || err.message)
//     console.error('⚠️  已清除本地登录状态，请重新登录')
//     throw error
//   }
// }

// /**
//  * 示例5：单设备登出
//  * 
//  * 使用方式：用户点击登出按钮时调用
//  */
// export async function exampleLogout() {
//   const authStore = useAuthStore()

//   try {
//     await authStore.logout()

//     console.log('✅ 登出成功')
//     console.log('🔄 已清除Token和用户信息')

//     // 登出成功后，自动跳转到登录页
//     // router.push('/login')
//   } catch (error: unknown) {
//     const err = error as AxiosError
//     console.error('❌ 登出失败:', err.response?.data || err.message)
//     throw error
//   }
// }

// /**
//  * 示例6：处理登录状态
//  * 
//  * 使用方式：在组件中判断用户是否已登录
//  */
// export function exampleCheckLoginStatus() {
//   const authStore = useAuthStore()

//   if (authStore.isLoggedIn) {
//     console.log('✅ 用户已登录')
//     console.log('👤 用户信息:', authStore.userInfo)
//   } else {
//     console.log('❌ 用户未登录')
//   }

//   return authStore.isLoggedIn
// }

// /**
//  * 示例7：在Vue组件中的完整使用
//  * 
//  * <template>
//  *   <div>
//  *     <!-- 登录表单 -->
//  *     <form @submit.prevent="handleLogin" v-if="!authStore.isLoggedIn">
//  *       <input v-model="username" placeholder="用户名" />
//  *       <input v-model="password" type="password" placeholder="密码" />
//  *       <button :disabled="authStore.loading">登录</button>
//  *     </form>
//  *
//  *     <!-- 用户信息展示 -->
//  *     <div v-if="authStore.isLoggedIn">
//  *       <h2>欢迎, {{ authStore.userInfo?.email }}</h2>
//  *       <p>额度: {{ authStore.userInfo?.credits }}</p>
//  *       <button @click="handleLogout" :disabled="authStore.loading">登出</button>
//  *     </div>
//  *   </div>
//  * </template>
//  *
//  * <script setup lang="ts">
//  * import { ref } from 'vue'
//  * import { useAuthStore } from '@/stores/auth'
//  *
//  * const authStore = useAuthStore()
//  * const username = ref('')
//  * const password = ref('')
//  *
//  * async function handleLogin() {
//  *   try {
//  *     await authStore.login({ username: username.value, password: password.value })
//  *     // 登录成功，路由守卫会自动跳转
//  *   } catch (error) {
//  *     console.error('登录失败:', error)
//  *     // 显示错误提示
//  *   }
//  * }
//  *
//  * async function handleLogout() {
//  *   try {
//  *     await authStore.logout()
//  *     // 登出成功，路由守卫会自动跳转
//  *   } catch (error) {
//  *     console.error('登出失败:', error)
//  *   }
//  * }
//  * </script>
//  */

// /**
//  * 示例8：API文档中的通用响应格式
//  * 
//  * 所有API响应都遵循以下格式：
//  * 
//  * 成功响应:
//  * {
//  *   "success": true,
//  *   "message": "操作成功描述",
//  *   "data": {
//  *     // 响应数据
//  *   }
//  * }
//  * 
//  * 错误响应:
//  * {
//  *   "success": false,
//  *   "message": "错误描述信息",
//  *   "data": null
//  * }
//  * 
//  * HTTP状态码:
//  * - 200: 成功
//  * - 400: 请求参数错误
//  * - 401: 未授权（Token无效或过期）
//  * - 403: 禁止访问（权限不足）
//  * - 404: 资源不存在
//  * - 500: 服务器错误
//  */

// /**
//  * 示例9：认证流程图
//  * 
//  * 1. 首次访问
//  *    ├─ 检查localStorage中的token
//  *    ├─ 如果不存在，显示登录页
//  *    └─ 如果存在，验证token有效性
//  *
//  * 2. 用户登录
//  *    ├─ POST /api/auth/login
//  *    ├─ 后端返回accessToken和user信息
//  *    ├─ 同时在Set-Cookie中设置refreshToken（HttpOnly）
//  *    ├─ 前端保存accessToken到localStorage
//  *    └─ 路由跳转到首页
//  *
//  * 3. 发送API请求
//  *    ├─ 自动在Authorization请求头添加Bearer Token
//  *    ├─ 如果返回401错误：
//  *    │  ├─ 自动调用POST /api/auth/refresh
//  *    │  ├─ 使用Cookie中的refreshToken
//  *    │  ├─ 获得新的accessToken
//  *    │  └─ 重试原始请求
//  *    └─ 如果是其他错误，直接返回错误
//  *
//  * 4. 用户登出
//  *    ├─ POST /api/auth/logout
//  *    ├─ 后端删除refreshToken
//  *    ├─ 前端删除localStorage中的token
//  *    └─ 路由跳转到登录页
//  */

// export default {
//   exampleRegister,
//   exampleLogin,
//   exampleFetchUserInfo,
//   exampleRefreshToken,
//   exampleLogout,
//   exampleCheckLoginStatus
// }
