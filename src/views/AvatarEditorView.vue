<template>
  <div class="editor container-md">
    <h2 class="editor-title">像素头像编辑器</h2>

    <!-- Level Selector -->
    <div class="level-bar">
      <button v-for="lvl in availableLevels" :key="lvl"
        class="level-btn" :class="{ active: level === lvl }"
        @click="changeLevel(lvl)">
        {{ lvl }}×{{ lvl }}
      </button>
    </div>

    <!-- Canvas Grid -->
    <div class="canvas-wrap">
      <div
        class="canvas-grid"
        ref="gridRef"
        :style="{
          gridTemplateColumns: `repeat(${level}, 1fr)`,
          gridTemplateRows: `repeat(${level}, 1fr)`,
          width: gridSize + 'px',
          height: gridSize + 'px',
        }"
        @mousedown="startDraw" @mousemove="continueDraw" @mouseup="stopDraw"
        @mouseleave="stopDraw"
        @touchstart.prevent="startDrawTouch"
        @touchmove.prevent="continueDrawTouch"
        @touchend="stopDraw"
      >
        <span
          v-for="(cell, i) in cells"
          :key="i"
          class="cell"
          :class="{ 'cell--grid': level <= 32 }"
          :style="{ background: palette[cell] || 'transparent' }"
          :data-index="i"
        />
      </div>
    </div>

    <!-- Actions Row -->
    <div class="actions-row">
      <button class="act-btn" @click="undo">↩ 撤销</button>
      <button class="act-btn" @click="clearAll">🗑 清空</button>
      <button class="act-btn" @click="fillAll(currentColor)">🪣 填充</button>
      <button class="act-btn act-save" @click="saveAvatar" :disabled="saving">
        {{ saving ? '保存中...' : '💾 保存' }}
      </button>
    </div>

    <!-- Color Palette -->
    <div class="palette-bar">
      <button
        v-for="(hex, key) in palette"
        :key="key"
        class="palette-swatch"
        :class="{ active: currentColor === key }"
        :style="{
          background: hex === 'transparent'
            ? 'repeating-linear-gradient(45deg, #ccc 0px, #ccc 2px, #fff 2px, #fff 4px)'
            : hex
        }"
        @click="currentColor = key"
      />
    </div>

    <!-- Save Confirmation -->
    <p v-if="saveMsg" class="save-msg" :class="{ 'save-msg--ok': saveOk }">{{ saveMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchWithRefresh } from '@/api/http'

const router = useRouter()
const gridRef = ref<HTMLElement>()

// ── Palette ──────────────────────────────────────────────────
const palette: Record<string, string> = {
  '0': 'transparent', '1': '#262626', '2': '#FFFFFF', '3': '#0095F6',
  '4': '#ED4956', '5': '#78C850', '6': '#F7B955', '7': '#833AB4',
  '8': '#F58529', '9': '#DD2A7B', 'A': '#405DE6', 'B': '#5851DB',
  'C': '#FD1D1D', 'D': '#F77737', 'E': '#F5F5F5', 'F': '#8E8E8E',
}
const paletteKeys = Object.keys(palette)

// ── State ────────────────────────────────────────────────────
const level = ref(16)
const currentColor = ref('1')
const cells = reactive<string[]>([])
const undoStack = ref<string[][]>([])
const drawing = ref(false)
const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(false)

const availableLevels = [16, 32]
const maxGridPx = computed(() =>
  Math.min(window.innerWidth - 32, 480)
)
const gridSize = computed(() =>
  Math.floor(maxGridPx.value / level.value) * level.value
)

// ── Init ─────────────────────────────────────────────────────
function initCells(seed?: string) {
  cells.length = 0
  const total = level.value * level.value
  if (seed && seed.length === total) {
    cells.push(...seed.split(''))
  } else {
    for (let i = 0; i < total; i++) cells.push('0')
  }
  undoStack.value = []
}

function changeLevel(lvl: number) {
  level.value = lvl
  initCells()
}

// ── Drawing ──────────────────────────────────────────────────
function getIndex(e: MouseEvent | Touch): number {
  const el = gridRef.value
  if (!el) return -1
  const rect = el.getBoundingClientRect()
  const cellW = rect.width / level.value
  const cellH = rect.height / level.value
  const clientX = 'clientX' in e ? e.clientX : (e as Touch).clientX
  const clientY = 'clientY' in e ? e.clientY : (e as Touch).clientY
  const col = Math.floor((clientX - rect.left) / cellW)
  const row = Math.floor((clientY - rect.top) / cellH)
  if (col < 0 || col >= level.value || row < 0 || row >= level.value) return -1
  return row * level.value + col
}

function paint(index: number) {
  if (index < 0 || index >= cells.length) return
  if (cells[index] === currentColor.value) return
  undoStack.value.push([...cells])
  if (undoStack.value.length > 50) undoStack.value.shift()
  cells[index] = currentColor.value
}

function startDraw(e: MouseEvent) { drawing.value = true; paint(getIndex(e)); }
function continueDraw(e: MouseEvent) { if (drawing.value) paint(getIndex(e)); }
function stopDraw() { drawing.value = false; }

function startDrawTouch(e: TouchEvent) {
  drawing.value = true
  const t = e.touches[0]
  if (t) paint(getIndex(t))
}
function continueDrawTouch(e: TouchEvent) {
  if (drawing.value) {
    const t = e.touches[0]
    if (t) paint(getIndex(t))
  }
}

function undo() {
  const prev = undoStack.value.pop()
  if (prev) {
    cells.length = 0
    cells.push(...prev)
  }
}

function clearAll() {
  undoStack.value.push([...cells])
  for (let i = 0; i < cells.length; i++) cells[i] = '0'
}

function fillAll(color: string) {
  undoStack.value.push([...cells])
  for (let i = 0; i < cells.length; i++) cells[i] = color
}

// ── Save ─────────────────────────────────────────────────────
async function saveAvatar() {
  saving.value = true
  saveMsg.value = ''
  const pixelData = cells.join('')
  try {
    const res = await fetchWithRefresh('/avatars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelData, level: level.value }),
    })
    if (res.ok) {
      saveOk.value = true
      saveMsg.value = '头像保存成功！'
      setTimeout(() => router.push('/profile'), 1000)
    } else {
      const data = await res.json()
      throw new Error(data.message || '失败')
    }
  } catch (err: any) {
    saveOk.value = false
    saveMsg.value = '保存失败: ' + (err.message || '未知错误')
  } finally {
    saving.value = false
  }
}

