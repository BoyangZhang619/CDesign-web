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
    try {
      result[metric.key] = {
        label: metric.label,
        value: metric.formatter ? metric.formatter(value) : value ?? '-',
        unit: metric.unit
      }
    } catch (error) {
      // 如果 formatter 失败，使用原始值
      result[metric.key] = {
        label: metric.label,
        value: String(value ?? '-'),
        unit: metric.unit
      }
      console.error(`Formatter error for ${metric.key}:`, error)
    }
  })
  return result
})
</script>

<style lang="scss" scoped src="@/scss/components/dailyCheckinView/CheckinTypeCard.scss"></style>
