<template>
  <div class="filter-panel">
    <!-- 筛选面板头部 - 切换按钮 -->
    <div class="filter-panel-header" @click="$emit('toggle')">
      <span class="filter-panel-title">筛选条件</span>
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

<style scoped>
.filter-panel {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  overflow: hidden;
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
  color: #5A7A87;
}

.filter-panel-toggle {
  display: inline-block;
  transform: rotate(-90deg);
  transition: transform 0.3s ease;
  color: #8B9FA0;
  font-size: 12px;
}

.filter-panel-toggle.open {
  transform: rotate(0deg);
}

.filter-panel-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: #5A7A87;
}

.type-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-btn {
  padding: 8px 16px;
  background: #F8F6F3;
  color: #5A7A87;
  border: 1px solid #E1D9D0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  background: #F0EBE3;
  border-color: #D1CAC0;
}

.type-btn.active {
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
  border-color: #9DB4A0;
}

.date-range-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-label {
  font-size: 12px;
  font-weight: 600;
  color: #8B9FA0;
}

.date-input {
  padding: 10px;
  background: #FFFFFF;
  border: 1px solid #E1D9D0;
  border-radius: 8px;
  font-size: 12px;
  color: #5A7A87;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #9DB4A0;
  box-shadow: 0 0 0 3px rgba(157, 180, 160, 0.1);
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #9DB4A0 0%, #8FA591 100%);
  color: #FEFCFA;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 180, 160, 0.3);
}

.btn-secondary {
  background: #F8F6F3;
  color: #5A7A87;
  border: 1px solid #E1D9D0;
}

.btn-secondary:hover {
  background: #F0EBE3;
  border-color: #D1CAC0;
}

@media (max-width: 768px) {
  .date-range-container {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }
}
</style>
