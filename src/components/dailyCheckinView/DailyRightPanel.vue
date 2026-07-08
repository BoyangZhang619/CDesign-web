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
      <!-- <div class="special-card trends-card">
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
      </div> -->

      <!-- 历史记录卡片 -->
      <!-- <div class="special-card history-card">
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
      </div> -->

      <!-- AI分析卡片 -->
      <!-- <div class="special-card ai-card">
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
      </div> -->
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

<style lang="scss" scoped src="@/scss/components/dailyCheckinView/DailyRightPanel.scss"></style>
