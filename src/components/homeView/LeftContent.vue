<template>
  <div class="left-content">
    <!-- Check Your Condition Card -->
    <CheckConditionCard />

    <!-- Health Stats -->
    <HealthStats />

    <!-- Patient Activities -->
    <PatientActivities />
  </div>
</template>

<script setup lang="ts">
import CheckConditionCard from './LeftContent/CheckConditionCard.vue'
import HealthStats from './LeftContent/HealthStats.vue'
import PatientActivities from './LeftContent/PatientActivities.vue'
</script>

<style scoped>
.left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
