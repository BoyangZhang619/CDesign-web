<template>
  <div class="chat container-md">
    <!-- Top bar -->
    <div class="chat-top">
      <button class="top-btn" @click="newChat">＋ 新对话</button>
      <button class="top-btn" @click="showHistory = !showHistory">
        {{ showHistory ? '✕ 关闭' : '☰ 历史' }}
      </button>
    </div>

    <!-- History Drawer -->
    <div v-if="showHistory" class="history-drawer">
      <div v-if="sessions.length === 0" class="history-empty">暂无历史对话</div>
      <div v-else class="history-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          :class="['history-item', { active: activeSessionId === s.id }]"
          @click="loadSession(s)"
        >
          <div class="hi-info">
            <span class="hi-title">{{ s.title }}</span>
            <span class="hi-time">{{ fmtTime(s.createdAt) }}</span>
          </div>
          <button class="hi-del" @click.stop="deleteSession(s)">🗑</button>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="msgContainer" class="chat-msgs">
      <div v-if="messages.length === 0" class="chat-empty">
        <span class="chat-empty-icon">✨</span>
        <h3>AI 健康助手</h3>
        <p>向我提问关于健康、饮食、运动或睡眠的任何问题</p>
      </div>

      <div v-else class="msg-list">
        <div v-for="(m, i) in messages" :key="i" :class="['msg', 'msg--' + m.role]">
          <div class="msg-bubble">
            <div v-if="m.reasoning" class="msg-think">
              <details>
                <summary>思考过程</summary>
                <p>{{ m.reasoning }}</p>
              </details>
            </div>
            <div v-if="m.content" class="msg-text">{{ m.content }}</div>
            <div v-else-if="m.role === 'assistant'" class="msg-dots"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
      <div v-if="errorMsg" class="chat-error">{{ errorMsg }}</div>
    </div>

    <!-- Input -->
    <div class="chat-input-bar">
      <textarea
        v-model="inputMessage" ref="inputEl"
        class="chat-input" placeholder="输入消息... (Enter 发送)" rows="1"
        :disabled="loading"
        @keydown.enter.exact.prevent="handleSendMessage()"
        @input="autoGrow"
      ></textarea>
      <button class="chat-send" :disabled="loading || !inputMessage.trim()" @click="handleSendMessage()">
        <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        <span v-else class="spinner-small"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useAIChat } from '../composables/useAIChat'
import { sessionAPI } from '../api/modules/aiChat'

const {
  loading, errorMsg, inputMessage, messages,
  handleSendMessage, clearMessages,
} = useAIChat()

const msgContainer = ref<HTMLElement>()
const inputEl = ref<HTMLTextAreaElement>()
const showHistory = ref(false)
const sessions = ref<any[]>([])
const activeSessionId = ref<string | null>(null)

function autoGrow() {
  const el = inputEl.value; if (!el) return
  el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

watch(() => messages.value.length, async () => {
  await nextTick()
  const c = msgContainer.value; if (c) c.scrollTop = c.scrollHeight
})

async function loadSessions() {
  try {
    const res = await sessionAPI.getSessions({ limit: 50 })
    if (res.data?.success) {
      sessions.value = (res.data.data?.sessions || []).map((s: any) => ({
        id: s.id, title: s.session_name || '未命名', createdAt: s.created_at,
      }))
    }
  } catch { /* silent */ }
}

async function loadSession(s: any) {
  activeSessionId.value = s.id
  showHistory.value = false
  // The session loading logic is handled by the composable - this would need backend support
  // For now, we record the active session ID for future implementation
}

async function newChat() {
  clearMessages()
  activeSessionId.value = null
  showHistory.value = false
}

async function deleteSession(s: any) {
  try {
    await sessionAPI.deleteSession(s.id)
    sessions.value = sessions.value.filter(x => x.id !== s.id)
    if (activeSessionId.value === s.id) { newChat() }
  } catch { /* silent */ }
}

function fmtTime(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  const now = new Date()
  const diff = now.getTime() - dt.getTime()
  if (diff < 86400000) return dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return `${Math.floor(diff/86400000)}天前`
  return dt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => loadSessions())
</script>

<style lang="scss" scoped>
.chat { display: flex; flex-direction: column; height: calc(100dvh - var(--topbar-height) - var(--bottombar-height)); }

// Top bar
.chat-top {
  display: flex; gap: var(--space-2); padding: var(--space-2) var(--space-4);
}
.top-btn {
  font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
  padding: var(--space-1) var(--space-3); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); background: var(--color-bg);
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition-fast);
  &:hover { border-color: var(--color-accent); color: var(--color-accent); }
}

