<template>
  <div class="profile-left">
    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="user-avatar-wrapper">
        <img v-if="userInfo?.avatar_url" :src="userInfo.avatar_url" :alt="userInfo.nickname || '用户头像'" class="user-avatar" />
        <div v-else class="user-avatar-empty">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
      <h2 class="user-name">{{ userInfo?.nickname || userInfo?.email || '用户' }}</h2>
      <p class="user-email">{{ userInfo?.email }}</p>
      <p v-if="userInfo?.phone" class="user-phone">📱 {{ userInfo.phone }}</p>
    </div>

    <!-- 账户状态卡片 -->
    <div class="stats-card">
      <h3 class="card-title">账户状态</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">状态</span>
          <span :class="['stat-badge', userInfo?.status === 1 ? 'active' : 'inactive']">
            {{ userInfo?.status === 1 ? '活跃' : '禁用' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">角色</span>
          <span :class="['stat-badge', userInfo?.admin === 1 ? 'admin' : 'user']">
            {{ userInfo?.admin === 1 ? '管理员' : '用户' }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  userInfo: any
}>()
</script>

<style scoped>
@import '@/css/components/ProfileLeftSidebar.css';
</style>
