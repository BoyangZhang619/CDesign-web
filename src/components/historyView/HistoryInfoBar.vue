<template>
  <div class="info-bar">
    <div class="sort-section">
      <div class="sort-buttons">
        <button 
          v-for="option in sortOptions" 
          :key="option.value" 
          @click="changeSort(option.value)"
          :class="['sort-btn', { active: currentSort === option.value }]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="pagination-info">{{ paginationInfo }}</div>
  </div>
</template>

<script setup lang="ts">
import { useHistory } from '../../composables/useHistory'

const { sortOptions, currentSort, changeSort, paginationInfo } = useHistory()
</script>

<style lang="scss" scoped src="@/scss/components/historyView/HistoryInfoBar.scss"></style>
