<template>
  <div class="right-content">
    <AppointmentsSection />
    <DailyProgress />
  </div>
</template>

<script setup lang="ts">
import AppointmentsSection from './RightContent/AppointmentsSection.vue'
import DailyProgress from './RightContent/DailyProgress.vue'
</script>

<style scoped>
.right-content {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
