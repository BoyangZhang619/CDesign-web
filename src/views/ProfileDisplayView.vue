<template>
  <div class="profile-display">
    <!-- 头部 -->
    <div class="pd-header">
      <div class="pd-header-top">
        <h1>用户信息</h1>
        <button @click="goToEdit" class="edit-btn">编辑</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 数据不存在 -->
    <div v-else-if="!userInfo" class="no-data">
      <p>暂无用户信息</p>
    </div>

    <!-- 数据展示 -->
    <div v-else class="pd-content">
      <!-- 账户信息卡片 -->
      <section class="info-section">
        <h3>账户信息</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ userInfo.email }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">昵称</div>
            <div class="info-value">{{ userInfo.nickname || '未设置' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">电话</div>
            <div class="info-value">{{ userInfo.phone || '未设置' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">角色</div>
            <div class="info-value">{{ userInfo.role }}</div>
          </div>
        </div>
      </section>

      <!-- 账户状态 -->
      <section class="status-section">
        <h3>账户状态</h3>
        <div class="status-cards">
          <div class="status-card">
            <div class="status-icon" :class="userInfo.status === 1 ? 'active' : 'inactive'">
              {{ userInfo.status === 1 ? '✓' : '✗' }}
            </div>
            <div class="status-label">账户状态</div>
            <div class="status-value">{{ userInfo.status === 1 ? '活跃' : '已禁用' }}</div>
          </div>
          <div class="status-card">
            <div class="status-icon" :class="userInfo.admin === 1 ? 'admin' : 'normal'">
              {{ userInfo.admin === 1 ? '👑' : '👤' }}
            </div>
            <div class="status-label">账户类型</div>
            <div class="status-value">{{ userInfo.admin === 1 ? '管理员' : '普通用户' }}</div>
          </div>
          <div class="status-card">
            <div class="status-icon credit">💎</div>
            <div class="status-label">模型点数</div>
            <div class="status-value">{{ userInfo.credits }}</div>
          </div>
        </div>
      </section>

      <!-- 时间信息 -->
      <section class="time-section">
        <h3>时间信息</h3>
        <div class="time-cards">
          <div class="time-card">
            <div class="time-label">创建时间</div>
            <div class="time-value">{{ formatDate(userInfo.created_at) }}</div>
            <div class="time-detail">{{ formatTime(userInfo.created_at) }}</div>
          </div>
          <div class="time-card">
            <div class="time-label">最后修改</div>
            <div class="time-value">{{ formatDate(userInfo.updated_at) }}</div>
            <div class="time-detail">{{ formatTime(userInfo.updated_at) }}</div>
          </div>
          <div v-if="userInfo.last_login_time" class="time-card">
            <div class="time-label">最后登录</div>
            <div class="time-value">{{ formatDate(userInfo.last_login_time) }}</div>
            <div class="time-detail">{{ formatTime(userInfo.last_login_time) }}</div>
          </div>
        </div>
      </section>

      <!-- 头像区域 -->
      <section v-if="userInfo.avatar_url" class="avatar-section">
        <h3>头像</h3>
        <div class="avatar-display">
          <img :src="userInfo.avatar_url" :alt="userInfo.nickname || '用户头像'" class="avatar-img" />
        </div>
      </section>
    </div>

    <!-- 底部操作 -->
    <div v-if="userInfo" class="pd-footer">
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const { userInfo, loading, loadUserInfo } = useUserProfile()

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const goToEdit = () => {
  router.push('/profile/edit')
}

const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    // TODO: 调用登出接口 - POST /api/auth/logout
    localStorage.removeItem('token')
    router.push('/auth')
  }
}

onMounted(async () => {
  await loadUserInfo()
})
</script>

<style src="../css/ProfileDisplayView.css">
</style>
