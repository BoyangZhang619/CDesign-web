<template>
  <div class="filter-panel">
    <!-- 筛选面板头部 - 切换按钮 -->
    <div class="filter-panel-header" @click="$emit('toggle')">
      <span class="filter-panel-title">任务筛选</span>
      <span class="filter-panel-toggle" :class="{ open: isOpen }">▼</span>
    </div>

    <!-- 筛选内容 - 可折叠 -->
    <div v-show="isOpen" class="filter-panel-content">
      <!-- 任务类型选择 -->
      <div class="filter-section">
        <label class="filter-label">任务类型</label>
        <div class="type-buttons">
          <button 
            v-for="option in typeOptions" 
            :key="option.value" 
            @click="$emit('type', option.value); changeType(option.value)"
            :class="['type-btn', { active: filters.type === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 分类选择 -->
      <div class="filter-section">
        <label class="filter-label">分类</label>
        <div class="category-buttons">
          <button 
            v-for="option in categoryOptions" 
            :key="option.value" 
            @click="$emit('category', option.value); changeCategory(option.value)"
            :class="['category-btn', { active: filters.category === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 优先级选择 -->
      <div class="filter-section">
        <label class="filter-label">优先级</label>
        <div class="priority-buttons">
          <button 
            v-for="option in priorityOptions" 
            :key="option.value" 
            @click="$emit('priority', option.value); changePriority(option.value)"
            :class="['priority-btn', { active: filters.priority === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 完成状态选择 -->
      <div class="filter-section">
        <label class="filter-label">完成状态</label>
        <div class="status-buttons">
          <button 
            v-for="option in statusOptions" 
            :key="option.value" 
            @click="$emit('status', option.value); changeStatus(option.value)"
            :class="['status-btn', { active: filters.completionStatus === option.value }]"
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
              @change="$emit('date-range', { startDate: filters.startDate, endDate: filters.endDate })"
              type="date" 
              class="date-input"
            />
          </div>
          <div class="date-input-group">
            <label for="endDate" class="date-label">结束日期</label>
            <input 
              id="endDate" 
              v-model="filters.endDate" 
              @change="$emit('date-range', { startDate: filters.startDate, endDate: filters.endDate })"
              type="date" 
              class="date-input"
            />
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="filter-section">
        <label class="filter-label">搜索任务</label>
        <input 
          v-model="filters.searchText" 
          @input="$emit('search', filters.searchText)"
          type="text" 
          class="search-input"
          placeholder="输入任务标题搜索..."
        />
      </div>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button @click="$emit('apply')" class="btn-primary">查询</button>
        <button @click="$emit('reset')" class="btn-secondary">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskCompletionHistory } from '../../composables/useTaskCompletionHistory'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle', 'apply', 'reset', 'sort', 'type', 'category', 'priority', 'status', 'date-range', 'search'])

const { 
  filters, 
  typeOptions, 
  categoryOptions,
  priorityOptions,
  statusOptions,
  changeType, 
  changeCategory,
  changePriority,
  changeStatus,
} = useTaskCompletionHistory()
</script>

<style lang="scss" scoped src="@/scss/components/historyView/TaskCompletionFilter.scss"></style>
