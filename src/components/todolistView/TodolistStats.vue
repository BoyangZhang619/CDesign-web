<template>
  <div class="stats-section">
    <div class="stat-card">
      <img src="/noun-todolist-all.svg" alt="总任务" class="stat-icon" style="transform: scale(.9);" />
      <div class="stat-info">
        <div class="stat-label">总任务</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
    </div>
    <div class="stat-card">
      <img src="/noun-todolist-complete.svg" alt="已完成" class="stat-icon" style="transform: scale(1);" />
      <div class="stat-info">
        <div class="stat-label">已完成</div>
        <div class="stat-value">{{ stats.completed }}</div>
      </div>
    </div>
    <div class="stat-card">
      <img src="/noun-todolist-cancel.svg" alt="待完成" class="stat-icon" style="transform: scale(1.25);" />
      <div class="stat-info">
        <div class="stat-label">待完成</div>
        <div class="stat-value">{{ stats.pending }}</div>
      </div>
    </div>
    <div class="stat-card">
      <img src="/noun-todolist-timeout.svg" alt="逾期" class="stat-icon" style="transform: scale(1.1);" />
      <div class="stat-info">
        <div class="stat-label">逾期</div>
        <div class="stat-value">{{ stats.overdue }}</div>
      </div>
    </div>
  </div>

  <div class="progress-section">
    <div class="progress-header">
      <span class="progress-label">今日完成率</span>
      <span class="progress-percentage">{{ completionRate }}%</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: completionRate + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  total: number
  completed: number
  pending: number
  overdue: number
}

const props = defineProps<{
  stats: Stats
  completionRate: number
}>()
</script>

<style scoped>
@import '../../css/components/TodolistStats.css';
</style>
