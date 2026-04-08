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
.ai-chat-layout {
  margin: 0 auto;
  display: flex;
  height: calc(100vh - 10px);
  background: linear-gradient(135deg, #D4C4B0 0%, #E8DDD0 100%);
  border: 5px solid #5A7A87;
  border-radius: 20px;
  overflow: hidden;
  box-sizing: content-box;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  overflow-y: auto;
  padding: 0;
}

.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
}

/* 滚动条 */
.content-area::-webkit-scrollbar {
  width: 8px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

/* ============================================
   聊天头部
   ============================================ */

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #D4C4B0;
  background: linear-gradient(135deg, #EBE5DF 0%, #DDD4C4 50%, #D9CEC0 100%);
  flex-shrink: 0;
}

.header-info {
  flex: 1;
}

.chat-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 600;
  color: #5A7A87;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}

.chat-subtitle {
  font-size: 12px;
  color: #9DB4A0;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.credits-info {
  text-align: right;
  font-size: 11px;
}

.credits-label {
  color: #5A7A87;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  margin-bottom: 2px;
}

.credits-value {
  font-size: 16px;
  font-weight: 600;
  color: #9DB4A0;
}

/* ============================================
   消息容器
   ============================================ */

.messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  gap: 16px;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #D4C4B0;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #C9B89C;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  line-height: 1;
  opacity: 0.6;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 600;
  color: #5A7A87;
  margin: 0;
}

.empty-description {
  font-size: 13px;
  color: #8B8B8B;
  margin: 0;
  text-align: center;
  line-height: 1.6;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  animation: slideIn 0.3s ease-out;
}

.message-bubble.msg-user {
  align-self: flex-end;
}

.message-bubble.msg-assistant {
  align-self: flex-start;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
}

.message-role {
  font-weight: 600;
  color: #5A7A87;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.message-content {
  padding: 12px 16px;
  background: linear-gradient(135deg, #E8DDD3 0%, #E1D7CD 100%);
  border: 2px solid #D0C4B8;
  border-radius: 4px;
  color: #5A7A87;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
}

.msg-user .message-content {
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border-color: #8FA591;
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.2);
}

/* 加载动画 */
.message-loading {
  padding: 12px 16px;
  background: linear-gradient(135deg, #E8DDD3 0%, #E1D7CD 100%);
  border: 2px solid #D0C4B8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #9DB4A0;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    opacity: 0.7;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================
   输入区域
   ============================================ */

.input-area {
  padding: 20px 32px;
  background: linear-gradient(135deg, #E8DDD3 0%, #DDD4C4 100%);
  border-top: 2px solid #C9B89C;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 错误提示 */
.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(169, 120, 123, 0.08);
  border: 2px solid #A9787B;
  border-radius: 8px;
  color: #8B6B75;
  font-size: 12px;
  font-weight: 500;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* 输入框 */
.input-box {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-textarea {
  flex: 1;
  padding: 12px;
  border: 2px solid #C9B89C;
  background: #FEFCFA;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #5A7A87;
  resize: none;
  height: 44px;
  max-height: 120px;
  transition: all 0.3s ease;
  outline: none;
}

.chat-textarea:focus {
  border-color: #8FA591;
  box-shadow: 0 0 0 3px rgba(143, 165, 145, 0.15);
}

.chat-textarea:disabled {
  background: #E8DDD3;
  color: #9DB4A0;
  cursor: not-allowed;
}

.chat-textarea::placeholder {
  color: #A9A9A9;
}

/* 发送按钮 */
.btn-submit {
  width: 44px;
  height: 44px;
  padding: 0;
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  border: 2px solid #8FA591;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #8FA591 0%, #7F9581 100%);
  border-color: #7F9581;
  box-shadow: 0 8px 20px rgba(157, 180, 160, 0.3);
  transform: translateY(-2px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit svg {
  width: 18px;
  height: 18px;
}

/* ============================================
   思考过程样式
   ============================================ */

.reasoning-section {
  margin-top: 8px;
  margin-bottom: 12px;
}

.reasoning-details {
  transition: all 0.5s ease;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
}

.reasoning-details.state-streaming {
  max-height: 78px;
  overflow: hidden;
  border: 1px solid rgba(168, 162, 158, 0.2);
  background: rgba(168, 162, 158, 0.05);
}

.reasoning-details.state-completed {
  border: 1px solid rgba(168, 162, 158, 0.3);
  background: rgba(168, 162, 158, 0.08);
}

.reasoning-summary {
  cursor: pointer;
  padding: 6px 8px;
  background: linear-gradient(135deg, rgba(210, 198, 186, 0.3) 0%, rgba(220, 207, 195, 0.2) 100%);
  border-radius: 8px;
  color: #6b6b6b;
  font-size: 13px;
  font-weight: 600;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.5s ease;
}

.reasoning-summary:hover {
  background: linear-gradient(135deg, rgba(210, 198, 186, 0.4) 0%, rgba(220, 207, 195, 0.3) 100%);
}

.reasoning-content {
  padding: 12px 16px;
  background: rgba(220, 207, 195, 0.06);
  font-size: 13px;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.reasoning-content::-webkit-scrollbar {
  width: 4px;
}

.reasoning-content::-webkit-scrollbar-thumb {
  background: rgba(168, 162, 158, 0.2);
  border-radius: 2px;
}

/* ============================================
   动画过渡
   ============================================ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================
   响应式设计
   ============================================ */

@media (max-width: 768px) {
  .ai-chat-layout {
    border: none;
    border-radius: 0;
    height: 100vh;
  }

  .chat-header {
    padding: 16px 20px;
  }

  .chat-title {
    font-size: 20px;
  }

  .chat-subtitle {
    font-size: 11px;
  }

  .messages-container {
    padding: 16px 20px;
  }

  .message-bubble {
    max-width: 85%;
  }

  .input-area {
    padding: 12px 20px;
  }

  .chat-textarea {
    font-size: 12px;
    height: 40px;
  }

  .btn-submit {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 12px 16px;
  }

  .chat-title {
    font-size: 18px;
  }

  .messages-container {
    padding: 12px 16px;
  }

  .message-bubble {
    max-width: 100%;
  }

  .input-area {
    padding: 10px 16px;
  }

  .input-box {
    gap: 8px;
  }

  .chat-textarea {
    font-size: 12px;
    height: 36px;
  }

  .btn-submit {
    width: 36px;
    height: 36px;
  }

  .btn-submit svg {
    width: 16px;
    height: 16px;
  }
}
</style>
