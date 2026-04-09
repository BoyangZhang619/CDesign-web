<template>
  <div v-if="habits.length > 0" class="trends-habits-section">
    <h2 class="trends-section-heading">习惯养成进度</h2>
    <div class="trends-habits-grid">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="trends-habit-item"
        :class="{ completed: habit.progress >= 100 }"
      >
        <div class="trends-habit-header">
          <h3 class="trends-habit-title">{{ habit.title }}</h3>
          <div class="trends-habit-progress-badge">{{ habit.progress }}%</div>
        </div>
        <p class="trends-habit-description">{{ habit.description }}</p>
        <div class="trends-habit-progress-container">
          <div class="trends-habit-progress-bar">
            <div class="trends-habit-progress-fill" :style="{ width: habit.progress + '%' }"></div>
          </div>
        </div>
        <div class="trends-habit-footer">
          <span class="trends-habit-target">目标: {{ habit.target }}天</span>
          <span class="trends-habit-current">已坚持: {{ habit.days }}天</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  habits: Array<{id: number; title: string; description: string; days: number; progress: number; target: number}>
}>()
</script>

<style scoped>
@import '@/css/components/TrendsHabits.css';
</style>
