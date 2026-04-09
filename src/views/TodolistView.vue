<template>
  <div class="todolist-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="todolist-wrapper">
          <!-- 页面头部 -->
          <div class="todolist-header">
            <div class="header-info">
              <h1 class="todolist-title">任务清单</h1>
              <p class="todolist-subtitle">管理你的日常任务和健康目标</p>
            </div>
            <div class="header-actions">
              <button @click="handleCreateTask" class="btn-create-task" title="创建任务">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>新任务</span>
              </button>
            </div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-label">总任务</div>
                <div class="stat-value">{{ stats.total }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-label">已完成</div>
                <div class="stat-value">{{ stats.completed }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <div class="stat-label">待完成</div>
                <div class="stat-value">{{ stats.pending }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚠️</div>
              <div class="stat-info">
                <div class="stat-label">逾期</div>
                <div class="stat-value">{{ stats.overdue }}</div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">今日完成率</span>
              <span class="progress-percentage">{{ completionRate }}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: completionRate + '%' }"></div>
            </div>
          </div>

          <!-- 搜索和筛选 -->
          <div class="toolbar-section">
            <input 
              v-model="searchKeyword" 
              type="text" 
              class="search-input" 
              placeholder="🔍 搜索任务..."
              @input="handleSearch"
            />
            <div class="filter-buttons">
              <button 
                v-for="status in ['all', 'pending', 'completed', 'overdue']"
                :key="status"
                @click="setFilter(status)"
                :class="['filter-btn', { active: currentFilter === status }]"
              >
                {{ statusLabels[status as keyof typeof statusLabels] }}
              </button>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="tasks-container">
            <!-- 空状态 -->
            <div v-if="filteredTasks.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3 class="empty-title">暂无任务</h3>
              <p class="empty-text">创建你的第一个任务来开始吧</p>
            </div>

            <!-- 任务列表 -->
            <div v-else class="task-list">
              <!-- 打卡任务 -->
              <div v-if="checkinTasks.length > 0" class="task-group">
                <h3 class="group-title">🎯 打卡任务</h3>
                <div class="group-tasks">
                  <div 
                    v-for="task in checkinTasks" 
                    :key="task.id"
                    :class="['task-item', { 
                      completed: task.status === 'completed', 
                      overdue: task.status === 'overdue' 
                    }]"
                  >
                    <div class="task-checkbox">
                      <input 
                        type="checkbox" 
                        :checked="task.status === 'completed'"
                        @change="toggleTask(task.id)"
                      />
                    </div>
                    <div class="task-content">
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-meta">
                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                        <span :class="['task-priority', task.priority]">{{ task.priority }}</span>
                      </div>
                    </div>
                    <div class="task-actions">
                      <button @click="openTask(task.id)" class="btn-action" title="查看">
                        →
                      </button>
                      <button @click="deleteTask(task.id)" class="btn-delete" title="删除">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI 建议任务 -->
              <div v-if="aiTasks.length > 0" class="task-group">
                <h3 class="group-title">🤖 AI 建议</h3>
                <div class="group-tasks">
                  <div 
                    v-for="task in aiTasks" 
                    :key="task.id"
                    :class="['task-item', 'ai-task', { 
                      completed: task.status === 'completed', 
                      overdue: task.status === 'overdue' 
                    }]"
                  >
                    <div class="task-checkbox">
                      <input 
                        type="checkbox" 
                        :checked="task.status === 'completed'"
                        @change="toggleTask(task.id)"
                      />
                    </div>
                    <div class="task-content">
                      <div class="task-title">{{ task.title }}</div>
                      <div v-if="task.reason" class="task-reason">{{ task.reason }}</div>
                      <div class="task-meta">
                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                        <span :class="['task-priority', task.priority]">{{ task.priority }}</span>
                      </div>
                    </div>
                    <div class="task-actions">
                      <button @click="acceptTask(task.id)" class="btn-accept" title="接受">
                        ✅
                      </button>
                      <button @click="rejectTask(task.id)" class="btn-reject" title="驳回">
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 自定义任务 -->
              <div v-if="customTasks.length > 0" class="task-group">
                <h3 class="group-title">✏️ 自定义任务</h3>
                <div class="group-tasks">
                  <div 
                    v-for="task in customTasks" 
                    :key="task.id"
                    :class="['task-item', { 
                      completed: task.status === 'completed', 
                      overdue: task.status === 'overdue' 
                    }]"
                  >
                    <div class="task-checkbox">
                      <input 
                        type="checkbox" 
                        :checked="task.status === 'completed'"
                        @change="toggleTask(task.id)"
                      />
                    </div>
                    <div class="task-content">
                      <div class="task-title">{{ task.title }}</div>
                      <div v-if="task.description" class="task-description">{{ task.description }}</div>
                      <div class="task-meta">
                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                        <span :class="['task-priority', task.priority]">{{ task.priority }}</span>
                      </div>
                    </div>
                    <div class="task-actions">
                      <button @click="editTask(task.id)" class="btn-edit" title="编辑">
                        ✏️
                      </button>
                      <button @click="deleteTask(task.id)" class="btn-delete" title="删除">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'

