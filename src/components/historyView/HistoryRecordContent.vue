<template>
  <div class="record-detail-content">
    <!-- 饮食详情 -->
    <template v-if="record.type === 'meal'">
      <div class="detail-header">
        <span class="detail-type-badge meal">🍽️ 饮食记录</span>
      </div>
      <div class="detail-body">
        <h3 class="detail-title">{{ record.food_name }}</h3>
        <div class="detail-meta">
          <span>{{ record.meal_type }}</span>
          <span>·</span>
          <span>{{ record.food_source }}</span>
          <span>·</span>
          <span>{{ formatTime(record.meal_time) }}</span>
        </div>
        <p v-if="record.food_detail" class="detail-note">{{ record.food_detail }}</p>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="nutrition-label">热量</span>
            <span class="nutrition-value">{{ Math.round(parseFloat(String(record.calories))) }} 卡</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">蛋白质</span>
            <span class="nutrition-value">{{ record.protein_g }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">脂肪</span>
            <span class="nutrition-value">{{ record.fat_g }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">碳水</span>
            <span class="nutrition-value">{{ record.carbohydrate_g }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">纤维</span>
            <span class="nutrition-value">{{ record.fiber_g }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">糖分</span>
            <span class="nutrition-value">{{ record.sugar_g }}g</span>
          </div>
        </div>
        <button class="btn-delete" @click="$emit('delete', record.id)">删除记录</button>
      </div>
    </template>

    <!-- 运动详情 -->
    <template v-else-if="record.type === 'exercise'">
      <div class="detail-header">
        <span class="detail-type-badge exercise">💪 运动记录</span>
      </div>
      <div class="detail-body">
        <h3 class="detail-title">{{ record.activity_type }}</h3>
        <div class="detail-meta">
          <span>{{ record.duration_min }}分钟</span>
          <span>·</span>
          <span>{{ record.intensity }}强度</span>
          <span>·</span>
          <span>{{ formatTime(record.start_time) }} - {{ formatTime(record.end_time) }}</span>
        </div>
        <p v-if="record.note" class="detail-note">{{ record.note }}</p>
        <div class="exercise-stats">
          <div class="stat-item">
            <span class="stat-label">消耗卡路里</span>
            <span class="stat-value">{{ Math.round(parseFloat(String(record.calories_burned))) }} 卡</span>
          </div>
        </div>
        <div class="ai-section">
          <h4 class="section-title"> AI 建议</h4>
          <p class="section-content">{{ record.suggestion }}</p>
          <h4 class="section-title"> AI 评价</h4>
          <p class="section-content">{{ record.evaluation }}</p>
        </div>
        <button class="btn-delete" @click="$emit('delete', record.id)">删除记录</button>
      </div>
    </template>

    <!-- 睡眠详情 -->
    <template v-else-if="record.type === 'sleep'">
      <div class="detail-header">
        <span class="detail-type-badge sleep">😴 睡眠记录</span>
      </div>
      <div class="detail-body">
        <h3 class="detail-title">睡眠质量: {{ record.sleep_quality_score }}/100</h3>
        <div class="detail-meta">
          <span>{{ formatTime(record.sleep_start_time) }} 睡眠</span>
          <span>·</span>
          <span>{{ formatTime(record.wake_up_time) }} 起床</span>
        </div>
        <div class="sleep-stats">
          <div class="stat-item">
            <span class="stat-label">睡眠时长</span>
            <span class="stat-value">{{ Math.round(parseFloat(String(record.sleep_duration_hours))) }} 小时</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">中途醒来</span>
            <span class="stat-value">{{ record.wake_up_times }} 次</span>
          </div>
        </div>
        <div class="ai-section">
          <h4 class="section-title"> AI 建议</h4>
          <p class="section-content">{{ record.suggestion }}</p>
          <h4 class="section-title"> AI 评价</h4>
          <p class="section-content">{{ record.evaluation }}</p>
        </div>
        <button class="btn-delete" @click="$emit('delete', record.id)">删除记录</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { HistoryRecord } from '../../composables/useHistory'

defineProps({
  record: {
    type: Object as () => HistoryRecord,
    required: true
  }
})

defineEmits<{
  delete: [id: string | number]
}>()

const formatTime = (time: string) => {
  if (!time) return '—'
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.record-detail-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.detail-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #E8E1D6;
}

.detail-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.detail-type-badge.meal {
  background: #FFE8D6;
  color: #C8704C;
}

.detail-type-badge.exercise {
  background: #D4E8D8;
  color: #5A7A87;
}

.detail-type-badge.sleep {
  background: #E8D4F0;
  color: #8B5A8A;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
}

.detail-meta {
  font-size: 12px;
  color: #8B9FA0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-note {
  font-size: 13px;
  color: #8B9FA0;
  line-height: 1.5;
  background: #F8F6F3;
  padding: 12px;
  border-radius: 8px;
  margin: 0;
}

.nutrition-grid,
.exercise-stats,
.sleep-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #F8F6F3;
  padding: 12px;
  border-radius: 8px;
}

.nutrition-item,
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nutrition-label,
.stat-label {
  font-size: 11px;
  color: #8B9FA0;
  font-weight: 600;
}

.nutrition-value,
.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #F8F6F3 0%, #F0EBE3 100%);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #9DB4A0;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
}

.section-content {
  font-size: 12px;
  color: #8B9FA0;
  line-height: 1.5;
  margin: 0;
}

.btn-delete {
  padding: 10px;
  background: linear-gradient(135deg, #D4A5A8 0%, #C89397 100%);
  color: #FEFCFA;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 168, 0.3);
}
</style>
