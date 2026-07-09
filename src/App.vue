<template>
  <router-view v-slot="{ Component, route }">
    <template v-if="route.path === '/auth'">
      <component :is="Component" />
    </template>
    <template v-else>
      <DefaultLayout :title="(route.meta?.title as string) || 'StuHeal'">
        <Transition name="page-fade" mode="out-in" appear>
          <component :is="Component" :key="route.path" />
        </Transition>
      </DefaultLayout>
    </template>
  </router-view>

  <AIChatFloatingWindow :isOpen="aiChatStore.isOpen" @close="aiChatStore.closeChat()" />
</template>

<script setup lang="ts">
import { useAIChatStore } from './stores/aiChat'
import AIChatFloatingWindow from './components/AIChatFloatingWindow.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const aiChatStore = useAIChatStore()
</script>

<style>
/* 页面切换过渡 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity .2s cubic-bezier(0.4, 0, 0.2, 1),
              transform .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>