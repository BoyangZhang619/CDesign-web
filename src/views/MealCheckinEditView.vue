<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="meal-wrapper">
        <div class="page-header">
          <h1 class="page-title">编辑饮食打卡</h1>
          <p class="page-subtitle">修改打卡信息</p>
        </div>

        <section v-if="records.length > 0" class="form-section">
          <div class="section-header">
            <span class="section-number">01</span>
            <h2 class="section-title">选择要编辑的记录</h2>
          </div>

          <div class="records-list">
            <div v-for="record in records" :key="record.id" class="record-item" @click="selectRecord(record)">
              <div class="record-select">
                <input
                  type="radio"
                  :name="'record-' + record.id"
                  :value="record.id"
                  v-model="selectedRecordId"
                  class="radio-input"
                />
              </div>
              <div class="record-info">
                <div class="record-header">
                  <h4 class="food-name">{{ record.food_name }}</h4>
                  <span class="record-time">{{ formatTime(record.meal_time) }}</span>
                </div>
                <p class="food-detail">{{ record.food_detail }}</p>
              </div>
              <div class="record-nutrition">
                <span v-if="isCalculating(record)" class="badge calculating">计算中</span>
                <span v-else class="badge">{{ record.calories }} kcal</span>
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

          <form @submit.prevent="handleUpdate" class="meal-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">进食时段</label>
                <select v-model="selectedRecord.meal_type" class="form-input">
                  <option v-for="option in mealTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">食物来源</label>
                <select v-model="selectedRecord.food_source" class="form-input">
                  <option v-for="option in foodSourceOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="foodName" class="form-label">食物名称</label>
                <input
                  id="foodName"
                  v-model="selectedRecord.food_name"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="foodDetail" class="form-label">食物描述</label>
                <textarea
                  id="foodDetail"
                  v-model="selectedRecord.food_detail"
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div v-if="errorMsg" class="error-box">
              {{ errorMsg }}
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
          <p class="empty-text">返回饮食打卡页面添加新的打卡记录</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useMealCheckin, type MealRecord } from '../composables/useMealCheckin'

const router = useRouter()

const {
  records,
  mealTypeOptions,
  foodSourceOptions,
  loadRecords,
  isCalculating
} = useMealCheckin()

const selectedRecordId = ref('')
const selectedRecord = ref<MealRecord | null>(null)
const loading = ref(false)
const errorMsg = ref('')

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectRecord = (record: MealRecord) => {
  selectedRecordId.value = record.id
  selectedRecord.value = { ...record }
}

const handleUpdate = async () => {
  // 这里可以添加更新逻辑
  // 由于API文档中没有提供更新接口，这里只显示保存提示
  loading.value = true
  errorMsg.value = ''

  try {
    // 模拟保存
    setTimeout(() => {
      loading.value = false
      router.push('/meal/checkin')
    }, 1000)
  } catch (error) {
    errorMsg.value = '更新失败'
    loading.value = false
  }
}

const goBack = () => {
  router.push('/meal/checkin')
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
@import '../css/MealCheckinDisplay.css';
</style>
