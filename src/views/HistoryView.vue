<template>
  <div class="history container-md">
    <div class="history-container">
      <!-- 左栏：筛选 + 记录列表 -->
      <div class="history-left-panel">
        <!-- 顶部按钮（详情按钮仅中小屏幕显示） -->
        <!-- <div class="left-panel-top">
              <button 
                class="history-detail-btn" 
                @click="showFiltersOnMobile = !showFiltersOnMobile"
                title="筛选和搜索"
              >
                ⚙️
              </button>
            </div> -->

        <!-- 筛选面板（打卡记录） -->
        <div v-if="activeTab === 'checkin'" class="filter-panel">
          <HistoryFilter :is-open="isFilterPanelOpen" @toggle="isFilterPanelOpen = !isFilterPanelOpen"
            @apply="handleApplyFilters" @reset="handleResetFilters" />
        </div>

        <!-- 筛选面板（任务完成） -->
        <div v-if="activeTab === 'tasks'" class="filter-panel">
          <TaskCompletionFilter :is-open="isTaskFilterPanelOpen"
            @toggle="isTaskFilterPanelOpen = !isTaskFilterPanelOpen" @apply="handleApplyTaskFilters"
            @reset="handleResetTaskFilters" @sort="handleTaskSort" @type="handleTaskType" @category="handleTaskCategory"
            @priority="handleTaskPriority" @status="handleTaskStatus" @date-range="handleTaskDateRange"
            @search="handleSearchTasks" />
        </div>

        <!-- 记录列表容器 -->
        <div class="records-section">
          <!-- 打卡记录列表 -->
          <div v-show="activeTab === 'checkin'" class="records-container">
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
            <HistoryRecordsList v-else :records="records" @select="selectedRecord = $event" />
          </div>

          <!-- 任务完成列表 -->
          <div v-show="activeTab === 'tasks'" class="records-container">
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
            <TaskCompletionRecordsList v-else :records="taskRecords" @select="selectedTaskRecord = $event" />
          </div>
        </div>

        <!-- 分页 -->
        <div v-show="activeTab === 'checkin'" class="pagination-section">
          <HistoryPagination v-if="!loading && records.length > 0" :current-page="currentPage" :total-pages="totalPages"
            @prev="currentPage--" @next="currentPage++" @goto="currentPage = $event" />
        </div>

        <div v-show="activeTab === 'tasks'" class="pagination-section">
          <TaskCompletionPagination v-if="!taskLoading && taskRecords.length > 0" :current-page="taskCurrentPage"
            :total-pages="taskTotalPages" @prev="taskCurrentPage--" @next="taskCurrentPage++" />
        </div>
      </div>

      <!-- 右栏：详情展示 -->
      <div class="history-right-panel">
        <!-- 打卡记录详情 -->
        <div v-show="activeTab === 'checkin'" class="details-wrapper">
          <!-- 打卡类型统计 -->
          <HistoryStats />

          <!-- 详情标题 -->
          <div class="detail-section-title" v-if="selectedRecord">选中的打卡记录</div>

          <!-- 记录详情或提示 -->
          <div v-if="selectedRecord" class="detail-content">
            <HistoryRecordContent :record="selectedRecord" @delete="handleDeleteRecord" />
          </div>
          <div v-else class="no-selection-hint">
            <p>👈 选择左侧记录查看详情</p>
          </div>
        </div>

        <!-- 任务完成详情 -->
        <div v-show="activeTab === 'tasks'" class="details-wrapper">
          <!-- 任务统计信息 -->
          <TaskCompletionStats v-if="taskStats" :stats="taskStats" />

          <!-- 详情标题 -->
          <div class="detail-section-title" v-if="selectedTaskRecord">选中的任务记录</div>

          <!-- 任务详情或提示 -->
          <div v-if="selectedTaskRecord" class="detail-content">
            <TaskCompletionContent :record="selectedTaskRecord" />
          </div>
          <div v-else class="no-selection-hint">
            <p>👈 选择左侧任务查看详情</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部标签页切换（仅平板和手机） -->
    <div class="tabs-footer">
      <button class="tab-btn" :class="{ active: activeTab === 'checkin' }" @click="activeTab = 'checkin'">
        📋 打卡记录
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">
        ✓ 任务完成
      </button>
    </div>

    <!-- 顶部切换按钮（仅桌面显示） -->
    <div class="desktop-tabs-header">
      <button class="desktop-tab-btn" :class="{ active: activeTab === 'checkin' }" @click="activeTab = 'checkin'">
        📋 打卡记录
      </button>
      <button class="desktop-tab-btn" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">
        ✓ 任务完成
      </button>
    </div>
  </div>

  <!-- 详情模态窗口（手机端） -->
  <!-- 打卡记录详情 -->
  <div v-if="selectedRecord && isMobileView" class="detail-modal-overlay" @click="selectedRecord = null">
    <div class="detail-modal" @click.stop>
      <button class="modal-close-btn" @click="selectedRecord = null">✕</button>
      <HistoryRecordDetail :record="selectedRecord" @close="selectedRecord = null" @delete="handleDeleteRecord" />
    </div>
  </div>

  <!-- 任务完成详情 -->
  <div v-if="selectedTaskRecord && isMobileView" class="detail-modal-overlay" @click="selectedTaskRecord = null">
    <div class="detail-modal" @click.stop>
      <button class="modal-close-btn" @click="selectedTaskRecord = null">✕</button>
      <TaskCompletionDetail :record="selectedTaskRecord" @close="selectedTaskRecord = null" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// import HistoryHeader from '../components/historyView/HistoryHeader.vue'
