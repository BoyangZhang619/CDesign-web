<template>
  <div class="daily-checkin-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'每日健康中心'" :subtitle="'您的健康数据一览'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="daily-checkin-container">
          <!-- 左栏：日期选择和快速统计 -->
          <DailyLeftPanel
            :selected-date="selectedDate"
            :completed-count="completedCount"
            :total-count="totalCount"
            :ai-summary="aiSummary"
            :ai-loading="aiLoading"
            :ai-error="aiError"
            @date-change="handleDateChange"
            @today="selectToday"
            @refresh="refreshAllData"
            @retry-ai-summary="retryAISummary"
          />

          <!-- 右栏：打卡卡片网格 -->
          <DailyRightPanel
            :exercise-status="exerciseStatus"
            :exercise-data="exerciseData"
            :meal-status="mealStatus"
            :meal-data="mealData"
            :sleep-status="sleepStatus"
            :sleep-data="sleepData"
            :total-records="allTotalRecords"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Sidebar from '@/components/homeView/Sidebar.vue'
import TopHeader from '@/components/homeView/TopHeader.vue'
import DailyLeftPanel from '@/components/dailyCheckinView/DailyLeftPanel.vue'
import DailyRightPanel from '@/components/dailyCheckinView/DailyRightPanel.vue'
import { useExerciseCheckin } from '@/composables/useExerciseCheckin'
import { useMealCheckin } from '@/composables/useMealCheckin'
import { useSleepCheckin } from '@/composables/useSleepCheckin'
import { useAISummary } from '@/composables/useAISummary'
import { getLocalISOString } from '@/utils/dateTime'

const sidebarRef = ref<InstanceType<typeof Sidebar>>()
const selectedDate = ref(getLocalISOString().split('T')[0])

// 导入三个composable
const { 
  todayStatistics: exerciseStats, 
  records: exerciseRecords, 
  loadRecords: loadExerciseRecords, 
  startPolling: startExercisePolling, 
  stopPolling: stopExercisePolling 
} = useExerciseCheckin()

const { 
  totalNutrition: mealStats, 
  records: mealRecords, 
  loadRecords: loadMealRecords, 
  startPolling: startMealPolling, 
  stopPolling: stopMealPolling 
} = useMealCheckin()

const { 
  todayStatistics: sleepStats, 
  records: sleepRecords, 
  loadRecords: loadSleepRecords, 
  startPolling: startSleepPolling, 
  stopPolling: stopSleepPolling 
} = useSleepCheckin()

// AI 总结 composable
const { 
  summary: aiSummary,
  loading: aiLoading,
  error: aiError,
  getAISummary
} = useAISummary()

// 计算完成状态
const exerciseStatus = computed(() => {
  if (exerciseRecords.value.length > 0) return 'completed'
  return 'none'
})

const mealStatus = computed(() => {
  if (mealRecords.value.length > 0) return 'completed'
  return 'none'
})

const sleepStatus = computed(() => {
  if (sleepRecords.value.length > 0) return 'completed'
  return 'none'
})

// 计算显示的数据
const exerciseData = computed(() => ({
  duration: exerciseStats.value?.totalDuration || 0,
  calories: exerciseStats.value?.totalCalories || 0
}))

const mealData = computed(() => ({
  calories: mealStats.value?.calories || 0,
  protein: mealStats.value?.protein || 0
}))

const sleepData = computed(() => ({
  duration: sleepStats.value?.totalNightHours ? sleepStats.value.totalNightHours / 60 : 0,
  quality: sleepStats.value?.avgQualityScore || 0
}))

// 计算完成数量
const completedCount = computed(() => {
  let count = 0
  if (exerciseStatus.value === 'completed') count++
  if (mealStatus.value === 'completed') count++
  if (sleepStatus.value === 'completed') count++
  return count
})

// 计算总数
const totalCount = computed(() => 3)

// 计算所有记录总数
const allTotalRecords = computed(() => {
  return (exerciseRecords.value.length || 0) + (mealRecords.value.length || 0) + (sleepRecords.value.length || 0)
})

// 方法
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

const handleDateChange = (newDate: string) => {
  selectedDate.value = newDate
  loadAllData()
}

const selectToday = () => {
  selectedDate.value = getLocalISOString().split('T')[0]
  loadAllData()
}

const retryAISummary = async () => {
  console.log('重新加载 AI 总结...')
  await getAISummary()
}

const loadAllData = async () => {
  try {
    await Promise.all([
      loadExerciseRecords(),
      loadMealRecords(),
      loadSleepRecords()
    ])
  } catch (error) {
    console.error('Error loading daily data:', error)
  }
}

const refreshAllData = async () => {
  console.log('刷新所有数据...')
  await loadAllData()
  // 同时刷新 AI 总结
  await getAISummary()
}

onMounted(async () => {
  await loadAllData()
  // 获取 AI 总结（只获取一次）
  await getAISummary()
  // 开始轮询以获得实时数据
  startExercisePolling()
  startMealPolling()
  startSleepPolling()
})

// 清理轮询
onBeforeUnmount(() => {
  stopExercisePolling()
  stopMealPolling()
  stopSleepPolling()
})
</script>

<style scoped>
@import '@/css/DailyCheckinDisplay.css';
</style>
