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

<style scoped>
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-left: 4px solid #9DB4A0;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left-color: #5A7A87;
}

.record-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
}

.record-type-badge {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta {
  font-size: 12px;
  color: #8B9FA0;
  margin: 4px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-right {
  flex-shrink: 0;
  text-align: right;
}

.record-value {
  font-size: 13px;
  font-weight: 700;
  color: #5A7A87;
}

@media (max-width: 768px) {
  .record-item {
    padding: 12px;
  }

  .record-item-content {
    gap: 12px;
  }

  .record-type-badge {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }

  .record-title {
    font-size: 13px;
  }

  .record-meta {
    font-size: 11px;
  }

  .record-value {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .record-item {
    padding: 10px;
  }

  .record-left {
    gap: 10px;
  }

  .record-type-badge {
    font-size: 18px;
    width: 32px;
    height: 32px;
  }

  .record-title {
    font-size: 12px;
  }
}
</style>
