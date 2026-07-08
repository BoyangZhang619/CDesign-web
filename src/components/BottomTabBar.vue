<template>
  <nav class="bottombar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="bottombar__tab"
      :class="{ 'bottombar__tab--active': isActive(tab.path) }"
    >
      <span class="bottombar__icon" v-html="tab.icon"></span>
      <span class="bottombar__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  {
    path: '/home',
    label: '首页',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    path: '/explore',
    label: '探索',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  },
  {
    path: '/profile',
    label: '个人',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
]

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  if (path === '/explore') return route.path === '/explore'
  if (path === '/profile') return route.path.startsWith('/profile')
  return false
}
</script>

<style lang="scss" scoped>
.bottombar {
  display: flex;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: var(--bottombar-height);
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
  transition: background-color var(--transition-slow);
}

.bottombar__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  &:active { opacity: 0.7; }
}

.bottombar__tab--active {
  color: var(--color-accent);
}

.bottombar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.bottombar__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

// Hide on desktop
@media (min-width: 768px) {
  .bottombar { display: none; }
}
</style>