import HistoryFilter from '../components/historyView/HistoryFilter.vue'
import HistoryStats from '../components/historyView/HistoryStats.vue'
import HistoryRecordsList from '../components/historyView/HistoryRecordsList.vue'
import HistoryRecordDetail from '../components/historyView/HistoryRecordDetail.vue'
import HistoryRecordContent from '../components/historyView/HistoryRecordContent.vue'
import HistoryPagination from '../components/historyView/HistoryPagination.vue'
import TaskCompletionFilter from '../components/historyView/TaskCompletionFilter.vue'
import TaskCompletionStats from '../components/historyView/TaskCompletionStats.vue'
import TaskCompletionRecordsList from '../components/historyView/TaskCompletionRecordsList.vue'
import TaskCompletionDetail from '../components/historyView/TaskCompletionDetail.vue'
import TaskCompletionContent from '../components/historyView/TaskCompletionContent.vue'
import TaskCompletionPagination from '../components/historyView/TaskCompletionPagination.vue'
import { useHistory } from '../composables/useHistory'
import { useTaskCompletionHistory } from '../composables/useTaskCompletionHistory'
import { getCurrentDate } from '../utils/dateTime'
import type { HistoryRecord } from '../composables/useHistory'
import type { TaskCompletionRecord } from '../composables/useTaskCompletionHistory'

const activeTab = ref<'checkin' | 'tasks'>('checkin')
const isFilterPanelOpen = ref(false)
const isMobileView = ref(window.innerWidth < 1025)  // 是否为移动端视图
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
  loadRecords: loadTaskRecords,
  loadStats: loadTaskStats,
  resetFilters: resetTaskFilters,
  applyFilters: applyTaskFilters,
  changeSort: changeTaskSort,
  changeType: changeTaskType,
  changeCategory: changeTaskCategory,
  changePriority: changeTaskPriority,
  changeStatus: changeTaskStatus,
  setDateRange: setTaskDateRange,
  searchTasks: searchTaskTasks,
} = useTaskCompletionHistory()

// 标签页切换
// const switchTab = (tab: 'checkin' | 'tasks') => {
//   console.log(`🔄 [HistoryView] 切换标签页至: ${tab}`)
//   activeTab.value = tab
//   
//   // 如果切换到任务完成标签页，加载任务数据和统计
//   if (tab === 'tasks' && taskRecords.value.length === 0) {
//     console.log('📝 [HistoryView] 首次加载任务数据和统计')
//     loadTaskRecords()
//     loadTaskStats()
//   }
// }

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

  // 初始化任务完成记录
  loadTaskRecords()
  loadTaskStats()

  // 监听窗口大小变化
  const handleResize = () => {
    isMobileView.value = window.innerWidth < 1025
  }
  window.addEventListener('resize', handleResize)

  // 清理
  return () => {
    window.removeEventListener('resize', handleResize)
  }
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

</script>

<style lang="scss" scoped src="@/scss/views/HistoryView.scss"></style>
