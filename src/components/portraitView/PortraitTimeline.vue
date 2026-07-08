<template>
  <div class="portrait-timeline">
    <div class="timeline-header">
      <div class="timeline-title">健康历程</div>
    </div>

    <div v-if="timelineEvents.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <div class="empty-text">暂无健康记录</div>
    </div>

    <div v-else class="timeline-container">
      <div
        v-for="(event, index) in timelineEvents"
        :key="event.id"
        class="timeline-item"
        :class="event.status"
      >
        <!-- 左侧时间线 -->
        <div class="timeline-track">
          <div class="timeline-dot" :class="event.status"></div>
          <div v-if="index < timelineEvents.length - 1" class="timeline-line"></div>
        </div>

        <!-- 右侧内容 -->
        <div class="timeline-content">
          <div class="timeline-date">{{ formatDate(event.date) }}</div>
          <div class="timeline-event-title">{{ event.title }}</div>
          <div class="timeline-description">{{ event.description }}</div>
          <div v-if="event.status === 'completed'" class="timeline-badge completed">
            ✓ 已完成
          </div>
          <div v-else class="timeline-badge pending">○ 进行中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: 'completed' | 'pending'
}

defineProps({
  timelineEvents: {
    type: Array as () => TimelineEvent[],
    default: () => []
  }
})

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  } catch {
    return dateStr
  }
}
</script>

<style lang="scss" scoped src="@/scss/components/portraitView/PortraitTimeline.scss"></style>
