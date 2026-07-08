<template>
  <div class="section">
    <div class="section-header">
      <h3 class="section-title">运动记录</h3>
      <button class="btn-add" @click="showForm = !showForm">{{ showForm ? '取消' : '+ 添加' }}</button>
    </div>
    <ExerciseAISummaryPanel />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExerciseAISummaryPanel from './ExerciseAISummaryPanel.vue'
const showForm = ref(false)
</script>

<style lang="scss" scoped>
.section {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-5);
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-4);
}
.section-title {
  font-size: var(--font-size-base); font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}
.btn-add {
  font-size: var(--font-size-sm); color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-1) var(--space-3); border-radius: var(--radius-sm);
  &:hover { background: var(--color-accent-light); }
}
</style>
