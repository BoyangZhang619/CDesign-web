<template>
  <div class="history-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" />

      <!-- 内容区 -->
      <div class="content-area">
        <div class="history-wrapper">
        <!-- 页面头部 -->
        <div class="history-header">
          <h1 class="history-title">历史记录</h1>
          <p class="history-subtitle">查询和管理您的健康打卡记录</p>
        </div>

        <!-- 筛选面板 -->
        <div class="filter-panel">
          <!-- 筛选面板头部 - 切换按钮 -->
          <div class="filter-panel-header" @click="isFilterPanelOpen = !isFilterPanelOpen">
            <span class="filter-panel-title">筛选条件</span>
            <span class="filter-panel-toggle" :class="{ open: isFilterPanelOpen }">▼</span>
          </div>

          <!-- 筛选内容 - 可折叠 -->
          <div v-show="isFilterPanelOpen" class="filter-panel-content">
            <!-- 记录类型选择 -->
            <div class="filter-section">
              <label class="filter-label">记录类型</label>
              <div class="type-buttons">
                <button 
                  v-for="option in typeOptions" 
                  :key="option.value" 
                  @click="changeType(option.value)"
                  :class="['type-btn', { active: filters.type === option.value }]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 日期范围选择 -->
            <div class="filter-section">
              <label class="filter-label">日期范围</label>
              <div class="date-range-container">
                <div class="date-input-group">
                  <label for="startDate" class="date-label">开始日期</label>
                  <input 
                    id="startDate" 
                    v-model="filters.startDate" 
                    type="date" 
                    class="date-input"
                  />
                </div>
                <div class="date-input-group">
                  <label for="endDate" class="date-label">结束日期</label>
                  <input 
                    id="endDate" 
                    v-model="filters.endDate" 
                    type="date" 
                    class="date-input"
                  />
                </div>
              </div>
            </div>

            <!-- 搜索栏 -->
            <!-- <div class="filter-section">
              <label class="filter-label">搜索备注</label>
              <div class="search-container">
                <input 
                  v-model="filters.searchText" 
                  type="text" 
                  class="search-input"
                  placeholder="输入关键词搜索..." 
                />
                <button @click="applyFilters" class="btn-search">搜索</button>
              </div>
            </div> -->

            <!-- 操作按钮 -->
            <div class="filter-actions">
              <button @click="applyFilters" class="btn-primary">查询</button>
              <button @click="resetFilters" class="btn-secondary">重置</button>
            </div>
          </div>
        </div>

        <!-- 排序和统计信息 -->
        <div class="info-bar">
          <div class="sort-section">
            <div class="sort-buttons">
              <button 
                v-for="option in sortOptions" 
                :key="option.value" 
                @click="changeSort(option.value)"
                :class="['sort-btn', { active: currentSort === option.value }]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <div class="pagination-info">{{ paginationInfo }}</div>
        </div>

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
        <div v-else class="records-list">
          <div 
            v-for="record in records" 
            :key="record.id" 
            class="record-item"
            @click="selectedRecord = record"
          >
            <!-- 饮食记录块 -->
            <template v-if="record.type === 'meal'">
              <div class="record-item-content">
                <div class="record-left">
                  <span class="record-type-badge meal">🍽️</span>
                  <div class="record-info">
                    <h4 class="record-title">{{ record.food_name }}</h4>
                    <p class="record-meta">{{ formatTime(record.meal_time) }}</p>
                  </div>
                </div>
                <div class="record-right">
                  <span class="record-value">{{ Math.round(parseFloat(String(record.calories))) }} 卡</span>
                </div>
              </div>
            </template>

            <!-- 运动记录块 -->
            <template v-else-if="record.type === 'exercise'">
              <div class="record-item-content">
                <div class="record-left">
                  <span class="record-type-badge exercise">💪</span>
                  <div class="record-info">
                    <h4 class="record-title">{{ record.activity_type }}</h4>
                    <p class="record-meta">{{ record.duration_min }}分钟 · {{ record.intensity }}</p>
                  </div>
                </div>
                <div class="record-right">
                  <span class="record-value">{{ Math.round(parseFloat(String(record.calories_burned))) }} 卡</span>
                </div>
              </div>
            </template>

            <!-- 睡眠记录块 -->
            <template v-else-if="record.type === 'sleep'">
              <div class="record-item-content">
                <div class="record-left">
                  <span class="record-type-badge sleep">😴</span>
                  <div class="record-info">
                    <h4 class="record-title">睡眠时间</h4>
                    <p class="record-meta">{{ Math.round(parseFloat(String(record.sleep_duration_hours))) }} 小时 · {{ formatTime(record.sleep_start_time) }} - {{ formatTime(record.wake_up_time) }}</p>
                  </div>
                </div>
                <div class="record-right">
                  <span class="record-value">⭐ {{ record.sleep_quality_score }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 记录详情悬浮弹窗 -->
        <div v-if="selectedRecord" class="record-detail-overlay" @click="selectedRecord = null">
          <div class="record-detail-modal" @click.stop>
            <!-- 饮食详情 -->
            <template v-if="selectedRecord.type === 'meal'">
              <div class="modal-header">
                <span class="modal-type-badge meal">🍽️ 饮食记录</span>
                <button class="modal-close" @click="selectedRecord = null">✕</button>
              </div>
              <div class="modal-content">
                <h3 class="modal-title">{{ selectedRecord.food_name }}</h3>
                <div class="modal-meta">
                  <span>{{ selectedRecord.meal_type }}</span>
                  <span>·</span>
                  <span>{{ selectedRecord.food_source }}</span>
                  <span>·</span>
                  <span>{{ formatTime(selectedRecord.meal_time) }}</span>
                </div>
                <p v-if="selectedRecord.food_detail" class="modal-note">{{ selectedRecord.food_detail }}</p>
                <div class="nutrition-grid">
                  <div class="nutrition-item">
                    <span class="nutrition-label">热量</span>
                    <span class="nutrition-value">{{ Math.round(parseFloat(String(selectedRecord.calories))) }} 卡</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">蛋白质</span>
                    <span class="nutrition-value">{{ selectedRecord.protein_g }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">脂肪</span>
                    <span class="nutrition-value">{{ selectedRecord.fat_g }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">碳水</span>
                    <span class="nutrition-value">{{ selectedRecord.carbohydrate_g }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">纤维</span>
                    <span class="nutrition-value">{{ selectedRecord.fiber_g }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">糖分</span>
                    <span class="nutrition-value">{{ selectedRecord.sugar_g }}g</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 运动详情 -->
            <template v-else-if="selectedRecord.type === 'exercise'">
              <div class="modal-header">
                <span class="modal-type-badge exercise">💪 运动记录</span>
                <button class="modal-close" @click="selectedRecord = null">✕</button>
              </div>
              <div class="modal-content">
                <h3 class="modal-title">{{ selectedRecord.activity_type }}</h3>
                <div class="modal-meta">
                  <span>{{ selectedRecord.duration_min }}分钟</span>
                  <span>·</span>
                  <span>{{ selectedRecord.intensity }}强度</span>
                  <span>·</span>
                  <span>{{ formatTime(selectedRecord.start_time) }} - {{ formatTime(selectedRecord.end_time) }}</span>
                </div>
                <p v-if="selectedRecord.note" class="modal-note">{{ selectedRecord.note }}</p>
                <div class="exercise-stats">
                  <div class="stat-item">
                    <span class="stat-label">消耗卡路里</span>
                    <span class="stat-value">{{ Math.round(parseFloat(String(selectedRecord.calories_burned))) }} 卡</span>
                  </div>
                </div>
                <div class="ai-section">
                  <h4 class="section-title">🤖 AI 建议</h4>
                  <p class="section-content">{{ selectedRecord.suggestion }}</p>
                  <h4 class="section-title">📊 AI 评价</h4>
                  <p class="section-content">{{ selectedRecord.evaluation }}</p>
                </div>
              </div>
            </template>

            <!-- 睡眠详情 -->
            <template v-else-if="selectedRecord.type === 'sleep'">
              <div class="modal-header">
                <span class="modal-type-badge sleep">😴 睡眠记录</span>
                <button class="modal-close" @click="selectedRecord = null">✕</button>
              </div>
              <div class="modal-content">
                <h3 class="modal-title">睡眠质量: {{ selectedRecord.sleep_quality_score }}/100</h3>
                <div class="modal-meta">
                  <span>{{ formatTime(selectedRecord.sleep_start_time) }} 睡眠</span>
                  <span>·</span>
                  <span>{{ formatTime(selectedRecord.wake_up_time) }} 起床</span>
                </div>
                <div class="sleep-stats">
                  <div class="stat-item">
                    <span class="stat-label">睡眠时长</span>
                    <span class="stat-value">{{ Math.round(parseFloat(String(selectedRecord.sleep_duration_hours))) }} 小时</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">中途醒来</span>
                    <span class="stat-value">{{ selectedRecord.wake_up_times }} 次</span>
                  </div>
                </div>
                <p v-if="selectedRecord.sleep_feeling" class="modal-note">{{ selectedRecord.sleep_feeling }}</p>
                <div class="ai-section">
                  <h4 class="section-title">🤖 AI 建议</h4>
                  <p class="section-content">{{ selectedRecord.suggestion }}</p>
                  <h4 class="section-title">📊 AI 评价</h4>
                  <p class="section-content">{{ selectedRecord.evaluation }}</p>
                </div>
              </div>
            </template>

            <div class="modal-footer">
              <button class="btn-delete" @click="deleteRecord(selectedRecord.id)">删除记录</button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="!loading && records.length > 0" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage <= 1" 
            class="pagination-btn"
          >
            ← 上一页
          </button>
          <span class="page-indicator">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages" 
            class="pagination-btn"
          >
            下一页 →
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import { useHistory} from '../composables/useHistory'
import { getCurrentDate, formatTime } from '../utils/dateTime'
import type { HistoryRecord } from '../composables/useHistory'

// 侧栏引用
const sidebarRef = ref<InstanceType<typeof Sidebar>>()

// 筛选面板折叠状态（默认关闭）
const isFilterPanelOpen = ref(false)

// 选中的记录（用于显示详情弹窗）
const selectedRecord = ref<HistoryRecord | null>(null)

const todayDate = getCurrentDate()

const {
  records,
  loading,
  errorMsg,
  currentPage,
  filters,
  sortOptions,
  currentSort,
  typeOptions,
  loadRecords,
  resetFilters,
  applyFilters,
  changeSort,
  changeType,
  deleteRecord,
  totalPages,
  paginationInfo
} = useHistory()

// 监听当前页变化，重新加载
watch(currentPage, () => {
  loadRecords()
})

// 初始化加载
onMounted(() => {
  // 如果日期为空，设置为当前日期
  if (!filters.value.startDate) {
    filters.value.startDate = todayDate
  }
  if (!filters.value.endDate) {
    filters.value.endDate = todayDate
  }
  loadRecords()
})

// 侧栏切换
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}
</script>

<style scoped>
@import '@/css/HistoryView.css';
</style>
