<template>
  <div class="todo container-md">
    <!-- Stats summary -->
    <div class="stats-row">
      <div class="stat-badge"><span class="stat-n">{{ stats.total }}</span><span class="stat-l">全部</span></div>
      <div class="stat-badge stat-pending"><span class="stat-n">{{ stats.pending }}</span><span class="stat-l">待完成</span></div>
      <div class="stat-badge stat-done"><span class="stat-n">{{ stats.completed }}</span><span class="stat-l">已完成</span></div>
      <div class="stat-badge stat-overdue"><span class="stat-n">{{ stats.overdue }}</span><span class="stat-l">已逾期</span></div>
    </div>

    <!-- Create + Filter row -->
    <div class="toolbar">
      <button class="btn-create" @click="openCreate">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>新建</span>
      </button>
      <div class="filter-pills">
        <button v-for="f in filters" :key="f.v" class="fpill" :class="{ active: currentFilter === f.v }" @click="applyFilter(f.v)">{{ f.l }}</button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="state-box"><div class="spinner"></div><p>加载中...</p></div>
    <div v-else-if="error" class="state-box state-err"><p>{{ error }}</p><button @click="refetch">重试</button></div>

    <!-- Task list -->
    <template v-else>
      <div v-if="displayTasks.length === 0" class="empty">
        <span class="empty-icon">📝</span>
        <p>还没有任务</p>
        <span class="empty-hint">点击"新建"创建第一个任务</span>
      </div>
      <div v-else class="task-list">
        <TransitionGroup name="task">
          <div v-for="t in displayTasks" :key="t.id" class="task-card" :class="'pri-' + t.priority">
            <!-- Left: checkbox -->
            <button class="task-check" :class="{ done: t.status === 'completed' }" @click="toggleTask(t)">
              <svg v-if="t.status === 'completed'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <!-- Content -->
            <div class="task-body" @click="openDetail(t)">
              <div class="task-top">
                <span class="task-title" :class="{ done: t.status === 'completed' }">{{ t.title }}</span>
                <span class="task-pill" :class="'tp-' + t.priority">{{ priorityLabel(t.priority) }}</span>
              </div>
              <p v-if="t.description" class="task-desc">{{ t.description }}</p>
              <div class="task-meta">
                <span>{{ formatDate(t.due_date) }}</span>
                <span v-if="t.category" class="task-cat">{{ t.category }}</span>
              </div>
            </div>
            <!-- Delete -->
            <button class="task-del" @click.stop="handleDelete(t)">🗑</button>
          </div>
        </TransitionGroup>
      </div>
    </template>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
          <div class="modal-sheet">
            <button class="modal-close" @click="showCreate = false">✕</button>
            <h3>新建任务</h3>
            <div class="q-card"><h4 class="q-title">任务标题</h4><input v-model="createForm.title" class="input" placeholder="要做什么..." /></div>
            <div class="q-card"><h4 class="q-title">描述（可选）</h4><textarea v-model="createForm.description" class="input" rows="2" placeholder="补充说明..." /></div>
            <div class="q-card"><h4 class="q-title">优先级</h4>
              <div class="q-options">
                <button v-for="p in priorities" :key="p.v" class="q-opt" :class="{ picked: createForm.priority === p.v }" @click="createForm.priority = p.v">{{ p.l }}</button>
              </div>
            </div>
            <div class="q-card"><h4 class="q-title">截止日期（可选）</h4><input v-model="createForm.due_date" type="date" class="input" /></div>
            <button class="btn-save" :disabled="!createForm.title.trim() || saving" @click="submitCreate">{{ saving ? '创建中...' : '创建任务' }}</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTodolist } from '../composables/useTodolist'

const {
  tasks, stats, loading, error,
  fetchTasks, createTask, deleteTask, completeTask, uncompleteTask,
} = useTodolist()

const showCreate = ref(false); const saving = ref(false)
const currentFilter = ref('all')
const filters = [{l:'全部',v:'all'},{l:'待完成',v:'pending'},{l:'已完成',v:'completed'},{l:'已逾期',v:'overdue'}]
const createForm = reactive({ title: '', description: '', priority: 'medium', due_date: '' })
const priorities = [{l:'🔴 高',v:'high'},{l:'🟡 中',v:'medium'},{l:'🟢 低',v:'low'}]

const displayTasks = computed(() => {
  if (currentFilter.value === 'all') return tasks.value
  return tasks.value.filter(t => t.status === currentFilter.value)
})

function applyFilter(v: string) { currentFilter.value = v }
function priorityLabel(p: string) { return ({high:'高',medium:'中',low:'低'} as any)[p] || p }
function formatDate(d: string) { if (!d) return '无截止'; const dt = new Date(d); const now = new Date(); const diff = Math.floor((dt.getTime()-now.getTime())/86400000); if (diff<0) return '已逾期'; if (diff===0) return '今天'; if (diff===1) return '明天'; return dt.toLocaleDateString('zh-CN',{month:'short',day:'numeric'}) }

function openCreate() { showCreate.value = true; createForm.title = ''; createForm.description = ''; createForm.priority = 'medium'; createForm.due_date = '' }

async function submitCreate() {
  saving.value = true
  try {
    await createTask({ ...createForm, type: 'custom', category: 'custom', status: 'pending' } as any)
    showCreate.value = false
  } catch {} finally { saving.value = false }
}

async function toggleTask(t: any) {
  try { t.status === 'completed' ? await uncompleteTask(t.id) : await completeTask(t.id) } catch {}
}

async function handleDelete(t: any) { if (confirm('删除这个任务？')) { try { await deleteTask(t.id) } catch {} } }

function openDetail(_t: any) { /* future detail view */ }

function refetch() { fetchTasks() }

