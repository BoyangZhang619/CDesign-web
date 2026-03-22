<template>
  <div class="page">
    <AppHeader />

    <main class="profile-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 编辑表单 -->
      <form v-else @submit.prevent="handleSubmit" class="profile-form">
        <!-- 页面标题 -->
        <h1 class="form-title">编辑资料</h1>

        <!-- 错误/成功提示 -->
        <div v-if="errorMsg" class="alert alert-error">
          <span>{{ errorMsg }}</span>
          <button type="button" @click="errorMsg = ''" class="alert-close">×</button>
        </div>
        <div v-if="successMsg" class="alert alert-success">
          <span>{{ successMsg }}</span>
          <button type="button" @click="successMsg = ''" class="alert-close">×</button>
        </div>

        <!-- 头像编辑区 -->
        <section class="form-section">
          <h2 class="section-title">头像</h2>
          <div class="avatar-edit-group">
            <div class="avatar-preview-wrapper">
              <img
                v-if="editInfo.avatar_url"
                :src="editInfo.avatar_url"
                :alt="editInfo.nickname || '用户头像'"
                class="avatar-preview-image"
              />
              <div v-else class="avatar-preview-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
            </div>
            <div class="avatar-input-group">
              <label for="avatar">头像链接</label>
              <input
                id="avatar"
                v-model="editInfo.avatar_url"
                type="url"
                placeholder="请输入头像图片的完整链接"
                class="form-input"
              />
              <span class="form-hint">输入 http:// 或 https:// 开头的图片链接</span>
            </div>
          </div>
        </section>

        <!-- 账户信息编辑区 -->
        <section class="form-section">
          <h2 class="section-title">账户信息</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                id="email"
                v-model="editInfo.email"
                type="email"
                class="form-input"
                disabled
              />
              <span class="form-hint">邮箱无法修改</span>
            </div>

            <div class="form-group">
              <label for="nickname">昵称</label>
              <input
                id="nickname"
                v-model="editInfo.nickname"
                type="text"
                placeholder="请输入昵称"
                class="form-input"
                maxlength="64"
              />
              <span class="form-hint">最多 64 个字符</span>
            </div>

            <div class="form-group">
              <label for="phone">电话</label>
              <input
                id="phone"
                v-model="editInfo.phone"
                type="tel"
                placeholder="请输入电话号码"
                class="form-input"
                maxlength="32"
              />
              <span class="form-hint">最多 32 个字符</span>
            </div>
          </div>
        </section>

        <!-- 账户状态信息（只读） -->
        <section class="form-section">
          <h2 class="section-title">账户状态</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="role">角色</label>
              <input
                id="role"
                :value="editInfo.role"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label for="status">账户状态</label>
              <input
                id="status"
                :value="editInfo.status === 1 ? '活跃' : '已禁用'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label for="admin">账户类型</label>
              <input
                id="admin"
                :value="editInfo.admin === 1 ? '管理员' : '普通用户'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label for="credits">模型点数</label>
              <input
                id="credits"
                :value="editInfo.credits"
                type="text"
                class="form-input"
                disabled
              />
            </div>
          </div>
        </section>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-cancel">返回</button>
          <button type="submit" class="btn btn-submit">保存修改</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const { userInfo, loading, loadUserInfo, saveUserInfo } = useUserProfile()

const editInfo = ref({
  email: '',
  nickname: '',
  phone: '',
  avatar_url: '',
  role: '',
  status: 0,
  admin: 0,
  credits: 0
})

const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  await loadUserInfo()
  updateEditInfo()
})

const updateEditInfo = () => {
  if (userInfo.value) {
    editInfo.value = {
      email: userInfo.value.email || '',
      nickname: userInfo.value.nickname || '',
      phone: userInfo.value.phone || '',
      avatar_url: userInfo.value.avatar_url || '',
      role: userInfo.value.role || '',
      status: userInfo.value.status || 0,
      admin: userInfo.value.admin || 0,
      credits: userInfo.value.credits || 0
    }
  }
}

const handleSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!editInfo.value.email) {
    errorMsg.value = '邮箱不能为空'
    return
  }

  if (!editInfo.value.nickname) {
    errorMsg.value = '昵称不能为空'
    return
  }

  // 更新 editInfo 然后保存
  try {
    await saveUserInfo()
    successMsg.value = '资料更新成功！'
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error: any) {
    errorMsg.value = error.message || '更新失败，请重试'
  }
}

const goBack = () => {
  router.push('/profile')
}
</script>

<style src="../css/ProfileEditView.css"></style>