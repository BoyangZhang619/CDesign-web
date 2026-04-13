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

<style scoped>
.filter-panel {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  background: linear-gradient(135deg, #F8F6F3 0%, #FEFCFA 100%);
  border-bottom: 1px solid #E1D9D0;
  transition: all 0.2s ease;
}

.filter-panel-header:hover {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
}

.filter-panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #4A4A4A;
}

.filter-panel-toggle {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
}

.filter-panel-toggle.open {
  transform: rotate(180deg);
}

.filter-panel-content {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4A4A4A;
  margin-bottom: 10px;
}

.type-buttons,
.category-buttons,
.priority-buttons,
.status-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-btn,
.category-btn,
.priority-btn,
.status-btn {
  padding: 8px 12px;
  border: 1px solid #D8CFC4;
  background: #FFF;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
}

.type-btn:hover,
.category-btn:hover,
.priority-btn:hover,
.status-btn:hover {
  border-color: #C8B4A0;
  background: #FBF8F5;
}

.type-btn.active,
.category-btn.active,
.priority-btn.active,
.status-btn.active {
  background: #E8D9C8;
  border-color: #C8B4A0;
  color: #6B5B47;
  font-weight: 600;
}

.date-range-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.date-input,
.search-input {
  padding: 8px 12px;
  border: 1px solid #D8CFC4;
  border-radius: 6px;
  font-size: 13px;
  background: #FFF;
  transition: all 0.2s ease;
}

.date-input:focus,
.search-input:focus {
  outline: none;
  border-color: #C8B4A0;
  background: #FFFBF7;
  box-shadow: 0 0 0 2px rgba(200, 180, 160, 0.1);
}

.search-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #E8E1D6;
  margin-top: 15px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #D4A574 0%, #C89860 100%);
  color: #FFF;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #C89860 0%, #B88A50 100%);
  transform: translateY(-2px);
}

.btn-secondary {
  background: #F5F1ED;
  color: #666;
  border: 1px solid #D8CFC4;
}

.btn-secondary:hover {
  background: #FEFCFA;
  border-color: #C8B4A0;
}
</style>