onMounted(() => fetchTasks())
</script>

<style lang="scss" scoped>
.todo { padding: var(--space-5) var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

// Stats
.stats-row { display: flex; gap: var(--space-2); }
.stat-badge { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--space-3); border-radius: var(--radius-lg); background: var(--bg-card-white); }
.stat-n { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary); }
.stat-l { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
.stat-pending { background: var(--bg-yellow-light); .stat-n { color: #D4A87A; } }
.stat-done { background: var(--bg-green-light); .stat-n { color: #7AAB9E; } }
.stat-overdue { background: var(--bg-pink-light); .stat-n { color: #D4887A; } }

// Toolbar
.toolbar { display: flex; align-items: center; gap: var(--space-3); }
.btn-create { display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-4); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); border-radius: var(--radius-full); background: var(--text-primary); color: var(--text-inverse); border: none; cursor: pointer; transition: all var(--transition-fast);
  &:hover { transform: scale(1.03); }
  &:active { transform: scale(.98); }
}
.filter-pills { display: flex; gap: var(--space-1); }
.fpill { padding: var(--space-1) var(--space-3); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); border-radius: var(--radius-full); background: var(--bg-card-white); color: var(--text-secondary); border: 1px solid var(--color-border); cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); }
  &.active { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }
}

// States
.state-box { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--text-secondary); font-size: var(--font-size-sm); }
  button { padding: var(--space-2) var(--space-4); background: var(--brand-blue); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; }
}
.state-err p { color: var(--color-danger); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--brand-blue); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-2);
  p { font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: var(--font-weight-medium); }
}
.empty-icon { font-size: 40px; }
.empty-hint { font-size: var(--font-size-xs); color: var(--text-tertiary); }

// Task cards
.task-list { display: flex; flex-direction: column; gap: var(--space-2); }
.task-card { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: var(--bg-card-white); border-radius: var(--radius-lg); transition: all var(--transition-fast);
  &:hover { background: var(--bg-blue-light); }
}
// .pri-high { border-left: 3px solid var(--color-danger); }
// .pri-medium { border-left: 3px solid var(--color-warning); }
// .pri-low { border-left: 3px solid var(--color-accent); }
.task-check { width: 24px; height: 24px; border-radius: var(--radius-full); border: 2px solid var(--color-border); background: transparent; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-top: 2px; transition: all var(--transition-fast);
  &.done { background: var(--brand-blue); border-color: var(--brand-blue); color: #fff; }
}
.task-body { flex: 1; min-width: 0; cursor: pointer; }
.task-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-1); }
.task-title { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); color: var(--text-primary);
  &.done { text-decoration: line-through; opacity: .5; }
}
.task-pill { padding: 1px 8px; font-size: 10px; font-weight: var(--font-weight-semibold); border-radius: var(--radius-full); text-transform: uppercase; }
.tp-high { background: var(--bg-pink-light); color: #D4887A; }
.tp-medium { background: var(--bg-yellow-light); color: #D4A87A; }
.tp-low { background: var(--bg-green-light); color: #7AAB9E; }
.task-desc { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-meta { display: flex; gap: var(--space-3); font-size: var(--font-size-xs); color: var(--text-tertiary); }
.task-del { font-size: 14px; background: none; border: none; cursor: pointer; opacity: .3; flex-shrink: 0; margin-top: 2px; transition: opacity var(--transition-fast);
  &:hover { opacity: 1; }
}

// Task transition
.task-enter-active { transition: all .3s var(--ease-out-expo); }
.task-leave-active { transition: all .2s ease; }
.task-enter-from { opacity: 0; transform: translateY(-8px); }
.task-leave-to { opacity: 0; transform: translateX(20px); }

// Modal (same as CheckinView)
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 2000; display: flex; align-items: flex-end; justify-content: center;
  @media(min-width:768px) { align-items: center; }
}
.modal-sheet { background: var(--bg-card-white); border-radius: var(--radius-2xl) var(--radius-2xl) 0 0; padding: var(--space-6); width: 100%; max-width: 480px; max-height: 80dvh; overflow-y: auto; position: relative;
  @media(min-width:768px) { border-radius: var(--radius-xl); }
  h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-4); }
}
.modal-close { position: absolute; top: var(--space-4); right: var(--space-4); width: 32px; height: 32px; border-radius: var(--radius-full); border: none; background: var(--bg-main); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text-primary); }
.modal-fade-enter-active { transition: all .25s var(--ease-out-expo); .modal-sheet { transition: transform .25s var(--ease-out-expo); } }
.modal-fade-leave-active { transition: all .2s ease; .modal-sheet { transition: transform .2s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-sheet { transform: translateY(100%); } }
.modal-fade-leave-to { opacity: 0; .modal-sheet { transform: translateY(100%); } }
@media(min-width:768px) { .modal-fade-enter-from .modal-sheet, .modal-fade-leave-to .modal-sheet { transform: translateY(20px) scale(.96); } }

// Question card (form)
.q-card { background: var(--bg-main); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3); }
.q-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-3); }
.q-options { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.q-opt { padding: var(--space-2) var(--space-4); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); border-radius: var(--radius-lg); background: var(--bg-card-white); color: var(--text-primary); border: 1px solid var(--color-border); cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); }
  &.picked { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }
}
.input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--bg-card-white); color: var(--text-primary); font-size: var(--font-size-base);
  &:focus { border-color: var(--brand-blue); outline: none; }
}
.btn-save { width: 100%; padding: var(--space-3); background: var(--text-primary); color: var(--text-inverse); font-weight: var(--font-weight-semibold); border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--font-size-base); margin-top: var(--space-4);
  &:hover:not(:disabled) { opacity: .9; }
  &:disabled { opacity: .4; cursor: not-allowed; }
}
</style>
