/**
 * AI Chat API 模块
 * 根据 AI_CHAT_API_DOCUMENTATION.md 实现
 * 
 * 基础 URL: /api/ai-chat
 * 所有请求都需要 Bearer Token 认证
 */

import http from '../http'
import { getToken } from '../../utils/token'

/**
 * 会话管理接口
 */
export const sessionAPI = {
  /**
   * 创建新会话
   * POST /api/ai-chat/sessions
   */
  async createSession(data: {
    session_name: string
    system_prompt?: string
    ai_model: 'dashscope' | 'gpt-4' | 'gpt-3.5-turbo'
    ai_app_id?: string
    temperature?: number
    max_tokens?: number
    tags?: string
    description?: string
  }) {
    return http.post('/api/ai-chat/sessions', data)
  },

  /**
   * 获取用户的所有会话
   * GET /api/ai-chat/sessions
   */
  async getSessions(params?: {
    page?: number
    limit?: number
    search?: string
    ai_model?: string
    is_starred?: boolean
    start_date?: string
    end_date?: string
  }) {
    return http.get('/api/ai-chat/sessions', { params })
  },

  /**
   * 获取会话详情
   * GET /api/ai-chat/sessions/{id}
   */
  async getSessionDetail(id: number) {
    return http.get(`/api/ai-chat/sessions/${id}`)
  },

  /**
   * 更新会话
   * PUT /api/ai-chat/sessions/{id}
   */
  async updateSession(
    id: number,
    data: {
      session_name?: string
      system_prompt?: string
      temperature?: number
      max_tokens?: number
      tags?: string
    }
  ) {
    return http.put(`/api/ai-chat/sessions/${id}`, data)
  },

  /**
   * 删除会话
   * DELETE /api/ai-chat/sessions/{id}
   */
  async deleteSession(id: number) {
    return http.delete(`/api/ai-chat/sessions/${id}`)
  },

  /**
   * 标记会话为星标
   * POST /api/ai-chat/sessions/{id}/star
   */
  async toggleSessionStar(id: number) {
    return http.post(`/api/ai-chat/sessions/${id}/star`)
  },

  /**
   * 清空会话内的所有消息
   * DELETE /api/ai-chat/sessions/{id}/clear
   */
  async clearSession(id: number) {
    return http.delete(`/api/ai-chat/sessions/${id}/clear`)
  }
}

/**
 * 消息管理接口
 */
export const messageAPI = {
  /**
   * 发送消息
   * POST /api/ai-chat/sessions/{id}/messages
   */
  async sendMessage(sessionId: number, content: string) {
    return http.post(`/api/ai-chat/sessions/${sessionId}/messages`, {
      content
    })
  },

  /**
   * 发送流式消息
   * POST /api/ai-chat/sessions/{id}/messages/stream
   * 返回 ReadableStream
   */
  sendStreamMessage: async function (sessionId: number, content: string) {
    const token = getToken() || ''
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://cda.api.zbyblq.xin'}/api/ai-chat/sessions/${sessionId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',  // ✅ 带上cookie
        body: JSON.stringify({ content })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  },

  /**
   * 获取聊天历史
   * GET /api/ai-chat/sessions/{id}/messages
   */
  async getMessages(sessionId: number, params?: { limit?: number }) {
    return http.get(`/api/ai-chat/sessions/${sessionId}/messages`, { params })
  },

  /**
   * 编辑消息
   * PATCH /api/ai-chat/messages/{id}
   */
  async editMessage(messageId: number, content: string) {
    return http.patch(`/api/ai-chat/messages/${messageId}`, {
      content
    })
  },

  /**
   * 删除消息
   * DELETE /api/ai-chat/messages/{id}
   */
  async deleteMessage(messageId: number) {
    return http.delete(`/api/ai-chat/messages/${messageId}`)
  }
}

/**
 * 搜索和统计接口
 */
export const searchAPI = {
  /**
   * 搜索消息
   * GET /api/ai-chat/search
   */
  async searchMessages(params: {
    keyword: string
    session_id?: number
  }) {
    return http.get('/api/ai-chat/search', { params })
  },

  /**
   * 获取用户 Token 统计
   * GET /api/ai-chat/stats
   */
  async getStats() {
    return http.get('/api/ai-chat/stats')
  }
}

/**
 * 类型定义
 */
export interface SessionCreateRequest {
  session_name: string
  system_prompt?: string
  ai_model: 'dashscope' | 'gpt-4' | 'gpt-3.5-turbo'
  ai_app_id?: string
  temperature?: number
  max_tokens?: number
  tags?: string
  description?: string
}

export interface SessionResponse {
  id: number
  uuid: string
  user_id: number
  session_name: string
  ai_model: string
  ai_app_id?: string
  system_prompt: string
  temperature: number
  max_tokens: number
  message_count: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  is_active: boolean
  is_starred: boolean
  tags?: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

export interface MessageResponse {
  id: number
  session_id: number
  message_index: number
  role: 'user' | 'assistant'
  content: string
  content_type: string
  input_tokens?: number
  output_tokens?: number
  total_tokens: number
  model_name?: string
  finish_reason?: string
  response_time_ms?: number
  is_edited?: boolean
  edited_at?: string
  created_at: string
}

export interface APIResponse<T> {
  code: number
  msg: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StreamMessage {
  type: 'reasoning' | 'content' | 'done' | 'connected' | 'chunk'
  content?: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
  userMessageId?: number
  aiMessageId?: number
  totalTokens?: number
}

export interface StatsResponse {
  totalSessions: number
  totalMessages: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  averageTokensPerMessage: number
  averageTokensPerSession: number
  lastActivityTime: string
}
