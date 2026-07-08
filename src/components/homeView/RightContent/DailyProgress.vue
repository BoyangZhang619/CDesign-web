<template>
  <section class="daily-progress">
    <h3 class="section-title">每日进度</h3>
    <p class="progress-subtitle">保持改善你的健康质量</p>

    <div class="progress-circle">
      <svg viewBox="0 0 120 120" class="circle-svg">
        <circle cx="60" cy="60" r="50" class="circle-background"></circle>
        <circle cx="60" cy="60" r="50" class="circle-progress" :style="{ strokeDashoffset: svgStrokeDashOffset }"></circle>
      </svg>
      <div class="circle-content">
        <span class="progress-percentage">{{ completionRate }}%</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTodolist } from '../../../composables/useTodolist';

const { fetchTasks, stats } = useTodolist();

const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round(((stats.value.completed / stats.value.total) * 100) || 0)
})


// SVG stroke-dasharray 总长度为 314 (2 * π * 50)
// 根据完成度计算 stroke-dashoffset
const svgStrokeDashOffset = computed(() => {
  const circumference = 314; // 2 * π * 50
  const offset = circumference - (completionRate.value / 100) * circumference;
  return offset;
});

onMounted(() => {
  fetchTasks();
});

</script>

<style lang="scss" scoped src="@/scss/components/homeView/RightContent/DailyProgress.scss"></style>
