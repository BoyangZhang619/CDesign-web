<template>
  <div class="ai-summary-panel">
    <div class="summary-section">
      <h3 class="summary-title">📊 今日AI总结</h3>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>AI 正在生成总结...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>❌ 总结加载失败</p>
        <button @click="retry" class="retry-btn">重试</button>
      </div>

      <!-- 总结内容 -->
      <div v-else class="summaries">
        <!-- 运动总结 -->
        <div class="summary-item exercise-summary">
          <div class="summary-header">
            <span class="summary-icon">🏃</span>
            <span class="summary-label">运动总结</span>
            <span v-if="updatedTypes.includes('exercise')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ aiSummary?.exercise_ai_summary || '暂无运动数据' }}</p>
        </div>

        <!-- 饮食总结 -->
        <div class="summary-item meal-summary">
          <div class="summary-header">
            <span class="summary-icon">🍽️</span>
            <span class="summary-label">饮食总结</span>
            <span v-if="updatedTypes.includes('meal')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ aiSummary?.meal_ai_summary || '暂无饮食数据' }}</p>
        </div>

        <!-- 睡眠总结 -->
        <div class="summary-item sleep-summary">
          <div class="summary-header">
            <span class="summary-icon">😴</span>
            <span class="summary-label">睡眠总结</span>
            <span v-if="updatedTypes.includes('sleep')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ aiSummary?.sleep_ai_summary || '暂无睡眠数据' }}</p>
        </div>

        <!-- 综合总结 -->
        <div class="summary-item total-summary">
          <div class="summary-header">
            <span class="summary-icon">✨</span>
            <span class="summary-label">综合总结</span>
            <span v-if="updatedTypes.includes('total')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ aiSummary?.total_ai_summary || '等待数据汇总...' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  aiSummary?: {
    exercise_ai_summary: string | null
    meal_ai_summary: string | null
    sleep_ai_summary: string | null
    total_ai_summary: string | null
    updated_flags?: {
      exercise: boolean
      meal: boolean
      sleep: boolean
      total: boolean
    }
  } | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const emit = defineEmits<{
  retry: []
}>()

// 计算更新的类型列表
const updatedTypes = computed(() => {
  if (!props.aiSummary?.updated_flags) return []
  const types: string[] = []
  const flags = props.aiSummary.updated_flags
  if (flags.exercise) types.push('exercise')
  if (flags.meal) types.push('meal')
  if (flags.sleep) types.push('sleep')
  if (flags.total) types.push('total')
  return types
})

const retry = () => {
  emit('retry')
}
</script>

<style scoped>
.ai-summary-panel {
  width: 100%;
  background: linear-gradient(135deg, #f5f7ff 0%, #f9f5ff 100%);
  border-radius: 16px;
  padding: 24px;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(147, 112, 219, 0.08);
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 12px;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(147, 112, 219, 0.1);
  border-top-color: #9370db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  padding: 8px 16px;
  background: #9370db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #7b5cc9;
}

.summaries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.exercise-summary {
  border-left-color: #ff6b6b;
}

.meal-summary {
  border-left-color: #4ecdc4;
}

.sleep-summary {
  border-left-color: #95a5a6;
}

.total-summary {
  border-left-color: #9370db;
  grid-column: 1 / -1;
}

.summary-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.summary-icon {
  font-size: 20px;
}

.summary-label {
  font-weight: 600;
  color: #2d2d2d;
  font-size: 14px;
}

.updated-badge {
  display: inline-block;
  background: #4ecdc4;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}

.summary-text {
  font-size: 13px;
  line-height: 1.5;
  color: #555;
  margin: 0;
  word-break: break-word;
}

@media (max-width: 768px) {
  .ai-summary-panel {
    padding: 16px;
  }

  .summaries {
    grid-template-columns: 1fr;
  }

  .total-summary {
    grid-column: 1;
  }
}
</style>
