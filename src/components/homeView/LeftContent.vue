<template>
  <div class="left-content">
    <CheckConditionCard :visible="!hasData" />
    <HealthStats :health-data="healthData" />
    <PatientActivities />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckConditionCard from './LeftContent/CheckConditionCard.vue'
import HealthStats from './LeftContent/HealthStats.vue'
import PatientActivities from './LeftContent/PatientActivities.vue'
import { type HealthData } from '../../composables/useHealthData'

const props = defineProps<{
  healthData?: HealthData
}>()

// 判断是否有完整数据
const hasData = computed(() => {
  return !!(
    props.healthData?.gender ||
    props.healthData?.birthday ||
    props.healthData?.height ||
    props.healthData?.currentWeight ||
    props.healthData?.targetWeight
  )
})
</script>

<style scoped>
.left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
