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
          <p class="summary-text">{{ actualSummary?.exercise_ai_summary || '暂无运动数据' }}</p>
        </div>

        <!-- 饮食总结 -->
        <div class="summary-item meal-summary">
          <div class="summary-header">
            <span class="summary-icon">🍽️</span>
            <span class="summary-label">饮食总结</span>
            <span v-if="updatedTypes.includes('meal')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ actualSummary?.meal_ai_summary || '暂无饮食数据' }}</p>
        </div>

        <!-- 睡眠总结 -->
        <div class="summary-item sleep-summary">
          <div class="summary-header">
            <span class="summary-icon">😴</span>
            <span class="summary-label">睡眠总结</span>
            <span v-if="updatedTypes.includes('sleep')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ actualSummary?.sleep_ai_summary || '暂无睡眠数据' }}</p>
        </div>

        <!-- 综合总结 -->
        <div class="summary-item total-summary">
          <div class="summary-header">
            <span class="summary-icon">✨</span>
            <span class="summary-label">综合总结</span>
            <span v-if="updatedTypes.includes('total')" class="updated-badge">更新</span>
          </div>
          <p class="summary-text">{{ actualSummary?.total_ai_summary || '等待数据汇总...' }}</p>
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
  // 如果 aiSummary 是完整响应结构，提取 .data
  const actualData = (props.aiSummary as any)?.data || props.aiSummary
  if (!actualData?.updated_flags) return []
  const types: string[] = []
  const flags = actualData.updated_flags
  if (flags.exercise) types.push('exercise')
  if (flags.meal) types.push('meal')
  if (flags.sleep) types.push('sleep')
  if (flags.total) types.push('total')
  return types
})

// 获取真实数据对象
const actualSummary = computed(() => {
  return (props.aiSummary as any)?.data || props.aiSummary
})

const retry = () => {
  // emit('retry')
}
</script>

<style scoped>
.ai-summary-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff8;
  border: 1px solid rgba(90, 122, 135, 0.15);
  border-radius: 12px;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  gap: 12px;
  color: #999;
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
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

.retry-btn {
  padding: 6px 12px;
  background: #5a7a87;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #4a6a77;
  transform: translateY(-1px);
}

.summaries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid;
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
  border-left-color: #5a7a87;
}

.summary-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.summary-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.summary-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
  flex: 1;
}

.updated-badge {
  display: inline-block;
  background: #4ecdc4;
  color: white;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
}

.summary-text {
  font-size: 12px;
  line-height: 1.4;
  color: #666;
  margin: 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .ai-summary-panel {
    padding: 12px;
  }

  .summary-title {
    font-size: 14px;
  }

  .summary-text {
    font-size: 11px;
  }
}
</style>
