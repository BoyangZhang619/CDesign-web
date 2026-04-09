<template>
  <div class="trends-overview">
    <div class="trends-card">
      <div class="trends-card-header">
        <p class="trends-card-title">平均运动时间</p>
        <span class="trends-card-icon">🏃</span>
      </div>
      <div class="trends-card-value">
        <span class="trends-card-number">{{ Math.round(stats.avgExercise) }}</span>
        <span class="trends-card-unit">分钟</span>
      </div>
      <div class="trends-card-trend" :class="stats.exerciseTrend > 0 ? 'up' : 'down'">
        {{ stats.exerciseTrend > 0 ? '↑' : '↓' }} {{ Math.abs(Math.round(stats.exerciseTrend)) }}%
      </div>
    </div>

    <div class="trends-card">
      <div class="trends-card-header">
        <p class="trends-card-title">平均热量摄入</p>
        <span class="trends-card-icon">🍎</span>
      </div>
      <div class="trends-card-value">
        <span class="trends-card-number">{{ Math.round(stats.avgMealCalories) }}</span>
        <span class="trends-card-unit">kcal</span>
      </div>
      <div class="trends-card-trend" :class="stats.caloriesTrend > 0 ? 'up' : 'down'">
        {{ stats.caloriesTrend > 0 ? '↑' : '↓' }} {{ Math.abs(Math.round(stats.caloriesTrend)) }}%
      </div>
    </div>

    <div class="trends-card">
      <div class="trends-card-header">
        <p class="trends-card-title">平均睡眠时间</p>
        <span class="trends-card-icon">😴</span>
      </div>
      <div class="trends-card-value">
        <span class="trends-card-number">{{ stats.avgSleep.toFixed(1) }}</span>
        <span class="trends-card-unit">小时</span>
      </div>
      <div class="trends-card-trend" :class="stats.sleepTrend > 0 ? 'down' : 'up'">
        {{ stats.sleepTrend > 0 ? '↑' : '↓' }} {{ Math.abs(Math.round(stats.sleepTrend)) }}%
      </div>
    </div>

    <div class="trends-card">
      <div class="trends-card-header">
        <p class="trends-card-title">健康评分</p>
        <span class="trends-card-icon">⭐</span>
      </div>
      <div class="trends-card-value">
        <span class="trends-card-number">{{ Math.round(stats.healthScore) }}</span>
        <span class="trends-card-unit">分</span>
      </div>
      <div class="trends-card-trend" :class="stats.scoreTrend > 0 ? 'up' : 'down'">
        {{ stats.scoreTrend > 0 ? '↑' : '↓' }} {{ Math.abs(Math.round(stats.scoreTrend)) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    avgExercise: number
    avgMealCalories: number
    avgSleep: number
    healthScore: number
    exerciseTrend: number
    caloriesTrend: number
    sleepTrend: number
    scoreTrend: number
  }
}>()
</script>

<style scoped>
@import '@/css/components/TrendsOverviewCards.css';
</style>
