<template>
  <div class="records-list">
    <div 
      v-for="record in records" 
      :key="record.id" 
      class="record-item"
      @click="$emit('select', record)"
    >
      <!-- 饮食记录块 -->
      <template v-if="record.type === 'meal'">
        <div class="record-item-content">
          <div class="record-left">
            <span class="record-type-badge meal">🍽️</span>
            <div class="record-info">
              <h4 class="record-title">{{ record.food_name }}</h4>
              <p class="record-meta">{{ formatTime(record.meal_time) }}</p>
            </div>
          </div>
          <div class="record-right">
            <span class="record-value">{{ Math.round(parseFloat(String(record.calories))) }} 卡</span>
          </div>
        </div>
      </template>

      <!-- 运动记录块 -->
      <template v-else-if="record.type === 'exercise'">
        <div class="record-item-content">
          <div class="record-left">
            <span class="record-type-badge exercise">💪</span>
            <div class="record-info">
              <h4 class="record-title">{{ record.activity_type }}</h4>
              <p class="record-meta">{{ record.duration_min }}分钟 · {{ record.intensity }}</p>
            </div>
          </div>
          <div class="record-right">
            <span class="record-value">{{ Math.round(parseFloat(String(record.calories_burned))) }} 卡</span>
          </div>
        </div>
      </template>

      <!-- 睡眠记录块 -->
      <template v-else-if="record.type === 'sleep'">
        <div class="record-item-content">
          <div class="record-left">
            <span class="record-type-badge sleep">😴</span>
            <div class="record-info">
              <h4 class="record-title">睡眠时间</h4>
              <p class="record-meta">{{ Math.round(parseFloat(String(record.sleep_duration_hours))) }} 小时 · {{ formatTime(record.sleep_start_time) }} - {{ formatTime(record.wake_up_time) }}</p>
            </div>
          </div>
          <div class="record-right">
            <span class="record-value">⭐ {{ record.sleep_quality_score }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '../../utils/dateTime'
import type { HistoryRecord } from '../../composables/useHistory'

defineProps({
  records: {
    type: Array as () => HistoryRecord[],
    required: true
  }
})

defineEmits<{
  select: [record: HistoryRecord]
}>()
</script>

<style lang="scss" scoped src="@/scss/components/historyView/HistoryRecordsList.scss"></style>
