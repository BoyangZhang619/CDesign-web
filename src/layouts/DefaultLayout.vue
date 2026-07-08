<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <TopBar :title="title" />
      <main class="app-content" :class="{ 'has-bottombar': true }">
        <slot />
      </main>
    </div>
    <BottomTabBar />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import TopBar from '@/components/TopBar.vue'

withDefaults(defineProps<{ title?: string }>(), {
  title: 'StuHeal',
})
</script>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  min-height: 100dvh;
  background: var(--color-bg-secondary);
  transition: background-color var(--transition-slow);
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal) var(--ease-out-expo);

  @media (max-width: 767px) {
    margin-left: 0;
  }
}

.app-content {
  flex: 1;
  padding-bottom: var(--space-8);
}

.has-bottombar {
  @media (max-width: 767px) {
    padding-bottom: calc(var(--bottombar-height) + var(--space-4));
  }
}
</style>
