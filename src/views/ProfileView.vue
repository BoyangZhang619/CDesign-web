<template>
  <div class="profile container-md">
    <!-- Header: Avatar + Info -->
    <div class="profile-header">
      <img
        :src="userInfo?.avatar_url || '/logo-stuheal.svg'"
        alt="头像"
        class="profile-avatar"
      />
      <div class="profile-meta">
        <h2 class="profile-name">{{ userInfo?.nickname || userInfo?.email?.split('@')[0] || '用户' }}</h2>
        <p class="profile-email">{{ userInfo?.email }}</p>
        <p v-if="userInfo?.bio" class="profile-bio">{{ userInfo.bio }}</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat">
        <span class="stat-num">--</span>
        <span class="stat-label">打卡天</span>
      </div>
      <div class="stat">
        <span class="stat-num">--</span>
        <span class="stat-label">完成率</span>
      </div>
      <div class="stat">
        <span class="stat-num">--</span>
        <span class="stat-label">连续天</span>
      </div>
    </div>

    <!-- Settings Entry -->
    <router-link to="/settings" class="settings-entry">
      <span class="settings-entry__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </span>
      <span class="settings-entry__text">设置</span>
      <span class="settings-entry__arrow">→</span>
    </router-link>

    <!-- Quick Links Grid -->
    <div class="quick-grid">
      <router-link v-for="link in quickLinks" :key="link.path" :to="link.path" class="quick-card">
        <span class="quick-card__icon" :style="{ color: link.color }" v-html="link.icon"></span>
        <span class="quick-card__label">{{ link.label }}</span>
      </router-link>
    </div>

    <!-- Logout -->
    <button class="logout-btn" @click="handleLogout">退出登录</button>

    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserProfile } from '../composables/useUserProfile'
import { useTrendsView } from '../composables/useTrendsView'
import HealthSetupModal from '../components/HealthSetupModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, loadUserInfo } = useUserProfile()
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()

const quickLinks = [
  {
    label: '打卡',
    path: '/checkin',
    color: '#0095F6',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    label: '画像',
    path: '/analysis/portrait',
    color: '#DD2A7B',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
  },
  {
    label: '趋势',
    path: '/analysis/trends',
    color: '#78C850',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`,
  },
  {
    label: '历史',
    path: '/history',
    color: '#F77737',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
]

async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/auth')
  }
}

onMounted(async () => {
  await loadUserInfo()
})
</script>

<style lang="scss" scoped>
.profile {
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

// ── Header ──────────────────────────────────────────────────
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.profile-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.profile-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.profile-bio {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  max-width: 300px;
  margin-top: var(--space-2);
}

// ── Stats ───────────────────────────────────────────────────
.stats-row {
  display: flex;
  justify-content: center;
  gap: var(--space-10);
  padding: var(--space-4) 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-num {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

// ── Settings Entry ──────────────────────────────────────────
.settings-entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);

  &:hover { background: var(--color-bg-secondary); }
}

.settings-entry__icon { display: flex; color: var(--color-text-secondary); }
.settings-entry__text { flex: 1; font-weight: var(--font-weight-medium); }
.settings-entry__arrow { color: var(--color-text-tertiary); }

// ── Quick Grid ─────────────────────────────────────────────
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  width: 100%;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  transition: all var(--transition-fast);

  &:hover { background: var(--color-bg-secondary); }
  &:active { transform: scale(0.97); }
}

.quick-card__icon { display: flex; }
.quick-card__label { font-size: var(--font-size-xs); color: var(--color-text-secondary); }

// ── Logout ──────────────────────────────────────────────────
.logout-btn {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-3);
  background: none;
  border: none;
  cursor: pointer;
  margin-top: var(--space-4);

  &:hover { opacity: 0.7; }
}
</style>
