import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAIChatStore = defineStore('aiChat', () => {
  // 状态
  const isOpen = ref(false)

  // 方法
  const openChat = () => {
    isOpen.value = true
  }

  const closeChat = () => {
    isOpen.value = false
  }

  const toggleChat = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat
  }
})
