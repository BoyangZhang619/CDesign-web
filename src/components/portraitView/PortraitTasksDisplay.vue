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

<style scoped>
.portrait-tasks-display {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.tasks-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.tasks-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-value.completed {
  color: #4caf50;
}

.stat-value.pending {
  color: #ff9800;
}

.tasks-loading,
.tasks-error,
.tasks-empty {
  text-align: center;
  padding: 30px 20px;
  color: #999;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tasks-error {
  color: #d32f2f;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #b71c1c;
}

.tasks-empty small {
  display: block;
  margin-top: 8px;
  color: #bbb;
  font-size: 12px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border-left: 4px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-item:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.task-item.priority-high {
  border-left-color: #d32f2f;
}

.task-item.priority-medium {
  border-left-color: #ff9800;
}

.task-item.priority-low {
  border-left-color: #4caf50;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.task-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
  word-break: break-word;
}

.task-description {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 11px;
  color: #999;
  background: white;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.meta-item.due-date {
  color: #ff9800;
}

.meta-item.task-type {
  color: #007bff;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.task-item.priority-high .priority-badge {
  background: #ffebee;
  color: #d32f2f;
}

.task-item.priority-medium .priority-badge {
  background: #fff3e0;
  color: #ff9800;
}

.task-item.priority-low .priority-badge {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge {
  font-size: 14px;
  font-weight: 700;
  color: #999;
  min-width: 20px;
  text-align: center;
}

.status-badge.completed {
  color: #4caf50;
}

.tasks-footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.view-all-link {
  font-size: 13px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portrait-tasks-display {
    padding: 15px;
  }

  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tasks-stats {
    width: 100%;
    justify-content: space-around;
  }

  .task-item {
    flex-direction: column;
    gap: 8px;
  }

  .task-right {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }
}
</style>
