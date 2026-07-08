<template>
  <div class="detail-overlay" @click.self="$emit('close')">
    <div class="detail-modal">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="$emit('close')">×</button>

      <!-- 详情内容 -->
      <div class="detail-content">
        <!-- 标题和优先级 -->
        <div class="detail-header">
          <h2 class="detail-title">{{ record.task_title }}</h2>
          <div class="detail-badges">
            <span :class="['badge', `priority-badge-${record.task_priority}`]">
              {{ getPriorityLabel(record.task_priority) }}
            </span>
            <span :class="['badge', `status-badge-${record.completion_status}`]">
              {{ getStatusLabel(record.completion_status) }}
            </span>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID</span>
            <span class="detail-value">{{ record.id }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">任务类型</span>
            <span class="detail-value">{{ getTaskTypeLabel(record.task_type) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">分类</span>
            <span class="detail-value">{{ getCategoryLabel(record.category) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">优先级</span>
            <span class="detail-value">{{ getPriorityLabel(record.task_priority) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">完成状态</span>
            <span class="detail-value">{{ getStatusLabel(record.completion_status) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">完成日期</span>
            <span class="detail-value">{{ formatDate(record.completion_date) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">完成时间</span>
            <span class="detail-value">{{ formatDateTime(record.completion_time) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ formatDateTime(record.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskCompletionHistory } from '../../composables/useTaskCompletionHistory'
import type { TaskCompletionRecord } from '../../composables/useTaskCompletionHistory'

defineProps({
  record: {
    type: Object as () => TaskCompletionRecord,
    required: true
  }
})

defineEmits(['close'])

const {
  getTaskTypeLabel,
  getCategoryLabel,
  getPriorityLabel,
  getStatusLabel
} = useTaskCompletionHistory()

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return dateStr
  }
}

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
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return dateTimeStr
  }
}
</script>

<style lang="scss" scoped src="@/scss/components/historyView/TaskCompletionDetail.scss"></style>
