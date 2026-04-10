<template>
  <div class="profile-right">
    <!-- 基本信息区 -->
    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">基本信息</h3>
        <button class="edit-btn" @click="$emit('edit')">
          ✏️ 编辑
        </button>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ userInfo?.email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ userInfo?.nickname || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">电话</span>
          <span class="info-value">{{ userInfo?.phone || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">角色</span>
          <span class="info-value">{{ userInfo?.role }}</span>
        </div>
      </div>
    </section>

    <!-- 时间信息区 -->
    <section class="info-section">
      <h3 class="section-title">时间信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">创建于</span>
          <span class="info-value">{{ formatDate(userInfo?.created_at) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">最后修改</span>
          <span class="info-value">{{ formatDate(userInfo?.updated_at) }}</span>
        </div>
        <div v-if="userInfo?.last_login_time" class="info-item">
          <span class="info-label">最后登录</span>
          <span class="info-value">{{ formatDate(userInfo.last_login_time) }}</span>
        </div>
      </div>
    </section>

    <!-- 健康档案信息区 -->
    <section class="info-section">
      <h3 class="section-title">健康档案</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">设置状态</span>
          <span :class="['info-value', 'status-' + (healthProfile?.is_completed ? 'complete' : 'incomplete')]">
            {{ healthProfile?.is_completed ? '✓ 已完成' : '⊘ 未设置' }}
          </span>
        </div>
        <div v-if="healthProfile?.setup_date" class="info-item">
          <span class="info-label">设置于</span>
          <span class="info-value">{{ formatDate(healthProfile.setup_date) }}</span>
        </div>
      </div>
    </section>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <button class="btn btn-primary" @click="$emit('edit')">
        编辑个人资料
      </button>
      <button class="btn btn-secondary" @click="$emit('logout')">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import 
defineProps<{
  userInfo: any
  healthProfile: any
}>()

defineEmits<{
  edit: []
  logout: []
}>()

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
</script>

<style scoped>
@import '@/css/components/ProfileRightContent.css';
</style>
