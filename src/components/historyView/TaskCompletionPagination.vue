<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span class="info-text">
        第 <span class="page-number">{{ currentPage }}</span> 页 
        <span class="divider">/</span> 
        共 <span class="total-pages">{{ totalPages }}</span> 页
      </span>
    </div>

    <div class="pagination-controls">
      <button 
        class="pagination-btn prev" 
        :disabled="currentPage <= 1"
        @click="$emit('prev')"
      >
        ← 上一页
      </button>

      <div class="page-indicator">
        <input 
          v-model.number="inputPage" 
          type="number" 
          class="page-input" 
          :min="1"
          :max="totalPages"
          @keyup.enter="goToPage"
        />
        <span class="separator">/</span>
        <span class="total">{{ totalPages }}</span>
      </div>

      <button 
        class="pagination-btn goto" 
        @click="goToPage"
        :disabled="inputPage < 1 || inputPage > totalPages || inputPage === currentPage"
      >
        跳转
      </button>

      <button 
        class="pagination-btn next" 
        :disabled="currentPage >= totalPages"
        @click="$emit('next')"
      >
        下一页 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits(['prev', 'next', 'goto'])

const inputPage = ref(props.currentPage)

watch(() => props.currentPage, (newPage) => {
  inputPage.value = newPage
})

const goToPage = () => {
  if (inputPage.value >= 1 && inputPage.value <= props.totalPages && inputPage.value !== props.currentPage) {
    emit('goto', inputPage.value)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  margin-top: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  flex: 1;
  min-width: 200px;
}

.info-text {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.page-number,
.total-pages {
  font-weight: 700;
  color: #8B6F47;
}

.divider {
  margin: 0 4px;
  color: #ddd;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #D8CFC4;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #C8B4A0;
  background: linear-gradient(135deg, #FFFBF7 0%, #FEFCFA 100%);
  color: #8B6F47;
  box-shadow: 0 2px 6px rgba(200, 180, 160, 0.1);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.prev,
.pagination-btn.next {
  min-width: 80px;
}

.pagination-btn.goto {
  min-width: 60px;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #D8CFC4;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border-radius: 6px;
}

.page-input {
  width: 40px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #8B6F47;
  text-align: center;
  padding: 0;
}

.page-input:focus {
  outline: none;
}

/* 隐藏输入框的数字上下按钮 */
.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.separator,
.total {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-info {
    width: 100%;
    text-align: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }

  .pagination-btn {
    flex: 1;
    min-width: auto;
  }
}
</style>
