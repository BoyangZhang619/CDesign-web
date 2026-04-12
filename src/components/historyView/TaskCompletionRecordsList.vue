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

<style scoped>
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.record-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border: 1px solid #E8E1D6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-item:hover {
  border-color: #C8B4A0;
  background: linear-gradient(135deg, #FFFBF7 0%, #FEFCFA 100%);
  box-shadow: 0 4px 12px rgba(200, 180, 160, 0.15);
  transform: translateX(4px);
}

.priority-indicator {
  width: 3px;
  height: 100%;
  border-radius: 2px;
  flex-shrink: 0;
  min-height: 80px;
}

.priority-indicator.priority-high {
  background: linear-gradient(180deg, #FF6B6B 0%, #FF5252 100%);
}

.priority-indicator.priority-medium {
  background: linear-gradient(180deg, #FFA500 0%, #FF9500 100%);
}

.priority-indicator.priority-low {
  background: linear-gradient(180deg, #95DE64 0%, #85C347 100%);
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.record-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #4A4A4A;
  word-break: break-word;
  flex: 1;
}

.record-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.priority-badge-high {
  background: #FFE0E0;
  color: #C92A2A;
}

.priority-badge-medium {
  background: #FFE8BD;
  color: #E67700;
}

.priority-badge-low {
  background: #DFFCF0;
  color: #2F9E44;
}

.status-badge-on_time {
  background: #C3FAE8;
  color: #087F5B;
}

.status-badge-late {
  background: #FFE0E0;
  color: #C92A2A;
}

.status-badge-early {
  background: #D0EBFF;
  color: #1971C2;
}

.record-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #999;
  font-weight: 500;
}

.meta-value {
  color: #666;
  font-weight: 600;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
}

.time-icon {
  font-size: 12px;
}

.time-text {
  font-weight: 500;
}

.record-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C8B4A0;
  font-size: 18px;
  font-weight: 300;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.3s ease;
}

.record-item:hover .record-arrow {
  opacity: 1;
  transform: translateX(4px);
}
</style>
