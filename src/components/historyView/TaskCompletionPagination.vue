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

<style lang="scss" scoped src="@/scss/components/historyView/TaskCompletionPagination.scss"></style>
