<template>
  <div class="page">
    <AppHeader />

    <main class="ai-chat-content">
      <div class="chat-container">
        <!-- 顶部信息栏 -->
        <div class="chat-header">
          <div class="header-info">
            <h1 class="chat-title">AI 健康助手</h1>
            <p class="chat-subtitle">基于您的健康模型，提供个性化的医学咨询与建议</p>
          </div>
          <div class="header-stats" v-if="authStore.userInfo">
            <div class="stat-item">
              <span class="stat-label">剩余额度</span>
              <span class="stat-value">{{ authStore.userInfo.credits || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="messages-container">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">Hello!</div>
              <h2 class="empty-title">开始新对话</h2>
              <p class="empty-description">
                向 AI 助手提出关于健康、饮食、运动和睡眠的问题
              </p>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-list">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', `msg-${msg.role}`]">
              <div class="message-header">
                <span class="message-role">
                  {{ msg.role === 'user' ? '您' : 'AI' }}
                </span>
                <!-- <span class="message-time">{{ formatTime(index) }}</span> -->
              </div>
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <!-- 错误消息 -->
          <transition name="fade">
            <div v-if="errorMsg" class="error-box">
              <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{{ errorMsg }}</span>
            </div>
          </transition>

          <!-- 输入框 -->
          <div class="input-box">
            <textarea v-model="inputMessage" @keydown.enter.ctrl="handleSendChat" :disabled="loading"
              class="chat-textarea" placeholder="输入您的问题... (Ctrl+Enter 发送)" rows="3"></textarea>
            <button @click="handleSendChat" :disabled="loading || !inputMessage.trim()" class="btn-submit">
              <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16350093 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4379852 C3.03521743,10.5950826 3.19218622,10.75 3.50612381,10.75 L16.6915026,11.5354869 C16.6915026,11.5354869 17.1624089,11.5354869 17.1624089,12.0068791 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
              <span v-else>发送中</span>
              <span v-if="!loading">发送</span>
            </button>
          </div>

          <!-- 配置栏 -->
          <div class="config-section">
            <div class="config-group">
              <label class="config-label">AI 模型</label>
              <select v-model="chatConfig.model" class="config-select">
                <option value="qwen3.5-flash">Qwen 3.5 Flash</option>
                <option value="qwen3.5-plus">Qwen 3.5 plus</option>
              </select>
            </div>

            <label class="config-checkbox-label">
              <input v-model="chatConfig.useStream" type="checkbox" />
              <span>启用流式对话</span>
            </label>

            <button v-if="messages.length > 0" @click="handleClearMessages" class="btn-clear-history">
              清除历史
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

// // 格式化时间（简单版本）
// function formatTime(index: number): string {
//   return `C ${Math.floor(index / 2) + 1}`
// }

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
@import '@/css/AIChatView.css';
</style>
