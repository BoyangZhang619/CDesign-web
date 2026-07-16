<template>
  <nav class="bottombar">
    <div class="bottombar__capsule">
      <router-link
        v-for="tab in tabs" :key="tab.path" :to="tab.path"
        class="bottombar__tab"
        :class="{ 'bottombar__tab--active': isActive(tab.path) }"
      >
        <span class="bottombar__icon" v-html="tab.icon"></span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const tabs = [
  { path: '/home', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>` },
  { path: '/checkin', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  // [SNOW] 树页面入口
  // { path: '/tree', icon: `...` },
  { path: '/explore', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
  { path: '/profile', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
]

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  if (path === '/checkin') return route.path === '/checkin'
  if (path === '/tree') return route.path === '/tree'
  if (path === '/explore') return route.path === '/explore'
  if (path === '/profile') return route.path.startsWith('/profile')
  return false
}
</script>

<style lang="scss" scoped>
.bottombar {
  position: fixed; bottom: var(--space-4); left: 50%; transform: translateX(-50%);
  z-index: 100; padding-bottom: env(safe-area-inset-bottom, 0);
}
.bottombar__capsule {
  display: flex; align-items: center; justify-content: space-around;
  background: rgba(26, 26, 26, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  height: var(--bottombar-height);
  width: min(calc(var(--content-width-md) - var(--space-8)), calc(100vw - var(--space-8)));
  padding: 0 var(--space-2);
}
.bottombar__tab {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: var(--radius-full);
  color: rgba(255,255,255,0.5); transition: all var(--transition-fast);
  &:active { transform: scale(.9); }
}
.bottombar__tab--active { color: #fff; background: rgba(255,255,255,0.12); }
.bottombar__icon { display: flex; }

@media (min-width: 768px) { .bottombar { display: none; } }
</style>
