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
            <h4 class="section-title"> AI 建议</h4>
            <p class="section-content">{{ record.suggestion }}</p>
            <h4 class="section-title"> AI 评价</h4>
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
            <h4 class="section-title"> AI 建议</h4>
            <p class="section-content">{{ record.suggestion }}</p>
            <h4 class="section-title"> AI 评价</h4>
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

<style lang="scss" scoped src="@/scss/components/historyView/HistoryRecordDetail.scss"></style>
