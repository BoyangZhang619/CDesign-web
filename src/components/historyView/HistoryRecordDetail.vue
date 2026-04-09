<template>
  <div class="record-detail-overlay" @click="$emit('close')">
    <div class="record-detail-modal" @click.stop>
      <!-- 饮食详情 -->
      <template v-if="record.type === 'meal'">
        <div class="modal-header">
          <span class="modal-type-badge meal">🍽️ 饮食记录</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-content">
          <h3 class="modal-title">{{ record.food_name }}</h3>
          <div class="modal-meta">
            <span>{{ record.meal_type }}</span>
            <span>·</span>
            <span>{{ record.food_source }}</span>
            <span>·</span>
            <span>{{ formatTime(record.meal_time) }}</span>
          </div>
          <p v-if="record.food_detail" class="modal-note">{{ record.food_detail }}</p>
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
        </div>
      </template>

      <!-- 运动详情 -->
      <template v-else-if="record.type === 'exercise'">
        <div class="modal-header">
          <span class="modal-type-badge exercise">💪 运动记录</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-content">
          <h3 class="modal-title">{{ record.activity_type }}</h3>
          <div class="modal-meta">
            <span>{{ record.duration_min }}分钟</span>
            <span>·</span>
            <span>{{ record.intensity }}强度</span>
            <span>·</span>
            <span>{{ formatTime(record.start_time) }} - {{ formatTime(record.end_time) }}</span>
          </div>
          <p v-if="record.note" class="modal-note">{{ record.note }}</p>
          <div class="exercise-stats">
            <div class="stat-item">
              <span class="stat-label">消耗卡路里</span>
              <span class="stat-value">{{ Math.round(parseFloat(String(record.calories_burned))) }} 卡</span>
            </div>
          </div>
          <div class="ai-section">
            <h4 class="section-title">🤖 AI 建议</h4>
            <p class="section-content">{{ record.suggestion }}</p>
            <h4 class="section-title">📊 AI 评价</h4>
            <p class="section-content">{{ record.evaluation }}</p>
          </div>
        </div>
      </template>

      <!-- 睡眠详情 -->
      <template v-else-if="record.type === 'sleep'">
        <div class="modal-header">
          <span class="modal-type-badge sleep">😴 睡眠记录</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-content">
          <h3 class="modal-title">睡眠质量: {{ record.sleep_quality_score }}/100</h3>
          <div class="modal-meta">
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
          <p v-if="record.sleep_feeling" class="modal-note">{{ record.sleep_feeling }}</p>
          <div class="ai-section">
            <h4 class="section-title">🤖 AI 建议</h4>
            <p class="section-content">{{ record.suggestion }}</p>
            <h4 class="section-title">📊 AI 评价</h4>
            <p class="section-content">{{ record.evaluation }}</p>
          </div>
        </div>
      </template>

      <div class="modal-footer">
        <button class="btn-delete" @click="$emit('delete', record.id)">删除记录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '../../utils/dateTime'
import type { HistoryRecord } from '../../composables/useHistory'

defineProps({
  record: {
    type: Object as () => HistoryRecord,
    required: true
  }
})

defineEmits<{
  close: []
  delete: [id: string | number]
}>()
</script>

<style scoped>
.record-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.record-detail-modal {
  background: #FEFCFA;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E1D9D0;
  background: linear-gradient(135deg, #F8F6F3 0%, #FEFCFA 100%);
}

.modal-type-badge {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8B9FA0;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #5A7A87;
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
}

.modal-meta {
  font-size: 12px;
  color: #8B9FA0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-note {
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
  padding: 15px;
  border-radius: 8px;
}

.sleep-stats {
  grid-template-columns: repeat(2, 1fr);
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
  gap: 10px;
  background: linear-gradient(135deg, #F8F6F3 0%, #F0EBE3 100%);
  padding: 15px;
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

.modal-footer {
  padding: 20px;
  border-top: 1px solid #E1D9D0;
  background: linear-gradient(135deg, #F8F6F3 0%, #FEFCFA 100%);
  display: flex;
  gap: 12px;
}

.btn-delete {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #D4A5A8 0%, #C89397 100%);
  color: #FEFCFA;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 168, 0.3);
}

@media (max-width: 480px) {
  .record-detail-modal {
    width: 95vw;
    max-height: 90vh;
  }

  .modal-content {
    padding: 15px;
  }

  .nutrition-grid,
  .exercise-stats,
  .sleep-stats {
    grid-template-columns: 1fr;
  }
}
</style>
