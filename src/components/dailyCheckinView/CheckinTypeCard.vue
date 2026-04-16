<template>
  <div class="checkin-card" :class="{ 'completed': status === 'completed', 'pending': status === 'pending' }">
    <div class="card-header">
      <span class="card-icon">{{ icon }}</span>
      <h2 class="card-title">{{ title }}</h2>
      <span class="card-status" :class="status">
        {{ getStatusText(status) }}
      </span>
    </div>
    <div class="card-content">
      <div class="content-main">
        <div v-if="data && Object.keys(data).length > 0" class="metric-display">
          <div v-for="(value, key) in displayMetrics" :key="key" class="metric-item">
            <span class="metric-label">{{ value.label }}</span>
            <span class="metric-value">{{ value.value }}</span>
            <span class="metric-unit">{{ value.unit }}</span>
          </div>
        </div>
        <div v-else class="empty-message">
          暂无数据，点击下方查看详情
        </div>
      </div>
    </div>
    <div class="card-footer">
      <router-link :to="detailLink" class="card-link">
        <span>查看详情</span>
        <span class="arrow">→</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  title: string
  status?: 'completed' | 'pending' | 'none'
  data?: Record<string, any>
  detailLink: string
  metrics?: Array<{
    key: string
    label: string
    unit: string
    formatter?: (value: any) => string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  status: 'none'
})

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return '✓ 已打卡'
    case 'pending':
      return '⏳ 进行中'
    default:
      return '○ 未打卡'
  }
}

const displayMetrics = computed(() => {
  if (!props.data || !props.metrics) return {}

  const result: Record<string, any> = {}
  props.metrics.forEach((metric) => {
    const value = props.data?.[metric.key]
    result[metric.key] = {
      label: metric.label,
      value: metric.formatter ? metric.formatter(value) : value ?? '-',
      unit: metric.unit
    }
  })
  return result
})
</script>

<style scoped>
.checkin-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 250px;
}

.checkin-card:hover {
  border-color: #5A7A87;
  box-shadow: 0 4px 12px rgba(90, 122, 135, 0.2);
  transform: translateY(-2px);
}

.checkin-card.completed {
  border-color: #66bb6a;
  background: linear-gradient(135deg, rgba(102, 187, 106, 0.05) 0%, rgba(102, 187, 106, 0.02) 100%);
}

.checkin-card.pending {
  border-color: #ffa726;
  background: linear-gradient(135deg, rgba(255, 167, 38, 0.05) 0%, rgba(255, 167, 38, 0.02) 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.card-status {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-status.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.card-status.pending {
  background: #fff3e0;
  color: #e65100;
}

.card-status.none {
  background: #f5f5f5;
  color: #999;
}

.card-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.content-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.metric-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #7a8f95;
  margin-bottom: 4px;
  font-weight: 500;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #5A7A87;
}

.metric-unit {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

.empty-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.card-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5A7A87;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.card-link:hover {
  color: #2c3e50;
  gap: 12px;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.card-link:hover .arrow {
  transform: translateX(4px);
}
</style>
