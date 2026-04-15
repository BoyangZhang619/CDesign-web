<template>
  <div class="task-group-wrapper" :class="`layout-${position}`">
    <!-- 待完成任务组 (左栏) 或整体 -->
    <div v-if="position === 'left' || position === 'full'" class="task-group pending-group">
      <h3 class="group-title">
        <span class="group-icon">📌</span>
        <span class="group-label">待完成</span>
        <span class="group-count">({{ pendingTasks.length }})</span>
      </h3>
      <div v-if="pendingTasks.length > 0" class="group-tasks">
        <div v-for="task in pendingTasks" :key="task.id" class="task-item pending">
          <div class="task-checkbox">
            <input type="checkbox" :checked="false" @change="onToggleTask(Number(task.id))" />
          </div>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div v-if="task.description" class="task-description">{{ task.description }}</div>
            <div class="task-meta">
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span class="task-type">{{ getDateType(task.date_type) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button @click="onDeleteTask(Number(task.id))" class="btn-delete" title="删除">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="empty-text">暂无待完成任务</p>
      </div>
    </div>

    <!-- 已完成任务组 (右栏) -->
    <div v-if="position === 'right' || position === 'full'" class="task-group completed-group">
      <h3 class="group-title">
        <span class="group-icon">✅</span>
        <span class="group-label">已完成</span>
        <span class="group-count">({{ completedTasks.length }})</span>
      </h3>
      <div v-if="completedTasks.length > 0" class="group-tasks">
        <div v-for="task in completedTasks" :key="task.id" class="task-item completed">
          <div class="task-checkbox">
            <input type="checkbox" :checked="true" @change="onToggleTask(Number(task.id))" />
          </div>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div v-if="task.description" class="task-description">{{ task.description }}</div>
            <div class="task-meta">
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span class="task-type">{{ getDateType(task.date_type) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button @click="onDeleteTask(Number(task.id))" class="btn-delete" title="删除">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="empty-text">暂无已完成任务</p>
      </div>
    </div>

    <!-- 全空状态 -->
    <div v-if="position === 'full' && pendingTasks.length === 0 && completedTasks.length === 0" class="empty-state">
      <p class="empty-text">暂无任务</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/todolist'

interface Props {
  tasks: Task[]
  category: string
  position?: 'left' | 'right' | 'full'  // left: 仅显示待完成, right: 仅显示已完成, full: 显示全部
}

const props = withDefaults(defineProps<Props>(), {
  position: 'full'
})

const emit = defineEmits<{
  toggle: [taskId: number]
  delete: [taskId: number]
}>()

// 按状态过滤任务
const pendingTasks = computed(() => {
  return props.tasks.filter((t: any) => t.status !== 'completed')
})

const completedTasks = computed(() => {
  return props.tasks.filter((t: any) => t.status === 'completed')
})

// 格式化日期
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

// 获取日期类型标签
const getDateType = (dateStr: string | undefined): string => {
  if (!dateStr) return '无信息'
  if (dateStr === 'everyday') return '每天'
  if (dateStr === 'workday') return '工作日'
  if (dateStr === 'weekend') return '周末'
  if (dateStr === 'tomorrow') return '次日'
  return '无信息'
}

// 获取优先级标签
const getPriorityLabel = (priority: 'low' | 'medium' | 'high'): string => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority] || priority
}

// 事件处理
const onToggleTask = (taskId: number) => {
  emit('toggle', taskId)
}

const onDeleteTask = (taskId: number) => {
  emit('delete', taskId)
}
</script>

<style scoped>
@import '@/css/CheckinTaskGroup.css';
</style>
