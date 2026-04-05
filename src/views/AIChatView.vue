<template>
  <div class="page">
    <AppHeader />

    <!-- 聊天历史侧栏遮罩 - 使用 Transition 组件确保淡入淡出效果 -->
    <Transition name="fade-overlay">
      <div v-if="showHistorySidebar" class="history-overlay" @click="closeHistorySidebar"></div>
    </Transition>

    <!-- 聊天历史侧栏 -->
    <aside :class="['chat-history-sidebar', { open: showHistorySidebar }]">
      <div class="history-header">
        <h3 class="history-title">聊天记录</h3>
        <button class="history-close-btn" @click="closeHistorySidebar" title="关闭">✕</button>
      </div>

      <div class="history-content">
        <div v-if="chatHistories.length === 0" class="history-empty">
          暂无聊天记录
        </div>

        <div v-else>
          <div v-for="history in chatHistories" :key="history.id"
            :class="['history-item', { active: currentChatId === history.id }]" @click="switchChat(history.id)">
            <h4 class="history-item-title">{{ history.title }}</h4>
            <p class="history-item-preview">{{ history.preview }}</p>
            <div class="history-item-time">{{ formatTime(history.timestamp) }}</div>
          </div>
        </div>
      </div>

      <div class="history-footer">
        <button class="new-chat-btn" @click="handleNewChat">
          + 新建对话
        </button>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <main class="ai-chat-content">
      <div class="chat-container">

        <!-- 顶部头部 - 简洁版 -->
        <div class="chat-header">
          <div class="header-info">
            <h1 class="chat-title">AI 健康助手</h1>
            <p class="chat-subtitle">个性化健康咨询 · 随时为您服务</p>
          </div>
          <div class="header-actions">
            <!-- 历史记录按钮 -->
            <button class="action-btn" @click="closeHistorySidebar"
              :title="`${showHistorySidebar ? '关闭' : '打开'}聊天记录`">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
            </button>

            <!-- 新建对话按钮 -->
            <button class="action-btn" @click="handleNewChat" title="新建对话">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>

            <!-- 用户信息 -->
            <div v-if="authStore.userInfo" class="header-actions">
              <div style="text-align: right; font-size: 11px;">
                <div
                  style="color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">
                  剩余额度</div>
                <div style="font-size: 16px; font-weight: 600; color: var(--color-accent-primary);">{{
                  authStore.userInfo.credits || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息显示区域 - 核心 -->
        <div class="messages-container">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">{{ getHoursIcon() }}</div>
              <h2 class="empty-title">开始健康对话</h2>
              <p class="empty-description">
                向 AI 助手提出关于健康、饮食、<br>运动和睡眠的任何问题
              </p>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-list">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', `msg-${msg.role}`]">
              <div class="message-header">
                <span class="message-role">{{ msg.role === 'user' ? '您' : 'AI' }}</span>
              </div>
              
              <!-- 思考过程（只在 AIChat 页显示） -->
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
              
              <!-- 主要回复内容 -->
              <div class="message-content">{{ msg.content }}</div>
            </div>

            <!-- 加载动画 - 当等待AI回复时显示 -->
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

        <!-- 输入区域 - 固定底部 -->
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
            <textarea v-model="inputMessage" @keydown="handleKeyDown" :disabled="loading" class="chat-textarea"
              placeholder="输入您的问题... (Enter 发送 / Shift+Enter 换行)"></textarea>
            <button @click="handleSendChat" :disabled="loading || !inputMessage.trim()" class="btn-submit" title="发送消息">
              <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16350093 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4379852 C3.03521743,10.5950826 3.19218622,10.75 3.50612381,10.75 L16.6915026,11.5354869 C16.6915026,11.5354869 17.1624089,11.5354869 17.1624089,12.0068791 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
              <span v-else>⏳</span>
            </button>
          </div>

          <!-- 配置栏 - 自定义块选择 -->
          <div class="config-section" style="display: none;">
            <div class="config-block">
              <span class="config-block-label">模型:</span>
              <select v-model="chatConfig.model" class="config-select"
                style="border: none; background: transparent; padding: 0; font-size: 10px;">
                <option value="qwen3.5-flash">Qwen 3.5</option>
                <option value="qwen3.5-plus">Qwen Plus</option>
              </select>
            </div>

            <!-- 清除历史按钮 -->
            <button v-if="messages.length > 0" @click="handleClearMessages" class="btn-clear-history">
              🗑️ 清除对话
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useAIChat } from '../composables/useAIChat'
import { sessionAPI, messageAPI } from '../api/modules/aiChat'

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

const getHoursIcon = () => {
  const hours = new Date().getHours()
  if (hours < 6) return '🌙'
  else if (hours < 8) return '🌅'
  else if (hours < 15) return '☀️'
  else if (hours < 18) return '🌇'
  else return '🌆'
}

// 聊天记录侧栏
const showHistorySidebar = ref(false)
const currentChatId = ref<string | null>(null)
const chatHistories = ref<Array<{
  id: string
  title: string
  preview: string
  timestamp: number
}>>([])

// 初始化聊天记录
async function initializeChatHistories() {
  try {
    // 获取用户的所有会话
    const response = await sessionAPI.getSessions({
      limit: 50,  // 获取最近50个会话
      page: 1
    })

    if (response.data?.success && response.data?.data?.data && Array.isArray(response.data.data.data)) {
      // 将会话转换为侧栏展示的格式
      chatHistories.value = response.data.data.data
        .map((session: any) => ({
          id: session.id?.toString() || session.uuid,
          title: session.session_name || '未命名对话',
          preview: session.message_count > 0 ? `${session.message_count} 条消息` : '暂无消息',
          timestamp: session.last_message_at ? new Date(session.last_message_at).getTime() : new Date(session.created_at).getTime()
        }))
        .sort((a: any, b: any) => b.timestamp - a.timestamp)  // 按时间倒序排列
      
      console.log('✅ 已加载聊天历史，共', chatHistories.value.length, '个会话')
    } else {
      console.warn('获取会话列表失败:', response.data?.message)
      chatHistories.value = []
    }
  } catch (error) {
    console.warn('获取聊天历史时出错:', error)
    chatHistories.value = []
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} 天前`
  } else if (hours > 0) {
    return `${hours} 小时前`
  } else if (minutes > 0) {
    return `${minutes} 分钟前`
  } else {
    return '刚刚'
  }
}

// 切换聊天
async function switchChat(id: string) {
  try {
    currentChatId.value = id
    
    // 获取会话的消息记录
    const sessionId = parseInt(id)
    const response = await sessionAPI.getSessionDetail(sessionId)
    
    if (response.data?.success && response.data?.data?.data) {
      const session = response.data.data.data
      
      // 更新当前会话ID
      chatConfig.sessionId = session.id
      
      // 获取该会话的消息
      const messagesRes = await messageAPI.getMessages(sessionId, { limit: 100 })
      
      if (messagesRes.data?.success && Array.isArray(messagesRes.data?.data?.data)) {
        // 清除当前消息，加载新的消息
        clearMessages()
        
        // 将消息添加到消息列表
        messagesRes.data.data.data.forEach((msg: any) => {
          messages.value.push({
            role: msg.role,
            content: msg.content,
            reasoning: msg.reasoning,
            reasoningState: 'collapsed',
            tokensUsed: msg.total_tokens,
            messageId: msg.id
          })
        })
        
        console.log('✅ 已加载会话消息，共', messages.value.length, '条')
      }
    }
    
    closeHistorySidebar()
  } catch (error) {
    errorMsg.value = '加载会话失败'
    console.error('加载会话失败:', error)
  }
}

// 新建对话 - 创建新会话
async function handleNewChat() {
  try {
    clearMessages()
    errorMsg.value = ''
    
    // 创建新会话
    const response = await sessionAPI.createSession({
      session_name: '新聊天 ' + new Date().toLocaleString(),
      ai_model: 'dashscope',
      temperature: 0.7,
      max_tokens: 2048
    })
    
    // 响应结构：response.data.data.data.id
    if (response.data?.success && response.data?.data?.data?.id) {
      chatConfig.sessionId = response.data.data.data.id
      console.log('✅ 新会话已创建，ID:', chatConfig.sessionId)
    } else {
      errorMsg.value = response.data?.message || '创建会话失败'
      console.error('创建会话失败:', response.data)
    }
  } catch (error) {
    errorMsg.value = '创建会话失败，请检查网络连接'
    console.error('创建会话错误:', error)
  }
  
  currentChatId.value = null
  closeHistorySidebar()
}

async function closeHistorySidebar() {
  showHistorySidebar.value = !showHistorySidebar.value
}

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

  // 如果还没有会话ID，先创建会话
  if (!chatConfig.sessionId) {
    try {
      const response = await sessionAPI.createSession({
        session_name: '新聊天 ' + new Date().toLocaleString(),
        ai_model: 'dashscope',
        temperature: 0.7,
        max_tokens: 2048
      })
      
      // 响应结构：response.data.data.data.id
      if (response.data?.success && response.data?.data?.data?.id) {
        chatConfig.sessionId = response.data.data.data.id
        console.log('✅ 会话已创建，ID:', chatConfig.sessionId)
      } else {
        errorMsg.value = response.data?.message || '创建会话失败'
        console.error('创建会话失败:', response.data)
        return
      }
    } catch (error) {
      errorMsg.value = '创建会话失败，请检查网络连接'
      console.error('创建会话错误:', error)
      return
    }
  }

  const result = await handleSendMessage(authStore.userInfo.credits || 0)

  if (result.success && authStore.userInfo) {
    authStore.userInfo.credits -= result.tokensUsed
  }
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  // 检测是否在桌面端（通过 UA 判断）
  const isDesktop = !/mobile|android|iphone|ipad|phone/i.test(navigator.userAgent.toLowerCase())

  if (isDesktop && event.key === 'Enter' && !event.shiftKey) {
    // 桌面端：Enter 发送，Shift+Enter 转行
    event.preventDefault()
    handleSendChat()
  } else if (event.key === 'Enter' && event.shiftKey) {
    // 任何平台：Shift+Enter 转行
    // 让默认行为进行
  }
  // 移动端不处理 Enter 事件
}

// 处理清除历史
function handleClearMessages() {
  if (confirm('确定要清除所有对话历史吗？')) {
    clearMessages()
  }
}

onMounted(async () => {
  await loadUserInfo()
  initializeChatHistories()
  
  // 延迟创建会话，等到用户发送第一条消息时再创建
  // 这样可以避免重复创建会话
})
</script>

<style scoped>
@import '@/css/AIChatView.css';
</style>
