<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="chat-container">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-left">
            <h1 class="chat-title">AI 健康助手</h1>
            <p class="chat-subtitle">基于您的健康模型提供个性化咨询</p>
          </div>
          <div class="header-right">
            <div class="user-credits" v-if="authStore.userInfo">
              <span class="credit-label">额度剩余</span>
              <span class="credit-value">{{ authStore.userInfo.credits || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 对话历史区 -->
        <div class="messages-area">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">🤖</div>
            <h3 class="empty-title">开始对话</h3>
            <p class="empty-text">向我提出关于健康、饮食、运动等问题</p>
          </div>

          <div v-else class="messages-list">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-item', msg.role]"
            >
              <div class="message-avatar">
                {{ msg.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-body">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(index) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="input-section">
          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <div class="config-bar">
            <div class="config-item">
              <label class="config-label">模型</label>
              <select v-model="chatConfig.model" class="config-select">
                <option value="qwen3.5-flash">Qwen 3.5 Flash (快速)</option>
                <option value="qwen3.5-max">Qwen 3.5 Max (高级)</option>
              </select>
            </div>

            <div class="config-item">
              <label class="config-label">
                <input v-model="chatConfig.useStream" type="checkbox" class="config-checkbox" />
                流式对话
              </label>
            </div>

            <button
              v-if="messages.length > 0"
              @click="handleClearMessages"
              class="btn-clear"
            >
              清除历史
            </button>
          </div>

          <div class="input-group">
            <textarea
              v-model="inputMessage"
              @keydown.enter.ctrl="handleSendChat"
              :disabled="loading"
              class="chat-input"
              placeholder="输入您的问题... (Ctrl+Enter 发送)"
            ></textarea>
            <button
              @click="handleSendChat"
              :disabled="loading || !inputMessage.trim()"
              class="btn-send"
            >
              {{ loading ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useAIChat } from '../composables/useAIChat'

const authStore = useAuthStore()
const {
  loading,
  errorMsg,
  inputMessage,
  messages,
  chatConfig,
  handleSendMessage,
  clearMessages
} = useAIChat()

// 加载用户信息
async function loadUserInfo() {
  try {
    await authStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 处理发送消息
async function handleSendChat() {
  if (!authStore.userInfo) {
    errorMsg.value = '请先登录'
    return
  }

  const result = await handleSendMessage(authStore.userInfo.credits || 0)

  if (result.success && authStore.userInfo) {
    authStore.userInfo.credits -= result.tokensUsed
  }
}

// 处理清除历史
function handleClearMessages() {
  if (confirm('确定要清除所有对话历史吗？')) {
    clearMessages()
  }
}

// 格式化时间（简单版本）
function formatTime(index: number): string {
  return `${Math.floor(index / 2) + 1} 轮对话`
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
@import '../css/AIChatView.css';
</style>
