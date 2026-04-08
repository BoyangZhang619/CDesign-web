<template>
  <section class="patient-activities">
    <div class="section-header">
      <h3 class="section-title">患者活动</h3>
      <p class="section-date">今天，2022年10月6日</p>
    </div>

    <div class="activities-chart">
      <div class="chart-bars">
        <div class="bar-group" v-for="(month, idx) in months" :key="idx">
          <div class="bar" :style="{ height: getBarHeight(idx) + '%' }"></div>
          <span class="bar-label">{{ month }}</span>
        </div>
      </div>
    </div>

    <div class="activity-detail">
      <span class="detail-icon">💚</span>
      <span class="detail-text">良好状况</span>
      <span class="detail-label">焦虑与健康</span>
      <span class="detail-arrow">→</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const months = ref(['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Oct'])
const barHeights = ref([30, 45, 25, 60, 35, 50])

function getBarHeight(index: number): number {
  return barHeights.value[index]
}
</script>

<style scoped>
.patient-activities {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.section-date {
  font-size: 12px;
  color: #95a5a6;
  margin: 0;
}

/* Chart */
.activities-chart {
  margin-bottom: 20px;
  width: 100%;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  height: 150px;
  padding-bottom: 10px;
  width: 100%;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
  max-width: 60px;
  height: 100%;
}

.bar {
  width: 100%;
  min-width: 24px;
  max-width: 45px;
  background: linear-gradient(to top, #9DB4A0, #7FA08F);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 12px;
  color: #95a5a6;
}

/* Activity Detail */
.activity-detail {
  background: #E8F0ED;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-detail:hover {
  background: #DFE8E5;
}

.detail-icon {
  font-size: 18px;
}

.detail-text {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.detail-label {
  font-size: 12px;
  color: #95a5a6;
}

.detail-arrow {
  color: #9DB4A0;
  font-size: 16px;
}
</style>
