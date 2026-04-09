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

<style scoped>
.portrait-timeline {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E1D9D0;
}

.timeline-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8B9FA0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  font-weight: 600;
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 20px;
  padding: 15px 0;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.timeline-dot.completed {
  background: #9DB4A0;
  border-color: #9DB4A0;
  box-shadow: 0 0 8px rgba(157, 180, 160, 0.3);
}

.timeline-dot.pending {
  background: #F8F6F3;
  border-color: #E8E1D6;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(180deg, #E8E1D6 0%, transparent 100%);
  min-height: 40px;
}

.timeline-content {
  flex: 1;
  padding: 10px;
}

.timeline-date {
  font-size: 12px;
  font-weight: 700;
  color: #9DB4A0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.timeline-event-title {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
  margin-bottom: 6px;
}

.timeline-description {
  font-size: 12px;
  color: #8B9FA0;
  line-height: 1.4;
  margin-bottom: 10px;
}

.timeline-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.timeline-badge.completed {
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
}

.timeline-badge.pending {
  background: #E8E1D6;
  color: #5A7A87;
}

@media (max-width: 480px) {
  .portrait-timeline {
    padding: 15px;
  }

  .timeline-item {
    gap: 12px;
    padding: 12px 0;
  }

  .timeline-date {
    font-size: 11px;
  }

  .timeline-event-title {
    font-size: 13px;
  }

  .timeline-description {
    font-size: 11px;
  }
}
</style>
