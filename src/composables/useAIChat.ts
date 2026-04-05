import { ref, reactive } from 'vue'
import { nextTick } from 'vue'
import { messageAPI, type StreamMessage } from '../api/modules/aiChat'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string  // 思考过程
  reasoningState?: 'streaming' | 'completed' | 'collapsed'  // 思考过程状态
  requestTime?: number  // 请求耗时（毫秒）
  tokensUsed?: number  // 消耗的 token
  messageId?: number  // API返回的消息ID
}

export interface ChatConfig {
  model: 'qwen3.5-flash' | 'qwen3.5-plus'
  useStream: boolean
  sessionId?: number  // 当前会话ID
}

export function useAIChat() {
  const loading = ref(false)
  const errorMsg = ref('')
  const inputMessage = ref('')
  const messages = ref<Message[]>([])

  const chatConfig = reactive<ChatConfig>({
    model: 'qwen3.5-plus',
    useStream: true,  // ✅ 默认启用流式
    sessionId: undefined  // 会话ID
  })

  /**
   * 发送非流式消息
   * 使用 API: POST /api/ai-chat/sessions/{sessionId}/messages
   */
  async function sendCommonMessage(): Promise<number> {
    if (!chatConfig.sessionId) {
      throw new Error('会话ID不存在，请重新创建会话')
    }

    try {
      const response = await messageAPI.sendMessage(chatConfig.sessionId, inputMessage.value)
      const data = response.data

      if (data?.code === 0 && data?.data?.aiMessage) {
        const aiMessageData = data.data.aiMessage
        messages.value.push({
          role: 'assistant',
          content: aiMessageData.content,
          tokensUsed: aiMessageData.total_tokens || 0,
          messageId: aiMessageData.id,
          requestTime: data.data.responseTime || 0
        })

        // 返回消耗的token
        return aiMessageData.total_tokens || 0
      }

      throw new Error(data?.msg || '发送消息失败')
    } catch (error) {
      throw error
    }
  }

  /**
   * 发送流式消息
   * 使用 API: POST /api/ai-chat/sessions/{sessionId}/messages/stream
   * 如果流式失败，会自动降级到非流式
   */
  async function sendStreamMessage(): Promise<number> {
    if (!chatConfig.sessionId) {
      throw new Error('会话ID不存在，请重新创建会话')
    }

    try {
      const requestStartTime = performance.now()
      
      const response = await messageAPI.sendStreamMessage(chatConfig.sessionId, inputMessage.value)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let aiMessage = ''
      let reasoningMessage = ''
      let totalTokens = 0
      let lastUpdateLength = 0
      let reasoningCompleted = false

      // 添加AI消息占位符
      const aiMessageObj: Message = {
        role: 'assistant',
        content: '',
        reasoning: '',
        reasoningState: 'streaming'
      }
      messages.value.push(aiMessageObj)

      // 立即触发更新以显示消息开始接收
      await nextTick()

      // ✅ 使用 Promise.resolve().then() 来延迟更新，不会阻塞 reader.read()
      const scheduleUpdate = () => {
        Promise.resolve().then(() => {
          messages.value[messages.value.length - 1] = { ...aiMessageObj }
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const streamMsg = JSON.parse(line.slice(6)) as StreamMessage

              // ✅ 支持新的流式数据格式
              if (streamMsg.type === 'connected') {
                // 连接已建立，开始接收数据
                console.log('✅ 流式连接已建立')
              } else if (streamMsg.type === 'chunk') {
                // 接收完整的文本块（后端已经完整处理）
                aiMessage += streamMsg.content || ''
                aiMessageObj.content = aiMessage
                aiMessageObj.reasoningState = 'completed'
                reasoningCompleted = true
                
                if (aiMessage.length - lastUpdateLength >= 50) {
                  scheduleUpdate()
                  lastUpdateLength = aiMessage.length
                }
              } else if (streamMsg.type === 'content') {
                // 旧格式兼容
                if (!reasoningCompleted && reasoningMessage) {
                  aiMessageObj.reasoningState = 'completed'
                  reasoningCompleted = true
                }
                
                aiMessage += streamMsg.content || ''
                aiMessageObj.content = aiMessage
                
                if (aiMessage.length - lastUpdateLength >= 20) {
                  scheduleUpdate()
                  lastUpdateLength = aiMessage.length
                }
              } else if (streamMsg.type === 'reasoning') {
                // 旧格式兼容
                reasoningMessage += streamMsg.content || ''
                aiMessageObj.reasoning = reasoningMessage
                
                if (reasoningMessage.length - lastUpdateLength >= 50) {
                  scheduleUpdate()
                  lastUpdateLength = reasoningMessage.length
                }
              } else if (streamMsg.type === 'done') {
                // 流完成
                totalTokens = (streamMsg.usage?.total_tokens || streamMsg.totalTokens || 0) as number
                aiMessageObj.reasoningState = 'collapsed'
                aiMessageObj.requestTime = Math.round(performance.now() - requestStartTime)
                aiMessageObj.tokensUsed = totalTokens
                console.log('✅ 流式消息完成，总 Token:', totalTokens)
              }
            } catch (e) {
              console.error('解析流式消息失败:', e)
            }
          }
        }
      }

      // 最后再做一次完整更新确保所有字符都显示
      messages.value[messages.value.length - 1] = { ...aiMessageObj }

      return totalTokens
    } catch (error) {
      console.warn('⚠️ 流式请求失败，自动降级到非流式模式:', error)
      
      // 流式失败，移除已添加的AI消息占位符
      messages.value.pop()
      
      // 降级到非流式模式
      return await sendCommonMessage()
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

    if (!chatConfig.sessionId) {
      errorMsg.value = '请先创建会话'
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
