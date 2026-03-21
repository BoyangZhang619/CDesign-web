<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="exercise-wrapper">
        <div class="page-header">
          <h1 class="page-title">运动打卡</h1>
          <p class="page-subtitle">记录每一次运动</p>
        </div>

        <!-- 新增运动记录 -->
        <section
          :class="['form-section', { 'collapsed': !isFormExpanded }]"
          @click="toggleFormExpand"
        >
          <div class="section-header">
            <span class="section-number">01</span>
            <h2 class="section-title">新增运动记录</h2>
            <span class="expand-icon">{{ isFormExpanded ? '▼' : '▶' }}</span>
          </div>

          <form v-if="isFormExpanded" @submit.prevent="handleAddRecord" class="exercise-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">运动类型</label>
                <select v-model="form.activity_type" class="form-input">
                  <option v-for="option in activityTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">强度</label>
                <select v-model="form.intensity" class="form-input">
                  <option v-for="option in intensityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startTime" class="form-label">开始时间</label>
                <input
                  id="startTime"
                  v-model="form.start_time"
                  type="datetime-local"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="endTime" class="form-label">结束时间</label>
                <input
                  id="endTime"
                  v-model="form.end_time"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="duration" class="form-label">运动时长（分钟）</label>
                <input
                  id="duration"
                  v-model.number="form.duration_min"
                  type="number"
                  class="form-input"
                  min="1"
                  max="1440"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="note" class="form-label">备注</label>
                <textarea
                  id="note"
                  v-model="form.note"
                  class="form-textarea"
                  rows="3"
                  placeholder="可选，记录运动中的特殊情况"
                ></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group checkbox">
                <input
                  id="aiRecognition"
                  v-model="form.ai_recognition_flag"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="aiRecognition" class="checkbox-label">启用 AI 辅助分析</label>
              </div>
            </div>

            <div v-if="errorMsg" class="error-box">
              {{ errorMsg }}
            </div>

            <div v-if="successMsg" class="success-box">
              {{ successMsg }}
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? '保存中...' : '保存记录' }}
              </button>
            </div>
          </form>
        </section>

        <!-- 运动记录 -->
        <section
          :class="['records-section', { 'collapsed': !isRecordsExpanded }]"
          @click="toggleRecordsExpand"
        >
          <div class="section-header">
            <span class="section-number">02</span>
            <h2 class="section-title">运动记录</h2>
            <span class="expand-icon">{{ isRecordsExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-if="isRecordsExpanded" class="records-list">
            <div v-if="records.length === 0" class="empty-state">
              <div class="empty-icon">—</div>
              <p class="empty-text">暂无运动记录</p>
            </div>

            <div v-for="record in records" :key="record.id" class="record-card">
              <div class="record-header">
                <div class="record-main">
                  <h3 class="activity-type">{{ getActivityTypeText(record.activity_type) }}</h3>
                  <p class="record-time">{{ formatTime(record.start_time) }} - {{ formatTime(record.end_time) }}</p>
                </div>
                <div class="record-actions">
                  <router-link
                    :to="`/exercise/checkin-edit?id=${record.id}`"
                    class="btn-edit"
                    title="编辑"
                  >
                    编辑
                  </router-link>
                  <button
                    class="btn-delete"
                    @click="deleteExerciseRecord(record.id)"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div class="record-details">
                <div class="detail-row">
                  <span class="detail-label">运动时长</span>
                  <span class="detail-value">{{ record.duration_min }} 分钟</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">强度</span>
                  <span class="detail-badge" :class="`intensity-${record.intensity}`">
                    {{ getIntensityText(record.intensity) }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">热量消耗</span>
                  <span v-if="isCalculating(record)" class="detail-value calculating">计算中</span>
                  <span v-else class="detail-value">{{ formatCaloriesBurned(record.calories_burned) }}</span>
                </div>
                <div v-if="record.note" class="detail-row">
                  <span class="detail-label">备注</span>
                  <span class="detail-value">{{ record.note }}</span>
                </div>
              </div>

              <div v-if="record.suggestion || record.evaluation" class="record-ai">
                <div v-if="record.suggestion" class="ai-item">
                  <h4 class="ai-title">建议</h4>
                  <p class="ai-content">{{ record.suggestion }}</p>
                </div>
                <div v-if="record.evaluation" class="ai-item">
                  <h4 class="ai-title">评价</h4>
                  <p class="ai-content">{{ record.evaluation }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 统计摘要 -->
        <section
          :class="['summary-section', { 'collapsed': !isSummaryExpanded }]"
          @click="toggleSummaryExpand"
        >
          <div class="section-header">
            <span class="section-number">03</span>
            <h2 class="section-title">今日统计</h2>
            <span class="expand-icon">{{ isSummaryExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-if="isSummaryExpanded" class="summary-grid">
            <div class="summary-card">
              <div class="summary-value">{{ todayStatistics.totalRecords }}</div>
              <div class="summary-label">运动次数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ todayStatistics.totalDuration }}</div>
              <div class="summary-label">总时长 (分钟)</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ todayStatistics.avgDuration }}</div>
              <div class="summary-label">平均时长 (分钟)</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ todayStatistics.totalCalories }}</div>
              <div class="summary-label">消耗热量 (kcal)</div>
            </div>

            <div class="summary-card intensity-breakdown">
              <div class="breakdown-title">强度分布</div>
              <div class="breakdown-items">
                <div class="breakdown-item">
                  <span class="breakdown-label">低强度</span>
                  <span class="breakdown-count">{{ todayStatistics.lowIntensity }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">中强度</span>
                  <span class="breakdown-count">{{ todayStatistics.mediumIntensity }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">高强度</span>
                  <span class="breakdown-count">{{ todayStatistics.highIntensity }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useExerciseCheckin } from '../composables/useExerciseCheckin'

const {
  form,
  records,
  loading,
  errorMsg,
  successMsg,
  activityTypeOptions,
  intensityOptions,
  todayStatistics,
  initializeForm,
  addExerciseRecord,
  loadRecords,
  deleteExerciseRecord,
  stopPolling,
  formatCaloriesBurned,
  getActivityTypeText,
  getIntensityText,
  isCalculating
} = useExerciseCheckin()

const isFormExpanded = ref(false)
const isRecordsExpanded = ref(false)
const isSummaryExpanded = ref(false)

const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleFormExpand = () => {
  isFormExpanded.value = !isFormExpanded.value
}

const toggleRecordsExpand = () => {
  isRecordsExpanded.value = !isRecordsExpanded.value
}

const toggleSummaryExpand = () => {
  isSummaryExpanded.value = !isSummaryExpanded.value
}

const handleAddRecord = async () => {
  await addExerciseRecord()
  if (successMsg.value && !errorMsg.value) {
    isFormExpanded.value = false
  }
}

onMounted(() => {
  initializeForm()
  loadRecords()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
@import '../css/ExerciseCheckinDisplay.css';
</style>
