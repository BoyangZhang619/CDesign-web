<template>
  <div class="portrait-score-card">
    <!-- 卡片操作栏 -->
    <div class="card-header">
      <div class="card-title">健康评分</div>
      <div class="card-actions">
        <!-- 加载动画 -->
        <div v-if="isRefreshing" class="loading-spinner">
          <div class="spinner"></div>
          <span>数据分析中...</span>
        </div>
        <!-- 刷新按钮 -->
        <button 
          v-else
          @click="$emit('refresh')"
          class="btn-refresh"
          :disabled="isRefreshing"
          title="刷新数据会使用AI重新分析打卡数据"
        >
          刷新
        </button>
      </div>
    </div>

    <div class="score-container">
      <div class="score-circle">
        <svg viewBox="0 0 120 120" class="score-ring">
          <circle cx="60" cy="60" r="54" class="score-ring-bg" />
          <circle
            cx="60"
            cy="60"
            r="54"
            class="score-ring-progress"
            :style="{ strokeDashoffset: scoreOffset }"
          />
        </svg>
        <div class="score-text">
          <div class="score-value">{{ healthScore > 0 ? healthScore : '--' }}</div>
          <div class="score-label">{{ healthScore > 0 ? '总体评分' : '待评分' }}</div>
        </div>
      </div>

      <div class="score-details">
        <div class="score-item">
          <span class="score-icon">🏃</span>
          <span class="score-name">运动</span>
          <div class="score-bar">
            <div class="score-fill exercise" :style="{ width: exerciseScore + '%' }"></div>
          </div>
          <span class="score-num">{{ exerciseScore }}</span>
        </div>

        <div class="score-item">
          <span class="score-icon">🍽️</span>
          <span class="score-name">饮食</span>
          <div class="score-bar">
            <div class="score-fill meal" :style="{ width: mealScore + '%' }"></div>
          </div>
          <span class="score-num">{{ mealScore }}</span>
        </div>

        <div class="score-item">
          <span class="score-icon">😴</span>
          <span class="score-name">睡眠</span>
          <div class="score-bar">
            <div class="score-fill sleep" :style="{ width: sleepScore + '%' }"></div>
          </div>
          <span class="score-num">{{ sleepScore }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  healthScore: {
    type: Number,
    default: 0
  },
  exerciseScore: {
    type: Number,
    default: 0
  },
  mealScore: {
    type: Number,
    default: 0
  },
  sleepScore: {
    type: Number,
    default: 0
  },
  isRefreshing: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])

const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 54
  return circumference * (1 - props.healthScore / 100)
})
</script>

<style lang="scss" scoped src="@/scss/components/portraitView/PortraitScoreCard.scss"></style>
