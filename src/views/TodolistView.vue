<template>
    <div class="todolist-page">
        <AppHeader />

        <!-- 健康档案设置浮窗（必须完成） -->
        <HealthSetupModal :show="showHealthSetupModal" :force-complete="true" @close="handleHealthSetupClose"
            @success="handleHealthSetupSuccess" />

        <!-- 主内容区 -->
        <main class="todolist-main" v-if="!showHealthSetupModal">
            <!-- 页面标题 -->
            <section class="todolist-header">
                <div class="header-content">
                    <h1 class="page-title">任务清单</h1>
                    <p class="page-subtitle">管理你的日常任务和健康目标</p>
                </div>
            </section>

            <!-- 统计面板 -->
            <section class="todolist-stats">
                <div class="stat-card total">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-label">总任务数</div>
                        <div class="stat-value">{{ stats.total || 0 }}</div>
                    </div>
                </div>
                <div class="stat-card completed">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <div class="stat-label">已完成</div>
                        <div class="stat-value">{{ stats.completed || 0 }}</div>
                    </div>
                </div>
                <div class="stat-card pending">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-info">
                        <div class="stat-label">待完成</div>
                        <div class="stat-value">{{ stats.pending || 0 }}</div>
                    </div>
                </div>
                <div class="stat-card overdue">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-info">
                        <div class="stat-label">逾期</div>
                        <div class="stat-value">{{ stats.overdue || 0 }}</div>
                    </div>
                </div>
            </section>

            <!-- 完成率进度条 -->
            <section class="todolist-progress">
                <div class="progress-header">
                    <span class="progress-label">今日完成率</span>
                    <span class="progress-percentage">{{ completionRate || 0 }}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: completionRate + '%' }"></div>
                </div>
            </section>

            <!-- 操作栏 -->
            <section class="todolist-toolbar">
                <div class="toolbar-left">
                    <input v-model="searchKeyword" type="text" class="search-input" placeholder="🔍 搜索任务..."
                        @input="handleSearch" />
                </div>
                <div class="toolbar-right">
                    <button @click="showTypeSelector = true" class="btn btn-primary">
                        ➕ 创建任务
                    </button>
                </div>
            </section>

            <!-- 筛选按钮 -->
            <section class="todolist-filters">
                <button @click="setFilter({ status: 'all' })" :class="{ active: filter.status === 'all' }"
                    class="filter-btn">
                    全部
                </button>
                <button @click="setFilter({ status: 'pending' })" :class="{ active: filter.status === 'pending' }"
                    class="filter-btn">
                    待完成
                </button>
                <button @click="setFilter({ status: 'completed' })" :class="{ active: filter.status === 'completed' }"
                    class="filter-btn">
                    已完成
                </button>
                <button @click="setFilter({ status: 'overdue' })" :class="{ active: filter.status === 'overdue' }"
                    class="filter-btn">
                    逾期
                </button>
                <div class="filter-separator"></div>
                <button @click="setFilter({ dateRange: 'today' })" :class="{ active: filter.dateRange === 'today' }"
                    class="filter-btn">
                    今日
                </button>
                <button @click="setFilter({ dateRange: 'week' })" :class="{ active: filter.dateRange === 'week' }"
                    class="filter-btn">
                    本周
                </button>
                <button @click="setFilter({ dateRange: 'month' })" :class="{ active: filter.dateRange === 'month' }"
                    class="filter-btn">
                    本月
                </button>
            </section>

            <!-- 任务列表 -->
            <section class="todolist-content">
                <!-- 加载状态 -->
                <div v-if="loading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>加载任务中...</p>
                </div>

                <!-- 空状态 -->
                <div v-else-if="filteredTasks.length === 0" class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">暂无任务</p>
                    <button @click="showCreateModal = true" class="btn btn-outline">
                        创建第一个任务
                    </button>
                </div>

                <!-- 任务列表 -->
                <div v-else class="task-list">
                    <!-- 打卡任务组 -->
                    <div v-if="checkinTasksFiltered.length > 0" class="task-group">
                        <h3 class="group-title">🎯 打卡任务</h3>
                        <div class="group-tasks">
                            <div v-for="task in checkinTasksFiltered" :key="task.id" class="task-item"
                                :class="{ completed: task.status === 'completed', overdue: task.status === 'overdue' }">
                                <div class="task-checkbox">
                                    <input type="checkbox" :checked="task.status === 'completed'"
                                        @change="toggleTask(task.id)" />
                                </div>
                                <div class="task-content">
                                    <div class="task-title">{{ task.categoryIcon }} {{ task.title }}</div>
                                    <div class="task-meta">
                                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                                        <span class="task-priority" :class="task.priority">{{ task.priority }}</span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button @click="jumpToCheckinPage(getCheckinType(task.type))" class="btn-action"
                                        title="前往打卡">
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI建议任务组 -->
                    <div v-if="aiSuggestedTasksFiltered.length > 0" class="task-group">
                        <h3 class="group-title">🤖 AI建议</h3>
                        <div class="group-tasks">
                            <div v-for="task in aiSuggestedTasksFiltered" :key="task.id" class="task-item ai-suggested"
                                :class="{ completed: task.status === 'completed', overdue: task.status === 'overdue' }">
                                <div class="task-checkbox">
                                    <input type="checkbox" :checked="task.status === 'completed'"
                                        @change="toggleTask(task.id)" />
                                </div>
                                <div class="task-content">
                                    <div class="task-title">{{ task.categoryIcon }} {{ task.title }}</div>
                                    <div v-if="task.aiSuggestionReason" class="task-reason">{{ task.aiSuggestionReason
                                        }}</div>
                                    <div class="task-meta">
                                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                                        <span class="task-priority" :class="task.priority">{{ task.priority }}</span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button @click="acceptAISuggestion(task.id)" class="btn-action accept" title="接受">
                                        ✅
                                    </button>
                                    <button @click="rejectAISuggestion(task.id)" class="btn-action reject" title="驳回">
                                        ❌
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 自定义任务组 -->
                    <div v-if="customTasksFiltered.length > 0" class="task-group">
                        <h3 class="group-title">✏️ 自定义任务</h3>
                        <div class="group-tasks">
                            <div v-for="task in customTasksFiltered" :key="task.id" class="task-item custom"
                                :class="{ completed: task.status === 'completed', overdue: task.status === 'overdue' }">
                                <div class="task-checkbox">
                                    <input type="checkbox" :checked="task.status === 'completed'"
                                        @change="toggleTask(task.id)" />
                                </div>
                                <div class="task-content">
                                    <div class="task-title">{{ task.categoryIcon }} {{ task.title }}</div>
                                    <div v-if="task.description" class="task-description">{{ task.description }}</div>
                                    <div class="task-meta">
                                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                                        <span class="task-priority" :class="task.priority">{{ task.priority }}</span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button @click="handleEditTask(task)" class="btn-action" title="编辑">
                                        ✏️
                                    </button>
                                    <button @click="deleteTask(task.id)" class="btn-action delete" title="删除">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 错误提示 -->
            <div v-if="error" class="error-banner">
                <span>{{ error }}</span>
                <button @click="error = ''" class="btn-close">×</button>
            </div>
        </main>

        <!-- 任务类型选择器 -->
        <div v-if="showTypeSelector" class="modal-overlay" @click.self="showTypeSelector = false">
            <div class="modal-content type-selector-modal">
                <div class="modal-header">
                    <h2 class="modal-title">选择任务类型</h2>
                    <button class="modal-close" @click="showTypeSelector = false">×</button>
                </div>
                <div class="type-options">
                    <!-- 打卡任务 -->
                    <div class="type-option-group">
                        <h3 class="type-group-title">🎯 打卡任务</h3>
                        <div class="type-option-row">
                            <button @click="selectTaskType('checkin_exercise')" class="type-option-btn">
                                <div class="type-icon">🏃</div>
                                <div class="type-name">运动打卡</div>
                                <div class="type-desc">记录运动状况</div>
                            </button>
                            <button @click="selectTaskType('checkin_meal')" class="type-option-btn">
                                <div class="type-icon">🍽️</div>
                                <div class="type-name">饮食打卡</div>
                                <div class="type-desc">记录饮食信息</div>
                            </button>
                            <button @click="selectTaskType('checkin_sleep')" class="type-option-btn">
                                <div class="type-icon">😴</div>
                                <div class="type-name">睡眠打卡</div>
                                <div class="type-desc">记录睡眠质量</div>
                            </button>
                        </div>
                    </div>

                    <!-- 其他任务 -->
                    <div class="type-option-group">
                        <h3 class="type-group-title">其他任务类型</h3>
                        <div class="type-option-row">
                            <button @click="selectTaskType('ai_suggested')" class="type-option-btn">
                                <div class="type-icon">🤖</div>
                                <div class="type-name">AI建议</div>
                                <div class="type-desc">获取智能建议</div>
                            </button>
                            <button @click="selectTaskType('custom')" class="type-option-btn">
                                <div class="type-icon">✏️</div>
                                <div class="type-name">自定义任务</div>
                                <div class="type-desc">创建自己的任务</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 创建/编辑任务对话框 -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">{{ editingTask ? '编辑任务' : '创建新任务' }}</h2>
                    <button class="modal-close" @click="closeModal">×</button>
                </div>
                <form @submit.prevent="handleSubmitTask" class="task-form">
                    <!-- 打卡任务表单 -->
                    <template v-if="selectedTaskType?.startsWith('checkin_')">
                        <div class="form-group">
                            <label class="form-label">打卡类型</label>
                            <div class="checkin-type-display">
                                <span v-if="selectedTaskType === 'checkin_exercise'">🏃 运动打卡</span>
                                <span v-else-if="selectedTaskType === 'checkin_meal'">🍽️ 饮食打卡</span>
                                <span v-else-if="selectedTaskType === 'checkin_sleep'">😴 睡眠打卡</span>
                            </div>
                            <p class="form-hint">打卡任务将与对应的打卡页面同步</p>
                        </div>

                        <!-- 运动打卡预设 -->
                        <template v-if="selectedTaskType === 'checkin_exercise'">
                            <div class="form-group">
                                <label for="exercise-preset" class="form-label">运动项目</label>
                                <select v-model="formData.checkinPreset" id="exercise-preset" class="form-select">
                                    <option value="">-- 选择或跳过 --</option>
                                    <option value="running">🏃 跑步</option>
                                    <option value="gym">🏋️ 健身房</option>
                                    <option value="yoga">🧘 瑜伽</option>
                                    <option value="cycling">🚴 骑自行车</option>
                                    <option value="swimming">🏊 游泳</option>
                                    <option value="walking">🚶 散步</option>
                                    <option value="basketball">🏀 篮球</option>
                                    <option value="tennis">🎾 网球</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="exercise-duration" class="form-label">运动时长</label>
                                <input id="exercise-duration" type="text" class="form-input"
                                    placeholder="例如：30分钟、1小时" />
                            </div>
                        </template>

                        <!-- 饮食打卡预设 -->
                        <template v-else-if="selectedTaskType === 'checkin_meal'">
                            <div class="form-group">
                                <label for="meal-preset" class="form-label">餐食类型</label>
                                <select v-model="formData.checkinPreset" id="meal-preset" class="form-select">
                                    <option value="">-- 选择或跳过 --</option>
                                    <option value="breakfast">🍳 正常吃早餐</option>
                                    <option value="nutritious_breakfast">🥗 营养早餐</option>
                                    <option value="lunch">🍜 午餐</option>
                                    <option value="healthy_lunch">🥙 健康午餐</option>
                                    <option value="dinner">🍽️ 晚餐</option>
                                    <option value="light_dinner">🥗 清淡晚餐</option>
                                    <option value="snack">🥜 零食</option>
                                    <option value="hydration">💧 补充水分</option>
                                </select>
                            </div>
                        </template>

                        <!-- 睡眠打卡预设 -->
                        <template v-else-if="selectedTaskType === 'checkin_sleep'">
                            <div class="form-group">
                                <label for="sleep-preset" class="form-label">睡眠目标</label>
                                <select v-model="formData.checkinPreset" id="sleep-preset" class="form-select">
                                    <option value="">-- 选择或跳过 --</option>
                                    <option value="early_sleep">🌙 早睡早起</option>
                                    <option value="sleep_8h">😴 睡眠8小时</option>
                                    <option value="quality_sleep">⭐ 高质量睡眠</option>
                                    <option value="no_nap">🚫 不睡懒觉</option>
                                    <option value="regular_schedule">⏰ 规律作息</option>
                                </select>
                            </div>
                        </template>

                        <!-- 打卡重复方式 -->
                        <div class="form-group">
                            <label for="checkin-recurrence" class="form-label">打卡重复方式</label>
                            <select v-model="formData.checkinRecurrence" id="checkin-recurrence" class="form-select">
                                <option value="tomorrow">📅 明天</option>
                                <option value="everyday">🔄 每天</option>
                                <option value="workday">💼 工作日 (周一至周五)</option>
                                <option value="weekend">🎉 周末 (周六周日)</option>
                            </select>
                        </div>
                    </template>

                    <!-- AI建议表单 -->
                    <template v-else-if="selectedTaskType === 'ai_suggested'">
                        <div class="form-group">
                            <label for="ai-prompt" class="form-label">描述你的健康目标 <span class="required">*</span></label>
                            <textarea id="ai-prompt" v-model="formData.aiPrompt" class="form-textarea"
                                placeholder="例如：我想要改善睡眠质量、增加运动量、改善饮食习惯等" rows="4" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="ai-reason" class="form-label">建议说明</label>
                            <textarea id="ai-reason" v-model="formData.aiSuggestionReason" class="form-textarea"
                                placeholder="系统将基于你的描述生成智能建议" rows="3" disabled></textarea>
                        </div>

                        <div class="form-hint">
                            ✨ AI将根据你的健康目标生成个性化建议
                        </div>
                    </template>

                    <!-- 自定义任务表单 -->
                    <template v-else>
                        <div class="form-group">
                            <label for="task-title" class="form-label">任务标题 <span class="required">*</span></label>
                            <input id="task-title" v-model="formData.title" type="text" class="form-input"
                                placeholder="请输入任务标题" required />
                        </div>

                        <div class="form-group">
                            <label for="task-desc" class="form-label">任务描述</label>
                            <textarea id="task-desc" v-model="formData.description" class="form-textarea"
                                placeholder="请输入任务描述（可选）" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="task-priority" class="form-label">优先级</label>
                            <select v-model="formData.priority" id="task-priority" class="form-select">
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="task-date" class="form-label">截止日期 <span class="required">*</span></label>
                            <input id="task-date" v-model="formData.dueDate" type="date" class="form-input" required />
                        </div>

                        <div class="form-group">
                            <label for="task-time" class="form-label">截止时间</label>
                            <input id="task-time" v-model="formData.dueTime" type="time" class="form-input" />
                        </div>

                        <div class="form-group checkbox">
                            <input id="task-daily" v-model="formData.isDaily" type="checkbox" class="form-checkbox" />
                            <label for="task-daily" class="form-label">日常重复任务</label>
                        </div>

                        <div class="form-group">
                            <label for="task-icon" class="form-label">分类图标</label>
                            <input id="task-icon" v-model="formData.categoryIcon" type="text" class="form-input"
                                placeholder="输入emoji，如 ✏️" maxlength="2" />
                        </div>
                    </template>

                    <!-- 按钮 -->
                    <div class="form-actions">
                        <button type="button" @click="closeModal" class="btn btn-cancel">
                            取消
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            {{ loading ? '保存中...' : '保存任务' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useAuthForm } from '../composables/useAuthForm'
import { useTodolist, type Task } from '../composables/useTodolist'

const { checkHealthInfoNeeded } = useAuthForm()
const {
    stats,
    loading,
    error,
    filter,
    searchKeyword,
    filteredTasks,
    completionRate,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    acceptAISuggestion,
    rejectAISuggestion,
    setFilter,
    searchTasks,
    jumpToCheckinPage
} = useTodolist()

const showHealthSetupModal = ref(false)
const showCreateModal = ref(false)
const showTypeSelector = ref(false)
const editingTask = ref<Task | null>(null)
const selectedTaskType = ref<'checkin_exercise' | 'checkin_meal' | 'checkin_sleep' | 'ai_suggested' | 'custom' | null>(null)

// 获取今天的日期（ISO 8601格式）
function getTodayDate(): string {
    const today = new Date()
    return today.toISOString().split('T')[0]
}

// 表单数据
const formData = ref({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: getTodayDate(),
    dueTime: '',
    isDaily: false,
    categoryIcon: '📝',
    aiPrompt: '', // AI建议的提示词
    aiSuggestionReason: '', // AI建议的原因
    checkinType: '', // 打卡类型 exercise/meal/sleep
    checkinRecurrence: 'tomorrow', // 打卡重复: tomorrow/everyday/workday/weekend
    checkinPreset: '' // 打卡预设
})

// ==================== 生命周期 ====================

onMounted(async () => {
    try {
        // 检查是否需要完成健康档案设置
        const needsHealthInfo = await checkHealthInfoNeeded()
        if (needsHealthInfo) {
            showHealthSetupModal.value = true
            return
        }

        // 加载任务
        await fetchTasks()
    } catch (err) {
        console.error('页面初始化错误:', err)
    }
})

// ==================== 事件处理 ====================

function handleHealthSetupClose() {
    console.log('用户选择稍后设置健康档案')
}

function handleHealthSetupSuccess() {
    showHealthSetupModal.value = false
    console.log('用户完成了健康档案设置！')
    // 加载任务
    fetchTasks()
}

function handleSearch(event: Event) {
    const keyword = (event.target as HTMLInputElement).value
    searchTasks(keyword)
}

function selectTaskType(type: 'checkin_exercise' | 'checkin_meal' | 'checkin_sleep' | 'ai_suggested' | 'custom') {
    selectedTaskType.value = type
    showTypeSelector.value = false
    showCreateModal.value = true

    // 根据任务类型设置默认值
    if (type === 'checkin_exercise') {
        formData.value.categoryIcon = '🏃'
        formData.value.title = '运动打卡'
        formData.value.checkinType = 'exercise'
        formData.value.checkinRecurrence = 'tomorrow'
        formData.value.checkinPreset = ''
    } else if (type === 'checkin_meal') {
        formData.value.categoryIcon = '🍽️'
        formData.value.title = '饮食打卡'
        formData.value.checkinType = 'meal'
        formData.value.checkinRecurrence = 'tomorrow'
        formData.value.checkinPreset = ''
    } else if (type === 'checkin_sleep') {
        formData.value.categoryIcon = '😴'
        formData.value.title = '睡眠打卡'
        formData.value.checkinType = 'sleep'
        formData.value.checkinRecurrence = 'tomorrow'
        formData.value.checkinPreset = ''
    } else if (type === 'ai_suggested') {
        formData.value.categoryIcon = '🤖'
        formData.value.title = ''
    } else {
        formData.value.categoryIcon = '✏️'
        formData.value.title = ''
    }
}

function handleEditTask(task: Task) {
    editingTask.value = task
    selectedTaskType.value = task.type as any
    formData.value = {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate,
        dueTime: task.dueTime || '',
        isDaily: task.isDaily,
        categoryIcon: task.categoryIcon,
        aiPrompt: '',
        aiSuggestionReason: task.aiSuggestionReason || '',
        checkinType: '',
        checkinRecurrence: 'tomorrow',
        checkinPreset: ''
    }
    showCreateModal.value = true
}

async function handleSubmitTask() {
    try {
        if (editingTask.value) {
            // 编辑任务
            await updateTask(editingTask.value.id, {
                ...formData.value,
                type: editingTask.value.type,
                status: editingTask.value.status
            })
        } else {
            // 创建新任务
            await createTask({
                ...formData.value,
                type: selectedTaskType.value,
                status: 'pending'
            } as Omit<Task, 'id' | 'createdAt' | 'userId'>)
        }
        closeModal()
        await fetchTasks()
    } catch (err: any) {
        console.error('保存任务错误:', err)
    }
}

function closeModal() {
    showCreateModal.value = false
    editingTask.value = null
    selectedTaskType.value = null
    // 重置表单
    formData.value = {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: getTodayDate(),
        dueTime: '',
        isDaily: false,
        categoryIcon: '📝',
        aiPrompt: '',
        aiSuggestionReason: '',
        checkinType: '',
        checkinRecurrence: 'tomorrow',
        checkinPreset: ''
    }
}

// 计算过滤后的任务列表
const checkinTasksFiltered = computed(() => {
    return filteredTasks.value.filter(t => t?.type?.startsWith('checkin_'))
})

const aiSuggestedTasksFiltered = computed(() => {
    return filteredTasks.value.filter(t => t?.type === 'ai_suggested')
})

const customTasksFiltered = computed(() => {
    return filteredTasks.value.filter(t => t?.type === 'custom')
})

// 获取打卡任务类型
function getCheckinType(type: string): 'exercise' | 'meal' | 'sleep' {
    if (type === 'checkin_exercise') return 'exercise'
    if (type === 'checkin_meal') return 'meal'
    return 'sleep'
}



// ==================== 工具函数 ====================

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    if (isToday) return '今天'
    if (isTomorrow) return '明天'

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
@import '@/css/TodolistView.css';
</style>