// ── Load existing ────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetchWithRefresh('/avatars', { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      if (data?.success && data.data?.avatar?.pixelData) {
        const av = data.data.avatar
        level.value = av.level || 16
        initCells(av.pixelData)
        return
      }
    }
  } catch { /* use empty grid */ }
  initCells()
})
</script>

<style lang="scss" scoped>
.editor {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.editor-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

// ── Level bar ────────────────────────────────────────────────
.level-bar {
  display: flex; gap: var(--space-2);
}
.level-btn {
  padding: var(--space-1) var(--space-4);
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-border); border-radius: var(--radius-full);
  background: var(--color-bg); color: var(--color-text-secondary);
  cursor: pointer; transition: all var(--transition-fast);
  &.active {
    background: var(--color-accent); color: #fff; border-color: var(--color-accent);
  }
}

// ── Canvas ───────────────────────────────────────────────────
.canvas-wrap {
  max-width: 100%; overflow: hidden;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
}
.canvas-grid {
  display: grid; gap: 0;
  cursor: crosshair; touch-action: none;
  user-select: none; -webkit-user-select: none;
  background: var(--color-bg);
}

.cell {
  transition: background var(--transition-fast);
  &--grid {
    border-right: 1px solid rgba(0,0,0,0.05);
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
}

// ── Actions ──────────────────────────────────────────────────
.actions-row { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }
.act-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: var(--color-bg); color: var(--color-text);
  cursor: pointer; transition: all var(--transition-fast);
  &:hover { background: var(--color-bg-secondary); }
}
.act-save {
  background: var(--color-accent); color: #fff; border-color: var(--color-accent);
  &:hover { background: var(--color-accent-hover); }
  &:disabled { opacity: 0.5; }
}

// ── Palette ──────────────────────────────────────────────────
.palette-bar {
  display: flex; gap: var(--space-1);
  padding: var(--space-2); background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  flex-wrap: wrap; justify-content: center;
  max-width: 100%;
}
.palette-swatch {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm); border: 2px solid transparent;
  cursor: pointer; transition: transform var(--transition-fast);
  flex-shrink: 0;
  &:hover { transform: scale(1.15); }
  &.active { border-color: var(--color-text); transform: scale(1.15); }
}
@media (max-width: 480px) {
  .palette-swatch { width: 28px; height: 28px; }
}

// ── Save msg ─────────────────────────────────────────────────
.save-msg { font-size: var(--font-size-sm); color: var(--color-danger); }
.save-msg--ok { color: var(--color-success); }
</style>
