<template>
  <div class="trends-control-panel">
    <div class="trends-range-selector">
      <button
        v-for="range in dateRanges"
        :key="range.value"
        :class="['trends-range-btn', { active: selectedRange === range.value }]"
        @click="$emit('select', range.value)"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedRange: string
  dateRanges: Array<{ label: string; value: string }>
}>()

defineEmits<{
  select: [value: string]
}>()
</script>

<style scoped>
@import '@/css/components/TrendsControlPanel.css';
</style>
