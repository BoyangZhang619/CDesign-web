<template>
  <div class="history-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader 
        @toggle-sidebar="toggleSidebar" 
        :title="'历史记录'" 
        :subtitle="activeTab === 'checkin' ? '查看您的历史打卡记录' : '查看您的任务完成记录'"
      />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="history-wrapper">
          <!-- 标签页切换 -->
          <div class="tabs-container">
            <div class="tabs">
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'checkin' }"
                @click="switchTab('checkin')"
              >
                <span class="tab-icon">📋</span>
                打卡记录
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'tasks' }"
                @click="switchTab('tasks')"
              >
                <span class="tab-icon">✓</span>
                任务完成
              </button>
            </div>
          </div>

          <!-- 打卡记录标签页 -->
          <div v-show="activeTab === 'checkin'" class="tab-pane">
            <!-- 筛选面板 -->
            <HistoryFilter 
              :is-open="isFilterPanelOpen"
              @toggle="isFilterPanelOpen = !isFilterPanelOpen"
              @apply="handleApplyFilters"
              @reset="handleResetFilters"
            />

            <!-- 信息栏和排序 -->
            <HistoryInfoBar />

            <!-- 错误提示 -->
            <div v-if="errorMsg" class="error-box">
              {{ errorMsg }}
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>加载中...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="records.length === 0" class="empty-state">
              <div class="empty-icon">—</div>
              <h3 class="empty-title">暂无记录</h3>
              <p class="empty-text">尝试调整筛选条件或创建新的打卡记录</p>
            </div>

            <!-- 记录列表 -->
            <HistoryRecordsList 
              v-else
              :records="records"
              @select="selectedRecord = $event"
            />

            <!-- 记录详情悬浮弹窗 -->
            <HistoryRecordDetail 
              v-if="selectedRecord"
              :record="selectedRecord"
              @close="selectedRecord = null"
              @delete="handleDeleteRecord"
            />

            <!-- 分页 -->
            <HistoryPagination 
              v-if="!loading && records.length > 0"
              :current-page="currentPage"
              :total-pages="totalPages"
              @prev="currentPage--"
              @next="currentPage++"
            />
          </div>

          <!-- 任务完成标签页 -->
          <div v-show="activeTab === 'tasks'" class="tab-pane">
            <!-- 任务筛选面板 -->
            <TaskCompletionFilter 
              :is-open="isTaskFilterPanelOpen"
              @toggle="isTaskFilterPanelOpen = !isTaskFilterPanelOpen"
              @apply="handleApplyTaskFilters"
              @reset="handleResetTaskFilters"
              @sort="handleTaskSort"
              @type="handleTaskType"
              @category="handleTaskCategory"
              @priority="handleTaskPriority"
              @status="handleTaskStatus"
              @date-range="handleTaskDateRange"
              @search="handleSearchTasks"
            />

            <!-- 任务统计信息 -->
            <TaskCompletionStats v-if="taskStats" :stats="taskStats" />

            <!-- 错误提示 -->
            <div v-if="taskErrorMsg" class="error-box">
              {{ taskErrorMsg }}
            </div>

            <!-- 加载状态 -->
            <div v-if="taskLoading" class="loading-state">
              <div class="spinner"></div>
              <p>加载中...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="taskRecords.length === 0" class="empty-state">
              <div class="empty-icon">✓</div>
              <h3 class="empty-title">暂无任务完成记录</h3>
              <p class="empty-text">尝试调整筛选条件或完成新的任务</p>
            </div>

            <!-- 任务记录列表 -->
            <TaskCompletionRecordsList 
              v-else
              :records="taskRecords"
              @select="selectedTaskRecord = $event"
            />

            <!-- 任务记录详情 -->
            <TaskCompletionDetail 
              v-if="selectedTaskRecord"
              :record="selectedTaskRecord"
              @close="selectedTaskRecord = null"
            />

            <!-- 任务分页 -->
            <TaskCompletionPagination 
              v-if="!taskLoading && taskRecords.length > 0"
              :current-page="taskCurrentPage"
              :total-pages="taskTotalPages"
              @prev="taskCurrentPage--"
              @next="taskCurrentPage++"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
// import HistoryHeader from '../components/historyView/HistoryHeader.vue'
import HistoryFilter from '../components/historyView/HistoryFilter.vue'
import HistoryInfoBar from '../components/historyView/HistoryInfoBar.vue'
import HistoryRecordsList from '../components/historyView/HistoryRecordsList.vue'
import HistoryRecordDetail from '../components/historyView/HistoryRecordDetail.vue'
import HistoryPagination from '../components/historyView/HistoryPagination.vue'
import TaskCompletionFilter from '../components/historyView/TaskCompletionFilter.vue'
import TaskCompletionStats from '../components/historyView/TaskCompletionStats.vue'
import TaskCompletionRecordsList from '../components/historyView/TaskCompletionRecordsList.vue'
import TaskCompletionDetail from '../components/historyView/TaskCompletionDetail.vue'
import TaskCompletionPagination from '../components/historyView/TaskCompletionPagination.vue'
import { useHistory } from '../composables/useHistory'
import { useTaskCompletionHistory } from '../composables/useTaskCompletionHistory'
import { getCurrentDate } from '../utils/dateTime'
import type { HistoryRecord } from '../composables/useHistory'
import type { TaskCompletionRecord } from '../composables/useTaskCompletionHistory'

const sidebarRef = ref()
const activeTab = ref<'checkin' | 'tasks'>('checkin')
const isFilterPanelOpen = ref(false)
const selectedRecord = ref<HistoryRecord | null>(null)

