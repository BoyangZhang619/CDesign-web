<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="todolist-create-modal-overlay" @click.self="close">
      <div class="todolist-create-modal">
        <!-- 模态框头部 -->
        <div class="modal-header">
          <h2 class="modal-title">创建任务</h2>
          <button class="modal-close-btn" @click="close" aria-label="关闭">✕</button>
        </div>

        <!-- 模态框内容 -->
        <div class="modal-content">
          <!-- 任务类型选择 -->
          <div class="task-type-section">
            <h3 class="section-title">选择任务类型</h3>
            <div class="task-type-grid">
              <!-- 进食任务 -->
              <button
                class="task-type-card"
                :class="{ active: currentTaskType === 'meal' }"
                @click="selectTaskType('meal')"
              >
                <span class="type-icon">🍽️</span>
                <span class="type-label">进食</span>
              </button>

              <!-- 运动任务 -->
              <button
                class="task-type-card"
                :class="{ active: currentTaskType === 'exercise' }"
                @click="selectTaskType('exercise')"
              >
                <span class="type-icon">🏃</span>
                <span class="type-label">运动</span>
              </button>

              <!-- 睡眠任务 -->
              <button
                class="task-type-card"
                :class="{ active: currentTaskType === 'sleep' }"
                @click="selectTaskType('sleep')"
              >
                <span class="type-icon">😴</span>
                <span class="type-label">睡眠</span>
              </button>
            </div>
          </div>

          <!-- 源类型选择 -->
          <div class="source-type-section">
            <h3 class="section-title">任务来源</h3>
            <div class="source-type-grid">
              <!-- 自定义 -->
              <button
                class="source-type-card"
                :class="{ active: currentSourceType === 'custom' }"
                @click="selectSourceType('custom')"
              >
                <span class="source-icon">✏️</span>
                <span class="source-label">自定义</span>
              </button>

              <!-- AI建议 -->
              <button
                class="source-type-card"
                :class="{ active: currentSourceType === 'ai' }"
                @click="selectSourceType('ai')"
              >
                <span class="source-icon">🤖</span>
                <span class="source-label">AI给定</span>
              </button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="content-section">
            <!-- 自定义任务表单 -->
            <div v-if="currentSourceType === 'custom'" class="custom-task-form">
              <div class="form-group">
                <label class="form-label">任务标题</label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  placeholder="输入任务标题"
                />
              </div>

              <div class="form-group">
                <label class="form-label">任务描述</label>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="输入任务描述（可选）"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">优先级</label>
                <select v-model="formData.priority" class="form-select">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">截止日期</label>
                <input
                  v-model="formData.dueDate"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 进食任务选择 -->
            <div v-else-if="currentTaskType === 'meal' && currentSourceType === 'ai'" class="meal-selection">
              <div class="food-categories">
                <button
                  v-for="category in foodCategories"
                  :key="category"
                  class="category-btn"
                  :class="{ active: selectedFoodCategory === category }"
                  @click="selectedFoodCategory = category"
                >
                  {{ getCategoryLabel(category) }}
                </button>
              </div>

              <div class="food-items">
                <button
                  v-for="food in currentFoodItems"
                  :key="food.name"
                  class="food-item-btn"
                  :class="{ active: selectedFood?.name === food.name }"
                  @click="selectFood(food)"
                >
                  <span class="food-name">{{ food.zh_name }} ({{ food.name }})</span>
                  <span class="food-info">{{ food.calories }} kcal</span>
                </button>
              </div>

              <div v-if="selectedFood" class="food-details">
                <h4 class="details-title">{{ selectedFood.zh_name }} ({{ selectedFood.name }})</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">热量</span>
                    <span class="detail-value">{{ selectedFood.calories }} kcal</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">蛋白质</span>
                    <span class="detail-value">{{ selectedFood.protein }}g</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">碳水化合物</span>
                    <span class="detail-value">{{ selectedFood.carbs }}g</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">单位</span>
                    <span class="detail-value">{{ selectedFood.unit_count }}{{ selectedFood.unit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 运动/睡眠 AI建议 -->
            <div v-else-if="(currentTaskType === 'exercise' || currentTaskType === 'sleep') && currentSourceType === 'ai'" class="ai-suggestion-form">
              <div class="form-group">
                <label class="form-label">任务建议</label>
                <p class="ai-suggestion-text">
                  根据你的健康数据，我们为你生成了以下{{ currentTaskType === 'exercise' ? '运动' : '睡眠' }}任务建议。
                </p>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="AI生成的任务建议描述"
                  rows="4"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">建议理由</label>
                <textarea
                  v-model="formData.aiSuggestionReason"
                  class="form-textarea"
                  placeholder="这是AI给出这个建议的理由"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 模态框底部 -->
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="close">取消</button>
          <button class="btn btn-create" @click="handleCreateTask" :disabled="isLoading">
            {{ isLoading ? '创建中...' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import foodDataRaw from '../../json/food_data.json'
import { useTodolist } from '../../composables/useTodolist'

interface Props {
  isOpen: boolean
}

interface FoodItem {
  name: string
  zh_name: string
  calories: number
  unit: string
  unit_count: number
  protein: number
  carbs: number
  is_liquid: boolean
  category_tag: string
}

interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  aiSuggestionReason?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  create: [taskData: any]
}>()

// 状态
const currentTaskType = ref<'meal' | 'exercise' | 'sleep'>('meal')
const currentSourceType = ref<'custom' | 'ai'>('custom')
const isLoading = ref(false)
const selectedFoodCategory = ref<string>('fruits')
const selectedFood = ref<FoodItem | null>(null)

const formData = ref<TaskFormData>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: new Date().toISOString().split('T')[0],
  aiSuggestionReason: ''
})

// 食物数据
const foodData = ref<Record<string, FoodItem[]>>(foodDataRaw as any)

// 计算属性
const foodCategories = computed(() => {
  const categories = Object.keys(foodData.value).filter(key => key !== 'meta')
  return categories
})

const currentFoodItems = computed(() => {
  return foodData.value[selectedFoodCategory.value] || []
})

// 方法
const selectTaskType = (type: 'meal' | 'exercise' | 'sleep') => {
  currentTaskType.value = type
  // 重置表单
  formData.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    aiSuggestionReason: ''
  }
  selectedFood.value = null
}

