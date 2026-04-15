<template>
  <div class="exercise-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'运动打卡'" :subtitle="'记录每次运动，追踪健身进度'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="exercise-container">
          <!-- 左栏：操作面板 -->
          <div class="exercise-left-panel">
            <!-- 新增按钮 -->
            <button class="exercise-add-btn" @click="openFormModal">
              <span class="add-btn-icon">+</span>
              <span class="add-btn-text">新增运动</span>
            </button>

            <!-- 今日统计 -->
            <div v-if="records.length > 0" class="exercise-stats-section">
              <h3 class="stats-title">今日汇总</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">运动次数</span>
                  <span class="stat-value">{{ todayStatistics.totalRecords }}</span>
                  <span class="stat-unit">次</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">运动时长</span>
                  <span class="stat-value">{{ todayStatistics.totalDuration }}</span>
                  <span class="stat-unit">分</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">消耗热量</span>
                  <span class="stat-value">{{ todayStatistics.totalCalories }}</span>
                  <span class="stat-unit">kcal</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">低强度</span>
                  <span class="stat-value">{{ todayStatistics.lowIntensity }}</span>
                  <span class="stat-unit">次</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">中强度</span>
                  <span class="stat-value">{{ todayStatistics.mediumIntensity }}</span>
                  <span class="stat-unit">次</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">高强度</span>
                  <span class="stat-value">{{ todayStatistics.highIntensity }}</span>
                  <span class="stat-unit">次</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右栏：记录列表 -->
          <div class="exercise-right-panel">
            <!-- 空状态 -->
            <div v-if="records.length === 0" class="empty-state">
              <div class="empty-icon">🏃</div>
              <h3 class="empty-title">暂无运动记录</h3>
              <p class="empty-text">点击新增按钮开始记录运动吧</p>
            </div>

            <!-- 记录列表 -->
            <template v-else>
              <div class="records-header">
                <h2 class="records-title">今日记录</h2>
                <span class="record-count">{{ records.length }}</span>
              </div>

              <div class="records-container">
                <div v-for="record in displayedRecords" :key="record.exercise_record_id" class="record-card">
                  <div class="card-header">
                    <div class="card-meta">
                      <span class="activity-badge">{{ getActivityTypeText(record.activity_type) }}</span>
                      <span class="duration-badge">{{ record.duration_min }} 分钟</span>
                      <span class="time-badge">{{ formatTime(record.start_time) }} - {{ formatTime(record.end_time) }}</span>
                    </div>
                  </div>

                  <div class="card-content">
                    <div class="content-row">
                      <div class="content-item">
                        <span class="label">强度</span>
                        <span class="intensity-badge" :class="`intensity-${record.intensity}`">
                          {{ getIntensityText(record.intensity) }}
                        </span>
                      </div>
                      <div class="content-item">
                        <span class="label">热量</span>
                        <span v-if="isCalculating(record)" class="value calculating">计算中...</span>
                        <span v-else class="value">{{ formatCaloriesBurned(record.calories_burned) }}</span>
                      </div>
                    </div>
                    <p v-if="record.note" class="note">{{ record.note }}</p>
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
            <h2 class="modal-title">新增运动记录</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="exercise-form">
            <!-- 运动类型 -->
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

            <!-- 开始和结束时间 -->
            <div class="form-row">
              <div class="form-group">
                <label for="startTime" class="form-label">开始时间 *</label>
                <input 
                  id="startTime" 
                  v-model="form.start_time" 
                  type="datetime-local" 
                  class="form-input" 
                  required 
                />
              </div>

              <div class="form-group">
                <label for="endTime" class="form-label">结束时间 *</label>
                <input 
                  id="endTime" 
                  v-model="form.end_time" 
                  type="datetime-local" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <!-- 备注 -->
            <div class="form-group full-width">
              <label for="note" class="form-label">备注 (可选)</label>
              <textarea 
                id="note" 
                v-model="form.note" 
                class="form-textarea"
                placeholder="记录运动中的特殊情况"
                rows="3"
                maxlength="200"
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
import { useExerciseCheckin } from '../composables/useExerciseCheckin'

const sidebarRef = ref()
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
  isCalculating,
  initializeForm
} = useExerciseCheckin()

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
@import '@/css/ExerciseCheckinDisplay.css';
</style>
