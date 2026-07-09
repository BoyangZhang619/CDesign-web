<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <Transition name="bar-slide">
        <TopBar v-if="!isCleanPage" :key="'topbar'"
          :title="topTitle"
          :showBack="topShowBack"
          :hasMenu="topHasMenu"
          @menu="onMenu"
        />
      </Transition>
      <main class="app-content" :class="{ 'has-bottombar': isCleanPage, 'no-topbar': isCleanPage }">
        <slot />
      </main>
    </div>
    <Transition name="bar-fade">
      <BottomTabBar v-if="isCleanPage" :key="'bottombar'" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import TopBar from '@/components/TopBar.vue'

const route = useRoute()

// Pages that don't need title/back (well-known landing pages)
const CLEAN_PAGES = ['/home', '/profile', '/checkin', '/explore']

const topTitle = computed(() => {
  if (isCleanPage.value) return ''
  return (route.meta?.title as string) || ''
})

const isCleanPage = computed(() => CLEAN_PAGES.includes(route.path))

const topShowBack = computed(() => {
  if (isCleanPage.value) return false
  return true
})

const topHasMenu = computed(() => {
  if (route.path === '/profile') return true
  // could add more pages with menu here
  return false
})

function onMenu() { /* per-page menu handling can be added later */ }
</script>

<style lang="scss" scoped>
.app-shell {
  display: flex; min-height: 100dvh;
  background: var(--bg-main);
  padding-top: env(safe-area-inset-top, 0px);
}
.app-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal) var(--ease-out-expo);
  @media (max-width: 767px) { margin-left: 0; }
}
.app-content { flex: 1; padding-bottom: var(--space-8); }
.has-bottombar {
  @media (max-width: 767px) {
    padding-bottom: calc(var(--bottombar-height) + var(--space-6));
  }
}
.no-topbar {
  padding-top: 0;
}

// TopBar transition
.bar-slide-enter-active,
.bar-slide-leave-active {
  transition: opacity .2s ease, transform .2s var(--ease-out-expo);
}
.bar-slide-enter-from,
.bar-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// BottomBar transition
.bar-fade-enter-active,
.bar-fade-leave-active {
  transition: opacity .25s ease, transform .25s var(--ease-out-expo);
}
.bar-fade-enter-from,
.bar-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