const selectSourceType = (type: 'custom' | 'ai') => {
  currentSourceType.value = type
}

const selectFood = (food: FoodItem) => {
  selectedFood.value = food
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    fruits: '水果',
    beverages: '饮料',
    alcohol: '酒精',
    dishes: '菜肴',
    staples: '主食',
    snacks: '零食',
    others: '其他'
  }
  return labels[category] || category
}

const close = () => {
  emit('close')
}

  const handleCreateTask = async () => {
    // 验证表单
    if (!formData.value.title && currentSourceType.value === 'custom') {
      alert('请输入任务标题')
      return
    }

    isLoading.value = true

    try {
      // 后端字段映射（前端 camelCase 转 snake_case）
      const taskData: any = {
        title: formData.value.title || `${currentTaskType.value === 'meal' ? selectedFood.value?.zh_name : currentTaskType.value === 'exercise' ? '运动' : '睡眠'} 任务`,
        description: formData.value.description,
        type: currentSourceType.value === 'ai' ? 'ai_suggested' : 'custom',
        priority: formData.value.priority,
        due_date: formData.value.dueDate,  // 映射: dueDate -> due_date
        is_daily: false,  // 映射: isDaily -> is_daily
        category_icon: currentTaskType.value === 'meal' ? '🍽️' : currentTaskType.value === 'exercise' ? '🏃' : '😴'  // 映射: categoryIcon -> category_icon
      }

      // 如果是进食任务且选择了食物，添加食物信息
      if (currentTaskType.value === 'meal' && selectedFood.value) {
        taskData.title = selectedFood.value.zh_name
        taskData.description = `热量: ${selectedFood.value.calories} kcal, 蛋白质: ${selectedFood.value.protein}g, 碳水: ${selectedFood.value.carbs}g`
        taskData.checkin_type = 'meal'  // 映射: checkinType -> checkin_type
      }

      // 如果是 AI 建议，添加建议理由
      if (currentSourceType.value === 'ai') {
        taskData.ai_suggestion_reason = formData.value.aiSuggestionReason  // 映射: aiSuggestionReason -> ai_suggestion_reason
      }

      // 调用 useTodolist 的 createTask 方法
      const { createTask } = useTodolist()
      await createTask(taskData)

      emit('create', taskData)

      // 重置表单
      formData.value = {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        aiSuggestionReason: ''
      }
      selectedFood.value = null

      close()
    } catch (error) {
      console.error('创建任务失败:', error)
      alert('创建任务失败，请重试')
    } finally {
      isLoading.value = false
    }
  }// 监听 isOpen 变化
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // 重置表单数据
      selectedFood.value = null
      selectedFoodCategory.value = 'fruits'
    }
  }
)
</script>

<style scoped>
@import '../../css/components/TodolistCreateModal.css';
</style>
