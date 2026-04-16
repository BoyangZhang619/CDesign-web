<template>
  <div class="daily-right-panel">
    <div class="checkin-cards-grid">
      <CheckinTypeCard
        icon="🏃"
        title="运动"
        :status="exerciseStatus"
        :data="exerciseData"
        detail-link="/exercise/checkin"
        :metrics="[
          { key: 'duration', label: '时长', unit: 'min', formatter: (v) => v || '-' },
          { key: 'calories', label: '消耗', unit: 'kcal', formatter: (v) => Math.round(v) || '-' }
        ]"
      />
      
      <CheckinTypeCard
        icon="🍽️"
        title="饮食"
        :status="mealStatus"
        :data="mealData"
        detail-link="/meal/checkin"
        :metrics="[
          { key: 'calories', label: '热量', unit: 'kcal', formatter: (v) => Math.round(v) || '-' },
          { key: 'protein', label: '蛋白', unit: 'g', formatter: (v) => (v || 0).toFixed(1) }
        ]"
      />
      
      <CheckinTypeCard
        icon="😴"
        title="睡眠"
        :status="sleepStatus"
        :data="sleepData"
        detail-link="/sleep/checkin"
        :metrics="[
          { key: 'duration', label: '时长', unit: 'h', formatter: (v) => (v || 0).toFixed(1) },
          { key: 'quality', label: '质量', unit: '分', formatter: (v) => v || '-' }
        ]"
      />

      <!-- 健康趋势卡片 -->
      <div class="special-card trends-card">
        <div class="card-header">
          <img src="/noun-sidebar-trend.svg" alt="趋势分析" class="grid-svg"/>
          <h2 class="card-title">趋势分析</h2>
        </div>
        <div class="card-content">
          <div class="trends-preview">
            <p class="trends-text">查看您的健康数据变化趋势</p>
            <div class="trends-indicators">
              <div class="indicator">
                <span class="indicator-label">周趋势</span>
                <span class="indicator-value">↗</span>
              </div>
              <div class="indicator">
                <span class="indicator-label">月趋势</span>
                <span class="indicator-value">→</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <router-link to="/analysis/trends" class="card-link">
            <span>查看趋势</span>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>

      <!-- 历史记录卡片 -->
      <div class="special-card history-card">
        <div class="card-header">
          <img src="/noun-sidebar-history.svg" alt="历史记录" class="grid-svg"/>
          <h2 class="card-title">历史记录</h2>
        </div>
        <div class="card-content">
          <div class="history-preview">
            <p class="history-text">回顾之前的健康打卡记录</p>
            <div class="history-stats">
              <div class="history-stat">
                <span class="stat-number">{{ totalRecords }}</span>
                <span class="stat-desc">条记录</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <router-link to="/health/history" class="card-link">
            <span>查看历史</span>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>

      <!-- AI分析卡片 -->
      <div class="special-card ai-card">
        <div class="card-header">
          <img src="/noun-sidebar-ai.svg" alt="AI分析" class="grid-svg" style="transform: scale(1.5);"/>
          <h2 class="card-title">AI分析</h2>
        </div>
        <div class="card-content">
          <div class="ai-preview">
            <p class="ai-text">获取您的个性化健康建议</p>
            <div class="ai-badge">智能分析中</div>
          </div>
        </div>
        <div class="card-footer">
          <router-link to="/ai-chat" class="card-link">
            <span>咨询AI</span>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckinTypeCard from './CheckinTypeCard.vue'

interface Props {
  exerciseStatus: 'completed' | 'pending' | 'none'
  exerciseData?: Record<string, any>
  mealStatus: 'completed' | 'pending' | 'none'
  mealData?: Record<string, any>
  sleepStatus: 'completed' | 'pending' | 'none'
  sleepData?: Record<string, any>
  totalRecords: number
}

withDefaults(defineProps<Props>(), {
  exerciseStatus: 'none',
  mealStatus: 'none',
  sleepStatus: 'none',
  totalRecords: 0
})
</script>

<style scoped>
.daily-right-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}

.checkin-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  flex: 1;
}

.special-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 250px;
}

.special-card:hover {
  border-color: #5A7A87;
  box-shadow: 0 4px 12px rgba(90, 122, 135, 0.2);
  transform: translateY(-2px);
}

/* .special-card.trends-card {
  border-color: #9c27b0;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0.02) 100%);
}

.special-card.trends-card:hover {
  border-color: #9c27b0;
}
  
.special-card.history-card {
  border-color: #2196f3;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%);
}

.special-card.history-card:hover {
  border-color: #2196f3;
}

.special-card.ai-card {
  border-color: #ff9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%);
}

.special-card.ai-card:hover {
  border-color: #ff9800;
} */

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.grid-svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.card-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.card-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.trends-preview,
.history-preview,
.ai-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: center;
}

.trends-text,
.history-text,
.ai-text {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.trends-indicators {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  flex: 1;
}

.indicator-label {
  font-size: 11px;
  color: #999;
  font-weight: 500;
}

.indicator-value {
  font-size: 16px;
  font-weight: 700;
  color: #9c27b0;
}

.history-stats {
  display: flex;
  justify-content: center;
}

.history-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2196f3;
}

.stat-desc {
  font-size: 12px;
  color: #999;
}

.ai-badge {
  display: inline-flex;
  padding: 8px 16px;
  background: #ffe0b2;
  color: #e65100;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin: 0 auto;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.card-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5A7A87;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.card-link:hover {
  color: #2c3e50;
  gap: 12px;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.card-link:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .checkin-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
