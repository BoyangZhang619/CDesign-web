<template>
  <div class="portrait-right-content">
    <PortraitMetrics :metrics-data="portraitData.metrics" />
    <PortraitTasksDisplay />
    <PortraitRecommendations :recommendations="portraitData.recommendations" />
  </div>
</template>

<script setup lang="ts">
import PortraitMetrics from './PortraitMetrics.vue'
import PortraitRecommendations from './PortraitRecommendations.vue'
import PortraitTasksDisplay from './PortraitTasksDisplay.vue'

interface Metrics {
  bmi: number
  cardio: number
  metabolism: number
  sleepQuality: number
}

interface Recommendation {
  id: string
  icon: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: 'completed' | 'pending'
}

interface PortraitData {
  metrics: Metrics
  recommendations: Recommendation[]
  timelineEvents: TimelineEvent[]
}

defineProps({
  portraitData: {
    type: Object as () => PortraitData,
    required: true
  }
})
</script>

<style scoped>
.portrait-right-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
