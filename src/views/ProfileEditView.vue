<template>
  <div class="profile-layout">
    <!-- 侧边栏 -->
    <Sidebar ref="sidebarRef" />

    <!-- 主内容区 -->
    <div class="main-content">
      <TopHeader
        @toggle-sidebar="toggleSidebar"
        @toggle-ai-chat="toggleAIChat"
        :title="'编辑资料'"
        :subtitle="'修改您的个人信息'"
      />

      <div class="content-area">
        <!-- 左侧: 用户基本信息卡片 -->
        <ProfileLeftSidebar :userInfo="userInfo" />

        <!-- 右侧: 编辑表单 -->
        <div class="profile-edit-content">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 编辑表单 -->
          <form v-else @submit.prevent="handleSubmit" class="profile-edit-form">
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
            <section class="info-section">
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

            <!-- 基本信息编辑区 -->
            <section class="info-section">
              <h2 class="section-title">基本信息</h2>
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

            <!-- 个人信息编辑区 -->
            <section class="info-section">
              <h2 class="section-title">个人信息</h2>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="bio">个人简介</label>
                  <textarea
                    id="bio"
                    v-model="editInfo.bio"
                    placeholder="介绍一下自己，例如：热爱健身的大学生，坚持规律作息"
                    class="form-input textarea"
                    maxlength="500"
                    rows="4"
                  ></textarea>
                  <span class="form-hint">
                    最多 500 个字符 ({{ editInfo.bio?.length || 0 }}/500)
                  </span>
                </div>

                <div class="form-group">
                  <label for="location">地址</label>
                  <input
                    id="location"
                    v-model="editInfo.location"
                    type="text"
                    placeholder="例如：北京市朝阳区"
                    class="form-input"
                    maxlength="100"
                  />
                  <span class="form-hint">最多 100 个字符</span>
                </div>

                <div class="form-group">
                  <label for="website">个人网站</label>
                  <input
                    id="website"
                    v-model="editInfo.website"
                    type="url"
                    placeholder="例如：https://example.com"
                    class="form-input"
                    maxlength="255"
                  />
                  <span class="form-hint">个人博客、作品集等链接</span>
                </div>
              </div>
            </section>

            <!-- 账户状态信息（只读） -->
            <section class="info-section">
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

                <div class="form-group">
                  <label for="createdAt">创建时间</label>
                  <input
                    id="createdAt"
                    :value="formatDate(editInfo.created_at)"
                    type="text"
                    class="form-input"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label for="updatedAt">最后修改</label>
                  <input
                    id="updatedAt"
                    :value="formatDate(editInfo.updated_at)"
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
              <button type="submit" :disabled="!hasChanges" class="btn btn-submit">
                {{ hasChanges ? '保存修改' : '无变更' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Health Setup Modal -->
    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess" />
  </div>
  <!-- AI 聊天浮窗 -->
  <AIChatFloatingWindow :isOpen="isAIChatOpen" @close="closeAIChat" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import ProfileLeftSidebar from '../components/profileView/ProfileLeftSidebar.vue'
import { useUserProfile } from '../composables/useUserProfile'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import AIChatFloatingWindow from '../components/AIChatFloatingWindow.vue'
import { useTrendsView } from '../composables/useTrendsView'
import { fetchWithRefresh } from '../api/http'

const router = useRouter()
const { userInfo, loading, loadUserInfo } = useUserProfile()
const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()

const editInfo = ref({
  email: '',
  nickname: '',
  phone: '',
  avatar_url: '',
  role: '',
  status: 0,
  admin: 0,
  credits: 0,
  created_at: '',
  updated_at: '',
  bio: '',
  website: '',
  location: ''
})

const errorMsg = ref('')
const successMsg = ref('')

// 计算是否有变更
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

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isAIChatOpen = ref(false)

const toggleAIChat = () => {
  isAIChatOpen.value = !isAIChatOpen.value
  if (!isAIChatOpen.value) {
    closeAIChat()
  }
}

const closeAIChat = () => {
  isAIChatOpen.value = false
}

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
      credits: userInfo.value.credits || 0,
      created_at: userInfo.value.created_at || '',
      updated_at: userInfo.value.updated_at || '',
      bio: userInfo.value.bio || '',
      website: userInfo.value.website || '',
      location: userInfo.value.location || ''
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

  try {
    // 使用 fetchWithRefresh 发送请求，带有认证和自动 token 刷新
    const response = await fetchWithRefresh('/auth/update-user-info', {
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
      // 更新本地 userInfo
      if (userInfo.value) {
        userInfo.value.nickname = editInfo.value.nickname
        userInfo.value.phone = editInfo.value.phone
        userInfo.value.avatar_url = editInfo.value.avatar_url
        userInfo.value.bio = editInfo.value.bio
        userInfo.value.website = editInfo.value.website
        userInfo.value.location = editInfo.value.location
      }
      
      successMsg.value = '资料更新成功！'
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } else {
      errorMsg.value = data.message || '更新失败，请重试'
    }
  } catch (error: any) {
    errorMsg.value = error.message || '更新失败，请重试'
    console.error('Submit error:', error)
  }
}

const goBack = () => {
  router.push('/profile')
}
</script>

<style scoped>
@import '@/css/ProfileView.css';
@import '@/css/components/ProfileLeftSidebar.css';
@import '@/css/components/ProfileRightContent.css';



.content-area {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 30px;
  gap: 20px;
  position: relative;
  z-index: 1;
}


/* 编辑表单容器 */
.profile-edit-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background: white; */
  /* border: 1px solid #e8e1d6; */
  border-radius: 12px;
  padding: 0 24px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); */
  overflow-y: auto;
}

