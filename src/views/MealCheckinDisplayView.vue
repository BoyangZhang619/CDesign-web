<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="meal-wrapper">
        <!-- 页面头部 -->
        <div class="page-header">
          <h1 class="page-title">饮食打卡</h1>
          <p class="page-subtitle">记录每餐的饮食情况，AI自动计算营养数据</p>
        </div>

        <!-- 新增打卡表单 -->
        <section class="form-section" :class="{ 'collapsed': !isFormExpanded }">
          <div class="section-header" @click="toggleFormExpand" style="cursor: pointer;">
            <span class="section-number">01</span>
            <h2 class="section-title">新增打卡记录</h2>
            <span class="expand-icon">{{ isFormExpanded ? '▼' : '▶' }}</span>
          </div>

          <form v-show="isFormExpanded" @submit.prevent="handleSubmit" class="meal-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">进食时段 *</label>
                <select v-model="form.meal_type" class="form-input">
                  <option v-for="option in mealTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">食物来源 *</label>
                <select v-model="form.food_source" class="form-input">
                  <option v-for="option in foodSourceOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="foodName" class="form-label">食物名称 *</label>
                <input
                  id="foodName"
                  v-model="form.food_name"
                  type="text"
                  class="form-input"
                  placeholder="例如：番茄鸡蛋面、红油火锅"
                  required
                />
              </div>

              <div class="form-group">
                <label for="mealTime" class="form-label">进食时间 *</label>
                <input
                  id="mealTime"
                  v-model="form.meal_time"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="foodDetail" class="form-label">食物描述 *</label>
                <textarea
                  id="foodDetail"
                  v-model="form.food_detail"
                  class="form-textarea"
                  placeholder="详细描述食物，例如：一碗番茄鸡蛋面，配青菜一份和豆腐半盒，油量中等"
                  rows="4"
                  required
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
                {{ loading ? '保存中...' : '保存打卡' }}
              </button>
            </div>
          </form>
        </section>

        <!-- 今天的记录列表 -->
        <section v-if="records.length > 0" class="records-section" :class="{ 'collapsed': !isRecordsExpanded }">
          <div class="section-header" @click="toggleRecordsExpand" style="cursor: pointer;">
            <span class="section-number">02</span>
            <h2 class="section-title">今天的打卡记录</h2>
            <span class="expand-icon">{{ isRecordsExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-show="isRecordsExpanded" class="records-list">
            <div v-for="record in records" :key="record.id" class="record-card">
              <div class="record-header">
                <div class="record-meta">
                  <span class="meal-type-badge">{{ getMealTypeText(record.meal_type) }}</span>
                  <span class="food-source-badge">{{ getFoodSourceText(record.food_source) }}</span>
                  <span class="record-time">{{ formatTime(record.meal_time) }}</span>
                </div>
              </div>

              <div class="record-content">
                <h4 class="food-name">{{ record.food_name }}</h4>
                <p class="food-detail">{{ record.food_detail }}</p>
              </div>

              <div class="nutrition-info">
                <div v-if="isCalculating(record)" class="calculating">
                  <span class="spinner"></span>
                  计算中...
                </div>
                <div v-else class="nutrition-grid">
                  <div class="nutrition-item">
                    <span class="nutrition-label">热量</span>
                    <span class="nutrition-value">{{ record.calories }}</span>
                    <span class="nutrition-unit">kcal</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">蛋白质</span>
                    <span class="nutrition-value">{{ record.protein_g }}</span>
                    <span class="nutrition-unit">g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">脂肪</span>
                    <span class="nutrition-value">{{ record.fat_g }}</span>
                    <span class="nutrition-unit">g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">碳水</span>
                    <span class="nutrition-value">{{ record.carbohydrate_g }}</span>
                    <span class="nutrition-unit">g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 日汇总统计 -->
        <section v-if="records.length > 0" class="summary-section" :class="{ 'collapsed': !isSummaryExpanded }">
          <div class="section-header" @click="toggleSummaryExpand" style="cursor: pointer;">
            <span class="section-number">03</span>
            <h2 class="section-title">今日汇总</h2>
            <span class="expand-icon">{{ isSummaryExpanded ? '▼' : '▶' }}</span>
          </div>

          <div v-show="isSummaryExpanded" class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">总热量摄入</div>
              <div class="summary-value">{{ totalNutrition.calories }}</div>
              <div class="summary-unit">kcal</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总蛋白质</div>
              <div class="summary-value">{{ totalNutrition.protein }}</div>
              <div class="summary-unit">g</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总脂肪</div>
              <div class="summary-value">{{ totalNutrition.fat }}</div>
              <div class="summary-unit">g</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总碳水</div>
              <div class="summary-value">{{ totalNutrition.carbohydrate }}</div>
              <div class="summary-unit">g</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总纤维</div>
              <div class="summary-value">{{ totalNutrition.fiber }}</div>
              <div class="summary-unit">g</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">记录条数</div>
              <div class="summary-value">{{ totalNutrition.count }}</div>
              <div class="summary-unit">条</div>
            </div>
          </div>
        </section>

        <!-- 空状态 -->
        <section v-else class="empty-state">
          <div class="empty-icon">—</div>
          <h3 class="empty-title">暂无打卡记录</h3>
          <p class="empty-text">立即添加第一条打卡记录吧</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useMealCheckin } from '../composables/useMealCheckin'

const isFormExpanded = ref(false)
const isRecordsExpanded = ref(false)
const isSummaryExpanded = ref(false)

const {
  form,
  records,
  loading,
  errorMsg,
  successMsg,
  mealTypeOptions,
  foodSourceOptions,
  totalNutrition,
  addMealRecord,
  loadRecords,
  startPolling,
  stopPolling,
  getMealTypeText,
  getFoodSourceText,
  isCalculating
} = useMealCheckin()

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
  await addMealRecord()
  // 上传成功后自动缩回
  if (!errorMsg.value) {
    isFormExpanded.value = false
  }
}

onMounted(() => {
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
@import '../css/MealCheckinDisplay.css';
</style>
