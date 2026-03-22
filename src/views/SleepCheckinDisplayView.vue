<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="sleep-wrapper">
        <!-- 页面头部 -->
        <div class="page-header">
          <h1 class="page-title">睡眠打卡</h1>
          <p class="page-subtitle">记录每天的睡眠情况，AI智能分析睡眠质量</p>
        </div>

        <!-- 新增打卡表单 -->
        <section class="form-section" :class="{ 'collapsed': !isFormExpanded }">
          <div class="section-header" @click="toggleFormExpand" style="cursor: pointer;">
            <span class="section-number">01</span>
            <h2 class="section-title">新增睡眠记录</h2>
            <span class="expand-icon">{{ isFormExpanded ? '▼' : '▶' }}</span>
          </div>

          <form v-show="isFormExpanded" @submit.prevent="handleSubmit" class="sleep-form">
            <div class="form-row">
              <div class="form-group">
                <label for="sleepStart" class="form-label">入睡时间 *</label>
                <input
                  id="sleepStart"
                  v-model="form.sleep_start_time"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="wakeUp" class="form-label">起床时间 *</label>
                <input
                  id="wakeUp"
                  v-model="form.wake_up_time"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="napType" class="form-label">睡眠类型</label>
                <select v-model.number="form.is_nap" class="form-input">
                  <option v-for="option in napTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="wakeUpTimes" class="form-label">苏醒次数</label>
                <input
                  id="wakeUpTimes"
                  v-model.number="form.wake_up_times"
                  type="number"
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="sleepFeel" class="form-label">睡眠感受</label>
                <textarea
                  id="sleepFeel"
                  v-model="form.sleep_feeling"
                  class="form-textarea"
                  placeholder="描述你的睡眠感受，例如：睡眠质量不错，但有点累"
                  rows="3"
                ></textarea>
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

        <!-- 今天的记录列表 -->
        <section v-if="records.length > 0" class="records-section" :class="{ 'collapsed': !isRecordsExpanded }">
          <div class="section-header" @click="toggleRecordsExpand" style="cursor: pointer;">
            <span class="section-number">02</span>
            <h2 class="section-title">今天的睡眠记录</h2>
            <span class="expand-icon">{{ isRecordsExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-show="isRecordsExpanded" class="records-list">
            <div v-for="record in records" :key="record.id" class="record-card">
              <div class="record-header">
                <div class="record-meta">
                  <span class="sleep-type-badge">{{ getNapTypeText(record.is_nap) }}</span>
                  <span class="sleep-duration">{{ formatSleepDuration(record.sleep_duration_hours) }}</span>
                  <span class="record-time">{{ formatTime(record.sleep_start_time) }} - {{ formatTime(record.wake_up_time) }}</span>
                </div>
              </div>

              <div class="record-content">
                <p v-if="record.sleep_feeling" class="sleep-feeling">{{ record.sleep_feeling }}</p>

                <div class="sleep-details">
                  <div class="detail-item">
                    <span class="detail-label">苏醒次数</span>
                    <span class="detail-value">{{ record.wake_up_times }}</span>
                    <span class="detail-unit">次</span>
                  </div>
                </div>
              </div>

              <div class="quality-info">
                <div v-if="isCalculating(record)" class="calculating">
                  <span class="spinner"></span>
                  分析中...
                </div>
                <div v-else class="quality-content">
                  <div class="quality-score">
                    <span class="score-label">睡眠质量</span>
                    <span class="score-value">{{ record.sleep_quality_score }}</span>
                    <span class="score-unit">分</span>
                  </div>
                  <div class="quality-text">
                    <p v-if="record.suggestion" class="suggestion">
                      <strong>建议：</strong>{{ record.suggestion }}
                    </p>
                    <p v-if="record.evaluation" class="evaluation">
                      <strong>评价：</strong>{{ record.evaluation }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="record-actions">
                <RouterLink :to="{ name: 'SleepCheckinEdit', params: { recordId: record.id } }" class="btn-edit">
                  编辑
                </RouterLink>
                <button @click="handleDelete(record.id)" class="btn-delete">删除</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 今日统计 -->
        <section v-if="records.length > 0" class="summary-section" :class="{ 'collapsed': !isSummaryExpanded }">
          <div class="section-header" @click="toggleSummaryExpand" style="cursor: pointer;">
            <span class="section-number">03</span>
            <h2 class="section-title">今日统计</h2>
            <span class="expand-icon">{{ isSummaryExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-show="isSummaryExpanded" class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">总记录数</div>
              <div class="summary-value">{{ todayStatistics.totalRecords }}</div>
              <div class="summary-unit">条</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">夜间睡眠</div>
              <div class="summary-value">{{ todayStatistics.nightSleepCount }}</div>
              <div class="summary-unit">次</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">午睡次数</div>
              <div class="summary-value">{{ todayStatistics.napCount }}</div>
              <div class="summary-unit">次</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">夜间总时长</div>
              <div class="summary-value">{{ formatSleepDuration(todayStatistics.totalNightHours) }}</div>
              <div class="summary-unit">—</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">午睡总时长</div>
              <div class="summary-value">{{ formatSleepDuration(todayStatistics.totalNapHours) }}</div>
              <div class="summary-unit">—</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">平均质量分</div>
              <div class="summary-value">{{ todayStatistics.avgQualityScore }}</div>
              <div class="summary-unit">分</div>
            </div>
          </div>
        </section>

        <!-- 空状态 -->
        <section v-else class="empty-state">
          <div class="empty-icon">—</div>
          <h3 class="empty-title">暂无睡眠记录</h3>
          <p class="empty-text">立即添加第一条睡眠记录吧</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useSleepCheckin } from '../composables/useSleepCheckin'

const isFormExpanded = ref(false)
const isRecordsExpanded = ref(false)
const isSummaryExpanded = ref(false)

const {
  form,
  records,
  loading,
  errorMsg,
  successMsg,
  napTypeOptions,
  todayStatistics,
  initializeForm,
  addSleepRecord,
  loadRecords,
  deleteSleepRecord,
  startPolling,
  stopPolling,
  formatSleepDuration,
  getNapTypeText,
  isCalculating
} = useSleepCheckin()

const formatTime = (timeStr: string) => {
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

const handleSubmit = async () => {
  await addSleepRecord()
  // 上传成功后自动缩回
  if (!errorMsg.value) {
    isFormExpanded.value = false
  }
}

const handleDelete = async (recordId: string) => {
  await deleteSleepRecord(recordId)
}

onMounted(() => {
  initializeForm()
  loadRecords()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  isFormExpanded.value = false
  isRecordsExpanded.value = false
  isSummaryExpanded.value = false
})
</script>

<style scoped>
@import '@/css/checkin/SleepCheckinDisplay.css';
</style>