interface Task {
  id: string
  title: string
  description?: string
  reason?: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  type: 'checkin' | 'ai' | 'custom'
  dueDate: string
}

const sidebarRef = ref<InstanceType<typeof Sidebar>>()

// 数据
const tasks = ref<Task[]>([])
const searchKeyword = ref('')
const currentFilter = ref('all')

// 统计数据
const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  pending: tasks.value.filter(t => t.status === 'pending').length,
  overdue: tasks.value.filter(t => t.status === 'overdue').length
}))

// 完成率
const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

// 状态标签
const statusLabels = {
  all: '全部',
  pending: '待完成',
  completed: '已完成',
  overdue: '逾期'
}

// 过滤后的任务
const filteredTasks = computed(() => {
  let result = tasks.value
  
  // 按搜索关键词过滤
  if (searchKeyword.value) {
    result = result.filter(t => 
      t.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  // 按状态过滤
  if (currentFilter.value !== 'all') {
    result = result.filter(t => t.status === currentFilter.value)
  }
  
  return result
})

// 按类型分类
const checkinTasks = computed(() => filteredTasks.value.filter(t => t.type === 'checkin'))
const aiTasks = computed(() => filteredTasks.value.filter(t => t.type === 'ai'))
const customTasks = computed(() => filteredTasks.value.filter(t => t.type === 'custom'))

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const handleSearch = () => {
  // 搜索逻辑由 computed 自动处理
}

const setFilter = (status: string) => {
  currentFilter.value = status
}

const handleCreateTask = () => {
  // TODO: 打开创建任务对话框
  console.log('创建任务')
}

const toggleTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = task.status === 'completed' ? 'pending' : 'completed'
  }
}

const openTask = (taskId: string) => {
  // TODO: 打开任务详情
  console.log('打开任务:', taskId)
}

const editTask = (taskId: string) => {
  // TODO: 打开编辑对话框
  console.log('编辑任务:', taskId)
}

const deleteTask = (taskId: string) => {
  if (confirm('确定要删除这个任务吗？')) {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  }
}

const acceptTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.type = 'custom'
    task.status = 'pending'
  }
}

const rejectTask = (taskId: string) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === tomorrow.toDateString()) return '明天'
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  // TODO: 加载任务列表数据
  // 示例数据
  tasks.value = [
    {
      id: '1',
      title: '运动打卡',
      status: 'pending',
      priority: 'high',
      type: 'checkin',
      dueDate: new Date().toISOString()
    },
    {
      id: '2',
      title: '增加每日步数到 8000',
      reason: '根据你的健康数据，增加运动量有助于改善睡眠质量',
      status: 'pending',
      priority: 'medium',
      type: 'ai',
      dueDate: new Date().toISOString()
    },
    {
      id: '3',
      title: '完成周报',
      description: '整理本周的工作进度和收获',
      status: 'pending',
      priority: 'medium',
      type: 'custom',
      dueDate: new Date().toISOString()
    }
  ]
})
</script>

<style scoped>
@import '../css/TodolistView.css';
</style>
