<template>
  <div class="toolbar-section">
    <input 
      :value="searchKeyword"
      @input="$emit('search', ($event.target as HTMLInputElement).value)"
      type="text" 
      class="search-input" 
      placeholder="🔍 搜索任务..."
    />
    <div class="filter-buttons">
      <button 
        v-for="status in ['all', 'pending', 'completed', 'overdue']"
        :key="status"
        @click="$emit('filter', status)"
        :class="['filter-btn', { active: currentFilter === status }]"
      >
        {{ statusLabels[status as keyof typeof statusLabels] }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  searchKeyword: string
  currentFilter: string
}>()

const statusLabels = {
  all: '全部',
  pending: '待完成',
  completed: '已完成',
  overdue: '逾期'
}

defineEmits<{
  search: [keyword: string]
  filter: [status: string]
}>()
</script>

<style scoped>
@import '../../css/components/TodolistToolbar.css';
</style>
