<template>
  <div class="daily-left-panel">

    <!-- 今日总结卡片 -->
    <div class="summary-card">
      <div class="summary-header">
        <h3 class="summary-title">📊 今日概览</h3>
      </div>
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-label">已完成</div>
            <div class="stat-value">{{ completedCount }}/{{ totalCount }}</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-label">完成率</div>
            <div class="stat-value">{{ completionRate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速导航按钮 -->
    <div class="quick-nav-section">
      <button class="nav-btn" @click="emit('refresh')" title="刷新所有数据">
        <span class="nav-icon">🔄</span>
        <span class="nav-text">刷新数据</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedDate: string
  completedCount: number
  totalCount: number
}

const props = withDefaults(defineProps<Props>(), {
  totalCount: 3
})

const emit = defineEmits<{
  'date-change': [date: string]
  'today': []
  'refresh': []
}>()

const completionRate = computed(() => {
  return Math.round((props.completedCount / props.totalCount) * 100)
})
</script>

<style scoped>
.daily-left-panel {
  flex: 5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

.date-selector-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.date-label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.date-input {
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #5A7A87;
  box-shadow: 0 0 0 3px rgba(90, 122, 135, 0.1);
}

.today-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.today-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(90, 122, 135, 0.3);
}

.today-btn:active {
  transform: translateY(0);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff8;
  border: 1px solid rgba(90, 122, 135, 0.15);
  border-radius: 12px;
}

.summary-header {
  margin: 0;
}

.summary-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.quick-nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #5A7A87;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  border-color: #5A7A87;
  background: linear-gradient(135deg, rgba(90, 122, 135, 0.05) 0%, rgba(90, 122, 135, 0.02) 100%);
  transform: translateY(-2px);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-weight: 600;
}

@media (max-width: 768px) {
  .daily-left-panel {
    padding-bottom: 15px;
  }
  
}
</style>
