<template>
  <div class="picker container-md">
    <!-- Category tabs (extensible) -->
    <div class="cat-tabs">
      <button v-for="c in categories" :key="c.id" class="cat-tab" :class="{ active: activeCat === c.id }"
        @click="activeCat = c.id">{{ c.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Grid -->
    <div v-else class="avatar-grid">
      <button v-for="(av, idx) in currentAvatars" :key="idx" class="av-item" :class="{ selected: selectedIdx === idx }"
        @click="select(idx)">
        <PixelAvatar :pixelData="av.pixelData" :level="av.level" :size="72" />
      </button>
    </div>

    <!-- Empty -->
    <div v-if="!loading && currentAvatars.length === 0" class="empty">
      <p>暂无头像</p>
    </div>

    <!-- Apply button -->
    <div class="actions">
      <button class="btn-apply" :disabled="selectedIdx === null" @click="applyAvatar">
        {{ saving ? '保存中...' : '使用此头像' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchWithRefresh } from '../api/http'
import PixelAvatar from '../components/PixelAvatar.vue'

const router = useRouter()
const loading = ref(true); const saving = ref(false)
const selectedIdx = ref<number | null>(null)
const defaultAvatars = ref<any[]>([])
const activeCat = ref('default')

// Extensible categories — add more entries later
const categories = [
  { id: 'default', label: '默认' },
  // { id: 'animals', label: '动物' },
  // { id: 'nature', label: '自然' },
  // { id: 'abstract', label: '抽象' },
]

const currentAvatars = computed(() => {
  // All categories return the same pool for now; extensible
  return defaultAvatars.value
})

function select(idx: number) { selectedIdx.value = idx }

async function applyAvatar() {
  if (selectedIdx.value === null) return
  saving.value = true
  const av = currentAvatars.value[selectedIdx.value]
  try {
    const res = await fetchWithRefresh('/avatars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelData: av.pixelData, level: av.level }),
    })
    const data = await res.json()
    if (data?.success) { router.push('/profile') }
    else { alert('保存失败: ' + (data.message || '未知错误')) }
  } catch (err: any) { alert('保存失败: ' + err.message) }
  finally { saving.value = false }
}

// Local fallback defaults (same hex data as useAvatar.ts)
// 16×16 pixel art — exactly 256 hex chars each (0=transparent, 1=black, 6=yellow, 4=red, 5=green, 3=blue, 8=orange, E=gray)
const AVA_16x16 = (rows: string[]) => rows.join('')

const LOCAL_DEFAULTS = [
  // 1. Smiley face (yellow circle, black eyes/mouth)
  AVA_16x16([
    '0000000000000000','0000001111110000','0000110000011000','0001000000000100',
    '0010000000000010','0010001001000010','0100000000000001','0100000110000001',
    '0100000000000001','0010001111000100','0001000000000100','0000110000011000',
    '0000001111110000','0000000000000000','0000000000000000','0000000000000000',
  ]),
  // 2. Star shape
  AVA_16x16([
    '0000000000000000','0000000110000000','0000000110000000','0000001111000000',
    '0000011111100000','0000111111110000','0011111111111100','0000011111100000',
    '0000011111100000','0000011111100000','0000011111100000','0000001111000000',
    '0000000110000000','0000000000000000','0000000000000000','0000000000000000',
  ]),
  // 3. Diamond
  AVA_16x16([
    '0000000000000000','0000000110000000','0000001111000000','0000011111100000',
    '0000111111110000','0001111111111000','0011111111111100','0111111111111110',
    '0011111111111100','0001111111111000','0000111111110000','0000011111100000',
    '0000001111000000','0000000110000000','0000000000000000','0000000000000000',
  ]),
  // 4. Heart
  AVA_16x16([
    '0000000000000000','0001100000110000','0011110001111000','0111111011111100',
    '0111111111111100','0111111111111100','0111111111111100','0011111111111000',
    '0001111111110000','0000111111100000','0000011111000000','0000001110000000',
    '0000000100000000','0000000000000000','0000000000000000','0000000000000000',
  ]),
  // 5. Cat face
  AVA_16x16([
    '0000000000000000','0001000000001000','0001100000011000','0011110000111100',
    '0011111111111100','0011111111111100','0011101111011100','0001101111011000',
    '0000111111110000','0000111111110000','0000011001100000','0000011111100000',
    '0000011111100000','0000001111000000','0000000000000000','0000000000000000',
  ]),
  // 6. Moon crescent
  AVA_16x16([
    '0000000000000000','0000011111000000','0000111111110000','0001111111110000',
    '0001111111100000','0001111111000000','0001111110000000','0001111100000000',
    '0001111100000000','0001111110000000','0001111111000000','0001111111100000',
    '0001111111110000','0000111111110000','0000011111000000','0000000000000000',
  ]),
  // 7. Lightning bolt
  AVA_16x16([
    '0000000000000000','0000000111000000','0000001111000000','0000011110000000',
    '0000111100000000','0001111000000000','0011111111100000','0111111111110000',
    '0000001111000000','0000011110000000','0000111100000000','0001111000000000',
    '0011110000000000','0111100000000000','0000000000000000','0000000000000000',
  ]),
  // 8. Flower
  AVA_16x16([
    '0000000000000000','0000000110000000','0000001111000000','0001101111011000',
    '0011111111111100','0111111111111110','0000111111110000','0000011111100000',
    '0000011111100000','0000111111110000','0111111111111110','0011111111111100',
    '0001101111011000','0000001111000000','0000000110000000','0000000000000000',
  ]),
].map(s => s.trim()).filter(s => s.length === 256)

onMounted(async () => {
  // Always show local fallbacks first
  defaultAvatars.value = LOCAL_DEFAULTS.map(d => ({ pixelData: d, level: 16 }))
  try {
    const res = await fetchWithRefresh('/avatars/defaults', { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      if (data?.success && data.data?.defaults?.length) {
        defaultAvatars.value = data.data.defaults.map((d: any) => ({
          pixelData: d.pixelData || d.pixel_data, level: d.level || 16,
        }))
      }
    }
  } catch { } finally { loading.value = false }
})
</script>

<style lang="scss" scoped>
.picker {
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

// Category tabs
.cat-tabs {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.cat-tab {
  padding: var(--space-2) var(--space-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  background: var(--bg-card-white);
  color: var(--text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--brand-blue);
  }

  &.active {
    background: var(--brand-blue);
    color: #fff;
    border-color: var(--brand-blue);
  }
}

// Grid
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--space-3);
  justify-items: center;
}

.av-item {
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-blue-light);
  }

  &.selected {
    border-color: var(--brand-blue);
    background: var(--bg-blue-light);
  }
}

// States
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12);
  gap: var(--space-3);

  p {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--brand-blue);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

// Actions
.actions {
  display: flex;
  justify-content: center;
}

.btn-apply {
  padding: var(--space-3) var(--space-10);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  background: var(--text-primary);
  color: var(--text-inverse);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    transform: scale(1.03);
  }

  &:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
}
</style>
