<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="card">
        <h2>AI 对话</h2>
        <p class="subtitle">与AI助手交互，获取智能回复</p>

        <div class="user-info" v-if="authStore.userInfo">
          <span>用户: {{ authStore.userInfo.email || authStore.userInfo.username }}</span>
          <span class="credits">额度: {{ authStore.userInfo.credits || 0 }}</span>
        </div>

        <!-- 对话历史 -->
        <div class="chat-history">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>

        <!-- 对话输入框 -->
        <div class="chat-input-area">
          <div class="model-selector">
            <label>模型:</label>
            <select v-model="chatConfig.model">
              <option value="qwen3.5-flash">Qwen 3.5 Flash (快速)</option>
              <option value="qwen3.5-max">Qwen 3.5 Max (高级)</option>
            </select>
          </div>

          <div class="stream-toggle">
            <label>
              <input v-model="chatConfig.useStream" type="checkbox" />
              使用流式对话
            </label>
          </div>

          <div class="input-group">
            <textarea
              v-model="inputMessage"
              placeholder="输入你的问题..."
              @keydown.enter.ctrl="handleSendMessage"
              :disabled="loading"
            ></textarea>
            <button @click="handleSendMessage" :disabled="loading || !inputMessage.trim()">
              {{ loading ? '发送中...' : '发送 (Ctrl+Enter)' }}
            </button>
          </div>

          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { fetchWithRefresh } from '../api/http'

const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')
const inputMessage = ref('')
const messages = ref([])

const chatConfig = reactive({
  model: 'qwen3.5-flash',
  useStream: false
})

// 加载用户信息
async function loadUserInfo() {
  try {
    await authStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 发送非流式消息
async function sendCommonMessage() {
  try {
    const response = await fetchWithRefresh(
      `${import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'}/api/ai/ptio/common`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage.value,
          model: chatConfig.model,
          response_language: 'Chinese'
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data?.success) {
      const aiMessage = data.data.content
      messages.value.push({
        role: 'assistant',
        content: aiMessage
      })

      // 更新额度
      if (authStore.userInfo) {
        authStore.userInfo.credits -= data.data.usage.total_tokens
      }
    }
  } catch (error) {
    throw error
  }
}

// 发送流式消息
async function sendStreamMessage() {
  try {
    const response = await fetchWithRefresh(
      `${import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'}/api/ai/ptio/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage.value,
          model: chatConfig.model,
          response_language: 'Chinese'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let aiMessage = ''
    let totalTokens = 0

    // 添加AI消息占位符
    const messageIndex = messages.value.length
    messages.value.push({
      role: 'assistant',
      content: ''
    })

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const message = JSON.parse(line.slice(6))

            if (message.type === 'content') {
              aiMessage += message.content
              messages.value[messageIndex].content = aiMessage
              await nextTick()
            } else if (message.type === 'done') {
              totalTokens = message.usage?.total_tokens || 0
            }
          } catch (e) {
            console.error('解析消息失败:', e)
          }
        }
      }
    }

    // 更新额度
    if (authStore.userInfo && totalTokens > 0) {
      authStore.userInfo.credits -= totalTokens
    }
  } catch (error) {
    throw error
  }
}

// 发送消息
async function handleSendMessage() {
  errorMsg.value = ''

  if (!inputMessage.value.trim()) {
    errorMsg.value = '请输入消息'
    return
  }

  if (authStore.userInfo && authStore.userInfo.credits < 10) {
    errorMsg.value = '额度不足，请充值'
    return
  }

  loading.value = true

  try {
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: inputMessage.value
    })

    if (chatConfig.useStream) {
      await sendStreamMessage()
    } else {
      await sendCommonMessage()
    }

    inputMessage.value = ''
  } catch (error) {
    messages.value.pop() // 移除用户消息
    errorMsg.value =
      error?.response?.data?.message ||
      error?.message ||
      '发送失败'
  } finally {
    loading.value = false
  }
}

// 初始化
loadUserInfo()
</script>

<style scoped>
.content {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

h2 {
  margin: 0;
  padding: 24px 24px 8px;
  font-size: 20px;
}

.subtitle {
  margin: 0;
  padding: 0 24px;
  color: #6b7280;
  font-size: 12px;
}

.user-info {
  padding: 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.credits {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.chat-history {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 8px;
  word-wrap: break-word;
  line-height: 1.5;
}

.message.user .message-content {
  background: #111827;
  color: white;
}

.message.assistant .message-content {
  background: #f3f4f6;
  color: #111827;
}

.chat-input-area {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.model-selector,
.stream-toggle {
  margin-bottom: 12px;
  font-size: 12px;
}

.model-selector label,
.stream-toggle label {
  margin-right: 8px;
}

.model-selector select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group textarea {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  max-height: 80px;
  font-family: inherit;
}

.input-group textarea:focus {
  outline: none;
  border-color: #111827;
}

.input-group button {
  padding: 10px 16px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.3s;
}

.input-group button:hover:not(:disabled) {
  background: #1f2937;
}

.input-group button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .message {
    max-width: 100%;
  }
}
</style>
