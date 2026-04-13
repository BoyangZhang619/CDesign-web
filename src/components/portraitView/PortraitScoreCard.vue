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

<style scoped>
.portrait-score-card {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E1D9D0;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.card-actions {
  display: flex;
  align-items: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #9DB4A0;
  font-size: 12px;
  font-weight: 600;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #E8E1D6;
  border-top: 2px solid #9DB4A0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-refresh {
  padding: 8px 14px;
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border: 1px solid #9DB4A0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.score-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.score-circle {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.score-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-ring-bg {
  fill: none;
  stroke: #E8E1D6;
  stroke-width: 6;
}

.score-ring-progress {
  fill: none;
  stroke: #9DB4A0;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 339.29;
  stroke-dashoffset: 169.65;
  transition: stroke-dashoffset 0.6s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: #5A7A87;
}

.score-label {
  font-size: 11px;
  color: #8B9FA0;
  margin-top: 4px;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  flex-shrink: 0;
}

.score-name {
  font-size: 13px;
  font-weight: 600;
  color: #5A7A87;
  min-width: 40px;
}

.score-bar {
  flex: 1;
  height: 6px;
  background: #E8E1D6;
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.score-fill.exercise {
  background: linear-gradient(90deg, #9DB4A0 0%, #8FA591 100%);
}

.score-fill.meal {
  background: linear-gradient(90deg, #C9B89C 0%, #B8A78B 100%);
}

.score-fill.sleep {
  background: linear-gradient(90deg, #A9787B 0%, #987067 100%);
}

.score-num {
  font-size: 12px;
  font-weight: 600;
  color: #8B9FA0;
  min-width: 30px;
  text-align: right;
}

@media (max-width: 768px) {
  .score-container {
    flex-direction: column;
    align-items: center;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-details {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card-header {
    align-items: flex-start;
    gap: 10px;
  }

  .score-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-value {
    font-size: 24px;
  }
}
</style>
