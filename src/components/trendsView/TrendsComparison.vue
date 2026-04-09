<template>
  <div class="trends-comparison-section">
    <h2 class="trends-section-heading">周期对比分析</h2>
    <div class="trends-comparison-grid">
      <div class="trends-comparison-item">
        <div class="trends-comparison-label">本期运动</div>
        <div class="trends-comparison-values">
          <div class="trends-comparison-value">
            <span class="value">{{ Math.round(comparison.exerciseFrequencyCurrent) }}</span>
            <span class="unit">天</span>
          </div>
          <div class="trends-comparison-vs">VS</div>
          <div class="trends-comparison-value secondary">
            <span class="value">{{ Math.round(comparison.exerciseFrequencyPrev) }}</span>
            <span class="unit">天</span>
          </div>
        </div>
        <div
          class="trends-comparison-trend"
          :class="{ up: comparison.exerciseTrend > 0, down: comparison.exerciseTrend < 0 }"
        >
          {{ comparison.exerciseTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.exerciseTrend) }}%
        </div>
      </div>

      <div class="trends-comparison-item">
        <div class="trends-comparison-label">本期睡眠</div>
        <div class="trends-comparison-values">
          <div class="trends-comparison-value">
            <span class="value">{{ comparison.sleepCurrent.toFixed(1) }}</span>
            <span class="unit">h</span>
          </div>
          <div class="trends-comparison-vs">VS</div>
          <div class="trends-comparison-value secondary">
            <span class="value">{{ comparison.sleepPrev.toFixed(1) }}</span>
            <span class="unit">h</span>
          </div>
        </div>
        <div
          class="trends-comparison-trend"
          :class="{ up: comparison.sleepTrend > 0, down: comparison.sleepTrend < 0 }"
        >
          {{ comparison.sleepTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.sleepTrend) }}%
        </div>
      </div>

      <div class="trends-comparison-item">
        <div class="trends-comparison-label">本期饮食</div>
        <div class="trends-comparison-values">
          <div class="trends-comparison-value">
            <span class="value">{{ Math.round(comparison.mealBalanceCurrent) }}</span>
            <span class="unit">分</span>
          </div>
          <div class="trends-comparison-vs">VS</div>
          <div class="trends-comparison-value secondary">
            <span class="value">{{ Math.round(comparison.mealBalancePrev) }}</span>
            <span class="unit">分</span>
          </div>
        </div>
        <div
          class="trends-comparison-trend"
          :class="{ up: comparison.mealTrend > 0, down: comparison.mealTrend < 0 }"
        >
          {{ comparison.mealTrend > 0 ? '↑' : '↓' }} {{ Math.abs(comparison.mealTrend) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comparison: {
    exerciseFrequencyCurrent: number
    exerciseFrequencyPrev: number
    exerciseTrend: number
    sleepCurrent: number
    sleepPrev: number
    sleepTrend: number
    mealBalanceCurrent: number
    mealBalancePrev: number
    mealTrend: number
  }
}>()
</script>

<style scoped>
@import '@/css/components/TrendsComparison.css';
</style>
