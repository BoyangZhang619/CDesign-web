<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="history-wrapper">
        <div class="history-header">
          <h1 class="history-title">历史记录</h1>
          <p class="history-subtitle">查询和管理您的健康打卡记录</p>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-panel">
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

          <div class="filter-row">
            <div class="filter-group">
              <label for="startDate" class="filter-label">开始日期</label>
              <input
                id="startDate"
                v-model="filters.startDate"
                type="date"
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <label for="endDate" class="filter-label">结束日期</label>
              <input
                id="endDate"
                v-model="filters.endDate"
                type="date"
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <label for="searchText" class="filter-label">搜索</label>
              <input
                id="searchText"
                v-model="filters.searchText"
                type="text"
                class="filter-input"
                placeholder="搜索备注..."
              />
            </div>
          </div>

          <div class="filter-actions">
            <button @click="applyFilters" class="btn-filter">查询</button>
            <button @click="resetFilters" class="btn-reset">重置</button>
          </div>
        </div>

        <!-- 排序和统计 -->
        <div class="info-bar">
          <div class="sort-section">
            <label class="sort-label">排序</label>
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
          >
            <div class="record-header">
              <div class="record-info">
                <span class="record-type-badge" :class="`type-${record.type}`">
                  {{ record.type }}
                </span>
                <h4 class="record-title">{{ record.title }}</h4>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <button
                @click="deleteRecord(record.id)"
                class="btn-delete"
                title="删除"
              >
                ✕
              </button>
            </div>

            <div class="record-content">
              <div class="record-value">{{ record.value }}</div>
              <p class="record-description">{{ record.description }}</p>
            </div>

            <div class="record-footer">
              <span class="record-time">{{ record.time }}</span>
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

          <span class="page-indicator">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>

          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="pagination-btn"
          >
            下一页 →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useHistory } from '../composables/useHistory'

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
  loadRecords()
})
</script>

<style scoped>
@import '../css/HistoryView.css';
</style>
