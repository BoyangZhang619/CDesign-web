<template>
  <div class="exercise-display-page">
    <AppHeader />
    
    <main class="exercise-display-main">
      <!-- 顶部装饰线 -->
      <div class="page-divider"></div>
      
      <!-- 页面标题区 -->
      <section class="exercise-title-section">
        <div class="title-container">
          <h1 class="exercise-title">运动打卡</h1>
          <p class="exercise-subtitle">记录每次运动，追踪健身进度</p>
          <div class="date-display">{{ formatDate(new Date()) }}</div>
        </div>
      </section>

      <!-- 新增打卡按钮区 -->
      <section class="exercise-add-section">
        <button class="add-record-btn" @click="openFormModal">
          <span class="add-icon">+</span>
          <span class="add-text">新增运动记录</span>
        </button>
      </section>

      <!-- 今天的记录列表 -->
      <section v-if="records.length > 0" class="exercise-records-section">
        <div class="section-title-bar">
          <h2 class="section-title">🏃 今日记录</h2>
          <span class="record-count">{{ records.length }}</span>
        </div>

        <div class="records-container">
          <div v-for="record in displayedRecords" :key="record.exercise_record_id" class="record-card">
            <div class="record-header">
              <div class="record-meta">
                <span class="activity-type-badge">{{ getActivityTypeText(record.activity_type) }}</span>
                <span class="record-duration">{{ record.duration_min }} 分钟</span>
                <span class="record-time">{{ formatTime(record.start_time) }} - {{ formatTime(record.end_time) }}</span>
              </div>
            </div>

            <div class="record-content">
              <div class="record-details">
                <div class="detail-item">
                  <span class="detail-label">强度</span>
                  <span class="intensity-badge" :class="`intensity-${record.intensity}`">
                    {{ getIntensityText(record.intensity) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">热量消耗</span>
                  <span v-if="isCalculating(record)" class="detail-value calculating">计算中...</span>
                  <span v-else class="detail-value">{{ formatCaloriesBurned(record.calories_burned) }}</span>
                </div>
              </div>
              
              <p v-if="record.note" class="record-note">{{ record.note }}</p>
            </div>
          </div>
        </div>

        <!-- 全部显示按钮 -->
        <div v-if="records.length > 2 && !showAllRecords" class="show-all-container">
          <button class="show-all-btn" @click="showAllRecords = true">
            查看全部 {{ records.length }} 条记录
          </button>
        </div>
        <div v-else-if="showAllRecords && records.length > 2" class="show-all-container">
          <button class="show-all-btn" @click="showAllRecords = false">
            收起
          </button>
        </div>
      </section>

      <!-- 今日统计 -->
      <section v-if="records.length > 0" class="exercise-summary-section">
        <div class="section-title-bar">
          <h2 class="section-title">今日汇总</h2>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">运动次数</div>
            <div class="summary-value">{{ todayStatistics.totalRecords }}</div>
            <div class="summary-unit">次</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总运动时长</div>
            <div class="summary-value">{{ todayStatistics.totalDuration }}</div>
            <div class="summary-unit">分钟</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">平均时长</div>
            <div class="summary-value">{{ todayStatistics.avgDuration }}</div>
            <div class="summary-unit">分钟</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">消耗热量</div>
            <div class="summary-value">{{ todayStatistics.totalCalories }}</div>
            <div class="summary-unit">kcal</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">低强度</div>
            <div class="summary-value">{{ todayStatistics.lowIntensity }}</div>
            <div class="summary-unit">次</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">中强度</div>
            <div class="summary-value">{{ todayStatistics.mediumIntensity }}</div>
            <div class="summary-unit">次</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">高强度</div>
            <div class="summary-value">{{ todayStatistics.highIntensity }}</div>
            <div class="summary-unit">次</div>
          </div>
        </div>
      </section>

      <!-- 空状态 -->
      <section v-else class="empty-state">
        <div class="empty-icon">🏋️</div>
        <h3 class="empty-title">暂无运动记录</h3>
        <p class="empty-text">开始记录你的运动吧</p>
      </section>

      <!-- 底部空白 -->
      <div class="exercise-footer"></div>
    </main>

    <!-- 添加记录浮窗 -->
    <transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeFormModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">新增运动记录</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="exercise-form">
            <!-- 运动类型选择 -->
            <div class="form-group">
              <label class="form-label">运动类型 *</label>
              <div class="button-group">
                <button
                  v-for="option in activityTypeOptions"
                  :key="option.value"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.activity_type === option.value }"
                  @click="form.activity_type = option.value as any"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 强度选择 -->
            <div class="form-group">
              <label class="form-label">强度 *</label>
              <div class="button-group">
                <button
                  v-for="option in intensityOptions"
                  :key="option.value"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.intensity === option.value }"
                  @click="form.intensity = option.value as any"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startTime" class="form-label">开始时间 *</label>
                <input id="startTime" v-model="form.start_time" type="datetime-local" class="form-input" required />
              </div>

              <div class="form-group">
                <label for="endTime" class="form-label">结束时间 *</label>
                <input id="endTime" v-model="form.end_time" type="datetime-local" class="form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="note" class="form-label">备注 (可选)</label>
                <textarea id="note" v-model="form.note" class="form-textarea"
                  placeholder="记录运动中的特殊情况" rows="3" maxlength="200"></textarea>
              </div>
            </div>

            <div v-if="errorMsg" class="error-box">
              {{ errorMsg }}
            </div>

            <div v-if="successMsg" class="success-box">
              {{ successMsg }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeFormModal">取消</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? '保存中...' : '保存记录' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useExerciseCheckin } from '../composables/useExerciseCheckin'

const isFormOpen = ref(false)
const showAllRecords = ref(false)

const {
  form,
  records,
  loading,
  errorMsg,
  successMsg,
  activityTypeOptions,
  intensityOptions,
  todayStatistics,
  addExerciseRecord,
  loadRecords,
  startPolling,
  stopPolling,
  formatCaloriesBurned,
  getActivityTypeText,
  getIntensityText,
  isCalculating
} = useExerciseCheckin()

// 计算显示的记录
const displayedRecords = computed(() => {
  if (showAllRecords.value) {
    return records.value
  }
  return records.value.slice(0, 2)
})

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${year}-${month}-${day} ${weekDay}`
}

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openFormModal = () => {
  isFormOpen.value = true
}

const closeFormModal = () => {
  isFormOpen.value = false
  errorMsg.value = ''
  successMsg.value = ''
}

const handleSubmit = async () => {
  await addExerciseRecord()
  if (!errorMsg.value) {
    closeFormModal()
  }
}

onMounted(() => {
  loadRecords()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  isFormOpen.value = false
})
</script>

<style scoped>
@import '@/css/checkin/ExerciseCheckinDisplay.css';
</style>
