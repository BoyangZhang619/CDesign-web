<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="todolist-create-modal-overlay" @click.self="close">
      <div class="todolist-create-modal">
        <!-- 模态框头部 -->
        <div class="modal-header">
          <h2 class="modal-title">创建新任务</h2>
          <button class="modal-close-btn" @click="close" aria-label="关闭">✕</button>
        </div>

        <!-- 模态框内容 -->
        <div class="modal-content">
          <!-- 第一步：选择任务类别 -->
          <div class="category-selection-section">
            <h3 class="section-title">选择任务类别</h3>
            <div class="category-grid">
              <!-- 饮食 -->
              <button
                class="category-card"
                :class="{ active: selectedCategory === 'diet' }"
                @click="selectCategory('diet')"
              >
                <span class="category-icon">🍽️</span>
                <span class="category-name">饮食</span>
              </button>

              <!-- 运动 -->
              <button
                class="category-card"
                :class="{ active: selectedCategory === 'exercise' }"
                @click="selectCategory('exercise')"
              >
                <span class="category-icon">🏃</span>
                <span class="category-name">运动</span>
              </button>

              <!-- 睡眠 -->
              <button
                class="category-card"
                :class="{ active: selectedCategory === 'sleep' }"
                @click="selectCategory('sleep')"
              >
                <span class="category-icon">😴</span>
                <span class="category-name">睡眠</span>
              </button>

              <!-- 自定义 -->
              <button
                class="category-card"
                :class="{ active: selectedCategory === 'custom' }"
                @click="selectCategory('custom')"
              >
                <span class="category-icon">✏️</span>
                <span class="category-name">自定义</span>
              </button>
            </div>
          </div>

          <!-- 预设选择（非自定义时显示） -->
          <div v-if="selectedCategory !== 'custom'" class="preset-selection-section">
            <h3 class="section-title">选择预设任务</h3>
            <div class="preset-grid">
              <button
                v-for="preset in currentPresets"
                :key="preset.value"
                class="preset-card"
                :class="{ active: selectedPreset === preset.value }"
                @click="selectedPreset = preset.value"
              >
                <span class="preset-icon">{{ preset.icon }}</span>
                <span class="preset-label">{{ preset.label }}</span>
              </button>
            </div>
          </div>

          <!-- 自定义文本/标题 -->
          <div class="form-section">
            <h3 class="section-title">任务详情</h3>
            
            <div class="form-group">
              <label class="form-label">任务标题</label>
              <input
                v-model="formData.title"
                type="text"
                class="form-input"
                :placeholder="getPlaceholder()"
              />
            </div>

            <div class="form-group">
              <label class="form-label">任务描述</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="可选，输入任务的详细说明"
                rows="2"
              ></textarea>
            </div>

            <!-- 优先级和日期选择（并排） -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select v-model="formData.priority" class="form-select">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">日期</label>
                <select v-model="formData.dateType" class="form-select">
                  <option value="tomorrow">明天</option>
                  <option value="workday">工作日</option>
                  <option value="weekend">周末</option>
                  <option value="everyday">每天</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 模态框底部 -->
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="close">取消</button>
          <button class="btn btn-create" @click="handleCreateTask" :disabled="isLoading || !formData.title.trim()">
            {{ isLoading ? '创建中...' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTodolist } from '../../composables/useTodolist'

interface Props {
  isOpen: boolean
}

interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dateType: 'tomorrow' | 'workday' | 'weekend' | 'everyday'
}

interface PresetOption {
  value: string
  label: string
  icon: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  create: [taskData: any]
}>()

// 预设任务数据
const presets: Record<string, PresetOption[]> = {
  diet: [
    { value: 'breakfast', label: '早餐', icon: '🥐' },
    { value: 'lunch', label: '午餐', icon: '🍱' },
    { value: 'dinner', label: '晚餐', icon: '🍜' },
    { value: 'snack', label: '零食', icon: '🍪' },
    { value: 'water', label: '喝水', icon: '💧' },
  ],
  exercise: [
    { value: 'jogging', label: '慢跑', icon: '🏃' },
    { value: 'gym', label: '健身房', icon: '🏋️' },
    { value: 'yoga', label: '瑜伽', icon: '🧘' },
    { value: 'swimming', label: '游泳', icon: '🏊' },
    { value: 'walking', label: '散步', icon: '🚶' },
  ],
  sleep: [
    { value: 'early_bed', label: '早睡', icon: '🛌' },
    { value: 'bedtime', label: '睡前准备', icon: '🧴' },
    { value: 'no_phone', label: '不玩手机', icon: '📵' },
    { value: 'meditation', label: '冥想', icon: '🧘‍♀️' },
    { value: 'sleep_tracking', label: '记录睡眠', icon: '📊' },
  ]
}

