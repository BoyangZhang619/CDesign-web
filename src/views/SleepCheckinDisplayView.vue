<template>
  <div class="sleep-display-page">
    <AppHeader />
    
    <main class="sleep-display-main">
      <!-- 顶部装饰线 -->
      <div class="page-divider"></div>
      
      <!-- 页面标题区 -->
      <section class="sleep-title-section">
        <div class="title-container">
          <h1 class="sleep-title">睡眠打卡</h1>
          <p class="sleep-subtitle">记录每天的睡眠情况，AI智能分析睡眠质量</p>
          <div class="date-display">{{ formatDate(new Date()) }}</div>
        </div>
      </section>

      <!-- 新增打卡按钮区 -->
      <section class="sleep-add-section">
        <button class="add-record-btn" @click="openFormModal">
          <span class="add-icon">+</span>
          <span class="add-text">新增睡眠记录</span>
        </button>
      </section>

      <!-- 今天的记录列表 -->
      <section v-if="records.length > 0" class="sleep-records-section">
        <div class="section-title-bar">
          <h2 class="section-title">🌙 今日记录</h2>
          <span class="record-count">{{ records.length }}</span>
        </div>

        <div class="records-container">
          <div v-for="record in displayedRecords" :key="record.id" class="record-card">
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
              <div v-else class="quality-grid">
                <div class="quality-item">
                  <span class="quality-label">睡眠质量</span>
                  <span class="quality-value">{{ record.sleep_quality_score }}</span>
                  <span class="quality-unit">分</span>
                </div>
              </div>
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
      <section v-if="records.length > 0" class="sleep-summary-section">
        <div class="section-title-bar">
          <h2 class="section-title">今日汇总</h2>
        </div>

        <div class="summary-grid">
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
            <div class="summary-unit">h</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">午睡总时长</div>
            <div class="summary-value">{{ formatSleepDuration(todayStatistics.totalNapHours) }}</div>
            <div class="summary-unit">h</div>
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
        <div class="empty-icon">😴</div>
        <h3 class="empty-title">暂无睡眠记录</h3>
        <p class="empty-text">立即添加第一条睡眠记录吧</p>
      </section>

      <!-- 底部空白 -->
      <div class="sleep-footer"></div>
    </main>

    <!-- 添加记录浮窗 -->
    <transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeFormModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">新增睡眠记录</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="sleep-form">
            <!-- 睡眠类型选择 -->
            <div class="form-group">
              <label class="form-label">睡眠类型 *</label>
              <div class="button-group">
                <button
                  v-for="option in napTypeOptions"
                  :key="option.value"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.is_nap === option.value }"
                  @click="form.is_nap = option.value as any"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="sleepStart" class="form-label">入睡时间 *</label>
                <input id="sleepStart" v-model="form.sleep_start_time" type="datetime-local" class="form-input" required />
              </div>

              <div class="form-group">
                <label for="wakeUp" class="form-label">起床时间 *</label>
                <input id="wakeUp" v-model="form.wake_up_time" type="datetime-local" class="form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="wakeUpTimes" class="form-label">苏醒次数</label>
                <input id="wakeUpTimes" v-model.number="form.wake_up_times" type="number" class="form-input" min="0" placeholder="0" />
              </div>

              <div class="form-group full-width"></div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="sleepFeel" class="form-label">睡眠感受</label>
                <textarea id="sleepFeel" v-model="form.sleep_feeling" class="form-textarea"
                  placeholder="描述你的睡眠感受，例如：睡眠质量不错，但有点累" rows="4"></textarea>
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
import { useSleepCheckin } from '../composables/useSleepCheckin'

const isFormOpen = ref(false)
const showAllRecords = ref(false)

const {
  form,
  records,
  loading,
  errorMsg,
  successMsg,
  napTypeOptions,
  todayStatistics,
  addSleepRecord,
  loadRecords,
  startPolling,
  stopPolling,
  formatSleepDuration,
  getNapTypeText,
  isCalculating,
  initializeForm
} = useSleepCheckin()

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
  initializeForm()
  isFormOpen.value = true
}

const closeFormModal = () => {
  isFormOpen.value = false
  errorMsg.value = ''
  successMsg.value = ''
}

const handleSubmit = async () => {
  await addSleepRecord()
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
@import '@/css/checkin/SleepCheckinDisplay.css';
</style>