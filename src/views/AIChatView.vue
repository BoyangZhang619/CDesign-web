<template>
  <div class="ai-chat-layout">
    <!-- 侧栏 - 聊天历史 -->
    <Sidebar ref="sidebarRef" :customSidebarContent="chatHistoriesSidebar" />
    
    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" />
      
      <!-- 聊天内容区 -->
      <div class="content-area">
        <div class="chat-wrapper">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="header-info">
              <h1 class="chat-title">AI 健康助手</h1>
              <p class="chat-subtitle">个性化健康咨询 · 随时为您服务</p>
            </div>
            <div class="header-actions">
              <div v-if="authStore.userInfo" class="credits-info">
                <div class="credits-label">剩余额度</div>
                <div class="credits-value">{{ authStore.userInfo.credits || 0 }}</div>
              </div>
            </div>
          </div>

          <!-- 消息容器 -->
          <div class="messages-container">
            <!-- 空状态 -->
            <div v-if="messages.length === 0" class="empty-state">
              <div class="empty-icon">✨</div>
              <h2 class="empty-title">开始健康对话</h2>
              <p class="empty-description">
                向 AI 助手提出关于健康、饮食、<br>运动和睡眠的任何问题
              </p>
            </div>

            <!-- 消息列表 -->
            <div v-else class="messages-list">
              <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', `msg-${msg.role}`]">
                <div class="message-header">
                  <span class="message-role">{{ msg.role === 'user' ? '您' : 'AI' }}</span>
                </div>
                
                <!-- 思考过程 -->
                <div v-if="msg.reasoning" class="reasoning-section">
                  <details :class="['reasoning-details', `state-${msg.reasoningState}`]" :open="msg.reasoningState !== 'collapsed'">
                    <summary class="reasoning-summary">
                      <span class="reasoning-icon">&nbsp;|&nbsp;</span>
                      <span class="reasoning-label">思考过程</span>
                      <span v-if="msg.reasoningState === 'collapsed' && msg.requestTime" class="reasoning-meta">
                        {{ (msg.requestTime / 1000).toFixed(1) }}s · {{ msg.tokensUsed }} tokens
                      </span>
                    </summary>
                    <div class="reasoning-content">{{ msg.reasoning }}</div>
                  </details>
                </div>
                
                <!-- 回复内容 -->
                <div class="message-content">{{ msg.content }}</div>
              </div>

              <!-- 加载动画 -->
              <div v-if="loading && messages.length > 0 && messages[messages.length - 1].role === 'user'" class="message-bubble msg-assistant">
                <div class="message-header">
                  <span class="message-role">AI</span>
                </div>
                <div class="message-loading">
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <!-- 错误提示 -->
            <transition name="fade">
              <div v-if="errorMsg" class="error-box">
                <span class="error-icon">⚠️</span>
                <span>{{ errorMsg }}</span>
              </div>
            </transition>

            <!-- 输入框 -->
            <div class="input-box">
              <textarea 
                v-model="inputMessage" 
                @keydown="handleKeyDown" 
                :disabled="loading" 
                class="chat-textarea"
                placeholder="输入您的问题... (Enter 发送 / Shift+Enter 换行)"
              ></textarea>
              <button 
                @click="handleSendChat" 
                :disabled="loading || !inputMessage.trim()" 
                class="btn-submit" 
                title="发送消息"
              >
                <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16350093 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4379852 C3.03521743,10.5950826 3.19218622,10.75 3.50612381,10.75 L16.6915026,11.5354869 C16.6915026,11.5354869 17.1624089,11.5354869 17.1624089,12.0068791 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
                <span v-else>⏳</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useAIChat } from '../composables/useAIChat'
import { sessionAPI } from '../api/modules/aiChat'

const authStore = useAuthStore()
const sidebarRef = ref<InstanceType<typeof Sidebar>>()

const {
  loading,
  errorMsg,
  inputMessage,
  messages,
  chatConfig,
  handleSendMessage,
  clearMessages
} = useAIChat()

// 聊天历史 - 侧栏内容
const chatHistoriesSidebar = ref(false)
const chatHistories = ref([])
const currentChatId = ref<string | null>(null)

// 切换侧栏
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

// 处理回车发送
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendChat()
  }
}

// 发送消息
async function handleSendChat() {
  if (!authStore.userInfo) {
    errorMsg.value = '请先登录'
    return
  }
  
  if (!inputMessage.value.trim() || loading.value) return

  // 创建会话
  if (!chatConfig.sessionId) {
    try {
      const response = await sessionAPI.createSession({
        session_name: 'AI对话',
        ai_model: 'dashscope',
        temperature: 0.7,
        max_tokens: 2048
      })
      
      if (response.data?.success && response.data?.data?.data?.id) {
        chatConfig.sessionId = response.data.data.data.id
      } else {
        errorMsg.value = '创建会话失败'
        return
      }
    } catch (error) {
      errorMsg.value = '创建会话失败'
      return
    }
  }

  const result = await handleSendMessage(authStore.userInfo.credits || 0)
  
  if (result.success && authStore.userInfo) {
    authStore.userInfo.credits -= result.tokensUsed
  }

  // 滚动到底部
  setTimeout(() => {
    const container = document.querySelector('.messages-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, 100)
}

// 清空消息
function handleClearMessages() {
  if (confirm('确定要清除所有对话吗？')) {
    clearMessages()
  }
}

onMounted(() => {
  // 初始化聊天历史等
})
</script>

<style scoped>
@import '../css/AIChatView.css';
</style>
