import { ref, reactive } from 'vue'
import { nextTick } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatConfig {
  model: 'qwen3.5-flash' | 'qwen3.5-max'
  useStream: boolean
}

export function useAIChat() {
  const loading = ref(false)
  const errorMsg = ref('')
  const inputMessage = ref('')
  const messages = ref<Message[]>([])

  const chatConfig = reactive<ChatConfig>({
    model: 'qwen3.5-flash',
    useStream: false
  })

  /**
   * 发送非流式消息
   */
  async function sendCommonMessage(): Promise<number> {
    try {
      const response = await fetchWithRefresh(
        `/api/ai/ptio/common`,
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

        // 返回消耗的额度
        return data.data.usage?.total_tokens || 0
      }

      return 0
    } catch (error) {
      throw error
    }
  }

  /**
   * 发送流式消息
   */
  async function sendStreamMessage(): Promise<number> {
    try {
      const response = await fetchWithRefresh(
        `/api/ai/ptio/stream`,
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

      const reader = response.body!.getReader()
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

      return totalTokens
    } catch (error) {
      throw error
    }
  }

  /**
   * 处理发送消息
   */
  async function handleSendMessage(userCredits: number): Promise<{ success: boolean; tokensUsed: number }> {
    errorMsg.value = ''

    if (!inputMessage.value.trim()) {
      errorMsg.value = '请输入消息'
      return { success: false, tokensUsed: 0 }
    }

    if (userCredits < 10) {
      errorMsg.value = '额度不足，请充值'
      return { success: false, tokensUsed: 0 }
    }

    loading.value = true

    try {
      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: inputMessage.value
      })

      let tokensUsed = 0

      if (chatConfig.useStream) {
        tokensUsed = await sendStreamMessage()
      } else {
        tokensUsed = await sendCommonMessage()
      }

      inputMessage.value = ''
      return { success: true, tokensUsed }
    } catch (error) {
      messages.value.pop() // 移除用户消息
      errorMsg.value =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        '发送失败'
      return { success: false, tokensUsed: 0 }
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空消息历史
   */
  function clearMessages() {
    messages.value = []
    inputMessage.value = ''
    errorMsg.value = ''
  }

  return {
    // 状态
    loading,
    errorMsg,
    inputMessage,
    messages,
    chatConfig,
    // 方法
    handleSendMessage,
    clearMessages
  }
}
