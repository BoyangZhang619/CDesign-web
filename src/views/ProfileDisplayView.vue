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

<style scoped>
.profile-display {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafaf9 0%, #f5f5f2 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.pd-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(180deg, rgba(250, 250, 249, 0.98) 0%, rgba(245, 245, 242, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(215, 168, 143, 0.1);
  padding: 12px 16px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pd-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pd-header-top h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2d2d2a;
  margin: 0;
}

.edit-btn {
  padding: 8px 16px;
  background: #d8a88f;
  color: #fafaf9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-btn:hover {
  background: #c9976f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(216, 168, 143, 0.2);
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a7a77;
  font-size: 16px;
}

.no-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7a7a77;
  padding: 40px 16px;
}

.pd-content {
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

/* 信息卡片部分 */
.info-section {
  margin-bottom: 24px;
}

.info-section h3,
.status-section h3,
.time-section h3,
.avatar-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2d2d2a;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-label {
  font-size: 12px;
  color: #7a7a77;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 14px;
  color: #2d2d2a;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.4;
}

/* 状态卡片部分 */
.status-section {
  margin-bottom: 24px;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.status-icon {
  font-size: 28px;
  margin-bottom: 8px;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.status-icon.active {
  background: linear-gradient(135deg, #b4c9a3 0%, #a3b892 100%);
  color: white;
}

.status-icon.inactive {
  background: linear-gradient(135deg, #d8a88f 0%, #c9976f 100%);
  color: white;
}

.status-icon.admin {
  background: linear-gradient(135deg, #d8a88f 0%, #c9976f 100%);
  color: white;
}

.status-icon.normal {
  background: linear-gradient(135deg, #8fb3d4 0%, #7da3c4 100%);
  color: white;
}

.status-icon.credit {
  background: linear-gradient(135deg, #f0b88f 0%, #e0a87f 100%);
  color: white;
}

.status-label {
  font-size: 12px;
  color: #7a7a77;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.status-value {
  font-size: 14px;
  color: #2d2d2a;
  font-weight: 600;
}

/* 时间卡片部分 */
.time-section {
  margin-bottom: 24px;
}

.time-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.time-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.time-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.time-label {
  font-size: 12px;
  color: #7a7a77;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 60px;
  flex-shrink: 0;
}

.time-value {
  flex: 1;
  font-size: 14px;
  color: #2d2d2a;
  font-weight: 600;
}

.time-detail {
  font-size: 12px;
  color: #7a7a77;
}

/* 头像部分 */
.avatar-section {
  margin-bottom: 24px;
}

.avatar-display {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.avatar-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

/* 底部操作 */
.pd-footer {
  padding: 16px;
  border-top: 1px solid rgba(215, 168, 143, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #d8a88f 0%, #c9976f 100%);
  color: #fafaf9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(216, 168, 143, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

/* 响应式 */
@media (max-width: 768px) {
  .info-cards {
    grid-template-columns: 1fr;
  }

  .status-cards {
    grid-template-columns: 1fr;
  }

  .time-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-value {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .pd-header {
    padding: 10px 12px 6px;
  }

  .pd-header-top h1 {
    font-size: 20px;
  }

  .pd-content {
    padding: 12px;
  }

  .info-cards,
  .status-cards {
    gap: 8px;
  }

  .info-card,
  .status-card,
  .time-card {
    padding: 12px;
  }
}
</style>
