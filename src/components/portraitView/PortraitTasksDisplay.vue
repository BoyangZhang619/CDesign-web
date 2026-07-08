<template>
  <div class="portrait-tasks-display">
    <!-- 头部 -->
    <div class="tasks-header">
      <h3 class="tasks-title">任务概览</h3>
      <div class="tasks-stats">
        <span class="stat-item">
          <span class="stat-label">总数</span>
          <span class="stat-value">{{ taskStats.total }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">完成</span>
          <span class="stat-value completed">{{ taskStats.completed }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">待办</span>
          <span class="stat-value pending">{{ taskStats.pending }}</span>
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="tasks-loading">
      <div class="loading-spinner"></div>
      <p>加载任务中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMessage" class="tasks-error">
      <p>{{ errorMessage }}</p>
      <button class="retry-btn" @click="retryFetch">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="displayTasks.length === 0" class="tasks-empty">
      <p>暂无任务</p>
      <small>开始创建你的第一个任务吧</small>
    </div>

    <!-- 任务列表 -->
    <div v-else class="tasks-list">
      <div 
        v-for="task in displayTasks" 
        :key="task.id"
        class="task-item"
        :class="[
          `priority-${task.priority}`,
          { completed: task.status === 'completed' }
        ]"
      >
        <!-- 左侧：图标和基本信息 -->
        <div class="task-left">
          <span class="task-icon">
            <img :src="iconSVGMap[(task.type as keyof typeof iconSVGMap)]" alt="" />
          </span>
          <div class="task-info">
            <h4 class="task-title">{{ task.title }}</h4>
            <p v-if="task.description" class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span v-if="task.due_date" class="meta-item due-date">
                📅 {{ formatDate(task.due_date) }}
              </span>
              <span class="meta-item task-type">
                {{ getTaskTypeLabel(task.type) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 右侧：优先级和状态 -->
        <div class="task-right">
          <span class="priority-badge">{{ getPriorityLabel(task.priority) }}</span>
          <span v-if="task.status === 'completed'" class="status-badge completed">✓</span>
          <span v-else class="status-badge pending">○</span>
        </div>
      </div>
    </div>

    <!-- 底部：查看全部链接 -->
    <div class="tasks-footer">
      <router-link to="/todolist" class="view-all-link">
        查看全部任务 →
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTodolist } from '../../composables/useTodolist'
const isLoading = ref(false)
const errorMessage = ref('')
const { fetchTasks: fetchTasksAPI, tasks: composableTasks } = useTodolist()

// 计算属性
const displayTasks = computed(() => {
  // 显示最新的5个任务
  return composableTasks.value.slice(0, 5)
})

const taskStats = computed(() => {
  return {
    total: composableTasks.value.length,
    completed: composableTasks.value.filter((t: any) => t.status === 'completed').length,
    pending: composableTasks.value.filter((t: any) => t.status === 'pending').length
  }
})

const iconSVGMap: object = {
  'checkin_meal': '/noun-portrait-food.svg',
  'checkin_sleep': '/noun-portrait-sleep.svg',
  'checkin_exercise': '/noun-portrait-sport.svg',
  'custom': '/noun-portrait-customization.svg',

}

// 方法
const getTaskTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'custom': '自定义',
    'ai_suggested': 'AI建议'
  }
  return labels[type] || type
}

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return labels[priority] || priority
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  } catch {
    return dateString
  }
}

const loadTasks = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 调用 useTodolist 的 fetchTasks 方法获取任务列表
    await fetchTasksAPI()
    // fetchTasks 会直接更新 composableTasks.value
  } catch (error) {
    console.error('获取任务失败:', error)
    errorMessage.value = '获取任务失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const retryFetch = async () => {
  await loadTasks()
}

// 组件挂载时加载任务
onMounted(() => {
  loadTasks()
})
</script>

<style lang="scss" scoped src="@/scss/components/portraitView/PortraitTasksDisplay.scss"></style>
