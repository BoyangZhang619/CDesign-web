<template>
  <section class="patient-activities">
    <div class="section-header">
      <h3 class="section-title">状态比对</h3>
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

<style lang="scss" scoped src="@/scss/components/homeView/LeftContent/PatientActivities.scss"></style>
