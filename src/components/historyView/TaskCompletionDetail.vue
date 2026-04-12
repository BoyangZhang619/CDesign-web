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

        <!-- 备注部分（如果任务有描述） -->
        <div v-if="record.task_title" class="detail-notes">
          <h3 class="notes-title">任务标题</h3>
          <p class="notes-content">{{ record.task_title }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <button class="btn-primary" @click="$emit('close')">返回</button>
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

<style scoped>
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-modal {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: #FFF;
  color: #666;
  transform: scale(1.1);
}

.detail-content {
  padding: 32px;
  padding-top: 48px;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #4A4A4A;
  word-break: break-word;
}

.detail-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border: 1px solid #E1D9D0;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #4A4A4A;
  font-weight: 500;
  word-break: break-word;
}

.detail-notes {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #FFFBF7 0%, #FFF8F3 100%);
  border-left: 3px solid #C8B4A0;
  border-radius: 4px;
}

.notes-title {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.notes-content {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(135deg, #D4A574 0%, #C89860 100%);
  color: #FFF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #C89860 0%, #B88A50 100%);
  transform: translateY(-2px);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #D8CFC4;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #C8B4A0;
}
</style>
