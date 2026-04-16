<template>
  <div class="exercise-ai-summary-panel">
    <div class="summary-header">
      <h3 class="summary-title">🤖 运动AI总结</h3>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>生成中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-text">加载失败</p>
    </div>

    <!-- 总结内容 -->
    <button v-else class="summary-content" @click="openFullModal" :disabled="!actualSummary">
      <p class="summary-text">{{ actualSummary || '暂无数据' }}</p>
    </button>

    <!-- AI总结全文浮窗 -->
    <AISummaryFullModal
      :visible="showFullModal"
      :icon="'🏃'"
      :title="'运动AI总结'"
      :content="actualSummary || ''"
      @close="showFullModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AISummaryFullModal from '../modals/AISummaryFullModal.vue'

interface Props {
  exerciseSummary?: {
    exercise_ai_summary: string | null
    updated_flags?: {
      exercise: boolean
    }
  } | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const showFullModal = ref(false)

// 获取真实数据对象
const actualSummary = computed(() => {
  return (props.exerciseSummary as any)?.data?.exercise_ai_summary || 
         (props.exerciseSummary as any)?.exercise_ai_summary ||
         null
})

const openFullModal = () => {
  if (actualSummary.value) {
    showFullModal.value = true
  }
}
</script>

<style scoped>
.exercise-ai-summary-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin: 12px 0;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(90, 122, 135, 0.1);
  border-top-color: #5a7a87;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-text {
  margin: 0;
  color: #ff6b6b;
}

.summary-content {
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-content:hover:not(:disabled) {
  transform: translateY(-1px);
}

.summary-content:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.summary-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #666;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  line-clamp: 4;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .exercise-ai-summary-panel {
    padding: 10px;
    margin: 10px 0;
  }

  .summary-title {
    font-size: 13px;
  }

  .summary-text {
    font-size: 11px;
  }
}
</style>
