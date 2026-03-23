<template>
  <div class="meal-display-page">
    <AppHeader />
    
    <main class="meal-display-main">
      <!-- 顶部装饰线 -->
      <div class="page-divider"></div>
      
      <!-- 页面标题区 -->
      <section class="meal-title-section">
        <div class="title-container">
          <h1 class="meal-title">饮食打卡</h1>
          <p class="meal-subtitle">记录每餐的饮食情况，AI自动计算营养数据</p>
          <div class="date-display">{{ formatDate(new Date()) }}</div>
        </div>
      </section>

      <!-- 新增打卡按钮区 -->
      <section class="meal-add-section">
        <button class="add-record-btn" @click="openFormModal">
          <span class="add-icon">+</span>
          <span class="add-text">新增打卡</span>
        </button>
      </section>

      <!-- 今天的记录列表 -->
      <section v-if="records.length > 0" class="meal-records-section">
        <div class="section-title-bar">
          <h2 class="section-title">今日记录</h2>
          <span class="record-count">{{ records.length }}</span>
        </div>

        <div class="records-container">
          <div v-for="record in displayedRecords" :key="record.id" class="record-card">
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

      <!-- 日汇总统计 -->
      <section v-if="records.length > 0" class="meal-summary-section">
        <div class="section-title-bar">
          <h2 class="section-title">今日汇总</h2>
        </div>

        <div class="summary-grid">
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
        <div class="empty-icon">🍽️</div>
        <h3 class="empty-title">暂无打卡记录</h3>
        <p class="empty-text">立即添加第一条打卡记录吧</p>
      </section>

      <!-- 底部空白 -->
      <div class="meal-footer"></div>
    </main>

    <!-- 添加记录浮窗 -->
    <transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeFormModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">新增打卡记录</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="meal-form">
            <!-- 进食时段选择 -->
            <div class="form-group">
              <label class="form-label">进食时段 *</label>
              <div class="button-group">
                <button
                  v-for="option in mealTypeOptions"
                  :key="option.value"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.meal_type === option.value }"
                  @click="form.meal_type = option.value as any"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 食物来源选择 -->
            <div class="form-group">
              <label class="form-label">食物来源 *</label>
              <div class="button-group">
                <button
                  v-for="option in foodSourceOptions"
                  :key="option.value"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.food_source === option.value }"
                  @click="form.food_source = option.value as any"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="foodName" class="form-label">食物名称 *</label>
                <input id="foodName" v-model="form.food_name" type="text" class="form-input" placeholder="例如：番茄鸡蛋面、红油火锅"
                  required />
              </div>

              <div class="form-group">
                <label for="mealTime" class="form-label">进食时间 *</label>
                <input id="mealTime" v-model="form.meal_time" type="datetime-local" class="form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="foodDetail" class="form-label">食物描述 *</label>
                <textarea id="foodDetail" v-model="form.food_detail" class="form-textarea"
                  placeholder="详细描述食物，例如：一碗番茄鸡蛋面，配青菜一份和豆腐半盒，油量中等" rows="4" required></textarea>
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
                {{ loading ? '保存中...' : '保存打卡' }}
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
import { useMealCheckin } from '../composables/useMealCheckin'

const isFormOpen = ref(false)
const showAllRecords = ref(false)

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
  // 清除消息
  errorMsg.value = ''
  successMsg.value = ''
}

const handleSubmit = async () => {
  await addMealRecord()
  // 上传成功后自动关闭浮窗
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
@import '@/css/checkin/MealCheckinDisplay.css';
</style>
