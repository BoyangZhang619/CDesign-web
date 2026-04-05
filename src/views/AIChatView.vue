<template>
  <div class="page">
    <AppHeader />

    <!-- 聊天历史侧栏遮罩 - 使用 Transition 组件确保淡入淡出效果 -->
    <Transition name="fade-overlay">
      <div v-if="showHistorySidebarScreen" class="history-overlay" @click="closeHistorySidebar"></div>
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
              <div class="message-content">{{ msg.content }}</div>
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
          <div class="config-section">
            <!-- 模型选择块 -->
            <div class="config-block">
              <span class="config-block-label">模型:</span>
              <select v-model="chatConfig.model" class="config-select"
                style="border: none; background: transparent; padding: 0; font-size: 10px;">
                <option value="qwen3.5-flash">Qwen 3.5</option>
                <option value="qwen3.5-plus">Qwen Plus</option>
              </select>
            </div>

            <!-- 流式输出切换块 -->
            <label class="config-checkbox-label">
              <input v-model="chatConfig.useStream" type="checkbox" />
              <span>流式输出</span>
            </label>

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
const showHistorySidebarScreen = ref(false) // 用于控制遮罩显示，避免侧栏动画时遮罩过早消失
const currentChatId = ref<string | null>(null)
const chatHistories = ref<Array<{
  id: string
  title: string
  preview: string
  timestamp: number
}>>([])

// 初始化聊天记录（mock 数据）
function initializeChatHistories() {
  const now = Date.now()
  chatHistories.value = [
    {
      id: '1',
      title: '最近的对话',
      preview: '关于最近的健康状况...',
      timestamp: now - 3600000
    },
    {
      id: '2',
      title: '运动建议',
      preview: '如何制定合理的运动计划...',
      timestamp: now - 86400000
    },
    {
      id: '3',
      title: '饮食咨询',
      preview: '关于如何保持均衡饮食...',
      timestamp: now - 172800000
    },
    {
      id: '4',
      title: '睡眠改善',
      preview: '有什么方法可以改善睡眠...',
      timestamp: now - 259200000
    }
  ]
  currentChatId.value = '1'
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
function switchChat(id: string) {
  currentChatId.value = id
  // 这里可以加载对应 ID 的聊天记录
  console.log('切换到聊天记录:', id)
  closeHistorySidebar()
}

// 新建对话
function handleNewChat() {
  clearMessages()
  currentChatId.value = null
  closeHistorySidebar()
}

async function closeHistorySidebar() {
  showHistorySidebar.value = !showHistorySidebar.value
  setTimeout(() => { showHistorySidebarScreen.value = !showHistorySidebarScreen.value }, 300)
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

onMounted(() => {
  loadUserInfo()
  initializeChatHistories()
})
</script>

<style scoped>
@import '@/css/AIChatView.css';
</style>
