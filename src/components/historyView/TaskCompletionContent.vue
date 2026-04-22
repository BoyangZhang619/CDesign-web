<template>
  <div class="task-detail-content">
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

<style scoped>
.task-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.detail-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #E8E1D6;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
}

.detail-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.priority-badge-1 {
  background: #FFE8E8;
  color: #C9302C;
}

.priority-badge-2 {
  background: #FFF4E8;
  color: #FF9800;
}

.priority-badge-3 {
  background: #E8F5FF;
  color: #2196F3;
}

.priority-badge-4 {
  background: #E8F8E8;
  color: #4CAF50;
}

.status-badge-pending {
  background: #F0F0F0;
  color: #999;
}

.status-badge-completed {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-badge-overdue {
  background: #FFEBEE;
  color: #C62828;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #F8F6F3;
  padding: 12px;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  color: #8B9FA0;
  font-weight: 600;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #5A7A87;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
