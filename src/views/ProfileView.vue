<template>
  <div class="profile container-md">
    <!-- Skeleton blocks prevent layout shift while loading -->
    <!-- Avatar row -->
    <div class="profile-header">
      <router-link to="/avatar-editor" class="avatar-link">
        <PixelAvatar v-if="hasAvatar" :pixelData="pixelData" :level="pixelLevel" :size="80" />
        <div v-else class="avatar-skeleton"></div>
        <span class="avatar-edit-badge">✎</span>
      </router-link>
      <!-- Name skeleton or real -->
      <div class="profile-meta">
        <h2 v-if="userInfo?.nickname" class="profile-name">{{ userInfo.nickname }}</h2>
        <div v-else-if="!userLoading" class="skeleton-line skeleton-line--lg"></div>
        <p v-if="userInfo?.email" class="profile-email">{{ userInfo.email }}</p>
        <div v-else-if="!userLoading" class="skeleton-line"></div>
        <p v-if="userInfo?.bio" class="profile-bio">{{ userInfo.bio }}</p>
        <div v-else-if="!userLoading" class="skeleton-line skeleton-line--sm"></div>
      </div>
    </div>

    <!-- Stats (always same height, numbers populate later) -->
    <div class="stats-row">
      <div class="stat"><span class="stat-num">--</span><span class="stat-label">打卡天</span></div>
      <div class="stat"><span class="stat-num">--</span><span class="stat-label">完成率</span></div>
      <div class="stat"><span class="stat-num">--</span><span class="stat-label">连续天</span></div>
    </div>

    <!-- Settings entry (always visible) -->
    <router-link to="/settings" class="settings-entry">
      <span class="settings-entry__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </span>
      <span class="settings-entry__text">设置</span>
      <span class="settings-entry__arrow">→</span>
    </router-link>

    <!-- Quick Links (always visible) -->
    <div class="quick-grid">
      <router-link v-for="link in quickLinks" :key="link.path" :to="link.path" class="quick-card">
        <span class="quick-card__icon" :style="{ color: link.color }" v-html="link.icon"></span>
        <span class="quick-card__label">{{ link.label }}</span>
      </router-link>
    </div>

    <button class="logout-btn" @click="handleLogout">退出登录</button>

    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserProfile } from '../composables/useUserProfile'
import { useAvatar } from '../composables/useAvatar'
import { useTrendsView } from '../composables/useTrendsView'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import PixelAvatar from '../components/PixelAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, loadUserInfo, loading: userLoading } = useUserProfile()
const { pixelData, pixelLevel, hasAvatar } = useAvatar()
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()

const quickLinks = [
  { label: '打卡', path: '/checkin', color: '#6A9AB8', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { label: '画像', path: '/analysis/portrait', color: '#D4887A', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>` },
  { label: '趋势', path: '/analysis/trends', color: '#7AAB9E', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>` },
  { label: '历史', path: '/history', color: '#D4A87A', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
]

async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/auth')
  }
}

onMounted(async () => { await loadUserInfo() })
</script>

<style lang="scss" scoped>
.profile { padding: var(--space-6) var(--space-4); display: flex; flex-direction: column; align-items: center; gap: var(--space-5); }

// Header
.profile-header { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); text-align: center; min-height: 140px; }
.profile-meta { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); min-height: 60px; }
.profile-name { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.profile-email { font-size: var(--font-size-sm); color: var(--text-secondary); }
.profile-bio { font-size: var(--font-size-sm); color: var(--text-primary); max-width: 300px; margin-top: var(--space-2); }

// Avatar
.avatar-link { position: relative; display: block; }
.avatar-edit-badge {
  position: absolute; bottom: 0; right: 0; width: 24px; height: 24px;
  background: var(--brand-blue); color: #fff; border-radius: var(--radius-full);
  font-size: 12px; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--bg-card-white);
}

// Skeleton blocks — fixed size, prevent layout shift
.avatar-skeleton {
  width: 80px; height: 80px; border-radius: var(--radius-xl);
  background: linear-gradient(90deg, var(--color-border) 25%, var(--bg-blue-light) 50%, var(--color-border) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-line {
  height: 14px; width: 120px; border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-border) 25%, var(--bg-blue-light) 50%, var(--color-border) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-line--lg { height: 20px; width: 160px; }
.skeleton-line--sm { height: 12px; width: 80px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

// Stats
.stats-row { display: flex; justify-content: center; gap: var(--space-10); padding: var(--space-4) 0; min-height: 60px; }
.stat { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
.stat-num { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary); }
.stat-label { font-size: var(--font-size-xs); color: var(--text-secondary); }

// Settings
.settings-entry {
  display: flex; align-items: center; gap: var(--space-3); width: 100%;
  padding: var(--space-4); background: var(--bg-card-white);
  border-radius: var(--radius-lg); text-decoration: none; color: var(--text-primary);
  transition: background var(--transition-fast);
  &:hover { background: var(--bg-blue-light); }
}
.settings-entry__icon { display: flex; color: var(--text-secondary); }
.settings-entry__text { flex: 1; font-weight: var(--font-weight-medium); }
.settings-entry__arrow { color: var(--text-tertiary); }

// Quick grid
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); width: 100%; }
.quick-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-4) var(--space-2); background: var(--bg-card-white);
  border-radius: var(--radius-lg); text-decoration: none; color: var(--text-primary);
  transition: all var(--transition-fast);
  &:hover { background: var(--bg-blue-light); }
  &:active { transform: scale(.97); }
}
.quick-card__icon { display: flex; }
.quick-card__label { font-size: var(--font-size-xs); color: var(--text-secondary); }

.logout-btn { color: var(--color-danger); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); padding: var(--space-3); margin-top: var(--space-4); cursor: pointer;
  &:hover { opacity: .7; }
}
</style>
