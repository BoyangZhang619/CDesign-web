<template>
  <aside class="sidebar" :class="{ 'sidebar--expanded': expanded }"
    @mouseenter="expanded = true" @mouseleave="expanded = false">
    <!-- Logo -->
    <div class="sidebar__logo" @click="$router.push('/home')">
      <img src="/logo-stuheal.svg" alt="StuHeal" class="sidebar__logo-img" />
      <Transition name="fade">
        <span v-if="expanded" class="sidebar__logo-text">StuHeal</span>
      </Transition>
    </div>

    <!-- Primary Nav -->
    <nav class="sidebar__nav">
      <router-link
        v-for="item in primaryItems"
        :key="item.path"
        :to="item.path"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item) }"
      >
        <span class="sidebar__icon" v-html="item.icon"></span>
        <Transition name="fade">
          <span v-if="expanded" class="sidebar__label">{{ item.label }}</span>
        </Transition>
      </router-link>
    </nav>

    <!-- Separator -->
    <div class="sidebar__sep"></div>

    <!-- Secondary Nav -->
    <nav class="sidebar__nav sidebar__nav--secondary">
      <router-link
        v-for="item in secondaryItems"
        :key="item.path"
        :to="item.path"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item) }"
      >
        <span class="sidebar__icon" v-html="item.icon"></span>
        <Transition name="fade">
          <span v-if="expanded" class="sidebar__label">{{ item.label }}</span>
        </Transition>
      </router-link>
    </nav>

    <!-- Spacer -->
    <div class="sidebar__spacer"></div>

    <!-- Theme Toggle (bottom) -->
    <button class="sidebar__item sidebar__theme-btn" @click="toggleTheme()">
      <span class="sidebar__icon" v-html="themeIcon"></span>
      <Transition name="fade">
        <span v-if="expanded" class="sidebar__label">切换主题</span>
      </Transition>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const expanded = ref(false)
const { theme, toggleTheme } = useTheme()

const themeIcon = computed(() =>
  theme.value === 'dark'
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
)

const primaryItems = [
  {
    path: '/home',
    label: '首页',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    path: '/explore',
    label: '探索',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  },
  {
    path: '/profile',
    label: '个人中心',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
]

const secondaryItems = [
  {
    path: '/checkin',
    label: '打卡',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    path: '/ai-chat',
    label: 'AI 对话',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>`,
  },
  {
    path: '/analysis/portrait',
    label: '健康画像',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
  },
  {
    path: '/analysis/trends',
    label: '趋势分析',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  },
]

function isActive(item: { path: string }) {
  if (item.path === '/home') return route.path === '/home'
  return route.path.startsWith(item.path)
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) var(--space-2);
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
  z-index: 200;
  transition: width var(--transition-normal) var(--ease-out-expo),
              background-color var(--transition-slow);
  overflow: hidden;
}

.sidebar--expanded {
  width: var(--sidebar-expanded);
  align-items: flex-start;
  padding: var(--space-4) var(--space-3);
}

// Logo
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2);
  margin-bottom: var(--space-6);
  cursor: pointer;
  width: 100%;
  min-height: 40px;
}

.sidebar__logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  white-space: nowrap;
  transition: color var(--transition-slow);
}

// Nav
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.sidebar__nav--secondary {
  margin-top: 0;
}

// Item
.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  text-decoration: none;
  transition: background-color var(--transition-fast),
              color var(--transition-fast);
  width: 100%;
  min-height: 44px;
  white-space: nowrap;

  &:hover {
    background: var(--color-bg-tertiary);
  }

  &--active {
    color: var(--color-accent);
    font-weight: var(--font-weight-semibold);
    background: var(--color-accent-light);
  }
}

.sidebar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar__label {
  font-size: var(--font-size-base);
  font-weight: inherit;
}

// Separator
.sidebar__sep {
  width: 100%;
  height: 1px;
  background: var(--color-separator);
  margin: var(--space-4) 0;
  transition: background-color var(--transition-slow);
}

// Spacer
.sidebar__spacer {
  flex: 1;
}

// Theme toggle
.sidebar__theme-btn {
  cursor: pointer;
  width: 100%;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Hide on mobile
@media (max-width: 767px) {
  .sidebar { display: none; }
}
</style>
