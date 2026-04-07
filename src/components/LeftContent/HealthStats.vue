<template>
  <section class="health-stats">
    <div class="stat-item">
      <div class="stat-icon">📊</div>
      <div class="stat-text">
        <p class="stat-label">Health Status</p>
        <p class="stat-value">Good</p>
      </div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-icon">✓</div>
      <div class="stat-text">
        <p class="stat-label">Status</p>
        <p class="stat-value">Completed</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.health-stats {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.stat-icon {
  font-size: 28px;
  background: #f0f7f0;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: #ecf0f1;
}
</style>
