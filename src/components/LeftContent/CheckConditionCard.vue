<template>
  <section class="check-condition-card">
    <h3 class="card-title">Check your condition</h3>
    <p class="card-subtitle">Check your every situation and your activities</p>
    <button class="check-btn">Check It Now</button>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.check-condition-card {
  background: linear-gradient(135deg, #a8d5ba 0%, #7ec8a3 100%);
  border-radius: 16px;
  padding: 30px;
  color: white;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.card-subtitle {
  font-size: 14px;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.check-btn {
  background: white;
  color: #7ec8a3;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.check-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
