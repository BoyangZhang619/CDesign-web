<template>
  <div class="profile-edit">
    <!-- 头部 -->
    <div class="pe-header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>编辑用户信息</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 编辑表单 -->
    <form v-else @submit.prevent="handleSubmit" class="pe-content">
      <!-- 错误提示 -->
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

      <!-- 成功提示 -->
      <div v-if="successMsg" class="success-message">{{ successMsg }}</div>

      <!-- 账户信息部分 -->
      <section class="form-section">
        <h3>账户信息</h3>

        <!-- 邮箱 -->
        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="editInfo.email"
            type="email"
            class="form-input"
          />
        </div>

        <!-- 昵称 -->
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
          <div class="input-hint">最多 64 个字符</div>
        </div>

        <!-- 电话 -->
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
          <div class="input-hint">最多 32 个字符</div>
        </div>

        <!-- 头像 URL -->
        <div class="form-group">
          <label for="avatar">头像 URL</label>
          <input
            id="avatar"
            v-model="editInfo.avatar_url"
            type="url"
            placeholder="请输入头像链接"
            class="form-input"
            maxlength="255"
          />
          <div class="input-hint">请输入有效的图片 URL</div>
          <div v-if="editInfo.avatar_url" class="avatar-preview">
            <img :src="editInfo.avatar_url" :alt="editInfo.nickname || '头像预览'" />
          </div>
        </div>
      </section>

      <!-- 账户状态部分（部分只读） -->
      <section class="form-section">
        <h3>账户状态（信息只读）</h3>

        <!-- 账户角色 -->
        <div class="form-group">
          <label>角色</label>
          <input
            :value="editInfo.role"
            type="text"
            class="form-input"
          />
        </div>

        <!-- 账户状态 -->
        <div class="form-group">
          <label>账户状态</label>
          <input
            :value="editInfo.status === 1 ? '活跃' : '已禁用'"
            type="text"
            disabled
            class="form-input disabled"
          />
        </div>

        <!-- 管理员标记 -->
        <div class="form-group">
          <label>账户类型</label>
          <input
            :value="editInfo.admin === 1 ? '管理员' : '普通用户'"
            type="text"
            disabled
            class="form-input disabled"
          />
        </div>

        <!-- 模型点数 -->
        <div class="form-group">
          <label>模型点数</label>
          <input
            :value="editInfo.credits"
            type="number"
            disabled
            class="form-input disabled"
          />
        </div>
      </section>

      <!-- 时间信息部分（只读） -->
      <section class="form-section">
        <h3>时间信息（只读）</h3>

        <!-- 创建时间 -->
        <div class="form-group">
          <label>创建时间</label>
          <input
            :value="formatDateTime(editInfo.created_at)"
            type="text"
            disabled
            class="form-input disabled"
          />
        </div>

        <!-- 最后修改 -->
        <div class="form-group">
          <label>最后修改</label>
          <input
            :value="formatDateTime(editInfo.updated_at)"
            type="text"
            disabled
            class="form-input disabled"
          />
        </div>

        <!-- 最后登录 -->
        <div class="form-group">
          <label>最后登录</label>
          <input
            :value="editInfo.last_login_time ? formatDateTime(editInfo.last_login_time) : '未登录'"
            type="text"
            disabled
            class="form-input disabled"
          />
        </div>
      </section>

      <!-- 表单按钮 -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-cancel">取消</button>
        <button
          type="submit"
          :disabled="!hasChanges || loading"
          class="btn-submit"
        >
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const {
  userInfo,
  editInfo,
  loading,
  errorMsg,
  successMsg,
  loadUserInfo,
  enterEditMode,
  saveUserInfo
} = useUserProfile()

const hasChanges = computed(() => {
  if (!userInfo.value) return false
  return (
    editInfo.value.nickname !== userInfo.value.nickname ||
    editInfo.value.phone !== userInfo.value.phone ||
    editInfo.value.avatar_url !== userInfo.value.avatar_url
  )
})

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const goBack = () => {
  router.push('/profile')
}

const handleSubmit = async () => {
  await saveUserInfo()
  if (!errorMsg.value) {
    setTimeout(() => {
      goBack()
    }, 1500)
  }
}

// 初始化
loadUserInfo().then(() => {
  enterEditMode()
})
</script>

<style src="../css/ProfileEdit.css">
</style>
