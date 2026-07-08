<template>
  <div class="settings container-md">
    <!-- Theme -->
    <section class="group">
      <h3 class="group-label">外观</h3>
      <div class="list-card">
        <button class="list-row" @click="toggleTheme()">
          <span class="list-row__left">
            <span class="list-row__icon" v-html="themeIcon"></span>
            <span class="list-row__text">暗色模式</span>
          </span>
          <span class="toggle" :class="{ 'toggle--on': theme === 'dark' }">
            <span class="toggle__knob"></span>
          </span>
        </button>
      </div>
    </section>

    <!-- Account -->
    <section class="group">
      <h3 class="group-label">账户</h3>
      <div class="list-card">
        <router-link to="/profile/edit" class="list-row">
          <span class="list-row__left">
            <span class="list-row__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </span>
            <span class="list-row__text">编辑资料</span>
          </span>
          <span class="list-row__arrow">→</span>
        </router-link>
        <button class="list-row" @click="handleChangePassword">
          <span class="list-row__left">
            <span class="list-row__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span class="list-row__text">修改密码</span>
          </span>
          <span class="list-row__arrow">→</span>
        </button>
      </div>
    </section>

    <!-- Health -->
    <section class="group">
      <h3 class="group-label">个性化</h3>
      <div class="list-card">
        <router-link to="/avatar-editor" class="list-row">
          <span class="list-row__left">
            <span class="list-row__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </span>
            <span class="list-row__text">像素头像</span>
          </span>
          <span class="list-row__arrow">→</span>
        </router-link>
      </div>
    </section>

    <section class="group">
      <h3 class="group-label">健康</h3>
      <div class="list-card">
        <button class="list-row" @click="openHealthSetup">
          <span class="list-row__left">
            <span class="list-row__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
            <span class="list-row__text">健康档案</span>
          </span>
          <span class="list-row__arrow">→</span>
        </button>
      </div>
    </section>

    <!-- About -->
    <section class="group">
      <h3 class="group-label">关于</h3>
      <div class="list-card">
        <div class="list-row">
          <span class="list-row__text">版本</span>
          <span class="list-row__value">1.0.0</span>
        </div>
      </div>
    </section>

    <!-- Logout -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <!-- Health Setup Modal -->
    <HealthSetupModal :show="showHealthSetup" @close="showHealthSetup = false"
      @success="showHealthSetup = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import HealthSetupModal from '@/components/HealthSetupModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { theme, toggleTheme } = useTheme()
const showHealthSetup = ref(false)

const themeIcon = computed(() =>
  theme.value === 'dark'
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
)

function openHealthSetup() {
  showHealthSetup.value = true
}

function handleChangePassword() {
  router.push('/profile/edit')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/auth')
}
</script>

<style lang="scss" scoped>
.settings {
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

// ── Group ───────────────────────────────────────────────────
.group-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: var(--space-3) var(--space-1) var(--space-2);
}

.list-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

// ── List Row ────────────────────────────────────────────────
.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4);
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-separator);
  color: var(--color-text);
  font-size: var(--font-size-base);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-fast);

  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-bg-secondary); }
}

.list-row__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.list-row__icon {
  display: flex;
  color: var(--color-text-secondary);
}

.list-row__text { color: var(--color-text); }

.list-row__arrow {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.list-row__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

// ── Toggle Switch ───────────────────────────────────────────
.toggle {
  width: 44px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  position: relative;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.toggle--on {
  background: var(--color-accent);
}

.toggle__knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  border-radius: var(--radius-full);
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform var(--transition-fast);
}

.toggle--on .toggle__knob {
  transform: translateX(18px);
}

// ── Logout ──────────────────────────────────────────────────
.logout-section {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.logout-btn {
  color: var(--color-danger);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-3) var(--space-8);
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover { opacity: 0.7; }
}
</style>
