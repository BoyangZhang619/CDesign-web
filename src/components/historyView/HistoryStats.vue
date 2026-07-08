<template>
  <div class="stats-container">
    <!-- 打卡类型统计 -->
    <div class="type-stats-container">
      <h3 class="stats-title">打卡类型统计</h3>
      <div class="type-stats-grid">
        <div class="type-stat">
          <span class="type-label">🏃 运动</span>
          <span class="type-count">0</span>
        </div>
        <div class="type-stat">
          <span class="type-label">🍽️ 饮食</span>
          <span class="type-count">0</span>
        </div>
        <div class="type-stat">
          <span class="type-label">💤 睡眠</span>
          <span class="type-count">0</span>
        </div>
        <div class="type-stat">
          <span class="type-label">📝 其他</span>
          <span class="type-count">0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style lang="scss" scoped src="@/scss/components/historyView/HistoryStats.scss"></style>