// 打卡记录 composable
const {
  records,
  loading,
  errorMsg,
  currentPage,
  filters,
  loadRecords,
  resetFilters,
  applyFilters,
  deleteRecord,
  totalPages
} = useHistory()

// 任务完成记录 composable
const isTaskFilterPanelOpen = ref(false)
const selectedTaskRecord = ref<TaskCompletionRecord | null>(null)

const {
  records: taskRecords,
  stats: taskStats,
  loading: taskLoading,
  errorMsg: taskErrorMsg,
  currentPage: taskCurrentPage,
  totalPages: taskTotalPages,
  // filters: taskFilters,
  loadRecords: loadTaskRecords,
  loadStats: loadTaskStats,
  resetFilters: resetTaskFilters,
  applyFilters: applyTaskFilters,
  // loadCompletionByDate: loadTaskCompletionByDate,
  changeSort: changeTaskSort,
  changeType: changeTaskType,
  changeCategory: changeTaskCategory,
  changePriority: changeTaskPriority,
  changeStatus: changeTaskStatus,
  setDateRange: setTaskDateRange,
  searchTasks: searchTaskTasks,
} = useTaskCompletionHistory()

// 标签页切换
const switchTab = (tab: 'checkin' | 'tasks') => {
  console.log(`🔄 [HistoryView] 切换标签页至: ${tab}`)
  activeTab.value = tab
  
  // 如果切换到任务完成标签页，加载任务数据和统计
  if (tab === 'tasks' && taskRecords.value.length === 0) {
    console.log('📝 [HistoryView] 首次加载任务数据和统计')
    loadTaskRecords()
    loadTaskStats()
  }
}

// 打卡记录监听
watch(currentPage, () => {
  loadRecords()
})

// 任务完成记录监听
watch(taskCurrentPage, () => {
  loadTaskRecords()
})

// 初始化
onMounted(() => {
  console.log('🚀 [HistoryView] 页面挂载')
  
  // 初始化打卡记录筛选
  if (!filters.value.startDate) {
    filters.value.startDate = getCurrentDate()
  }
  if (!filters.value.endDate) {
    filters.value.endDate = getCurrentDate()
  }
  loadRecords()
  
  // 初始化任务完成记录筛选 默认获取全部信息
  // if (!taskFilters.value.startDate) {
  //   taskFilters.value.startDate = getCurrentDate()
  // }
  // if (!taskFilters.value.endDate) {
  //   taskFilters.value.endDate = getCurrentDate()
  // }
})

// 打卡记录处理方法
const handleApplyFilters = () => {
  console.log('✨ [HistoryView] 应用打卡记录筛选条件')
  applyFilters()
  isFilterPanelOpen.value = false
}

const handleResetFilters = () => {
  console.log('🔄 [HistoryView] 重置打卡记录筛选条件')
  resetFilters()
  isFilterPanelOpen.value = false
}

const handleDeleteRecord = async (id: string | number) => {
  console.log(`🗑️ [HistoryView] 删除打卡记录: ${id}`)
  await deleteRecord(id as string)
  selectedRecord.value = null
}

// 任务完成记录处理方法
const handleApplyTaskFilters = () => {
  console.log('✨ [HistoryView] 应用任务完成记录筛选条件')
  applyTaskFilters()
  isTaskFilterPanelOpen.value = false
}

const handleResetTaskFilters = () => {
  console.log('🔄 [HistoryView] 重置任务完成记录筛选条件')
  resetTaskFilters()
  isTaskFilterPanelOpen.value = false
}

// TaskCompletionFilter emit 处理函数 - 直接触发数据加载
const handleTaskSort = (sort: string) => {
  console.log('📊 [HistoryView] 改变任务排序:', sort)
  changeTaskSort(sort)
  loadTaskRecords()
}

const handleTaskType = (type: string) => {
  console.log('🏷️ [HistoryView] 改变任务类型:', type)
  changeTaskType(type)
  loadTaskRecords()
}

const handleTaskCategory = (category: string) => {
  console.log('📂 [HistoryView] 改变任务分类:', category)
  changeTaskCategory(category)
  loadTaskRecords()
}

const handleTaskPriority = (priority: string) => {
  console.log('⚡ [HistoryView] 改变任务优先级:', priority)
  changeTaskPriority(priority)
  loadTaskRecords()
}

const handleTaskStatus = (status: string) => {
  console.log('✓ [HistoryView] 改变任务完成状态:', status)
  changeTaskStatus(status)
  loadTaskRecords()
}

const handleTaskDateRange = (dateRange: { startDate: string; endDate: string }) => {
  console.log('📅 [HistoryView] 改变任务日期范围:', dateRange)
  setTaskDateRange(dateRange.startDate, dateRange.endDate)
  loadTaskRecords()
}

const handleSearchTasks = (searchText: string) => {
  console.log('🔍 [HistoryView] 搜索任务:', searchText)
  searchTaskTasks(searchText)
  loadTaskRecords()
}

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}
</script>

<style scoped>
@import '@/css/HistoryView.css';

/* 标签页容器 */
.tabs-container {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border-radius: 12px;
  border: 1px solid #E8E1D6;
  padding: 4px;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #888888;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover {
  background: rgba(200, 180, 160, 0.08);
  color: #C8B4A0;
}

.tab-button.active {
  background: linear-gradient(135deg, #F5E6D3 0%, #EDD9CC 100%);
  color: #8B6F47;
  box-shadow: 0 2px 8px rgba(200, 180, 160, 0.15);
}

.tab-icon {
  font-size: 16px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