.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 40px;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #9db4a0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 表单区块 */
.info-section {
  color: #5a7a87;
  background: #ffffffca;
  border: 1px solid #e8e1d6;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #5a7a87;
  margin: 0;
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #8b9fa0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d9cfc8;
  border-radius: 6px;
  font-size: 14px;
  color: #5a7a87;
  background: white;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #9db4a0;
  background: white;
  box-shadow: 0 0 0 3px rgba(157, 180, 160, 0.1);
}

.form-input:disabled {
  background-color: #f5f3f0;
  color: #8b9fa0;
  cursor: not-allowed;
  border-color: #e8e1d6;
}

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-hint {
  font-size: 12px;
  color: #8b9fa0;
}

/* 头像编辑组 */
.avatar-edit-group {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 16px 0;
}

.avatar-preview-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #f0ebe6, #e8dfd8);
  border: 2px solid #e8e1d6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9cfc8;
}

.avatar-preview-empty svg {
  width: 50px;
  height: 50px;
}

.avatar-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 提示信息 */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.alert-error {
  background-color: #fef0f0;
  border: 1px solid #fcd5d5;
  color: #c33;
}

.alert-success {
  background-color: #f0fef0;
  border: 1px solid #d5fcd5;
  color: #363;
}

.alert-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid #e8e1d6;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background-color: #f8f6f3;
  color: #5a7a87;
  border: 1px solid #e8e1d6;
}

.btn-cancel:hover {
  background-color: #f0ebe6;
  border-color: #d9cfc8;
}

.btn-submit {
  background: linear-gradient(135deg, #9db4a0, #8fa591);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.3);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background: linear-gradient(135deg, #d1d5db, #c4c7ce);
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-edit-content {
    padding: 0 16px;
  }

  .profile-left{
    display: none;
  }

  .content-area {
    flex-direction: column;
    padding: 16px;
  }

  .info-section {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .avatar-edit-group {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .avatar-input-group {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
  }
}

/* 自定义滚动条 */
.profile-edit-content::-webkit-scrollbar {
  width: 6px;
}

.profile-edit-content::-webkit-scrollbar-track {
  background: transparent;
}

.profile-edit-content::-webkit-scrollbar-thumb {
  background-color: #d0ccc4;
  border-radius: 3px;
}

.profile-edit-content::-webkit-scrollbar-thumb:hover {
  background-color: #c0b8b0;
}
</style>