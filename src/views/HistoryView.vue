<template>
  <div class="history-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'历史记录'" :subtitle="'查看您的历史打卡记录'" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="history-wrapper">
          <!-- 页面头部 -->
          <!-- <HistoryHeader /> -->

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
import { useHistory } from '../composables/useHistory'
import { getCurrentDate } from '../utils/dateTime'
import type { HistoryRecord } from '../composables/useHistory'

const sidebarRef = ref()
const isFilterPanelOpen = ref(false)
const selectedRecord = ref<HistoryRecord | null>(null)

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

watch(currentPage, () => {
  loadRecords()
})

onMounted(() => {
  if (!filters.value.startDate) {
    filters.value.startDate = getCurrentDate()
  }
  if (!filters.value.endDate) {
    filters.value.endDate = getCurrentDate()
  }
  loadRecords()
})

const handleApplyFilters = () => {
  applyFilters()
  isFilterPanelOpen.value = false
}

const handleResetFilters = () => {
  resetFilters()
  isFilterPanelOpen.value = false
}

const handleDeleteRecord = async (id: string | number) => {
  await deleteRecord(id as string)
  selectedRecord.value = null
}

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}
</script>

<style scoped>
@import '@/css/HistoryView.css';
</style>
