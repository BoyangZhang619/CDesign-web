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

<style scoped>
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E1D9D0;
  gap: 20px;
}

.sort-section {
  flex: 1;
}

.sort-buttons {
  display: flex;
  gap: 10px;
}

.sort-btn {
  padding: 6px 12px;
  background: #F8F6F3;
  color: #5A7A87;
  border: 1px solid #E1D9D0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: #F0EBE3;
  border-color: #D1CAC0;
}

.sort-btn.active {
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border-color: #9DB4A0;
}

.pagination-info {
  font-size: 12px;
  color: #8B9FA0;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .info-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-info {
    width: 100%;
    text-align: right;
  }
}
</style>
