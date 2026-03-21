<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="exercise-wrapper">
        <div class="page-header">
          <h1 class="page-title">编辑运动打卡</h1>
          <p class="page-subtitle">修改运动信息</p>
        </div>

        <section v-if="records.length > 0" class="form-section">
          <div class="section-header">
            <span class="section-number">01</span>
            <h2 class="section-title">选择要编辑的记录</h2>
          </div>

          <div class="records-list">
            <div v-for="record in records" :key="record.exercise_record_id" class="record-item" @click="selectRecord(record)">
              <div class="record-select">
                <input
                  type="radio"
                  :name="'record-' + record.exercise_record_id"
                  :value="record.exercise_record_id"
                  v-model="selectedRecordId"
                  class="radio-input"
                />
              </div>
              <div class="record-info">
                <div class="record-header">
                  <h4 class="activity-name">{{ getActivityTypeText(record.activity_type) }}</h4>
                  <span class="record-time">{{ formatTime(record.start_time) }}</span>
                </div>
                <p class="record-detail">{{ record.duration_min }} 分钟 · {{ getIntensityText(record.intensity) }}</p>
              </div>
              <div class="record-calories">
                <span v-if="isCalculating(record)" class="badge calculating">计算中</span>
                <span v-else class="badge">{{ formatCaloriesBurned(record.calories_burned) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 编辑表单 -->
        <section v-if="selectedRecord" class="form-section">
          <div class="section-header">
            <span class="section-number">02</span>
            <h2 class="section-title">编辑记录信息</h2>
          </div>

          <form @submit.prevent="handleUpdate" class="exercise-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">运动类型</label>
                <select v-model="selectedRecord.activity_type" class="form-input">
                  <option v-for="option in activityTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">强度</label>
                <select v-model="selectedRecord.intensity" class="form-input">
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
                  v-model="selectedRecord.start_time"
                  type="datetime-local"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="endTime" class="form-label">结束时间</label>
                <input
                  id="endTime"
                  v-model="selectedRecord.end_time"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="note" class="form-label">备注 (可选)</label>
                <textarea
                  id="note"
                  v-model="selectedRecord.note"
                  class="form-textarea"
                  rows="3"
                  placeholder="记录运动中的特殊情况"
                  maxlength="200"
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
              <button type="button" class="btn-secondary" @click="goBack">
                返回
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? '更新中...' : '更新记录' }}
              </button>
            </div>
          </form>
        </section>

        <!-- 空状态 -->
        <section v-else class="empty-state">
          <div class="empty-icon">—</div>
          <h3 class="empty-title">暂无记录可编辑</h3>
          <p class="empty-text">返回运动打卡页面添加新的运动记录</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useExerciseCheckin, type ExerciseRecord } from '../composables/useExerciseCheckin'

const router = useRouter()
const route = useRoute()

const {
  records,
  loading,
  errorMsg,
  successMsg,
  selectedRecordId,
  activityTypeOptions,
  intensityOptions,
  loadRecords,
  updateExerciseRecord,
  formatCaloriesBurned,
  getActivityTypeText,
  getIntensityText,
  isCalculating
} = useExerciseCheckin()

const selectedRecord = ref<ExerciseRecord | null>(null)

const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectRecord = (record: ExerciseRecord) => {
  selectedRecordId.value = record.exercise_record_id
  selectedRecord.value = { ...record }
}

const handleUpdate = async () => {
  if (!selectedRecord.value) return

  const updateData = {
    activity_type: selectedRecord.value.activity_type,
    intensity: selectedRecord.value.intensity,
    start_time: selectedRecord.value.start_time,
    end_time: selectedRecord.value.end_time,
    note: selectedRecord.value.note
  }

  await updateExerciseRecord(selectedRecord.value.exercise_record_id, updateData)
  if (successMsg.value && !errorMsg.value) {
    setTimeout(() => {
      router.push('/exercise/checkin')
    }, 500)
  }
}

const goBack = () => {
  router.push('/exercise/checkin')
}

onMounted(() => {
  loadRecords()

  // 如果有 id 参数，自动选择该记录
  const recordId = route.query.id as string
  if (recordId) {
    watch(
      () => records.value,
      (newRecords) => {
        const record = newRecords.find(r => String(r.exercise_record_id) === recordId)
        if (record) {
          selectRecord(record)
        }
      },
      { immediate: true }
    )
  }
})
</script>

<style scoped>
@import '../css/ExerciseCheckinDisplay.css';
</style>
