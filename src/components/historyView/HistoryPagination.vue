<template>
  <div class="pagination">
    <button 
      @click="$emit('prev')" 
      :disabled="currentPage <= 1" 
      class="pagination-btn"
    >
      ← 上一页
    </button>
    <span class="page-indicator">第 {{ currentPage }} / {{ totalPages }} 页</span>
    <button 
      @click="$emit('next')" 
      :disabled="currentPage >= totalPages" 
      class="pagination-btn"
    >
      下一页 →
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits<{
  prev: []
  next: []
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 25px;
  padding: 20px;
}

.pagination-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.3);
}

.pagination-btn:disabled {
  background: #E8E1D6;
  color: #A0A09F;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-indicator {
  font-size: 12px;
  font-weight: 600;
  color: #5A7A87;
  min-width: 100px;
  text-align: center;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 12px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 11px;
  }

  .page-indicator {
    min-width: 80px;
    font-size: 11px;
  }
}
</style>
