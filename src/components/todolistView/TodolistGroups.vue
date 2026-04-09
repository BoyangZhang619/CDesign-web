<template>
  <div class="tasks-container">
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
              @change="$emit('toggle', task.id)"
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
            <button @click="$emit('open', task.id)" class="btn-action" title="查看">
              →
            </button>
            <button @click="$emit('delete', task.id)" class="btn-delete" title="删除">
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
              @change="$emit('toggle', task.id)"
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
            <button @click="$emit('accept', task.id)" class="btn-accept" title="接受">
              ✅
            </button>
            <button @click="$emit('reject', task.id)" class="btn-reject" title="驳回">
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
              @change="$emit('toggle', task.id)"
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
            <button @click="$emit('edit', task.id)" class="btn-edit" title="编辑">
              ✏️
            </button>
            <button @click="$emit('delete', task.id)" class="btn-delete" title="删除">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  filteredTasks: Task[]
}>()

// 按类型分类
const checkinTasks = computed(() => props.filteredTasks.filter(t => t.type === 'checkin'))
const aiTasks = computed(() => props.filteredTasks.filter(t => t.type === 'ai'))
const customTasks = computed(() => props.filteredTasks.filter(t => t.type === 'custom'))

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

defineEmits<{
  toggle: [taskId: string]
  open: [taskId: string]
  edit: [taskId: string]
  delete: [taskId: string]
  accept: [taskId: string]
  reject: [taskId: string]
}>()
</script>

<style scoped>
@import '../../css/components/TodolistGroups.css';
</style>
