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
        <span class="progress-percentage">{{ todayCompletionPercentage }}%</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTodolist } from '../../../composables/useTodolist';
import { getLocalISOString } from '@/utils/dateTime';

const { tasks, fetchTasks } = useTodolist();

// 获取今天的任务完成度
const todayCompletionPercentage = computed(() => {
  if (!Array.isArray(tasks.value) || tasks.value.length === 0) return 0;
  
  const today = getLocalISOString().split('T')[0];
  
  // 过滤今天的任务，正确处理日期格式
  const todayTasks = tasks.value.filter(task => {
    const taskDateStr = typeof task.due_date === 'string' 
      ? task.due_date.split('T')[0] 
      : getLocalISOString(task.due_date).split('T')[0];
    return taskDateStr === today;
  });
  
  if (todayTasks.length === 0) return 0;
  
  const completedCount = todayTasks.filter(task => task.status === 'completed').length;
  return Math.round((completedCount / todayTasks.length) * 100);
});

// SVG stroke-dasharray 总长度为 314 (2 * π * 50)
// 根据完成度计算 stroke-dashoffset
const svgStrokeDashOffset = computed(() => {
  const circumference = 314; // 2 * π * 50
  const offset = circumference - (todayCompletionPercentage.value / 100) * circumference;
  return offset;
});

onMounted(() => {
  fetchTasks();
});

</script>

<style scoped>
.daily-progress {
  background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.progress-subtitle {
  font-size: 12px;
  margin: 5px 0 15px 0;
  opacity: 0.9;
}

.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-background {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 4;
}

.circle-progress {
  fill: none;
  stroke: white;
  stroke-width: 4;
  stroke-dasharray: 314;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.circle-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
}
</style>
