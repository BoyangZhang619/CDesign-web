<template>
  <div class="meal-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'饮食打卡'" :subtitle="'记录每餐的饮食情况'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="meal-container">
          <!-- 左栏：操作面板 -->
          <div class="meal-left-panel">
            <!-- 按钮组 -->
            <div class="button-container">
              <button class="meal-add-btn" @click="openFormModal">
                <span class="add-btn-icon">+</span>
                <span class="add-btn-text">新增打卡</span>
              </button>
              <button class="meal-other-btn" @click="showOtherCheckinMenu = true" title="其他打卡">
                <span class="other-btn-icon">📋</span>
              </button>
            </div>

            <!-- 汇总统计 -->
            <div class="meal-stats-section">
              <div class="stats-header">
                <h3 class="stats-title">今日汇总</h3>
                <button class="stats-toggle-btn" @click="isMealStatsVisible = !isMealStatsVisible" :title="isMealStatsVisible ? '收起' : '展开'">
                  <svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path :d="isMealStatsVisible ? 'M7 10l5 5 5-5z' : 'M7 14l5-5 5 5z'" />
                  </svg>
                </button>
              </div>
              <div class="stats-grid" v-if="isMealStatsVisible">
                <div class="stat-item">
                  <span class="stat-label">总热量</span>
                  <span class="stat-value">{{ totalNutrition.calories }}</span>
                  <span class="stat-unit">kcal</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">蛋白质</span>
                  <span class="stat-value">{{ totalNutrition.protein }}</span>
                  <span class="stat-unit">g</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">脂肪</span>
                  <span class="stat-value">{{ totalNutrition.fat }}</span>
                  <span class="stat-unit">g</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">碳水</span>
                  <span class="stat-value">{{ totalNutrition.carbohydrate }}</span>
                  <span class="stat-unit">g</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">纤维</span>
                  <span class="stat-value">{{ totalNutrition.fiber }}</span>
                  <span class="stat-unit">g</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">记录数</span>
                  <span class="stat-value">{{ totalNutrition.count }}</span>
                  <span class="stat-unit">条</span>
                </div>
              </div>
            </div>
            
            <!-- AI 总结面板 -->
            <MealAISummaryPanel
              :meal-summary="MealAISummary"
              :loading="MealAILoading"
              :error="MealAIError"
            />

            <!-- 饮食任务组件 - 待完成 -->
            <CheckinTaskGroup 
              :tasks="mealTasks" 
              category="meal"
              position="left"
              @toggle="handleToggleTask"
              @delete="handleDeleteTask"
            />
          </div>

          <!-- 右栏：饮食任务和记录列表 -->
          <div class="meal-right-panel">
            <!-- 饮食任务组件 - 已完成 -->
            <CheckinTaskGroup 
              :tasks="mealTasks" 
              category="meal"
              position="right"
              @toggle="handleToggleTask"
              @delete="handleDeleteTask"
            />

            <!-- 空状态 -->
            <div v-if="records.length === 0" class="empty-state">
              <div class="empty-icon">🍽️</div>
              <h3 class="empty-title">暂无打卡记录</h3>
              <p class="empty-text">立即点击新增打卡记录吧</p>
            </div>

            <!-- 记录列表 -->
            <template v-else>
              <div class="records-header">
                <h2 class="records-title">今日记录</h2>
                <span class="record-count">{{ records.length }}</span>
              </div>

              <div class="records-container">
                <button 
                  v-for="record in displayedRecords" 
                  :key="record.id" 
                  class="record-card"
                  @click="openRecordDetail(record)"
                >
                  <div class="card-header">
                    <div class="card-meta">
                      <span class="meal-badge">{{ getMealTypeText(record.meal_type) }}</span>
                      <span class="source-badge">{{ getFoodSourceText(record.food_source) }}</span>
                      <span class="time-badge">{{ formatTime(record.meal_time) }}</span>
                    </div>
                  </div>

                  <div class="card-content">
                    <h4 class="food-name">{{ record.food_name }}</h4>
                    <p class="food-detail">{{ record.food_detail }}</p>
                  </div>

                  <div class="card-nutrition">
                    <div v-if="isCalculating(record)" class="calculating">
                      <span class="spinner"></span>
                      计算中...
                    </div>
                    <div v-else class="nutrition-info">
                      <div class="nutrition-item">
                        <span class="nut-label">热量</span>
                        <span class="nut-value">{{ record.calories }}</span>
                        <span class="nut-unit">kcal</span>
                      </div>
                      <div class="nutrition-item">
                        <span class="nut-label">蛋白质</span>
                        <span class="nut-value">{{ record.protein_g }}</span>
                        <span class="nut-unit">g</span>
                      </div>
                      <div class="nutrition-item">
                        <span class="nut-label">脂肪</span>
                        <span class="nut-value">{{ record.fat_g }}</span>
                        <span class="nut-unit">g</span>
                      </div>
                      <div class="nutrition-item">
                        <span class="nut-label">碳水</span>
                        <span class="nut-value">{{ record.carbohydrate_g }}</span>
                        <span class="nut-unit">g</span>
                      </div>
                    </div>
                  </div>
                </button>
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

    <!-- 添加打卡浮窗 -->
    <transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeFormModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">新增饮食打卡</h2>
            <button class="modal-close" @click="closeFormModal">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="meal-form">
            <!-- 进食时段 -->
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

            <!-- 食物来源 -->
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

            <!-- 食物名称和时间 -->
            <div class="form-row">
              <div class="form-group">
                <label for="foodName" class="form-label">食物名称 *</label>
                <input 
                  id="foodName" 
                  v-model="form.food_name" 
                  type="text" 
                  class="form-input" 
                  placeholder="例如：番茄鸡蛋面"
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

            <!-- 食物描述 -->
            <div class="form-group full-width">
              <label for="foodDetail" class="form-label">食物描述 *</label>
              <textarea 
                id="foodDetail" 
                v-model="form.food_detail" 
                class="form-textarea"
                placeholder="详细描述食物内容和用量"
                rows="4"
                required
              ></textarea>
            </div>

            <!-- 消息提示 -->
            <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

            <!-- 按钮 -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeFormModal">取消</button>
              <button type="submit" class="btn-submit" :disabled="loading">
                {{ loading ? '保存中...' : '保存打卡' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- 其他打卡菜单浮窗 -->
    <transition name="modal-fade">
      <div v-if="showOtherCheckinMenu" class="modal-overlay" @click.self="showOtherCheckinMenu = false">
        <div class="checkin-menu-content" @click.stop>
          <div class="menu-header">
            <h3 class="menu-title">其他打卡</h3>
            <button class="menu-close" @click="showOtherCheckinMenu = false">✕</button>
          </div>
          <div class="menu-items">
            <button class="menu-item exercise-item" @click="navigateToCheckin('exercise')">
              <span class="menu-icon">🏃</span>
              <span class="menu-text">运动打卡</span>
              <span class="menu-desc">记录你的运动</span>
            </button>
            <button class="menu-item sleep-item" @click="navigateToCheckin('sleep')">
              <span class="menu-icon">😴</span>
              <span class="menu-text">睡眠打卡</span>
              <span class="menu-desc">记录你的睡眠质量</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 记录详情模态框 -->
    <RecordDetailModal
      :visible="showRecordDetail"
      record-type="meal"
      :record="selectedRecord"
      @close="showRecordDetail = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import CheckinTaskGroup from '../components/checkinView/CheckinTaskGroup.vue'
import RecordDetailModal from '../components/modals/RecordDetailModal.vue'
import { useMealCheckin } from '../composables/useMealCheckin'
import { useTodolist } from '../composables/useTodolist'
import MealAISummaryPanel from '../components/mealCheckinView/MealAISummaryPanel.vue'
import { useAISummary } from '../composables/useAISummary'

const router = useRouter()

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isFormOpen = ref(false)
const showAllRecords = ref(false)
const showOtherCheckinMenu = ref(false)
const showRecordDetail = ref(false)
const selectedRecord = ref<any>(null)

// 响应式设置统计部分默认状态（px > 768 默认展开，否则默认关闭）
const isMealStatsVisible = ref(typeof window !== 'undefined' ? window.innerWidth > 768 : true)

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
  isCalculating,
  initializeForm
} = useMealCheckin()

const {
  tasks,
  fetchTasks,
  toggleTask,
  deleteTask
} = useTodolist()

const mealTasks = computed(() => {
  return tasks.value.filter((t: any) => t.category === 'meal')
})

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
  await addMealRecord()
  if (!errorMsg.value) {
    closeFormModal()
  }
}

