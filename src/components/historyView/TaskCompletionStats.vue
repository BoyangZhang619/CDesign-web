<template>
  <div class="stats-container">
    <div class="stats-grid">
      <!-- 总完成数 -->
      <div class="stat-card">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <div class="stat-label">总完成数</div>
          <div class="stat-value">{{ stats.total_completed || 0 }}</div>
        </div>
      </div>

      <!-- 有完成的天数 -->
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-label">完成天数</div>
          <div class="stat-value">{{ stats.days_with_completion || 0 }}</div>
        </div>
      </div>

      <!-- 准时完成 -->
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-label">准时完成</div>
          <div class="stat-value">{{ stats.on_time_count || 0 }}</div>
        </div>
      </div>

      <!-- 迟到完成 -->
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">迟到完成</div>
          <div class="stat-value">{{ stats.late_count || 0 }}</div>
        </div>
      </div>

      <!-- 提前完成 -->
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-label">提前完成</div>
          <div class="stat-value">{{ stats.early_count || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 任务类型统计 -->
    <div class="type-stats-container">
      <h3 class="stats-title">任务类型统计</h3>
      <div class="type-stats-grid">
        <div v-if="stats.exercise_count !== undefined" class="type-stat">
          <span class="type-label">运动</span>
          <span class="type-count">{{ stats.exercise_count }}</span>
        </div>
        <div v-if="stats.meal_count !== undefined" class="type-stat">
          <span class="type-label">饮食</span>
          <span class="type-count">{{ stats.meal_count }}</span>
        </div>
        <div v-if="stats.sleep_count !== undefined" class="type-stat">
          <span class="type-label">睡眠</span>
          <span class="type-count">{{ stats.sleep_count }}</span>
        </div>
        <div v-if="stats.custom_count !== undefined" class="type-stat">
          <span class="type-label">自定义</span>
          <span class="type-count">{{ stats.custom_count }}</span>
        </div>
        <div v-if="stats.ai_suggested_count !== undefined" class="type-stat">
          <span class="type-label">AI建议</span>
          <span class="type-count">{{ stats.ai_suggested_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskCompletionStats } from '../../composables/useTaskCompletionHistory'

defineProps({
  stats: {
    type: Object as () => TaskCompletionStats,
    required: true
  }
})
</script>

<style scoped>
.stats-container {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FEFCFA 100%);
  border: 1px solid #E1D9D0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #C8B4A0;
  background: linear-gradient(135deg, #FFFBF7 0%, #FEFCFA 100%);
  box-shadow: 0 4px 12px rgba(200, 180, 160, 0.15);
}

.stat-icon {
  font-size: 24px;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #4A4A4A;
}

.type-stats-container {
  border-top: 1px solid #E8E1D6;
  padding-top: 20px;
}

.stats-title {
  font-size: 14px;
  font-weight: 600;
  color: #4A4A4A;
  margin-bottom: 12px;
}

.type-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.type-stat {
  background: linear-gradient(135deg, #F5E6D3 0%, #EDD9CC 100%);
  border: 1px solid #DCC9B8;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.type-stat:hover {
  background: linear-gradient(135deg, #EDD9CC 0%, #E5CCC0 100%);
  box-shadow: 0 2px 8px rgba(200, 180, 160, 0.15);
}

.type-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.type-count {
  font-size: 18px;
  font-weight: 700;
  color: #8B6F47;
}
</style>
