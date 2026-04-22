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

<style scoped>
.stats-container {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.type-stats-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-title {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
}

.type-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-stat {
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border: 1px solid #E8E1D6;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 70px;
  transition: all 0.2s ease;
}

.type-stat:hover {
  background: linear-gradient(135deg, #F8F6F3 0%, #FEFCFA 100%);
  border-color: #9DB4A0;
  box-shadow: 0 2px 8px rgba(157, 180, 160, 0.15);
}

.type-label {
  font-size: 12px;
  color: #8B9FA0;
  font-weight: 600;
}

.type-count {
  font-size: 18px;
  font-weight: 700;
  color: #5A7A87;
}

@media (max-width: 768px) {
  .stats-container {
    padding: 12px;
    margin-bottom: 12px;
  }

  .stats-title {
    font-size: 13px;
  }

  .type-stats-grid {
    gap: 8px;
  }

  .type-stat {
    padding: 8px 12px;
    min-width: 60px;
  }

  .type-count {
    font-size: 16px;
  }
}
</style>
