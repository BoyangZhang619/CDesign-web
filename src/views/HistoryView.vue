<template>
  <div class="history container-md">
    <!-- Tab switch -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'checkin' }]" @click="activeTab = 'checkin'">打卡记录</button>
      <button :class="['tab', { active: activeTab === 'tasks' }]" @click="activeTab = 'tasks'">任务完成</button>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <select v-model="filters.type" @change="applyFilters()" class="filter-select">
          <option value="">全部类型</option>
          <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <select v-model="currentSort" @change="changeSort(currentSort)" class="filter-select">
          <option v-for="s in sortOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box"><div class="spinner"></div><p>加载中...</p></div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="state-box state-error">
      <p>{{ errorMsg }}</p>
      <button @click="loadRecords()">重试</button>
    </div>

    <!-- Checkin Records -->
    <template v-else-if="activeTab === 'checkin'">
      <div v-if="records.length === 0" class="state-box">
        <p>暂无记录</p>
        <span class="state-hint">去打卡页面记录你的健康数据吧</span>
      </div>
      <div v-else class="list">
        <div v-for="r in records" :key="r.id" class="record-card" @click="selectedRecord = r">
          <div class="rec-top">
            <span class="rec-type" :style="{ color: typeColor(r.type) }">{{ typeLabel(r.type) }}</span>
            <span class="rec-date">{{ formatDate(r.created_at) }}</span>
          </div>
          <div class="rec-body">
            <slot name="meal" v-if="r.type === 'meal'">
              <span>{{ r.food_name || '-' }}</span>
              <span class="rec-sub">{{ r.calories }} kcal</span>
            </slot>
            <slot name="exercise" v-else-if="r.type === 'exercise'">
              <span>{{ r.activity_type || '-' }}</span>
              <span class="rec-sub">{{ r.duration_min }}分钟</span>
            </slot>
            <slot name="sleep" v-else-if="r.type === 'sleep'">
              <span>睡眠 {{ r.sleep_duration_hours }}h</span>
              <span class="rec-sub">质量 {{ r.sleep_quality_score }}/10</span>
            </slot>
          </div>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pager">
        <button :disabled="currentPage <= 1" @click="currentPage--; loadRecords()">‹</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="currentPage++; loadRecords()">›</button>
      </div>
    </template>

    <!-- Task records placeholder -->
    <div v-else class="state-box">
      <p>任务完成记录</p>
      <span class="state-hint">功能开发中</span>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div v-if="selectedRecord" class="modal-overlay" @click.self="selectedRecord = null">
        <div class="modal-sheet">
          <button class="modal-close" @click="selectedRecord = null">✕</button>
          <h3>{{ typeLabel(selectedRecord.type) }} 详情</h3>
          <div class="detail-grid">
            <div v-for="(v,k) in selectedRecord" :key="k" class="detail-row">
              <span class="detail-key">{{ k }}</span>
              <span class="detail-val">{{ v }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHistory } from '../composables/useHistory'

const {
  records, loading, errorMsg, currentPage, totalPages,
  filters, sortOptions, currentSort, typeOptions,
  loadRecords, applyFilters, changeSort,
} = useHistory()

const activeTab = ref<'checkin' | 'tasks'>('checkin')
const selectedRecord = ref<any>(null)

function typeLabel(t: string) { return { meal: '饮食', exercise: '运动', sleep: '睡眠' }[t] || t }
function typeColor(t: string) { return { meal: '#78C850', exercise: '#F58529', sleep: '#833AB4' }[t] || 'var(--color-text)' }

function formatDate(d: string) {
  if (!d) return '-'
  const dt = new Date(d)
  return `${dt.getMonth()+1}/${dt.getDate()} ${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`
}

onMounted(() => loadRecords())
</script>

<style lang="scss" scoped>
.history { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

// Tabs
.tabs { display: flex; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.tab { flex: 1; padding: var(--space-2) var(--space-4); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); border: none; background: transparent; color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast);
  &.active { background: var(--color-accent-light); color: var(--color-accent); font-weight: var(--font-weight-semibold); }
}

// Filters
.filter-bar { display: flex; gap: var(--space-2); }
.filter-row { display: flex; gap: var(--space-2); width: 100%; }
.filter-select {
  flex: 1; padding: var(--space-2) var(--space-3); font-size: var(--font-size-sm);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: var(--color-bg); color: var(--color-text);
  &:focus { border-color: var(--color-accent); outline: none; }
}

// States
.state-box { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
  button { padding: var(--space-2) var(--space-4); background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; }
}
.state-hint { font-size: var(--font-size-xs); color: var(--color-text-tertiary); }
.state-error p { color: var(--color-danger); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// List
.list { display: flex; flex-direction: column; gap: var(--space-2); }
.record-card {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-4); cursor: pointer;
  transition: background var(--transition-fast);
  &:hover { background: var(--color-bg-secondary); }
  &:active { transform: scale(.99); }
}
.rec-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
.rec-type { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: .5px; }
.rec-date { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.rec-body { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-base); color: var(--color-text); }
.rec-sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); }

// Pagination
.pager { display: flex; justify-content: center; align-items: center; gap: var(--space-4);
  button { width: 36px; height: 36px; border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-bg); color: var(--color-text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    &:hover:not(:disabled) { border-color: var(--color-accent); }
    &:disabled { opacity: .3; cursor: default; }
  }
  span { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
}

// Modal
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 2000; display: flex; align-items: flex-end; justify-content: center;
  @media (min-width: 768px) { align-items: center; }
}
.modal-sheet {
  background: var(--color-bg); border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--space-5); width: 100%; max-width: 480px; max-height: 70dvh; overflow-y: auto;
  position: relative;
  @media (min-width: 768px) { border-radius: var(--radius-xl); }
  h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-4); color: var(--color-text); }
}
.modal-close { position: absolute; top: var(--space-4); right: var(--space-4); width: 32px; height: 32px; border: none; background: var(--color-bg-tertiary); border-radius: var(--radius-full); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-text); }
.detail-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-separator); font-size: var(--font-size-sm);
  &:last-child { border-bottom: none; }
}
.detail-key { color: var(--color-text-secondary); }
.detail-val { color: var(--color-text); max-width: 60%; text-align: right; word-break: break-all; }
</style>
