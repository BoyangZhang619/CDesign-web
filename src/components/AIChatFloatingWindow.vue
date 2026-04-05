<template>
  <teleport to="body">
    <!-- 浮窗遮罩层 -->
    <transition name="float-fade">
      <div v-if="isOpen" class="float-window-overlay" @click.self="closeWindow"></div>
    </transition>

    <!-- AI Chat 浮窗 -->
    <transition name="float-slide-up">
      <div v-if="isOpen" class="ai-float-window">
        <!-- 浮窗头部 -->
        <div class="float-header">
          <div class="float-header-info">
            <h2 class="float-title">AI 健康助手</h2>
            <p class="float-subtitle">快速提问获取建议</p>
          </div>
          <button class="float-close" @click="closeWindow" aria-label="关闭浮窗">✕</button>
        </div>

        <!-- 消息区域 -->
        <div class="float-messages" ref="messagesContainer">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="float-empty-state">
            <div class="float-empty-icon">💬</div>
            <p class="float-empty-text">输入您的健康问题</p>
          </div>

          <!-- 消息列表 -->
          <div v-else class="float-messages-list">
            <div v-for="(msg, index) in messages" :key="index" :class="['float-message', `float-msg-${msg.role}`]">
              <div class="float-message-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="loading" class="float-loading">
          <span class="float-loading-dot"></span>
          <span class="float-loading-dot"></span>
          <span class="float-loading-dot"></span>
        </div>

        <!-- 输入区域 -->
        <div class="float-input-area">
          <!-- 错误提示 -->
          <transition name="fade">
            <div v-if="errorMsg" class="float-error-box">
              <svg class="float-error-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{{ errorMsg }}</span>
            </div>
          </transition>

          <!-- 输入框和发送按钮 -->
          <div class="float-input-wrapper">
            <textarea
              v-model="inputMessage"
              @keydown="handleKeyDown"
              :disabled="loading"
              class="float-textarea"
              placeholder="输入问题... (Enter 发送，Shift+Enter 转行)"
              rows="1"
            ></textarea>
            <button
              @click="handleSendMessage"
              :disabled="loading || !inputMessage.trim()"
              class="float-btn-submit"
            >
              <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16350093 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4379852 C3.03521743,10.5950826 3.19218622,10.75 3.50612381,10.75 L16.6915026,11.5354869 C16.6915026,11.5354869 17.1624089,11.5354869 17.1624089,12.0068791 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
              <span v-else class="float-sending">发送中</span>
            </button>
          </div>

          <!-- 快速问题按钮 -->
          <div v-if="messages.length === 0" class="float-quick-prompts">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt.id"
              @click="sendQuickPrompt(prompt.text)"
              :disabled="loading"
              class="float-quick-btn"
            >
              {{ prompt.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAIChat } from '../composables/useAIChat'
import { useAuthStore } from '../stores/auth'
import { sessionAPI } from '../api/modules/aiChat'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

const { 
  messages, 
  loading, 
  errorMsg, 
  inputMessage, 
  chatConfig,
  handleSendMessage: composableHandleSendMessage, 
  clearMessages
} = useAIChat()

const messagesContainer = ref<HTMLElement | null>(null)

// 快速提问列表
const quickPrompts = [
  { id: 1, label: '💪 运动建议', text: '请给我一些日常运动的建议' },
  { id: 2, label: '🥗 饮食建议', text: '请给我一些健康饮食的建议' },
  { id: 3, label: '😴 睡眠建议', text: '请给我一些改善睡眠的建议' },
  { id: 4, label: '❤️ 健康检查', text: '我想做一个健康状态自测' }
]

// 关闭浮窗
function closeWindow() {
  emit('close')
  setTimeout(() => {
    clearMessages()
  }, 300)
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  const isDesktop = !/mobile|android|iphone|ipad|phone/i.test(navigator.userAgent.toLowerCase())
  
  if (isDesktop && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

// 发送消息
async function handleSendMessage() {
  if (!authStore.userInfo) {
    errorMsg.value = '请先登录'
    return
  }
  
  if (!inputMessage.value.trim() || loading.value) return

  // 如果还没有会话ID，先创建会话
  if (!chatConfig.sessionId) {
    try {
      const response = await sessionAPI.createSession({
        session_name: '浮窗聊天',
        ai_model: 'dashscope',
        temperature: 0.7,
        max_tokens: 2048
      })
      
      // 响应结构：response.data.data.data.id
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

  // 使用真实的用户额度
  const result = await composableHandleSendMessage(authStore.userInfo.credits || 0)
  
  // 更新用户额度
  if (result.success && authStore.userInfo) {
    authStore.userInfo.credits -= result.tokensUsed
  }
  
  await nextTick()
  scrollToBottom()
}

// 发送快速提问
async function sendQuickPrompt(text: string) {
  inputMessage.value = text
  await nextTick()
  await handleSendMessage()
}

// 自动滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    setTimeout(() => {
      messagesContainer.value!.scrollTop = messagesContainer.value!.scrollHeight
    }, 50)
  }
}

onMounted(() => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap');
@import '../css/components/AIChatFloatingWindow.css';
</style>
