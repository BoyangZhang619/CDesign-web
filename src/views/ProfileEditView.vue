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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import ProfileLeftSidebar from '../components/profileView/ProfileLeftSidebar.vue'
import { useUserProfile } from '../composables/useUserProfile'
import HealthSetupModal from '../components/HealthSetupModal.vue'
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

<style lang="scss" scoped src="@/scss/views/ProfileEditView.scss"></style>