// 状态
const selectedCategory = ref<'diet' | 'exercise' | 'sleep' | 'custom'>('diet')
const selectedPreset = ref<string>('')
const isLoading = ref(false)

const formData = ref<TaskFormData>({
  title: '',
  description: '',
  priority: 'medium',
  dateType: 'tomorrow'
})

// 计算属性
const currentPresets = computed(() => {
  const category = selectedCategory.value
  return presets[category] || []
})

// 方法
const selectCategory = (category: 'diet' | 'exercise' | 'sleep' | 'custom') => {
  selectedCategory.value = category
  selectedPreset.value = ''
  formData.value.title = ''
  formData.value.description = ''
}

const getPlaceholder = (): string => {
  const placeholders: Record<string, string> = {
    diet: '例如：吃一个苹果',
    exercise: '例如：跑步30分钟',
    sleep: '例如：晚上11点睡觉',
    custom: '输入任务标题'
  }
  return placeholders[selectedCategory.value] || '输入任务标题'
}

const close = () => {
  emit('close')
}

const handleCreateTask = async () => {
  // 验证表单
  if (!formData.value.title.trim()) {
    alert('请输入任务标题')
    return
  }

  isLoading.value = true

  try {
    // 类别到图标和类型的映射
    const categoryMap: Record<string, { icon: string; type: string; checkinType?: string }> = {
      diet: { icon: '🍽️', type: 'checkin_meal', checkinType: 'meal' },
      exercise: { icon: '🏃', type: 'checkin_exercise', checkinType: 'exercise' },
      sleep: { icon: '😴', type: 'checkin_sleep', checkinType: 'sleep' },
      custom: { icon: '✏️', type: 'custom' }
    }

    const categoryConfig = categoryMap[selectedCategory.value] || categoryMap['custom']

    const taskData: any = {
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority,
      category: selectedCategory.value,
      category_icon: categoryConfig.icon,
      type: categoryConfig.type,
      checkin_type: categoryConfig.checkinType || undefined,
      preset_type: selectedPreset.value || undefined,
      checkin_recurrence: formData.value.dateType,
      checkin_preset: selectedPreset.value || undefined,
      is_daily: formData.value.dateType === 'everyday',
      date_type: formData.value.dateType
    }

    // 计算实际的 due_date
    const today = new Date()
    let dueDate = new Date()
    
    switch (formData.value.dateType) {
      case 'tomorrow':
        dueDate.setDate(today.getDate() + 1)
        break
      case 'workday': {
        let dayOfWeek = today.getDay()
        let daysToAdd = 1
        // 如果今天是周末（0=周日，6=周六），跳到周一
        if (dayOfWeek === 0) daysToAdd = 1
        else if (dayOfWeek === 6) daysToAdd = 2
        // 否则找下一个工作日
        else {
          do {
            daysToAdd++
            dayOfWeek = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000).getDay()
          } while (dayOfWeek === 0 || dayOfWeek === 6)
          daysToAdd--
        }
        dueDate.setDate(today.getDate() + daysToAdd)
        break
      }
      case 'weekend': {
        let dayOfWeek = today.getDay()
        let daysToAdd = 1
        // 找下一个周末（周六或周日）
        do {
          daysToAdd++
          dayOfWeek = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000).getDay()
        } while (dayOfWeek !== 0 && dayOfWeek !== 6)
        dueDate.setDate(today.getDate() + daysToAdd)
        break
      }
      case 'everyday':
        dueDate = today
        break
    }

    taskData.due_date = dueDate.toISOString().split('T')[0]

    console.log('📝 创建任务数据:', taskData)

    // 调用 useTodolist 的 createTask 方法
    const { createTask } = useTodolist()
    await createTask(taskData)

    emit('create', taskData)

    // 重置表单
    selectedCategory.value = 'diet'
    selectedPreset.value = ''
    formData.value = {
      title: '',
      description: '',
      priority: 'medium',
      dateType: 'tomorrow'
    }

    close()
  } catch (error) {
    console.error('创建任务失败:', error)
    alert('创建任务失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 监听 isOpen 变化
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // 重置表单数据
      selectedCategory.value = 'diet'
      selectedPreset.value = ''
      formData.value = {
        title: '',
        description: '',
        priority: 'medium',
        dateType: 'tomorrow'
      }
    }
  }
)
</script>

<style scoped>
@import '../../css/components/TodolistCreateModal.css';
</style>
