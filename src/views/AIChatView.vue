<template>
  <div class="chat container-md">
    <!-- Top bar -->
    <div class="chat-top">
      <button class="top-btn" @click="newChat">＋ 新对话</button>
      <button class="top-btn" @click="showHistory = !showHistory">
        {{ showHistory ? '✕ 关闭' : '☰ 历史' }}
      </button>
    </div>

    <!-- History 浮窗 -->
    <AIChatHistoryPanel
      :visible="showHistory"
      :sessions="sessions"
      :activeId="activeSessionId"
      @close="showHistory = false"
      @select="loadSession"
      @delete="deleteSession"
      @rename="renameSession"
    />

    <!-- Messages Area -->
    <div ref="msgContainer" class="chat-msgs">
      <div v-if="messages.length === 0" class="chat-empty">
        <!-- Morandi 治愈系插图：柔和十字 + 叶脉 -->
        <svg class="empty-illust" width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 外圈 -->
          <circle cx="48" cy="48" r="44" stroke="var(--brand-blue)" stroke-width="1.5" opacity=".25"/>
          <circle cx="48" cy="48" r="34" stroke="var(--brand-blue)" stroke-width="1" opacity=".15"/>
          <!-- 十字 -->
          <rect x="44" y="24" width="8" height="48" rx="4" fill="var(--brand-blue)" opacity=".6"/>
          <rect x="24" y="44" width="48" height="8" rx="4" fill="var(--brand-blue)" opacity=".6"/>
          <!-- 叶片 -->
          <ellipse cx="72" cy="26" rx="10" ry="6" fill="var(--bg-green-light)" stroke="var(--color-success)" stroke-width="1" opacity=".7" transform="rotate(-30 72 26)"/>
          <line x1="65" y1="32" x2="68" y2="36" stroke="var(--color-success)" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <!-- 小点 -->
          <circle cx="60" cy="42" r="2" fill="var(--brand-blue)" opacity=".3"/>
          <circle cx="38" cy="56" r="1.5" fill="var(--brand-blue)" opacity=".25"/>
          <circle cx="56" cy="62" r="2.5" fill="var(--bg-pink-light)" stroke="var(--color-danger)" stroke-width=".5" opacity=".4"/>
        </svg>

        <h2 class="empty-title">今天想聊点什么？</h2>
        <p class="empty-desc">我是你的专属健康伙伴，关于饮食、运动、睡眠、情绪 — 随时随地，问我任何问题</p>

        <div class="empty-pills">
          <button v-for="p in displayedPrompts" :key="p.text" class="empty-pill" @click="sendQuick(p.text)">
            <span class="pill-icon" v-html="p.icon"></span>
            <span class="pill-text">{{ p.text }}</span>
            <svg class="pill-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button class="empty-pill empty-pill--refresh" @click="shufflePrompts">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span class="pill-text">换一批</span>
          </button>
        </div>
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
            <div v-if="m.content" class="msg-text" v-html="renderMd(m.content)"></div>
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
        @keydown.enter.exact.prevent="send()"
        @input="autoGrow"
      ></textarea>
      <button class="chat-send" :disabled="loading || !inputMessage.trim()" @click="send()">
        <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        <span v-else class="spinner-small"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useAIChat } from '../composables/useAIChat'
import { useMarkdown } from '../composables/useMarkdown'
import { sessionAPI, messageAPI } from '../api/modules/aiChat'
import AIChatHistoryPanel from '../components/AIChatHistoryPanel.vue'

const {
  loading, errorMsg, inputMessage, messages,
  handleSendMessage, clearMessages,
  setSessionId, loadMessages,
} = useAIChat()

const { render: renderMd } = useMarkdown()

