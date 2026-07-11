import { ref, reactive } from 'vue'
import { nextTick } from 'vue'
import { messageAPI, sessionAPI, type StreamMessage } from '../api/modules/aiChat'

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
   * 使用 API: POST /ai-chat/sessions/{sessionId}/messages
   */
  async function sendCommonMessage(content?: string): Promise<number> {
    if (!chatConfig.sessionId) {
      throw new Error('会话ID不存在，请重新创建会话')
    }

    // 如果没有提供内容，使用 inputMessage.value
    const messageContent = content || inputMessage.value
    
    if (!messageContent.trim()) {
      throw new Error('消息内容不能为空')
    }

    try {
      const response = await messageAPI.sendMessage(chatConfig.sessionId, messageContent)
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
   * 使用 API: POST /ai-chat/sessions/{sessionId}/messages/stream
   * 如果流式失败，会自动降级到非流式
   */
  async function sendStreamMessage(content: string): Promise<number> {
    if (!chatConfig.sessionId) {
      throw new Error('会话ID不存在，请重新创建会话')
    }

    let streamStarted = false
    let hasReceivedData = false
    let connectedReceived = false

    try {
      const requestStartTime = performance.now()
      
      console.log('[sendStreamMessage] 开始发送流式请求，sessionId:', chatConfig.sessionId)
      const response = await messageAPI.sendStreamMessage(chatConfig.sessionId, content)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let aiMessage = ''
      let reasoningMessage = ''
      let totalTokens = 0
      let lastUpdateLength = 0
      let reasoningCompleted = false

      // 添加AI消息占位符，初始为加载状态
      const aiMessageObj: Message = {
        role: 'assistant',
        content: '', // 空内容会触发加载动画显示
        reasoning: '',
        reasoningState: 'streaming'
      }
      messages.value.push(aiMessageObj)
      streamStarted = true

      // 立即触发更新以显示消息开始接收（加载动画）
      await nextTick()

      // ✅ 同步更新函数，避免异步操作中的错误
      const scheduleUpdate = () => {
        try {
          console.log('[scheduleUpdate] 开始更新，messages.value:', messages.value ? 'exists' : 'undefined', '长度:', messages.value?.length)
          if (!messages.value) {
            console.error('[scheduleUpdate] ❌ messages.value 为 undefined！')
            return
          }
          if (!Array.isArray(messages.value)) {
            console.error('[scheduleUpdate] ❌ messages.value 不是数组，类型:', typeof messages.value)
            return
          }
          if (messages.value.length === 0) {
            console.warn('[scheduleUpdate] ⚠️ messages.value 为空数组')
            return
          }
          
          const lastMsg = messages.value[messages.value.length - 1]
          console.log('[scheduleUpdate] lastMsg:', lastMsg ? 'exists' : 'null', '角色:', lastMsg?.role)
          
          if (!lastMsg) {
            console.error('[scheduleUpdate] ❌ lastMsg 为 null')
            return
          }
          if (typeof lastMsg !== 'object') {
            console.error('[scheduleUpdate] ❌ lastMsg 不是对象，类型:', typeof lastMsg)
            return
          }
          if (lastMsg.role !== 'assistant') {
            console.warn('[scheduleUpdate] ⚠️ lastMsg 角色不是 assistant，是:', lastMsg.role)
            return
          }
          
          // 创建一个新对象确保响应性
          const updatedMessage: Message = {
            role: 'assistant',
            content: aiMessage || '',
            reasoning: reasoningMessage || '',
            reasoningState: aiMessageObj.reasoningState || 'streaming',
            tokensUsed: aiMessageObj.tokensUsed,
            requestTime: aiMessageObj.requestTime,
            messageId: aiMessageObj.messageId
          }
          console.log('[scheduleUpdate] 即将更新，content长度:', updatedMessage.content.length)
          messages.value[messages.value.length - 1] = updatedMessage
          console.log('[scheduleUpdate] ✅ 更新成功')
        } catch (err) {
          console.error('[scheduleUpdate] 捕获的异常:', err)
          console.error('[scheduleUpdate] 异常详情:', err instanceof Error ? err.message : String(err))
          if (err instanceof Error) {
            console.error('[scheduleUpdate] 堆栈:', err.stack)
          }
        }
      }

      // ⏱️ 设置流式超时：30秒内必须至少收到一次数据
      const streamTimeoutId = setTimeout(() => {
        if (!hasReceivedData && connectedReceived) {
          console.warn('⚠️ 流式连接已建立但30秒未收到数据，强制关闭流')
          reader.cancel().catch(() => {})
        }
      }, 30000)

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            clearTimeout(streamTimeoutId)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const streamMsg = JSON.parse(line.slice(6)) as StreamMessage

                // 防御性编程：检查消息对象是否有效
                if (!streamMsg || !streamMsg.type) {
                  console.warn('⚠️ 收到无效的流式消息对象')
                  continue
                }

                // ✅ 支持新的流式数据格式
                if (streamMsg.type === 'connected') {
                  // 连接已建立，保持加载动画显示
                  connectedReceived = true
                } else if (streamMsg.type === 'chunk') {
                  // 接收完整的文本块（后端已经完整处理）
                  hasReceivedData = true
                  clearTimeout(streamTimeoutId)
                  const chunkContent = streamMsg.content || ''
                  console.log('[chunk处理] 收到chunk，内容长度:', chunkContent.length, '内容:', chunkContent)
                  aiMessage += chunkContent
                  aiMessageObj.content = aiMessage
                  aiMessageObj.reasoningState = 'completed'
                  reasoningCompleted = true
                  console.log('[chunk处理] 调用scheduleUpdate前，messages.value存在:', !!messages.value, '长度:', messages.value?.length)
                  scheduleUpdate()
                  console.log('[chunk处理] scheduleUpdate调用后')
                  lastUpdateLength = aiMessage.length
                } else if (streamMsg.type === 'content') {
                  // 旧格式兼容
                  hasReceivedData = true
                  clearTimeout(streamTimeoutId)
                  const contentData = streamMsg.content || ''
                  if (!reasoningCompleted && reasoningMessage) {
                    aiMessageObj.reasoningState = 'completed'
                    reasoningCompleted = true
                  }
                  
                  aiMessage += contentData
                  aiMessageObj.content = aiMessage
                  
                  if (aiMessage.length - lastUpdateLength >= 20) {
                    scheduleUpdate()
                    lastUpdateLength = aiMessage.length
                  }
                } else if (streamMsg.type === 'reasoning') {
                  // 旧格式兼容
                  hasReceivedData = true
                  clearTimeout(streamTimeoutId)
                  const reasoningData = streamMsg.content || ''
                  reasoningMessage += reasoningData
                  aiMessageObj.reasoning = reasoningMessage
                  
                  if (reasoningMessage.length - lastUpdateLength >= 50) {
                    scheduleUpdate()
                    lastUpdateLength = reasoningMessage.length
                  }
                } else if (streamMsg.type === 'done') {
                  // 流完成
                  hasReceivedData = true
                  clearTimeout(streamTimeoutId)
                  totalTokens = (streamMsg.usage?.total_tokens || streamMsg.totalTokens || 0) as number
                  aiMessageObj.reasoningState = 'collapsed'
                  aiMessageObj.requestTime = Math.round(performance.now() - requestStartTime)
                  aiMessageObj.tokensUsed = totalTokens
                } else if (streamMsg.type === 'error') {
                  // 处理流式错误
                  hasReceivedData = true
                  clearTimeout(streamTimeoutId)
                  const errorMsg = streamMsg.message || '未知流式传输错误'
                  console.error('❌ 流式消息错误:', errorMsg)
                  throw new Error(errorMsg)
                }
              } catch (e) {
                if (e instanceof SyntaxError) {
                  console.warn('⚠️ 流式消息解析失败（JSON格式错误）')
                } else if (e instanceof TypeError) {
                  console.error('❌ 流式消息处理类型错误:', e instanceof Error ? e.message : String(e))
                  throw e
                } else {
                  console.error('❌ 解析流式消息失败:', e instanceof Error ? e.message : String(e))
                  throw e
                }
              }
            }
          }
        }
      } finally {
        clearTimeout(streamTimeoutId)
      }

      // 处理缓冲区中可能剩余的最后一块数据
      if (buffer && buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          try {
            const lastData = buffer.slice(6).trim()
            if (lastData) {
              const streamMsg = JSON.parse(lastData) as StreamMessage
              
              if (streamMsg && streamMsg.type === 'done') {
                hasReceivedData = true
                totalTokens = (streamMsg.usage?.total_tokens || streamMsg.totalTokens || 0) as number
              }
            }
          } catch (e) {
            console.warn('⚠️ 处理缓冲区剩余数据失败:', e instanceof Error ? e.message : String(e))
          }
        }
      }

      // 流式成功完成
      if (!hasReceivedData && connectedReceived) {
        console.warn('⚠️ 流式连接已建立但未接收到任何实际数据')
      }

      // 最后再做一次完整更新确保所有字符都显示
      console.log('[发送流式] 最后更新阶段，messages.value:', messages.value ? 'exists' : 'undefined', '长度:', messages.value?.length)
      if (messages.value && Array.isArray(messages.value) && messages.value.length > 0) {
        const lastMessage = messages.value[messages.value.length - 1]
        console.log('[发送流式] lastMessage:', lastMessage ? 'exists' : 'null', '角色:', lastMessage?.role)
        if (lastMessage && typeof lastMessage === 'object' && lastMessage.role === 'assistant') {
          try {
            // 创建新的消息对象确保响应性
            const finalMessage: Message = {
              role: 'assistant',
              content: aiMessage || (aiMessageObj.content || ''),
              reasoning: reasoningMessage || (aiMessageObj.reasoning || ''),
              reasoningState: 'collapsed',
              tokensUsed: totalTokens || 0,
              requestTime: Math.round(performance.now() - requestStartTime),
              messageId: aiMessageObj.messageId
            }
            console.log('[发送流式] 即将执行最终更新，content长度:', finalMessage.content.length)
            messages.value[messages.value.length - 1] = finalMessage
            console.log('[发送流式] ✅ 最终更新完成')
          } catch (updateError) {
            console.error('[发送流式] ❌ 最终更新出错:', updateError instanceof Error ? updateError.message : String(updateError))
            if (updateError instanceof Error) {
              console.error('[发送流式] 错误堆栈:', updateError.stack)
            }
          }
        }
      }

      console.log('[发送流式] 流式处理完成，返回 token:', totalTokens)
      return totalTokens
    } catch (error) {
      console.warn('⚠️ 流式请求失败:', error instanceof Error ? error.message : error)
      
      // 只在流式真正开始后才移除占位符和降级
      if (streamStarted) {
        console.warn('⚠️ 移除流式占位符，尝试降级到非流式模式')
        messages.value.pop()
        
        if (!hasReceivedData) {
          // 未收到任何数据，降级到非流式模式
          console.log('[sendStreamMessage] 开始降级到非流式请求')
          try {
            return await sendCommonMessage(content)
          } catch (fallbackError) {
            console.error('[sendStreamMessage] 降级请求也失败:', fallbackError)
            throw fallbackError
          }
        } else {
          // 如果已经收到数据但出错，不再降级，直接抛出错误
          console.error('[sendStreamMessage] 流式已收到数据但后续出错，不再降级')
          throw error
        }
      } else {
        // 流式完全未开始，直接抛出错误
        console.error('[sendStreamMessage] 流式请求未开始就失败')
        throw error
      }
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

    // 如果还没有会话，自动创建一个（首次发消息时静默创建）
    if (!chatConfig.sessionId) {
      try {
        const res = await sessionAPI.createSession({
          session_name: inputMessage.value.trim().slice(0, 20) || '新对话',
          ai_model: 'dashscope',
          tags: 'chat',
        })
        // sendResult(res, { data: session }) → { success, data: { data: session } }
        const session = res.data?.data?.data
        if (res.data?.success && session?.id) {
          chatConfig.sessionId = session.id
        } else {
          errorMsg.value = '创建会话失败，请重试'
          return { success: false, tokensUsed: 0 }
        }
      } catch {
        errorMsg.value = '创建会话失败，请重试'
        return { success: false, tokensUsed: 0 }
      }
    }

    // 防止重复提交：如果已经在加载，直接返回
    if (loading.value) {
      console.warn('[handleSendMessage] 上一个请求仍在处理中，忽略本次提交')
      return { success: false, tokensUsed: 0 }
    }

    loading.value = true

    try {
      // 立即保存消息内容，防止后续被清空
      const messageToSend = inputMessage.value
      inputMessage.value = ''

      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: messageToSend
      })

      let tokensUsed = 0

      if (chatConfig.useStream) {
        // 流式请求：需要在 sendStreamMessage 中使用 messageToSend
        tokensUsed = await sendStreamMessage(messageToSend)
      } else {
        // 非流式请求：直接传递消息内容
        tokensUsed = await sendCommonMessage(messageToSend)
      }

      return { success: true, tokensUsed }
    } catch (error) {
      // 恢复输入框内容（从最后一条用户消息中恢复）
      if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'user') {
        inputMessage.value = messages.value[messages.value.length - 1].content
        messages.value.pop() // 移除用户消息
      }
      errorMsg.value =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        '发送失败'
      console.error('[handleSendMessage] 错误详情:', error)
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
    chatConfig.sessionId = undefined
  }

  /**
   * 设置当前会话 ID（切换/恢复会话时调用）
   */
  function setSessionId(id: number) {
    chatConfig.sessionId = id
  }

  /**
   * 从后端加载历史消息到当前状态
   * 用于点击历史会话后回填消息列表
   */
  function loadMessages(historyMessages: Message[]) {
    messages.value = historyMessages
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
    clearMessages,
    setSessionId,
    loadMessages,
  }
}
