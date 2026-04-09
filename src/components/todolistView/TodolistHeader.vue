<template>
  <div class="todolist-header">
    <div class="header-info">
      <h1 class="todolist-title">任务清单</h1>
      <p class="todolist-subtitle">管理你的日常任务和健康目标</p>
    </div>
    <div class="header-actions">
      <button @click="$emit('create')" class="btn-create-task" title="创建任务">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>新任务</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  create: []
}>()
</script>

<style scoped>
@import '../../css/components/TodolistHeader.css';
</style>