const allPrompts = [
  { text: '今天该吃什么？',           icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>' },
  { text: '帮我制定一个运动计划',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
  { text: '怎么改善睡眠质量？',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' },
  { text: '最近压力很大怎么办',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>' },
  { text: '推荐一周健康食谱',           icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  { text: '运动后肌肉酸痛怎么缓解',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
  { text: '每天喝多少水才够？',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
  { text: '什么是BMI？帮我算一下',      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>' },
  { text: '久坐族怎么保护颈椎腰椎',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { text: '睡前做什么有助于入睡？',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 15V9"/><path d="M17 3v2"/><path d="M7 15V9"/><path d="M7 3v2"/><path d="M2 9h20"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg>' },
  { text: '适合初学者的健身动作推荐',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>' },
  { text: '总想吃甜食怎么办？',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94"/><path d="M9.69 8h11.48"/><path d="M7.38 12l5.74-9.94"/></svg>' },
  { text: '跑步和游泳哪个更减脂？',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { text: '熬夜之后怎么补救？',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { text: '帮我分析一下最近的饮食',     icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' },
  { text: '维生素和补剂有必要吃吗？',   icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>' },
  { text: '饭后多久运动比较好？',       icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { text: '如何判断自己是否过度训练？',  icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  { text: '低碳饮食和低脂饮食哪个好？',  icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>' },
  { text: '给我讲个健康小知识',         icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' },
]

const displayedPrompts = ref<typeof allPrompts>([])

function shufflePrompts() {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5)
  displayedPrompts.value = shuffled.slice(0, 3)
}

shufflePrompts()

function send() {
  handleSendMessage(0)
}

function sendQuick(prompt: string) {
  inputMessage.value = prompt
  handleSendMessage(0)
}

const msgContainer = ref<HTMLElement>()
const inputEl = ref<HTMLTextAreaElement>()
const showHistory = ref(false)
const sessions = ref<any[]>([])
const activeSessionId = ref<string | null>(null)

function autoGrow() {
  const el = inputEl.value; if (!el) return
  el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// ── 智能滚动：流式输出时保持底部，用户上滑则暂停 ──
let userScrolledUp = false
let scrollTimer: ReturnType<typeof setTimeout> | null = null

function isNearBottom(el: HTMLElement): boolean {
  const threshold = 60 // px，距底部小于此值认为"在底部"
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function smartScrollToBottom(force = false) {
  const c = msgContainer.value; if (!c) return
  if (force || (!userScrolledUp && loading.value)) {
    c.scrollTop = c.scrollHeight
  }
}

function onMsgScroll() {
  const c = msgContainer.value; if (!c) return
  if (isNearBottom(c)) {
    userScrolledUp = false
  } else {
    // 用户自己往上滑了
    userScrolledUp = true
    // 3 秒后如果还在 loading（AI 还在输出），但用户没有继续滑动，不恢复
    if (scrollTimer) clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      if (isNearBottom(c)) userScrolledUp = false
    }, 1500)
  }
}

// 新消息到达时强制滚到底部
watch(() => messages.value.length, async () => {
  userScrolledUp = false
  await nextTick()
  smartScrollToBottom(true)
})

// loading 开始/结束时复位
watch(() => loading.value, (val) => {
  if (val) userScrolledUp = false
  if (!val) { userScrolledUp = false; smartScrollToBottom(true) }
})

// 流式内容更新时智能滚动
watch(
  () => {
    const last = messages.value[messages.value.length - 1]
    return last ? last.content : ''
  },
  () => {
    if (loading.value && !userScrolledUp) {
      nextTick(() => smartScrollToBottom())
    }
  }
)

onMounted(() => {
  msgContainer.value?.addEventListener('scroll', onMsgScroll, { passive: true })
})

onUnmounted(() => {
  msgContainer.value?.removeEventListener('scroll', onMsgScroll)
})

async function loadSessions() {
  try {
    const res = await sessionAPI.getSessions({ limit: 50 })
    if (res.data?.success) {
      // sendResult(res, { data: sessions }) → data.data.data
      const all = (res.data.data?.data || []) as any[]
      // 白名单：只显示标记为 'chat' 的会话（或无标签的旧会话）
      const chatSessions = all.filter((s: any) => !s.tags || s.tags?.includes('chat'))
      sessions.value = chatSessions.map((s: any) => ({
        id: s.id, title: s.session_name || '未命名', createdAt: s.created_at,
      }))
    }
  } catch { /* silent */ }
}

async function loadSession(s: any) {
  activeSessionId.value = s.id
  showHistory.value = false

  try {
    // 加载历史消息
    const res = await messageAPI.getMessages(s.id, { limit: 100 })
    // sendResult(res, { data: messages }) → { success, data: { data: [...] } }
    const rawMessages = res.data?.data?.data
    if (res.data?.success && Array.isArray(rawMessages)) {
      const historyMsgs = rawMessages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content || '',
        tokensUsed: m.total_tokens || 0,
        messageId: m.id,
      }))
      loadMessages(historyMsgs)
    } else {
      loadMessages([])
    }
    // 设置当前会话 ID，后续发送消息会归入此会话
    setSessionId(s.id)
  } catch {
    // 加载失败时静默处理，仍设置 sessionId
    loadMessages([])
    setSessionId(s.id)
  }
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

async function renameSession(s: any, newTitle: string) {
  try {
    await sessionAPI.updateSession(s.id, { session_name: newTitle })
    const target = sessions.value.find(x => x.id === s.id)
    if (target) target.title = newTitle
  } catch { /* silent */ }
}

onMounted(() => loadSessions())

// 每次打开历史面板时异步重新加载，保持数据新鲜
watch(showHistory, (val) => { if (val) loadSessions() })
</script>

<style lang="scss" scoped>
.chat { display: flex; flex-direction: column; height: calc(100dvh - var(--topbar-height) - 40px); }

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

// Messages
.chat-msgs { flex: 1; overflow-y: auto; padding: var(--space-4); }
.chat-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; text-align: center; padding: var(--space-8) var(--space-6);
}
.empty-illust {
  margin-bottom: var(--space-6);
  flex-shrink: 0;
}
.empty-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  max-width: 320px;
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-8);
}
.empty-pills {
  display: flex; flex-direction: column; gap: var(--space-2);
  width: 100%; max-width: 360px;
}
.empty-pill {
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%; padding: var(--space-4) var(--space-4);
  text-align: left; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  color: var(--text-primary); background: var(--bg-card-white);
  border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  &:hover {
    border-color: var(--brand-blue);
    background: var(--bg-blue-light);
    box-shadow: var(--shadow-card);
    .pill-arrow { opacity: 1; transform: translateX(2px); }
  }
  &:active { transform: scale(.985); }
}
.pill-icon {
  flex-shrink: 0; width: 32px; height: 32px; border-radius: var(--radius-md);
  background: var(--bg-blue-light); color: var(--brand-blue);
  display: flex; align-items: center; justify-content: center;
}
.pill-text { flex: 1; }
.pill-arrow {
  flex-shrink: 0; opacity: .3; color: var(--brand-blue);
  transition: all var(--transition-fast);
}
.empty-pill--refresh {
  justify-content: center; color: var(--text-tertiary);
  background: transparent; border-style: dashed;
  .pill-icon { background: transparent; color: var(--text-tertiary); }
  &:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: transparent; }
}

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
// ── Markdown 渲染样式 ──
.msg-text {
  line-height: var(--line-height-relaxed);
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: var(--space-3) 0 var(--space-2);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: var(--font-size-xl); }
  :deep(h2) { font-size: var(--font-size-lg); }
  :deep(h3) { font-size: var(--font-size-base); }
  :deep(p) { margin: var(--space-2) 0; &:first-child { margin-top: 0; } &:last-child { margin-bottom: 0; } }
  :deep(ul), :deep(ol) {
    padding-left: var(--space-5); margin: var(--space-2) 0;
    li { margin: var(--space-1) 0; }
  }
  :deep(a) { color: var(--brand-blue); text-decoration: underline; }
  :deep(blockquote) {
    margin: var(--space-2) 0; padding: var(--space-2) var(--space-4);
    border-left: 3px solid var(--brand-blue);
    background: var(--bg-blue-light); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    color: var(--text-secondary);
  }
  // 行内代码
  :deep(code) {
    padding: 1px 6px; font-size: .9em;
    background: var(--bg-main); color: var(--color-danger);
    border-radius: var(--radius-sm); font-family: 'SF Mono', 'Fira Code', monospace;
  }
  // 代码块
  :deep(pre) {
    margin: var(--space-3) 0; padding: var(--space-4);
    background: var(--bg-main); border-radius: var(--radius-lg);
    overflow-x: auto; font-size: var(--font-size-xs);
    code {
      padding: 0; background: none; color: var(--text-primary);
      font-size: inherit;
    }
  }
  // 表格
  :deep(table) {
    width: 100%; border-collapse: collapse; margin: var(--space-3) 0;
    font-size: var(--font-size-xs);
    th, td {
      padding: var(--space-2) var(--space-3); text-align: left;
      border-bottom: 1px solid var(--color-separator);
    }
    th { font-weight: var(--font-weight-semibold); color: var(--text-secondary); }
    td { color: var(--text-primary); }
  }
  :deep(hr) { border: none; border-top: 1px solid var(--color-separator); margin: var(--space-4) 0; }
  :deep(strong) { font-weight: var(--font-weight-semibold); }
  :deep(em) { font-style: italic; }
}
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
