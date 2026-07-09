<template>
  <header class="topbar">
    <h1 class="topbar__title">{{ title }}</h1>
    <router-link to="/profile" class="topbar__avatar">
      <img
        :src="avatarUrl"
        alt="个人中心"
        class="topbar__avatar-img"
      />
    </router-link>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{ title: string }>()

const authStore = useAuthStore()

const avatarUrl = computed(() =>
  authStore.userInfo?.avatar_url || '/logo-stuheal.svg'
)
</script>

<style lang="scss" scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-4);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background-color var(--transition-slow);
}

.topbar__title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
}

.topbar__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
