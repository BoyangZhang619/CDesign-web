<template>
  <div class="todolist-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'待办事项'" :subtitle="'管理您的任务清单'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="todolist-wrapper">
          <!-- <TodolistHeader @create="handleCreateTask" /> -->
          <TodolistStats :stats="stats" :completion-rate="completionRate" />
          <TodolistToolbar 
            :search-keyword="searchKeyword"
            :current-filter="currentFilter"
            @search="searchKeyword = $event"
            @filter="setFilter"
          />
          <TodolistEmpty v-if="filteredTasks.length === 0" />
          <TodolistGroups 
            v-else
            :filtered-tasks="filteredTasks"
            @toggle="toggleTask"
            @open="openTask"
            @edit="editTask"
            @delete="deleteTask"
            @accept="acceptTask"
            @reject="rejectTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
// import TodolistHeader from '../components/todolistView/TodolistHeader.vue'
import TodolistStats from '../components/todolistView/TodolistStats.vue'
import TodolistToolbar from '../components/todolistView/TodolistToolbar.vue'
import TodolistEmpty from '../components/todolistView/TodolistEmpty.vue'
import TodolistGroups from '../components/todolistView/TodolistGroups.vue'

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

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const setFilter = (status: string) => {
  currentFilter.value = status
}

// const handleCreateTask = () => {
//   // TODO: 打开创建任务对话框
//   console.log('创建任务')
// }

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