// AI 总结
const {
  summary: aiSummary,
  loading: aiLoading,
  error: aiError,
  getAISummary
} = useAISummary()

const MealAISummary = computed(() => {
  return aiSummary.value
})

const MealAILoading = computed(() => {
  return aiLoading.value
})

const MealAIError = computed(() => {
  return aiError.value
})

// 处理任务切换（同步更新已完成任务列表）
const handleToggleTask = async (taskId: number) => {
  await toggleTask(taskId)
  // 强制刷新任务数据，确保两个CheckinTaskGroup同步更新
  setTimeout(() => {
    fetchTasks()
  }, 100)
}

// 处理任务删除（同步更新已完成任务列表）
const handleDeleteTask = async (taskId: number) => {
  await deleteTask(taskId)
  // 强制刷新任务数据，确保两个CheckinTaskGroup同步更新
  setTimeout(() => {
    fetchTasks()
  }, 100)
}

// 导航到其他打卡类型
const navigateToCheckin = (type: 'exercise' | 'sleep') => {
  showOtherCheckinMenu.value = false
  if (type === 'exercise') {
    router.push('/exercise/checkin')
  } else if (type === 'sleep') {
    router.push('/sleep/checkin')
  }
}

// 打开记录详情模态框
const openRecordDetail = (record: any) => {
  selectedRecord.value = record
  showRecordDetail.value = true
}

// 监听窗口大小变化
const handleMealWindowResize = () => {
  isMealStatsVisible.value = window.innerWidth > 768
}

onMounted(() => {
  loadRecords()
  startPolling()
  fetchTasks()
  getAISummary()
  // 监听窗口大小变化
  window.addEventListener('resize', handleMealWindowResize)
})

onUnmounted(() => {
  stopPolling()
  isFormOpen.value = false
  // 移除窗口监听
  window.removeEventListener('resize', handleMealWindowResize)
})
</script>

<style scoped>
@import '@/css/MealCheckinDisplay.css';
</style>
