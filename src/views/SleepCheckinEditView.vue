<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="sleep-wrapper">
        <!-- 页面头部 -->
        <div class="page-header">
          <h1 class="page-title">编辑睡眠记录</h1>
          <p class="page-subtitle">修改睡眠时间和相关信息</p>
        </div>

        <!-- 记录选择 -->
        <section v-if="records.length > 0" class="form-section">
          <div class="section-header">
            <span class="section-number">01</span>
            <h2 class="section-title">选择要编辑的记录</h2>
          </div>

          <div class="records-selector">
            <label v-for="record in records" :key="record.id" class="selector-item">
              <input
                type="radio"
                :value="record.id"
                v-model="selectedRecordId"
                class="selector-radio"
              />
              <div class="selector-content">
                <div class="selector-meta">
                  <span class="sleep-type-badge">{{ getNapTypeText(record.is_nap) }}</span>
                  <span class="sleep-duration">{{ formatSleepDuration(record.sleep_duration_hours) }}</span>
                </div>
                <div class="selector-time">
                  {{ formatDate(record.sleep_start_time) }} {{ formatTime(record.sleep_start_time) }} - {{ formatTime(record.wake_up_time) }}
                </div>
                <div v-if="record.sleep_quality_score !== null" class="selector-quality">
                  质量分：{{ record.sleep_quality_score }}分
                </div>
                <div v-else class="selector-quality calculating">
                  分析中...
                </div>
              </div>
            </label>
          </div>
        </section>
        
        <!-- 空状态 -->
        <section v-else class="empty-state">
          <div class="empty-icon">—</div>
          <h3 class="empty-title">暂无睡眠记录</h3>
          <p class="empty-text">返回睡眠打卡页面添加记录</p>
          <RouterLink to="/sleep/checkin" class="btn-primary">
            返回睡眠打卡
          </RouterLink>
        </section>

        <!-- 编辑表单 -->
        <section v-if="selectedRecordId && selectedRecord" class="form-section">
          <div class="section-header">
            <span class="section-number">02</span>
            <h2 class="section-title">编辑记录</h2>
          </div>

          <form @submit.prevent="handleUpdate" class="sleep-form">
            <div class="form-row">
              <div class="form-group">
                <label for="editSleepStart" class="form-label">入睡时间 *</label>
                <input
                  id="editSleepStart"
                  v-model="editForm.sleep_start_time"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="editWakeUp" class="form-label">起床时间 *</label>
                <input
                  id="editWakeUp"
                  v-model="editForm.wake_up_time"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="editNapType" class="form-label">睡眠类型</label>
                <select v-model.number="editForm.is_nap" class="form-input">
                  <option v-for="option in napTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="editWakeUpTimes" class="form-label">苏醒次数</label>
                <input
                  id="editWakeUpTimes"
                  v-model.number="editForm.wake_up_times"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="editSleepFeel" class="form-label">睡眠感受</label>
                <textarea
                  id="editSleepFeel"
                  v-model="editForm.sleep_feeling"
                  class="form-textarea"
                  placeholder="描述你的睡眠感受"
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
                {{ loading ? '保存中...' : '保存修改' }}
              </button>
              <RouterLink to="/sleep/checkin" class="btn-secondary">
                返回列表
              </RouterLink>
            </div>
          </form>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useSleepCheckin } from '../composables/useSleepCheckin'
import type { SleepCheckinForm } from '../composables/useSleepCheckin'

const route = useRoute()

const {
  records,
  loading,
  errorMsg,
  successMsg,
  selectedRecordId,
  napTypeOptions,
  loadRecords,
  updateSleepRecord,
  formatSleepDuration,
  getNapTypeText
} = useSleepCheckin()

const editForm = ref<SleepCheckinForm>({
  sleep_start_time: '',
  wake_up_time: '',
  is_nap: 0,
  wake_up_times: 0,
  sleep_feeling: ''
})

const selectedRecord = computed(() => {
  return records.value.find(r => r.id === selectedRecordId.value)
})

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN')
}

const handleUpdate = async () => {
  if (!selectedRecordId.value) return

  await updateSleepRecord(selectedRecordId.value, editForm.value)
}

// 当选中的记录变化时，更新编辑表单
const updateEditForm = () => {
  if (!selectedRecord.value) return

  editForm.value = {
    sleep_start_time: new Date(selectedRecord.value.sleep_start_time).toISOString().slice(0, 16),
    wake_up_time: new Date(selectedRecord.value.wake_up_time).toISOString().slice(0, 16),
    is_nap: selectedRecord.value.is_nap,
    wake_up_times: selectedRecord.value.wake_up_times,
    sleep_feeling: selectedRecord.value.sleep_feeling
  }
}

// 监听选中的记录变化
watch(selectedRecordId, () => {
  updateEditForm()
})

// 如果从列表页传过来recordId参数，自动选中
const { recordId } = route.params
if (recordId && typeof recordId === 'string') {
  selectedRecordId.value = recordId
}

onMounted(async () => {
  await loadRecords()
  if (recordId && typeof recordId === 'string') {
    selectedRecordId.value = recordId
    updateEditForm()
  }
})
</script>

<style scoped>
@import '../css/SleepCheckinDisplay.css';
</style>
