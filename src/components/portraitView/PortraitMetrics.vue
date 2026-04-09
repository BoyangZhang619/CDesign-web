<template>
  <div class="portrait-metrics">
    <div class="metrics-header">
      <div class="metrics-title">身体指标</div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card bmi">
        <div class="metric-icon">📏</div>
        <div class="metric-value">{{ metricsData.bmi }}</div>
        <div class="metric-unit">BMI</div>
        <div class="metric-status" :class="getBMIStatus(metricsData.bmi)">
          {{ getBMILabel(metricsData.bmi) }}
        </div>
      </div>

      <div class="metric-card cardio">
        <div class="metric-icon">❤️</div>
        <div class="metric-value">{{ metricsData.cardio }}</div>
        <div class="metric-unit">BPM</div>
        <div class="metric-status" :class="getCardioStatus(metricsData.cardio)">
          {{ getCardioLabel(metricsData.cardio) }}
        </div>
      </div>

      <div class="metric-card metabolism">
        <div class="metric-icon">⚡</div>
        <div class="metric-value">{{ metricsData.metabolism }}</div>
        <div class="metric-unit">kcal/day</div>
        <div class="metric-status neutral">基础代谢</div>
      </div>

      <div class="metric-card sleep">
        <div class="metric-icon">😴</div>
        <div class="metric-value">{{ metricsData.sleepQuality }}%</div>
        <div class="metric-unit">睡眠质量</div>
        <div class="metric-status" :class="getSleepStatus(metricsData.sleepQuality)">
          {{ getSleepLabel(metricsData.sleepQuality) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Metrics {
  bmi: number
  cardio: number
  metabolism: number
  sleepQuality: number
}

defineProps({
  metricsData: {
    type: Object as () => Metrics,
    default: () => ({
      bmi: 24,
      cardio: 72,
      metabolism: 1800,
      sleepQuality: 80
    })
  }
})

// BMI 状态判断
const getBMIStatus = (bmi: number): string => {
  if (bmi < 18.5) return 'warning'
  if (bmi > 24.9) return 'warning'
  return 'excellent'
}

const getBMILabel = (bmi: number): string => {
  if (bmi < 18.5) return '偏低'
  if (bmi > 24.9) return '偏高'
  return '正常'
}

// 心率状态判断
const getCardioStatus = (bpm: number): string => {
  if (bpm < 60 || bpm > 100) return 'warning'
  return 'excellent'
}

const getCardioLabel = (bpm: number): string => {
  if (bpm < 60 || bpm > 100) return '异常'
  return '正常'
}

// 睡眠状态判断
const getSleepStatus = (quality: number): string => {
  if (quality < 60) return 'warning'
  if (quality < 80) return 'neutral'
  return 'excellent'
}

const getSleepLabel = (quality: number): string => {
  if (quality < 60) return '较差'
  if (quality < 80) return '良好'
  return '优秀'
}
</script>

<style scoped>
.portrait-metrics {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E1D9D0;
}

.metrics-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.metric-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F6F3 100%);
  border: 1px solid #E1D9D0;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #5A7A87;
  line-height: 1;
}

.metric-unit {
  font-size: 11px;
  color: #8B9FA0;
  margin-top: 4px;
  margin-bottom: 8px;
  font-weight: 600;
}

.metric-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 8px;
}

.metric-status.excellent {
  background: #9DB4A0;
  color: #FEFCFA;
}

.metric-status.warning {
  background: #D4A5A8;
  color: #FEFCFA;
}

.metric-status.neutral {
  background: #C9B89C;
  color: #FEFCFA;
}

/* 不同卡片的边框色 */
.metric-card.bmi {
  border-left: 4px solid #9DB4A0;
}

.metric-card.cardio {
  border-left: 4px solid #A9787B;
}

.metric-card.metabolism {
  border-left: 4px solid #C9B89C;
}

.metric-card.sleep {
  border-left: 4px solid #8FA591;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .metric-value {
    font-size: 20px;
  }

  .metric-icon {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .portrait-metrics {
    padding: 15px;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .metric-value {
    font-size: 18px;
  }

  .metric-icon {
    font-size: 20px;
  }

  .metric-status {
    font-size: 11px;
  }
}
</style>
