
<template>
  <div class="checkin-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'每日打卡'" :subtitle="'记录你的健康数据'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="checkin-wrapper">
          <!-- 页面头部 -->
          <!-- <div class="checkin-header">
            <div class="header-info">
              <h1 class="checkin-title">每日打卡</h1>
              <p class="checkin-subtitle">记录你的健康数据</p>
            </div>
            <div class="header-date">
              <input 
                v-model="selectedDate" 
                type="date" 
                class="date-picker"
                @change="loadCheckinData"
              />
            </div>
          </div> -->

          <!-- 打卡类别选择 -->
          <div class="checkin-tabs">
            <button 
              v-for="tab in checkinTabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="['tab-button', { active: currentTab === tab.id }]"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <!-- 打卡内容区 -->
          <div class="checkin-content">
            <!-- 运动打卡 -->
            <div v-show="currentTab === 'exercise'" class="tab-pane">
              <div class="checkin-card">
                <div class="card-header">
                  <h2 class="card-title">🏃 运动打卡</h2>
                  <span class="card-status" :class="(checkinData.exercise?.status || 'not_checkin') as keyof typeof statusLabels">
                    {{ statusLabels[(checkinData.exercise?.status || 'not_checkin') as keyof typeof statusLabels] }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">运动时长（分钟）</label>
                    <input 
                      v-model.number="exerciseForm.duration" 
                      type="number" 
                      class="form-input"
                      placeholder="输入运动时长"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">运动类型</label>
                    <select v-model="exerciseForm.type" class="form-input">
                      <option value="">-- 选择运动类型 --</option>
                      <option value="walking">散步</option>
                      <option value="running">跑步</option>
                      <option value="cycling">骑车</option>
                      <option value="swimming">游泳</option>
                      <option value="yoga">瑜伽</option>
                      <option value="gym">健身</option>
                      <option value="sports">运动</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">卡路里消耗（kcal）</label>
                    <input 
                      v-model.number="exerciseForm.calories" 
                      type="number" 
                      class="form-input"
                      placeholder="输入卡路里消耗"
                    />
                  </div>
                  <button @click="submitCheckin('exercise')" class="btn-submit">
                    ✓ 提交打卡
                  </button>
                </div>
              </div>
            </div>

            <!-- 饮食打卡 -->
            <div v-show="currentTab === 'meal'" class="tab-pane">
              <div class="checkin-card">
                <div class="card-header">
                  <h2 class="card-title">🍽️ 饮食打卡</h2>
                  <span class="card-status" :class="(checkinData.meal?.status || 'not_checkin') as keyof typeof statusLabels">
                    {{ statusLabels[(checkinData.meal?.status || 'not_checkin') as keyof typeof statusLabels] }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">摄入热量（kcal）</label>
                    <input 
                      v-model.number="mealForm.calories" 
                      type="number" 
                      class="form-input"
                      placeholder="输入摄入热量"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">主要食物</label>
                    <input 
                      v-model="mealForm.foods" 
                      type="text" 
                      class="form-input"
                      placeholder="例如：米饭、鸡肉、蔬菜"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">进食时间</label>
                    <select v-model="mealForm.mealType" class="form-input">
                      <option value="">-- 选择进食时间 --</option>
                      <option value="breakfast">早餐</option>
                      <option value="lunch">午餐</option>
                      <option value="dinner">晚餐</option>
                      <option value="snack">零食</option>
                    </select>
                  </div>
                  <button @click="submitCheckin('meal')" class="btn-submit">
                    ✓ 提交打卡
                  </button>
                </div>
              </div>
            </div>

            <!-- 睡眠打卡 -->
            <div v-show="currentTab === 'sleep'" class="tab-pane">
              <div class="checkin-card">
                <div class="card-header">
                  <h2 class="card-title">😴 睡眠打卡</h2>
                  <span class="card-status" :class="(checkinData.sleep?.status || 'not_checkin') as keyof typeof statusLabels">
                    {{ statusLabels[(checkinData.sleep?.status || 'not_checkin') as keyof typeof statusLabels] }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">睡眠时长（小时）</label>
                    <input 
                      v-model.number="sleepForm.duration" 
                      type="number" 
                      step="0.5"
                      class="form-input"
                      placeholder="输入睡眠时长"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">睡眠质量</label>
                    <select v-model="sleepForm.quality" class="form-input">
                      <option value="">-- 选择睡眠质量 --</option>
                      <option value="excellent">优秀</option>
                      <option value="good">良好</option>
                      <option value="fair">一般</option>
                      <option value="poor">较差</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">入睡时间</label>
                    <input 
                      v-model="sleepForm.bedTime" 
                      type="time" 
                      class="form-input"
                    />
                  </div>
                  <button @click="submitCheckin('sleep')" class="btn-submit">
                    ✓ 提交打卡
                  </button>
                </div>
              </div>
            </div>

            <!-- 心情打卡 -->
            <div v-show="currentTab === 'mood'" class="tab-pane">
              <div class="checkin-card">
                <div class="card-header">
                  <h2 class="card-title">😊 心情打卡</h2>
                  <span class="card-status" :class="(checkinData.mood?.status || 'not_checkin') as keyof typeof statusLabels">
                    {{ statusLabels[(checkinData.mood?.status || 'not_checkin') as keyof typeof statusLabels] }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">今日心情</label>
                    <div class="mood-selector">
                      <button 
                        v-for="mood in moods"
                        :key="mood.value"
                        @click="moodForm.mood = mood.value"
                        :class="['mood-btn', { selected: moodForm.mood === mood.value }]"
                      >
                        <span class="mood-icon">{{ mood.icon }}</span>
                        <span class="mood-label">{{ mood.label }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">心情备注</label>
                    <textarea 
                      v-model="moodForm.notes" 
                      class="form-textarea"
                      placeholder="记录一些今天的感受..."
                      rows="3"
                    ></textarea>
                  </div>
                  <button @click="submitCheckin('mood')" class="btn-submit">
                    ✓ 提交打卡
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日总结 -->
          <div v-if="todayCheckinsSummary" class="summary-section">
            <h2 class="summary-title">📊 今日打卡总结</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-icon">🏃</div>
                <div class="summary-info">
                  <div class="summary-label">运动</div>
                  <div class="summary-value">{{ todayCheckinsSummary.exercise || '-' }}</div>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">🍽️</div>
                <div class="summary-info">
                  <div class="summary-label">饮食</div>
                  <div class="summary-value">{{ todayCheckinsSummary.meal || '-' }}</div>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">😴</div>
                <div class="summary-info">
                  <div class="summary-label">睡眠</div>
                  <div class="summary-value">{{ todayCheckinsSummary.sleep || '-' }}</div>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">😊</div>
                <div class="summary-info">
                  <div class="summary-label">心情</div>
                  <div class="summary-value">{{ todayCheckinsSummary.mood || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import { getLocalISOString } from '@/utils/dateTime'

interface CheckinData {
  exercise?: { status: string; data: any }
  meal?: { status: string; data: any }
  sleep?: { status: string; data: any }
  mood?: { status: string; data: any }
}

const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const currentTab = ref('exercise')
const selectedDate = ref(getLocalISOString().split('T')[0])
const checkinData = ref<CheckinData>({})

// 表单数据
const exerciseForm = ref({
  duration: null,
  type: '',
  calories: null
})

const mealForm = ref({
  calories: null,
  foods: '',
  mealType: ''
})

const sleepForm = ref({
  duration: null,
  quality: '',
  bedTime: ''
})

const moodForm = ref({
  mood: '',
  notes: ''
})

// 打卡类别
const checkinTabs = [
  { id: 'exercise', label: '运动', icon: '🏃' },
  { id: 'meal', label: '饮食', icon: '🍽️' },
  { id: 'sleep', label: '睡眠', icon: '😴' },
  { id: 'mood', label: '心情', icon: '😊' }
]

// 心情选项
const moods = [
  { value: 'excellent', label: '很开心', icon: '😄' },
  { value: 'good', label: '开心', icon: '😊' },
  { value: 'fair', label: '一般', icon: '😐' },
  { value: 'sad', label: '不开心', icon: '😔' },
  { value: 'angry', label: '烦躁', icon: '😠' }
]

// 状态标签
const statusLabels = {
  completed: '已打卡',
  not_checkin: '未打卡',
  pending: '待完成'
}

// 今日打卡总结
const todayCheckinsSummary = computed(() => {
  const today = getLocalISOString().split('T')[0]
  if (selectedDate.value !== today) return null
  
  return {
    exercise: checkinData.value.exercise?.status === 'completed' ? '✓' : '○',
    meal: checkinData.value.meal?.status === 'completed' ? '✓' : '○',
    sleep: checkinData.value.sleep?.status === 'completed' ? '✓' : '○',
    mood: checkinData.value.mood?.status === 'completed' ? '✓' : '○'
  }
})

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const loadCheckinData = () => {
  // TODO: 加载指定日期的打卡数据
  console.log('加载打卡数据:', selectedDate.value)
  // 示例数据
  checkinData.value = {
    exercise: { status: 'not_checkin', data: {} },
    meal: { status: 'not_checkin', data: {} },
    sleep: { status: 'not_checkin', data: {} },
    mood: { status: 'not_checkin', data: {} }
  }
}

const submitCheckin = async (type: string) => {
  // TODO: 提交打卡数据
  console.log(`提交${type}打卡:`, { exercise: exerciseForm.value, meal: mealForm.value, sleep: sleepForm.value, mood: moodForm.value })
  
  // 模拟提交成功
  if (checkinData.value[type as keyof CheckinData]) {
    (checkinData.value[type as keyof CheckinData] as any).status = 'completed'
  }
  
  alert('打卡成功！')
}

onMounted(() => {
  loadCheckinData()
})
</script>

<style scoped>
@import '../css/CheckinView.css';
</style>

<!-- <template>
  <div class="daily-display-page">
    <AppHeader />
    
    <main class="daily-display-main">
      <div class="page-divider"></div>
      <section class="daily-title-section">
        <div class="title-container">
          <h1 class="daily-title">每日健康总结</h1>
          <p class="daily-subtitle">您今日的健康数据概览</p>
          <div class="date-display">{{ formatDate(form.date) }}</div>
        </div>
      </section>

      <section class="daily-core-metrics">
        <div class="metric-card metric-exercise" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">🏃</span>
            <h3 class="metric-title">运动</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.exercise_duration_time }}</div>
              <div class="metric-unit">分钟</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">消耗</span>
                <span class="value">{{ form.exercise_calories_burned }}</span>
                <span class="unit">kcal</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toExerciseCheckin">查看详情</button>
        </div>

        <div class="metric-card metric-meal" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">🍽️</span>
            <h3 class="metric-title">饮食</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.meal_calories }}</div>
              <div class="metric-unit">kcal</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">蛋白</span>
                <span class="value">{{ form.meal_protein }}</span>
                <span class="unit">g</span>
              </div>
              <div class="metric-item">
                <span class="label">脂肪</span>
                <span class="value">{{ form.meal_fat }}</span>
                <span class="unit">g</span>
              </div>
              <div class="metric-item">
                <span class="label">碳水</span>
                <span class="value">{{ form.meal_carb }}</span>
                <span class="unit">g</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toMealCheckin">查看详情</button>
        </div>

        <div class="metric-card metric-sleep" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">😴</span>
            <h3 class="metric-title">睡眠</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.sleep_duration_time }}</div>
              <div class="metric-unit">小时</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">就寝</span>
                <span class="value">{{ form.sleep_start_time }}</span>
              </div>
              <div class="metric-item">
                <span class="label">夜醒</span>
                <span class="value">{{ form.sleep_wakeup_times }}</span>
                <span class="unit">次</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toSleepCheckin">查看详情</button>
        </div>
      </section>

      <section class="daily-ai-section" v-if="form.total_ai_summary">
        <div class="ai-card">
          <div class="ai-header">
            <span class="ai-badge">✨ AI 分析</span>
            <h2 class="ai-title">您的今日总结</h2>
          </div>
          
          <div class="ai-content">
            <p class="ai-text">{{ form.total_ai_summary }}</p>
          </div>

          <div class="ai-details">
            <div v-if="form.exercise_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">🏃 运动分析</div>
              <p class="ai-detail-text">{{ form.exercise_ai_summary }}</p>
            </div>

            <div v-if="form.meal_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">🍽️ 饮食分析</div>
              <p class="ai-detail-text">{{ form.meal_ai_summary }}</p>
            </div>

            <div v-if="form.sleep_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">😴 睡眠分析</div>
              <p class="ai-detail-text">{{ form.sleep_ai_summary }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="daily-detail-section">
        <div class="detail-card">
          <h3 class="detail-title">🍽️ 饮食详情</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">早餐</span>
              <span class="detail-value">{{ form.meal_breakfast_type || '未记录' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">午餐</span>
              <span class="detail-value">{{ form.meal_lunch_type || '未记录' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">晚餐</span>
              <span class="detail-value">{{ form.meal_dinner_type || '未记录' }}</span>
              </div>
            <div class="detail-item">
              <span class="detail-label">零食</span>
              <span class="detail-value">{{ form.meal_snacks_type || '未记录' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3 class="detail-title">📊 营养详情</h3>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_protein, 50) + '%' }"></div>
              </div>
              <span class="nutrition-label">蛋白 {{ form.meal_protein }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_fat, 80) + '%' }"></div>
              </div>
              <span class="nutrition-label">脂肪 {{ form.meal_fat }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_carb, 300) + '%' }"></div>
              </div>
              <span class="nutrition-label">碳水 {{ form.meal_carb }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_fiber, 30) + '%' }"></div>
              </div>
              <span class="nutrition-label">纤维 {{ form.meal_fiber }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_sugar, 50) + '%' }"></div>
              </div>
              <span class="nutrition-label">糖分 {{ form.meal_sugar }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_water, 2500) + '%' }"></div>
              </div>
              <span class="nutrition-label">饮水 {{ form.meal_water }}ml</span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="errorMsg" class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMsg }}</span>
      </div>

      <div class="daily-footer"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { onMounted } from 'vue'
import { useDailyCheckin} from '../composables/useDailyCheckin'
import { formatDate, getPercentage } from '../utils/dateTime'

const { form, loading, errorMsg, loadDailyCheckin, toExerciseCheckin, toMealCheckin, toSleepCheckin } = useDailyCheckin()

onMounted(async () => {
  await loadDailyCheckin()
})
</script>

<style scoped>
@import "@/css/checkin/DailyCheckinDisplay.css";
</style> -->
