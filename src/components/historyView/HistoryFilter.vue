<template>
  <div class="filter-panel">
    <!-- 筛选面板头部 - 切换按钮 -->
    <div class="filter-panel-header" @click="$emit('toggle')">
      <span class="filter-panel-title">打卡筛选</span>
      <span class="filter-panel-toggle" :class="{ open: isOpen }">▼</span>
    </div>

    <!-- 筛选内容 - 可折叠 -->
    <div v-show="isOpen" class="filter-panel-content">
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

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button @click="$emit('apply')" class="btn-primary">查询</button>
        <button @click="$emit('reset')" class="btn-secondary">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHistory } from '../../composables/useHistory'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle', 'apply', 'reset'])

const { filters, typeOptions, changeType } = useHistory()
</script>

<style lang="scss" scoped src="@/scss/components/historyView/HistoryFilter.scss"></style>
