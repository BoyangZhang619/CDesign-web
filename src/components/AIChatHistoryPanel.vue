<template>
  <Teleport to="body">
    <Transition name="panel-slide">
      <div v-if="visible" class="history-overlay" @click.self="$emit('close')">
        <div class="history-panel">
          <!-- Header -->
          <div class="panel-head">
            <h3 class="panel-title">历史对话</h3>
            <button class="panel-close" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Empty -->
          <div v-if="sessions.length === 0" class="panel-empty">暂无历史对话</div>

          <!-- List -->
          <div v-else class="panel-list">
            <div
              v-for="s in sessions"
              :key="s.id"
              :class="['panel-item', { active: activeId === s.id }]"
            >
              <!-- 主体点击加载 -->
              <div class="item-main" @click="$emit('select', s)">
                <div class="item-info">
                  <!-- 内联重命名 -->
                  <input
                    v-if="renamingId === s.id"
                    ref="renameInput"
                    v-model="renameText"
                    class="item-input"
                    @keydown.enter="finishRename(s)"
                    @keydown.escape="cancelRename"
                    @blur="finishRename(s)"
                    @click.stop
                  />
                  <span v-else class="item-title">{{ s.title }}</span>
                  <span class="item-time">{{ fmtTime(s.createdAt) }}</span>
                </div>
              </div>

              <!-- 操作图标 -->
              <div class="item-actions">
                <!-- 重命名 -->
                <button class="act-btn" title="重命名" @click.stop="startRename(s)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="M15 5l4 4"/>
                  </svg>
                </button>
                <!-- 删除 -->
                <button class="act-btn act-btn--danger" title="删除" @click.stop="$emit('delete', s)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  visible: boolean
  sessions: Array<{ id: number | string; title: string; createdAt: string }>
  activeId: number | string | null
}>()

const emit = defineEmits<{
  close: []
  select: [session: any]
  delete: [session: any]
  rename: [session: any, newTitle: string]
}>()

const renamingId = ref<number | string | null>(null)
const renameText = ref('')
const renameInput = ref<HTMLInputElement[]>()

async function startRename(s: any) {
  renamingId.value = s.id
  renameText.value = s.title
  await nextTick()
  renameInput.value?.[0]?.focus()
  renameInput.value?.[0]?.select()
}

function cancelRename() {
  renamingId.value = null
  renameText.value = ''
}

function finishRename(s: any) {
  if (!renamingId.value) return
  const newTitle = renameText.value.trim()
  renamingId.value = null
  renameText.value = ''
  if (newTitle && newTitle !== s.title) {
    emit('rename', s, newTitle)
  }
}

function fmtTime(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  const now = new Date()
  const diff = now.getTime() - dt.getTime()
  if (diff < 86400000) return dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return dt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style lang="scss" scoped>
// ── 遮罩 + 面板容器 ──
.history-overlay {
  position: fixed; inset: 0; z-index: 2500;
  background: rgba(0, 0, 0, .25);
  display: flex; justify-content: flex-end;
}

.history-panel {
  width: 340px; max-width: 85vw; height: 100dvh;
  background: var(--bg-card-white);
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-modal);
}

// ── 头部 ──
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-5) var(--space-5);
  border-bottom: 1px solid var(--color-separator);
  flex-shrink: 0;
}
.panel-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}
.panel-close {
  width: 36px; height: 36px; border-radius: var(--radius-full);
  border: none; background: var(--bg-main); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background var(--transition-fast);
  &:hover { background: var(--color-bg-tertiary); }
}

// ── 空状态 ──
.panel-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-sm); color: var(--text-tertiary);
}

// ── 列表 ──
.panel-list {
  flex: 1; overflow-y: auto; padding: var(--space-3);
  display: flex; flex-direction: column; gap: var(--space-1);
}

// ── 列表项 ──
.panel-item {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  cursor: pointer;

  &:hover { background: var(--bg-blue-light); }
  &.active { background: var(--bg-blue-light); }
}

.item-main {
  flex: 1; min-width: 0;
}
.item-info {
  display: flex; flex-direction: column; gap: 2px;
}
.item-title {
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  display: block;
}
.item-time {
  font-size: var(--font-size-xs); color: var(--text-tertiary);
}
.item-input {
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  color: var(--text-primary); background: var(--bg-card-white);
  border: 1px solid var(--brand-blue); border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2); width: 100%; outline: none;
}

// ── 操作按钮 ──
.item-actions {
  display: flex; gap: var(--space-1); flex-shrink: 0;
}
.act-btn {
  width: 30px; height: 30px; border-radius: var(--radius-full);
  border: none; background: transparent; color: var(--text-tertiary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition-fast);
  &:hover { background: var(--bg-main); color: var(--text-primary); }
  &--danger:hover { background: var(--color-danger-light); color: var(--color-danger); }
}

// ── 滑入过渡 ──
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity .25s var(--ease-out-expo);
  .history-panel { transition: transform .25s var(--ease-out-expo); }
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  .history-panel { transform: translateX(100%); }
}
</style>
