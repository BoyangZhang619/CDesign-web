<template>
  <div class="records-list">
    <div v-for="record in records" :key="record.id" class="record-item" @click="$emit('select', record)">
      <!-- 优先级指示器 -->
      <div :class="['priority-indicator', `priority-${record.task_priority}`]"></div>

      <!-- 记录内容 -->
      <div class="record-content">
        <!-- 上行：标题 + 优先级标签 + 完成状态 -->
        <div class="record-header">
          <h4 class="record-title">{{ record.task_title }}</h4>
          <div class="record-badges">
            <span :class="['badge', `priority-badge-${record.task_priority}`]">
              {{ getPriorityLabel(record.task_priority) }}
            </span>
            <span :class="['badge', `status-badge-${record.completion_status}`]">
              {{ getStatusLabel(record.completion_status) }}
            </span>
          </div>
        </div>

        <!-- 中行：任务信息 -->
        <div class="record-meta">
          <span class="meta-item">
            <span class="meta-label">类型:</span>
            <span class="meta-value">{{ getTaskTypeLabel(record.task_type) }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">分类:</span>
            <span class="meta-value">{{ getCategoryLabel(record.category) }}</span>
          </span>
        </div>

        <!-- 下行：日期时间 -->
        <div class="record-time">
          <span class="time-icon">📅</span>
          <span class="time-text">{{ formatDateTime(record.completion_time) }}</span>
        </div>
      </div>

      <!-- 点击提示 -->
      <div class="record-arrow">
        <span>→</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskCompletionHistory } from '../../composables/useTaskCompletionHistory'
import type { TaskCompletionRecord } from '../../composables/useTaskCompletionHistory'

defineProps({
  records: {
    type: Array as () => TaskCompletionRecord[],
    required: true
  }
})

defineEmits(['select'])

const {
  getTaskTypeLabel,
  getCategoryLabel,
  getPriorityLabel,
  getStatusLabel
} = useTaskCompletionHistory()

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '—'
  try {
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return dateTimeStr
  }
}
</script>

<style lang="scss" scoped src="@/scss/components/historyView/TaskCompletionRecordsList.scss"></style>