// History drawer
.history-drawer {
  max-height: 200px; overflow-y: auto; border-bottom: 1px solid var(--color-separator);
  background: var(--color-bg-secondary); padding: var(--space-2) var(--space-4);
}
.history-empty {
  text-align: center; padding: var(--space-6); color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
.history-item {
  display: flex; align-items: center; padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md); cursor: pointer; gap: var(--space-3);
  transition: background var(--transition-fast);
  &:hover, &.active { background: var(--color-bg); }
}
.hi-info { flex: 1; min-width: 0; }
.hi-title { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hi-time { font-size: var(--font-size-xs); color: var(--color-text-tertiary); }
.hi-del {
  font-size: 14px; background: none; border: none; cursor: pointer; opacity: .5;
  &:hover { opacity: 1; }
}

// Messages
.chat-msgs { flex: 1; overflow-y: auto; padding: var(--space-4); }
.chat-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; text-align: center; gap: var(--space-3);
  h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text); }
  p { font-size: var(--font-size-sm); color: var(--color-text-secondary); max-width: 280px; }
}
.chat-empty-icon { font-size: 48px; }

.msg-list { display: flex; flex-direction: column; gap: var(--space-3); }
.msg { display: flex; }
.msg--user { justify-content: flex-end; }
.msg--assistant { justify-content: flex-start; }
.msg-bubble {
  max-width: 80%; padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg); font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed); word-break: break-word;
}
.msg--user .msg-bubble { background: var(--color-accent); color: #fff; border-bottom-right-radius: var(--radius-sm); }
.msg--assistant .msg-bubble { background: var(--color-bg); border: 1px solid var(--color-border); border-bottom-left-radius: var(--radius-sm); }
.msg-think {
  margin-bottom: var(--space-2); font-size: var(--font-size-xs);
  details { opacity: .7; } summary { cursor: pointer; color: var(--color-text-secondary); }
  p { margin-top: var(--space-1); color: var(--color-text-secondary); white-space: pre-wrap; }
}
.msg-text { white-space: pre-wrap; }
.msg-dots {
  display: flex; gap: 4px; padding: var(--space-1) 0;
  span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-tertiary); animation: bounce 1.4s infinite ease-in-out both;
    &:nth-child(1) { animation-delay: -.32s; } &:nth-child(2) { animation-delay: -.16s; } }
}
@keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
.chat-error {
  padding: var(--space-3); margin-top: var(--space-3);
  background: var(--color-danger-light); color: var(--color-danger);
  border-radius: var(--radius-md); font-size: var(--font-size-sm);
}

// Input
.chat-input-bar {
  display: flex; align-items: flex-end; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}
.chat-input {
  flex: 1; resize: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-base); background: var(--color-bg-secondary);
  color: var(--color-text); max-height: 120px; line-height: 1.5;
  &:focus { border-color: var(--color-accent); outline: none; }
  &::placeholder { color: var(--color-text-tertiary); }
}
.chat-send {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--color-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background var(--transition-fast);
  &:hover:not(:disabled) { background: var(--color-accent-hover); }
  &:disabled { opacity: .4; cursor: not-allowed; }
}
.spinner-small {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
