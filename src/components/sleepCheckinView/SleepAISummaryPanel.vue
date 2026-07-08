<template>
  <div class="sleep-ai-summary-panel">
    <div class="summary-header">
      <h3 class="summary-title">睡眠AI总结</h3>
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
      :icon="'😴'"
      :title="'睡眠AI总结'"
      :content="actualSummary || ''"
      @close="showFullModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AISummaryFullModal from '../modals/AISummaryFullModal.vue'

interface Props {
  sleepSummary?: {
    sleep_ai_summary: string | null
    updated_flags?: {
      sleep: boolean
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
  return (props.sleepSummary as any)?.data?.sleep_ai_summary || 
         (props.sleepSummary as any)?.sleep_ai_summary ||
         null
})

const openFullModal = () => {
  if (actualSummary.value) {
    showFullModal.value = true
  }
}
</script>

<style lang="scss" scoped src="@/scss/components/sleepCheckinView/SleepAISummaryPanel.scss"></style>
