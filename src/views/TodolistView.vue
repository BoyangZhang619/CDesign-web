<template>
  <div class="todolist-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'待办事项'" :subtitle="'管理您的任务清单'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="todolist-container">
          <!-- 左栏：任务管理面板 -->
          <div class="todolist-left-panel">
            <!-- 添加任务按钮 -->
            <button class="todolist-add-btn" @click="handleCreateTask" title="创建新任务">
              <span class="add-btn-icon">+</span>
              <span class="add-btn-text">新建任务</span>
            </button>

            <!-- 搜索和筛选 -->
            <div class="todolist-search-section">
              <TodolistToolbar :search-keyword="searchKeyword" :current-filter="currentFilter" @search="handleSearch"
                @filter="handleSetFilter" />
            </div>

            <!-- 数据统计展示 -->
            <div class="todolist-stats-section">
              <TodolistStats :stats="stats" :completion-rate="completionRate" />
            </div>
          </div>

          <!-- 右栏：任务列表 -->
          <div class="todolist-right-panel">
            <div class="todolist-choice">
              <div class="choice-toggle">
                <button :class="['choice-btn', { active: viewMode === 'pending' }]" @click="viewMode = 'pending'">
                  今日任务
                </button>
                <button :class="['choice-btn', { active: viewMode === 'all' }]" @click="viewMode = 'all'">
                  所有任务
                </button>
              </div>
            </div>
            <TodolistEmpty v-if="viewMode === 'pending' && filteredTasks.length === 0" />
            <TodolistGroups v-if="viewMode === 'pending' && filteredTasks.length > 0" :filtered-tasks="filteredTasks"
              :show-checkbox="true" @toggle="toggleTask" @delete="handleDeleteTask" @accept="handleAcceptTask"
              @reject="handleRejectTask" />

            <!-- 所有任务模式：不过滤，直接显示所有任务 -->
            <div v-if="viewMode === 'all'" class="all-tasks-view">
              <TodolistEmpty v-if="tasks.length === 0" />
              <TodolistGroups v-else :filtered-tasks="tasks" :show-checkbox="false" @toggle="toggleTask"
                @delete="handleDeleteTask" @accept="handleAcceptTask" @reject="handleRejectTask" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务浮窗 -->
    <TodolistCreateModal :isOpen="showCreateModal" @close="closeCreateModal" @create="handleCreateTaskSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import TodolistStats from '../components/todolistView/TodolistStats.vue'
import TodolistToolbar from '../components/todolistView/TodolistToolbar.vue'
import TodolistEmpty from '../components/todolistView/TodolistEmpty.vue'
import TodolistGroups from '../components/todolistView/TodolistGroups.vue'
import TodolistCreateModal from '../components/todolistView/TodolistCreateModal.vue'
import { useTodolist } from '../composables/useTodolist'

const sidebarRef = ref()
const showCreateModal = ref(false)
const searchKeyword = ref('')
const currentFilter = ref('all')
const viewMode = ref<'pending' | 'all'>('pending')

// 使用 useTodolist composable
const {
  tasks,
  stats,
  fetchTasks,
  fetchAllTasks,
  calculateStats,
  createTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  acceptAISuggestion,
  rejectAISuggestion,
  searchTasks
} = useTodolist()

// 完成率
const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round(((stats.value.completed / stats.value.total) * 100) || 0)
})

// 过滤后的任务
const filteredTasks = computed(() => {
  let result = Array.from(tasks.value)
  // console.log('🔍 原始任务列表:', result)

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    result = result.filter(t =>
      t.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // console.log('🔍 搜索过滤后任务列表:', result)

  // 根据视图模式过滤
  if (viewMode.value === 'pending') {
    result = result.filter(t => t.status === 'pending' || t.status === 'overdue' || t.status === 'completed')
  }
  // 所有模式：显示所有状态的任务

  // console.log('🔍 视图模式过滤后任务列表:', result)

  // 按当前筛选过滤（如果不是"全部"）
  if (currentFilter.value !== 'all') {
    result = result.filter(t => t.status === currentFilter.value)
  }

  // console.log('🔍 最终过滤后任务列表:', result)

  return result
})

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const handleSetFilter = (status: string) => {
  viewMode.value = 'pending' // 切换筛选时默认切换到待办模式
  fetchTasks().then(() => {
    currentFilter.value = status
  })
}

const handleSearch = (keyword: string) => {
  viewMode.value = 'pending' // 搜索时默认切换到待办模式
  searchKeyword.value = keyword
  searchTasks(keyword)
}

const handleCreateTask = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleCreateTaskSubmit = async (taskData: any) => {
  try {
    // createTask 已经直接调用 API 并更新本地状态
    await createTask(taskData)
  } catch (err) {
    console.error('创建任务失败:', err)
  } finally {
    // 无论成功与否都关闭模态框
    closeCreateModal()
    // 创建任务后，默认切换到待办模式并刷新
    viewMode.value = 'pending'
    await fetchTasks()
  }
}

const toggleTask = async (taskId: string | number) => {
  try {
    const id = typeof taskId === 'string' ? Number(taskId) : taskId
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    if (task.status === 'completed') {
      await uncompleteTask(id)
    } else {
      await completeTask(id)
    }
  } catch (err) {
    console.error('切换任务状态失败:', err)
  } finally {
    // 根据当前视图模式刷新不同的数据
    if (viewMode.value === 'all') {
      await fetchAllTasks()
    } else {
      await fetchTasks()
    }
  }
}


const handleDeleteTask = async (taskId: string | number) => {
  if (confirm('确定要删除这个任务吗？')) {
    try {
      const id = typeof taskId === 'string' ? Number(taskId) : taskId
      await deleteTask(id)
    } catch (err) {
      console.error('删除任务失败:', err)
    } finally {
      // 根据当前视图模式刷新不同的数据
      if (viewMode.value === 'all') {
        await fetchAllTasks()
      } else {
        await fetchTasks()
      }
    }
  }
}

const handleAcceptTask = async (taskId: string | number) => {
  try {
    const id = typeof taskId === 'string' ? Number(taskId) : taskId
    await acceptAISuggestion(id)
  } catch (err) {
    console.error('接受建议失败:', err)
  } finally {
    // 根据当前视图模式刷新不同的数据
    if (viewMode.value === 'all') {
      await fetchAllTasks()
    } else {
      await fetchTasks()
    }
  }
}

const handleRejectTask = async (taskId: string | number) => {
  try {
    const id = typeof taskId === 'string' ? Number(taskId) : taskId
    await rejectAISuggestion(id)
  } catch (err) {
    console.error('驳回建议失败:', err)
  } finally {
    // 根据当前视图模式刷新不同的数据
    if (viewMode.value === 'all') {
      await fetchAllTasks()
    } else {
      await fetchTasks()
    }
  }
}

// 监听 viewMode 变化
watch(viewMode, async (newMode) => {
  if (newMode === 'all') {
    // 切换到"所有任务"模式，获取所有任务
    await fetchAllTasks()
  } else {
    // 切换到"待办任务"模式，恢复待办任务
    await fetchTasks()
  }
  // 刷新统计数据
  await calculateStats()
})

onMounted(() => {
  // 页面加载时获取任务数据
  fetchTasks()
})
</script>

<style scoped>
@import '../css/TodolistView.css';
</style>
