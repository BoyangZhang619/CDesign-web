<template>
  <div class="portrait-left-content">
    <!-- 健康评分卡 -->
    <PortraitScoreCard 
      :health-score="portraitData.healthScore"
      :exercise-score="portraitData.exerciseScore"
      :meal-score="portraitData.mealScore"
      :sleep-score="portraitData.sleepScore"
      :is-refreshing="isRefreshing"
      @refresh="$emit('refresh')"
    />

    <!-- 健康维度分析 -->
    <PortraitRadarChart 
      :radar-data="portraitData.radarData"
    />

    
    <PortraitTimeline :timeline-events="portraitData.timelineEvents" />
  </div>
</template>

<script setup lang="ts">
import PortraitScoreCard from './PortraitScoreCard.vue'
import PortraitRadarChart from './PortraitRadarChart.vue'
import PortraitTimeline from './PortraitTimeline.vue'

defineProps({
  portraitData: {
    type: Object,
    required: true
  },
  isRefreshing: {
    type: Boolean,
    default: false
  }
})
defineEmits(['refresh'])
</script>

<style scoped>
.portrait-left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
</style>
