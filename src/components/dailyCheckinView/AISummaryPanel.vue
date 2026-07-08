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
        <button v-if="actualSummary?.exercise_ai_summary" class="summary-item exercise-summary" @click="openFullModal('exercise', actualSummary?.exercise_ai_summary)" :disabled="!actualSummary?.exercise_ai_summary">
          <div class="summary-header">
            <!-- <span class="summary-icon">🏃</span> -->
            <span class="summary-label">运动总结</span>
          </div>
          <p class="summary-text">{{ actualSummary?.exercise_ai_summary || '暂无运动数据' }}</p>
        </button>

        <!-- 饮食总结 -->
        <button v-if="actualSummary?.meal_ai_summary" class="summary-item meal-summary" @click="openFullModal('meal', actualSummary?.meal_ai_summary)" :disabled="!actualSummary?.meal_ai_summary">
          <div class="summary-header">
            <!-- <span class="summary-icon">🍽️</span> -->
            <span class="summary-label">饮食总结</span>
          </div>
          <p class="summary-text">{{ actualSummary?.meal_ai_summary || '暂无饮食数据' }}</p>
        </button>

        <!-- 睡眠总结 -->
        <button v-if="actualSummary?.sleep_ai_summary" class="summary-item sleep-summary" @click="openFullModal('sleep', actualSummary?.sleep_ai_summary)" :disabled="!actualSummary?.sleep_ai_summary">
          <div class="summary-header">
            <!-- <span class="summary-icon">😴</span> -->
            <span class="summary-label">睡眠总结</span>
          </div>
          <p class="summary-text">{{ actualSummary?.sleep_ai_summary || '暂无睡眠数据' }}</p>
        </button>

        <!-- 综合总结 -->
        <button v-if="actualSummary?.total_ai_summary" class="summary-item total-summary" @click="openFullModal('total', actualSummary?.total_ai_summary)" :disabled="!actualSummary?.total_ai_summary">
          <div class="summary-header">
            <!-- <span class="summary-icon">✨</span> -->
            <span class="summary-label">综合总结</span>
          </div>
          <p class="summary-text">{{ actualSummary?.total_ai_summary || '等待数据汇总...' }}</p>
        </button>
      </div>
    </div>

    <!-- AI总结全文浮窗 -->
    <AISummaryFullModal
      :visible="showFullModal"
      :icon="fullModalIcon"
      :title="fullModalTitle"
      :content="fullModalContent"
      @close="showFullModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AISummaryFullModal from '../modals/AISummaryFullModal.vue'

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

const showFullModal = ref(false)
const fullModalIcon = ref('📊')
const fullModalTitle = ref('AI 总结')
const fullModalContent = ref('')


// 获取真实数据对象
const actualSummary = computed(() => {
  return (props.aiSummary as any)?.data || props.aiSummary
})

const openFullModal = (type: string, content: string | null) => {
  if (!content) return
  
  const iconMap: Record<string, string> = {
    exercise: '🏃',
    meal: '🍽️',
    sleep: '😴',
    total: '✨'
  }

  const titleMap: Record<string, string> = {
    exercise: '运动AI总结',
    meal: '饮食AI总结',
    sleep: '睡眠AI总结',
    total: '综合AI总结'
  }

  fullModalIcon.value = iconMap[type] || '📊'
  fullModalTitle.value = titleMap[type] || 'AI总结'
  fullModalContent.value = content
  showFullModal.value = true
}

const retry = () => {
  // emit('retry')
}
</script>

<style lang="scss" scoped src="@/scss/components/dailyCheckinView/AISummaryPanel.scss"></style>
