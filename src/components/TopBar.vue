<template>
  <header class="topbar">
    <!-- Left: back button (only on sub-pages) -->
    <button v-if="showBack" class="topbar-btn" @click="$router.back()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <span v-else class="topbar-spacer"></span>

    <!-- Center: title -->
    <span v-if="title" class="topbar__title display-text">{{ title }}</span>

    <!-- Right: kebab menu -->
    <button v-if="hasMenu" class="topbar-btn" @click="$emit('menu')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
    </button>
    <span v-else class="topbar-spacer"></span>
  </header>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  hasMenu?: boolean
}>(), {
  title: '',
  showBack: false,
  hasMenu: false,
})

defineEmits<{ menu: [] }>()
</script>

<style lang="scss" scoped>
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--topbar-height); padding: 0 var(--space-4);
  background: var(--bg-card-white); position: sticky; top: 0; z-index: 50;
  border-bottom: 1px solid var(--color-separator);
}
.topbar__title {
  font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);
  color: var(--text-primary); text-align: center;
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.topbar-btn {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-full); color: var(--text-primary);
  transition: background var(--transition-fast); flex-shrink: 0;
  &:hover { background: var(--bg-blue-light); }
  &:active { transform: scale(.95); }
}
.topbar-spacer { width: 40px; flex-shrink: 0; }
</style>
