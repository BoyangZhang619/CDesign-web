<template>
  <div class="stats-container">
    <!-- 任务类型统计 -->
    <div class="type-stats-container">
      <h3 class="stats-title">任务类型统计</h3>
      <div class="type-stats-grid">
        <div v-if="stats.exercise_count !== undefined" class="type-stat">
          <span class="type-label">运动</span>
          <span class="type-count">{{ stats.exercise_count }}</span>
        </div>
        <div v-if="stats.meal_count !== undefined" class="type-stat">
          <span class="type-label">饮食</span>
          <span class="type-count">{{ stats.meal_count }}</span>
        </div>
        <div v-if="stats.sleep_count !== undefined" class="type-stat">
          <span class="type-label">睡眠</span>
          <span class="type-count">{{ stats.sleep_count }}</span>
        </div>
        <div v-if="stats.custom_count !== undefined" class="type-stat">
          <span class="type-label">自定义</span>
          <span class="type-count">{{ stats.custom_count }}</span>
        </div>
        <div v-if="stats.ai_suggested_count !== undefined" class="type-stat">
          <span class="type-label">AI建议</span>
          <span class="type-count">{{ stats.ai_suggested_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskCompletionStats } from '../../composables/useTaskCompletionHistory'

defineProps({
  stats: {
    type: Object as () => TaskCompletionStats,
    required: true
  }
})
</script>

<style lang="scss" scoped src="@/scss/components/historyView/TaskCompletionStats.scss"></style>
