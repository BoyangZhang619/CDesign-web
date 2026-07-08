<template>
  <div class="app-wrapper">
    <router-view />
    
    <!-- 全局 AI 聊天浮窗 -->
    <AIChatFloatingWindow :isOpen="aiChatStore.isOpen" @close="aiChatStore.closeChat()" />
  </div>
</template>

<script setup lang="ts">
import { useAIChatStore } from './stores/aiChat'
import AIChatFloatingWindow from './components/AIChatFloatingWindow.vue'
import "@/style.scss" // 引入全局样式

const aiChatStore = useAIChatStore()
</script>