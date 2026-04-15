<template>
  <div class="sleep-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'睡眠打卡'" :subtitle="'记录每天的睡眠情况'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="sleep-container">
          <!-- 左栏：操作面板 -->
          <div class="sleep-left-panel">
            <!-- 新增按钮 -->
            <button class="sleep-add-btn" @click="openFormModal">
              <span class="add-btn-icon">+</span>
              <span class="add-btn-text">新增睡眠</span>
            </button>

            <!-- 今日统计 -->
            <div v-if="records.length > 0" class="sleep-stats-section">
              <h3 class="stats-title">今日汇总</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">总记录</span>
                  <span class="stat-value">{{ todayStatistics.totalRecords }}</span>
                  <span class="stat-unit">条</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">夜间睡眠</span>
                  <span class="stat-value">{{ todayStatistics.nightSleepCount }}</span>
                  <span class="stat-unit">次</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">午睡次数</span>
                  <span class="stat-value">{{ todayStatistics.napCount }}</span>
                  <span class="stat-unit">次</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">夜间时长</span>
                  <span class="stat-value">{{ formatSleepDuration(todayStatistics.totalNightHours) }}</span>
                  <span class="stat-unit">h</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">午睡时长</span>
                  <span class="stat-value">{{ formatSleepDuration(todayStatistics.totalNapHours) }}</span>
                  <span class="stat-unit">h</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">平均质量</span>
                  <span class="stat-value">{{ todayStatistics.avgQualityScore }}</span>
                  <span class="stat-unit">分</span>
                </div>
              </div>
            </div>

            <!-- 睡眠任务组件 - 待完成 -->
            <CheckinTaskGroup 
              :tasks="sleepTasks" 
              category="sleep"
              position="left"
              @toggle="toggleTask"
              @delete="deleteTask"
            />
          </div>

          <!-- 右栏：睡眠任务和记录列表 -->
          <div class="sleep-right-panel">
            <!-- 睡眠任务组件 - 已完成 -->
            <CheckinTaskGroup 
              :tasks="sleepTasks" 
              category="sleep"
              position="right"
              @toggle="toggleTask"
              @delete="deleteTask"
            />

            <!-- 空状态 -->
            <div v-if="records.length === 0" class="empty-state">
              <div class="empty-icon">🌙</div>
              <h3 class="empty-title">暂无睡眠记录</h3>
              <p class="empty-text">点击新增按钮记录你的睡眠吧</p>
            </div>

            <!-- 记录列表 -->
            <template v-else>
              <div class="records-header">
                <h2 class="records-title">今日记录</h2>
                <span class="record-count">{{ records.length }}</span>
              </div>

              <div class="records-container">
                <div v-for="record in displayedRecords" :key="record.id" class="record-card">
                  <div class="card-header">
                    <div class="card-meta">
                      <span class="sleep-badge">{{ getNapTypeText(record.is_nap) }}</span>
                      <span class="duration-badge">{{ formatSleepDuration(record.sleep_duration_hours) }}</span>
                      <span class="time-badge">{{ formatTime(record.sleep_start_time) }} - {{ formatTime(record.wake_up_time) }}</span>
                    </div>
                  </div>

                  <div class="card-content">
                    <p v-if="record.sleep_feeling" class="sleep-feeling">{{ record.sleep_feeling }}</p>
                    
                    <div class="content-row">
                      <div class="content-item">
                        <span class="label">苏醒次数</span>
                        <span class="value">{{ record.wake_up_times }}</span>
                        <span class="unit">次</span>
                      </div>
                      <div class="content-item">
                        <span class="label">质量分</span>
                        <span v-if="isCalculating(record)" class="value calculating">计算中...</span>
                        <span v-else class="value">{{ record.sleep_quality_score }}</span>
                        <span v-if="!isCalculating(record)" class="unit">分</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 查看全部按钮 -->
              <div v-if="records.length > 3 && !showAllRecords" class="view-all-container">
                <button class="view-all-btn" @click="showAllRecords = true">
                  查看全部 {{ records.length }} 条
                </button>
              </div>
              <div v-else-if="showAllRecords && records.length > 3" class="view-all-container">
                <button class="view-all-btn" @click="showAllRecords = false">
                  收起
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加记录浮窗 -->
    <transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeFormModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">新增睡眠记录</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="sleep-form">
            <!-- 睡眠类型 -->
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

            <!-- 入睡和起床时间 -->
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

            <!-- 苏醒次数 -->
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

            <!-- 睡眠感受 -->
            <div class="form-group full-width">
              <label for="sleepFeel" class="form-label">睡眠感受</label>
              <textarea 
                id="sleepFeel" 
                v-model="form.sleep_feeling" 
                class="form-textarea"
                placeholder="描述你的睡眠感受"
                rows="4"
              ></textarea>
            </div>

            <!-- 消息提示 -->
            <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

            <!-- 按钮 -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeFormModal">取消</button>
              <button type="submit" class="btn-submit" :disabled="loading">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import CheckinTaskGroup from '../components/checkinView/CheckinTaskGroup.vue'
import { useSleepCheckin } from '../composables/useSleepCheckin'
import { useTodolist } from '../composables/useTodolist'

const sidebarRef = ref()

const { tasks, fetchTasks, toggleTask, deleteTask } = useTodolist()

const sleepTasks = computed(() => {
  return tasks.value.filter((t: any) => t.category === 'sleep')
})
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

// 计算显示的记录数
const displayedRecords = computed(() => {
  if (showAllRecords.value) {
    return records.value
  }
  return records.value.slice(0, 3)
})

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 侧栏切换
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

// 打开表单
const openFormModal = () => {
  initializeForm()
  isFormOpen.value = true
}

// 关闭表单
const closeFormModal = () => {
  isFormOpen.value = false
  errorMsg.value = ''
  successMsg.value = ''
}

// 提交表单
const handleSubmit = async () => {
  await addSleepRecord()
  if (!errorMsg.value) {
    closeFormModal()
  }
}

onMounted(() => {
  loadRecords()
  startPolling()
  fetchTasks()
})

onUnmounted(() => {
  stopPolling()
  isFormOpen.value = false
})
</script>

<style scoped>
@import '@/css/SleepCheckinDisplay.css';
</style>