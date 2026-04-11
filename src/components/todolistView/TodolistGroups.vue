<template>
  <div class="tasks-container">
    <!-- 饮食任务 -->
    <div v-if="dietTasks.length > 0" class="task-group">
      <h3 class="group-title">🍽️ 饮食</h3>
      <div class="group-tasks">
        <div 
          v-for="task in dietTasks" 
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
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
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

    <!-- 运动任务 -->
    <div v-if="exerciseTasks.length > 0" class="task-group">
      <h3 class="group-title">🏃 运动</h3>
      <div class="group-tasks">
        <div 
          v-for="task in exerciseTasks" 
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
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
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

    <!-- 睡眠任务 -->
    <div v-if="sleepTasks.length > 0" class="task-group">
      <h3 class="group-title">😴 睡眠</h3>
      <div class="group-tasks">
        <div 
          v-for="task in sleepTasks" 
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
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
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

    <!-- 自定义任务 -->
    <div v-if="customTasks.length > 0" class="task-group">
      <h3 class="group-title">✏️ 自定义</h3>
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
              <span class="task-date">{{ formatDate(task.due_date) }}</span>
              <span :class="['task-priority', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
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

    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <p>📋 还没有任务，去创建一个新的吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../../types/todolist'

interface Props {
  filteredTasks: Task[]
}

const props = defineProps<Props>()

// 按新的四个类别分组
const dietTasks = computed(() => props.filteredTasks.filter(t => t.category === 'diet'))
const exerciseTasks = computed(() => props.filteredTasks.filter(t => t.category === 'exercise'))
const sleepTasks = computed(() => props.filteredTasks.filter(t => t.category === 'sleep'))
const customTasks = computed(() => props.filteredTasks.filter(t => t.category === 'custom'))

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

const getPriorityLabel = (priority: 'low' | 'medium' | 'high'): string => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority] || priority
}

defineEmits<{
  toggle: [taskId: string | number]
  edit: [taskId: string | number]
  delete: [taskId: string | number]
}>()
</script>

<style scoped>
@import '../../css/components/TodolistGroups.css';

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}
</style>