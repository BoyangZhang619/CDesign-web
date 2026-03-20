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

        <!-- 邮箱（只读） -->
        <div class="form-group">
          <label>邮箱（账户标识，不可修改）</label>
          <input
            v-model="editInfo.email"
            type="email"
            disabled
            class="form-input disabled"
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

      <!-- 账户状态部分（只读） -->
      <section class="form-section">
        <h3>账户状态（信息只读）</h3>

        <!-- 账户角色 -->
        <div class="form-group">
          <label>角色</label>
          <input
            :value="editInfo.role"
            type="text"
            disabled
            class="form-input disabled"
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

<style scoped>
.profile-edit {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafaf9 0%, #f5f5f2 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.pe-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(180deg, rgba(250, 250, 249, 0.98) 0%, rgba(245, 245, 242, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(215, 168, 143, 0.1);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.back-btn {
  padding: 8px 12px;
  background: transparent;
  color: #2d2d2a;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  color: #d8a88f;
  transform: translateX(-2px);
}

.pe-header h1 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #2d2d2a;
  margin: 0;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a7a77;
  font-size: 16px;
}

.pe-content {
  flex: 1;
  padding: 16px;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 提示信息 */
.error-message,
.success-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-message {
  background: rgba(216, 168, 143, 0.1);
  color: #c9976f;
  border-left: 3px solid #c9976f;
}

.success-message {
  background: rgba(180, 201, 163, 0.1);
  color: #8ba34f;
  border-left: 3px solid #8ba34f;
}

/* 表单部分 */
.form-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #2d2d2a;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-section:not(:first-of-type) h3 {
  margin-top: 0;
}

/* 表单组 */
.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #2d2d2a;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* 表单输入 */
.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #fafaf9;
  border: 1px solid rgba(215, 168, 143, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #2d2d2a;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:not(.disabled):focus {
  outline: none;
  background: white;
  border-color: #d8a88f;
  box-shadow: 0 0 0 2px rgba(216, 168, 143, 0.1);
}

.form-input.disabled {
  background: #f5f5f2;
  color: #7a7a77;
  cursor: not-allowed;
  border-color: rgba(215, 168, 143, 0.1);
}

.form-input::placeholder {
  color: #b3b3b0;
}

.input-hint {
  font-size: 12px;
  color: #7a7a77;
  margin-top: 4px;
}

/* 头像预览 */
.avatar-preview {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(215, 168, 143, 0.2);
  max-width: 150px;
}

.avatar-preview img {
  width: 100%;
  height: auto;
  display: block;
}

/* 表单按钮 */
.form-actions {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.btn-cancel {
  background: #f0f0ed;
  color: #2d2d2a;
}

.btn-cancel:hover:not(:disabled) {
  background: #e0e0dd;
  transform: translateY(-1px);
}

.btn-submit {
  background: linear-gradient(135deg, #d8a88f 0%, #c9976f 100%);
  color: #fafaf9;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(216, 168, 143, 0.2);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

/* 响应式 */
@media (max-width: 480px) {
  .pe-header {
    padding: 10px 12px;
  }

  .pe-header h1 {
    font-size: 16px;
  }

  .pe-content {
    padding: 12px;
  }

  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .form-actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
