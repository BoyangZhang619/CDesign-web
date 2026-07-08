<template>
  <router-view v-slot="{ Component, route }">
    <template v-if="route.path === '/auth'">
      <!-- Auth page: no layout chrome -->
      <component :is="Component" />
    </template>
    <template v-else>
      <!-- All other pages: app shell -->
      <DefaultLayout :title="(route.meta?.title as string) || 'StuHeal'">
        <component :is="Component" />
      </DefaultLayout>
    </template>
  </router-view>

  <!-- 全局 AI 聊天浮窗 -->
  <AIChatFloatingWindow :isOpen="aiChatStore.isOpen" @close="aiChatStore.closeChat()" />
</template>

<script setup lang="ts">
import { useAIChatStore } from './stores/aiChat'
import AIChatFloatingWindow from './components/AIChatFloatingWindow.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const aiChatStore = useAIChatStore()
</script>