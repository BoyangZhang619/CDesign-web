import { ref, computed, reactive } from 'vue'
import { fetchWithRefresh } from '../api/http'

/**
 * ==================== 类型定义 ====================
 */

// 任务类型
export type TaskType = 'checkin_exercise' | 'checkin_meal' | 'checkin_sleep' | 'custom' | 'ai_suggested'

// 任务状态
export type TaskStatus = 'pending' | 'completed' | 'overdue'

// 优先级
export type TaskPriority = 'high' | 'medium' | 'low'

// 筛选选项
export type FilterType = 'all' | 'pending' | 'completed' | 'overdue'
export type DateRange = 'all' | 'today' | 'week' | 'month'

/**
 * 任务接口 - 映射后端 Task 字段
 * 后端使用 snake_case，前端转换为 camelCase
 */
export interface Task {
  id: number
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  dueDate: string  // 后端: due_date
  dueTime?: string  // 后端: due_time
  isDaily: boolean  // 后端: is_daily
  categoryIcon?: string  // 后端: category_icon
  checkinType?: 'exercise' | 'meal' | 'sleep'  // 后端: checkin_type
  checkinRecurrence?: string  // 后端: checkin_recurrence
  checkinPreset?: string  // 后端: checkin_preset
  aiPrompt?: string  // 后端: ai_prompt
  aiSuggestionReason?: string  // 后端: ai_suggestion_reason
  createdAt: string  // 后端: created_at
  completedAt?: string  // 后端: completed_date
  userId: number  // 后端: user_id
  updatedAt: string  // 后端: updated_at
}

/**
 * 任务统计 - 映射后端 TaskStatistics
 */
export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completion_rate: number  // 后端返回 completion_rate
  byType: {
    checkin_exercise: number
    checkin_meal: number
    checkin_sleep: number
    custom: number
    ai_suggested: number
  }
  byPriority: {
    high: number
    medium: number
    low: number
  }
}

/**
 * 筛选选项
 */
export interface FilterOptions {
  status: FilterType
  dateRange: DateRange
  type?: TaskType
  priority?: TaskPriority
}

/**
 * AI建议响应
 */
export interface AISuggestion extends Task {
  reason: string
}

/**
 * ==================== Composable ====================
 */

/**
 * 转换后端任务数据为前端格式
 * 将 snake_case 字段转换为 camelCase
 */
function transformBackendTask(backendTask: any): Task {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    type: backendTask.type,
    status: backendTask.status,
    priority: backendTask.priority,
    dueDate: backendTask.due_date,
    dueTime: backendTask.due_time,
    isDaily: backendTask.is_daily,
    categoryIcon: backendTask.category_icon,
    checkinType: backendTask.checkin_type,
    checkinRecurrence: backendTask.checkin_recurrence,
    checkinPreset: backendTask.checkin_preset,
    aiPrompt: backendTask.ai_prompt,
    aiSuggestionReason: backendTask.ai_suggestion_reason,
    createdAt: backendTask.created_at,
    completedAt: backendTask.completed_date,
    userId: backendTask.user_id,
    updatedAt: backendTask.updated_at
  }
}

/**
 * 转换前端任务数据为后端格式
 * 将 camelCase 字段转换为 snake_case
 */
function transformFrontendTask(frontendTask: Partial<Task>): any {
  const result: any = {}
  
  if (frontendTask.title !== undefined) result.title = frontendTask.title
  if (frontendTask.description !== undefined) result.description = frontendTask.description
  if (frontendTask.type !== undefined) result.type = frontendTask.type
  if (frontendTask.priority !== undefined) result.priority = frontendTask.priority
  if (frontendTask.dueDate !== undefined) result.due_date = frontendTask.dueDate
  if (frontendTask.dueTime !== undefined) result.due_time = frontendTask.dueTime
  if (frontendTask.isDaily !== undefined) result.is_daily = frontendTask.isDaily
  if (frontendTask.categoryIcon !== undefined) result.category_icon = frontendTask.categoryIcon
  if (frontendTask.checkinType !== undefined) result.checkin_type = frontendTask.checkinType
  if (frontendTask.checkinRecurrence !== undefined) result.checkin_recurrence = frontendTask.checkinRecurrence
  if (frontendTask.checkinPreset !== undefined) result.checkin_preset = frontendTask.checkinPreset
  if (frontendTask.aiPrompt !== undefined) result.ai_prompt = frontendTask.aiPrompt
  
  return result
}

export function useTodolist() {
  // ==================== 状态 ====================
  const tasks = ref<Task[]>([])
  const stats = ref<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completion_rate: 0,
    byType: { checkin_exercise: 0, checkin_meal: 0, checkin_sleep: 0, custom: 0, ai_suggested: 0 },
    byPriority: { high: 0, medium: 0, low: 0 }
  })

  const loading = ref(false)
  const error = ref('')

  const filter = reactive<FilterOptions>({
    status: 'all',
    dateRange: 'all'
  })

  const searchKeyword = ref('')

  // ==================== 计算属性 ====================

  /**
   * 已筛选的任务
   */
  const filteredTasks = computed(() => {
    let result = Array.from(tasks.value)
    console.log('Filtered tasks:', result)
    // 按状态筛选
    if (filter.status !== 'all') {
      result = result.filter(task => task.status === filter.status)
    }

    // 按日期范围筛选
    if (filter.dateRange !== 'all') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      result = result.filter(task => {
        const dueDate = new Date(task.dueDate)
        switch (filter.dateRange) {
          case 'today':
            return dueDate >= startOfDay && dueDate < new Date(startOfDay.getTime() + 86400000)
          case 'week':
            return dueDate >= startOfWeek
          case 'month':
            return dueDate >= startOfMonth
          default:
            return true
        }
      })
    }

    // 按类型筛选
    if (filter.type) {
      result = result.filter(task => task.type === filter.type)
    }

    // 按优先级筛选
    if (filter.priority) {
      result = result.filter(task => task.priority === filter.priority)
    }

    // 按搜索关键词筛选
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword)
      )
    }

    // return result.sort((a, b) => {
    //   // 优先级排序（高 > 中 > 低）
    //   const priorityOrder = { high: 0, medium: 1, low: 2 }
    //   if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
    //     return priorityOrder[a.priority] - priorityOrder[b.priority]
    //   }
    //   // 按状态排序（待完成 > 逾期 > 已完成）
    //   const statusOrder = { pending: 0, overdue: 1, completed: 2 }
    //   if (statusOrder[a.status] !== statusOrder[b.status]) {
    //     return statusOrder[a.status] - statusOrder[b.status]
    //   }
    //   // 按截止日期排序
    //   return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    // })
    console.log('Filtered tasks:', result)
    return result;
  })

  /**
   * 打卡任务
   */
  const checkinTasks = computed(() => {
    return tasks.value.filter(task => 
      task.type === 'checkin_exercise' || 
      task.type === 'checkin_meal' || 
      task.type === 'checkin_sleep'
    )
  })

  /**
   * AI建议任务
   */
  const aiSuggestedTasks = computed(() => {
    return Array.from(tasks.value).filter(task => task.type === 'ai_suggested')
  })

  /**
   * 自定义任务
   */
  const customTasks = computed(() => {
    return Array.from(tasks.value).filter(task => task.type === 'custom')
  })

  /**
   * 已完成数
   */
  const completedCount = computed(() => {
    return Array.from(tasks.value).filter(task => task.status === 'completed').length
  })

  /**
   * 待完成数
   */
  const pendingCount = computed(() => {
    return Array.from(tasks.value).filter(task => task.status === 'pending').length
  })

  /**
   * 逾期数
   */
  const overdueCount = computed(() => {
    return Array.from(tasks.value).filter(task => task.status === 'overdue').length
  })

  /**
   * 完成率
   */
  const completionRate = computed(() => {
    if (tasks.value.length === 0) return 0
    return Math.round((completedCount.value / tasks.value.length) * 100)
  })

  // ==================== 数据获取 ====================

  /**
   * 获取任务列表
   * GET /api/tasks
   */
  async function fetchTasks(date?: string) {
    loading.value = true
    error.value = ''
    try {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      params.append('page', '1')
      params.append('limit', '100')  // 获取足够多的数据
      
      const response = await fetchWithRefresh(
        `/api/tasks?${params.toString()}`,
        { method: 'GET' }
      )
      const data = await response.json()
      console.log('获取任务列表响应:', data)
      
      if (data.success && data.data) {
        // 后端返回 { data: tasks, pagination: {...} }
        const taskList = Array.isArray(data.data.data) ? data.data.data : data.data
        tasks.value = taskList.map((task: any) => transformBackendTask(task))
        await calculateStats()
      } else {
        throw new Error(data.message || '获取任务列表失败')
      }
    } catch (err: any) {
      error.value = err.message || '获取任务列表失败'
      console.error('获取任务列表错误:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 计算统计数据
   * GET /api/tasks/stats
   */
  async function calculateStats() {
    try {
      const response = await fetchWithRefresh('/api/tasks/stats', { method: 'GET' })
      const data = await response.json()
      console.log('获取任务统计响应:', data)
      
      if (data.success && data.data) {
        // 直接使用后端返回的统计数据
        stats.value = data.data
      }
    } catch (err: any) {
      console.error('计算统计数据错误:', err)
    }
  }

  // ==================== 任务操作 ====================

  /**
   * 创建任务
   * POST /api/tasks
   */
  async function createTask(taskData: Partial<Task>) {
    loading.value = true
    error.value = ''
    try {
      // 转换前端数据为后端格式
      const backendData = transformFrontendTask(taskData)
      
      const response = await fetchWithRefresh('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const newTask = transformBackendTask(data.data)
        tasks.value.push(newTask)
        await calculateStats()
        return newTask
      } else {
        throw new Error(data.message || '创建任务失败')
      }
    } catch (err: any) {
      error.value = err.message || '创建任务失败'
      console.error('创建任务错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新任务
   * PUT /api/tasks/:id
   */
  async function updateTask(id: number, taskData: Partial<Task>) {
    loading.value = true
    error.value = ''
    try {
      // 转换前端数据为后端格式
      const backendData = transformFrontendTask(taskData)
      
      const response = await fetchWithRefresh(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const updatedTask = transformBackendTask(data.data)
        const index = tasks.value.findIndex(t => t.id === id)
        if (index > -1) {
          tasks.value[index] = updatedTask
        }
        await calculateStats()
        return updatedTask
      } else {
        throw new Error(data.message || '更新任务失败')
      }
    } catch (err: any) {
      error.value = err.message || '更新任务失败'
      console.error('更新任务错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除任务
   * DELETE /api/tasks/:id
   */
  async function deleteTask(id: number) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchWithRefresh(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        await calculateStats()
      } else {
        throw new Error(data.message || '删除任务失败')
      }
    } catch (err: any) {
      error.value = err.message || '删除任务失败'
      console.error('删除任务错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 标记任务为完成
   * PATCH /api/tasks/:id/complete
   */
  async function completeTask(id: number) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchWithRefresh(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_date: new Date().toISOString().split('T')[0]
        })
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const updatedTask = transformBackendTask(data.data)
        const index = tasks.value.findIndex(t => t.id === id)
        if (index > -1) {
          tasks.value[index] = updatedTask
        }
        await calculateStats()
        return updatedTask
      } else {
        throw new Error(data.message || '标记完成失败')
      }
    } catch (err: any) {
      error.value = err.message || '标记完成失败'
      console.error('标记完成错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 标记任务为未完成
   * PATCH /api/tasks/:id/uncomplete
   */
  async function uncompleteTask(id: number) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchWithRefresh(`/api/tasks/${id}/uncomplete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const updatedTask = transformBackendTask(data.data)
        const index = tasks.value.findIndex(t => t.id === id)
        if (index > -1) {
          tasks.value[index] = updatedTask
        }
        await calculateStats()
        return updatedTask
      } else {
        throw new Error(data.message || '标记未完成失败')
      }
    } catch (err: any) {
      error.value = err.message || '标记未完成失败'
      console.error('标记未完成错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换任务完成状态
   */
  async function toggleTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    
    return task.status === 'completed' 
      ? await uncompleteTask(id) 
      : await completeTask(id)
  }

  // ==================== 打卡任务同步 ====================

  /**
   * 同步打卡任务状态
   * POST /api/tasks/sync-checkin
   * 当在 DailyCheckin 中完成打卡后，同步状态到 TodoList
   */
  async function syncCheckinTask(
    checkinType: 'exercise' | 'meal' | 'sleep',
    completed: boolean
  ) {
    try {
      const typeMap: Record<string, string> = {
        'exercise': 'exercise',
        'meal': 'meal',
        'sleep': 'sleep'
      }
      
      const response = await fetchWithRefresh('/api/tasks/sync-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: typeMap[checkinType],
          completed,
          checkin_date: new Date().toISOString().split('T')[0]
        })
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        // 更新本地任务状态
        const updatedTask = transformBackendTask(data.data)
        const index = tasks.value.findIndex(t => t.id === updatedTask.id)
        if (index > -1) {
          tasks.value[index] = updatedTask
        }
        await calculateStats()
        return updatedTask
      } else {
        throw new Error(data.message || '同步打卡任务失败')
      }
    } catch (err: any) {
      console.error('同步打卡任务错误:', err)
      throw err
    }
  }

  /**
   * 跳转到打卡页面
   */
  function jumpToCheckinPage(type: 'exercise' | 'meal' | 'sleep') {
    const pathMap: Record<string, string> = {
      'exercise': '/health/daily-checkin#exercise',
      'meal': '/health/daily-checkin#meal',
      'sleep': '/health/daily-checkin#sleep'
    }
    
    if (pathMap[type]) {
      window.location.hash = pathMap[type]
      // 或使用 router.push(pathMap[type])
    }
  }

  /**
   * 获取打卡任务状态
   */
  function getCheckinTaskStatus(type: 'exercise' | 'meal' | 'sleep'): TaskStatus | null {
    const taskTypeMap: Record<string, TaskType> = {
      'exercise': 'checkin_exercise',
      'meal': 'checkin_meal',
      'sleep': 'checkin_sleep'
    }
    
    const task = tasks.value.find(t => t.type === taskTypeMap[type])
    return task?.status || null
  }

  // ==================== AI建议 ====================

  /**
   * 生成 AI 建议
   * POST /api/tasks/ai-suggestions
   */
  async function generateAISuggestions(): Promise<Task[]> {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchWithRefresh('/api/tasks/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const suggestions = Array.isArray(data.data) 
          ? data.data.map((task: any) => transformBackendTask(task))
          : []
        return suggestions
      } else {
        throw new Error(data.message || 'AI 建议生成失败')
      }
    } catch (err: any) {
      error.value = err.message || 'AI 建议生成失败'
      console.error('AI 建议生成错误:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 接受AI建议
   */
  async function acceptAISuggestion(id: number) {
    try {
      const response = await fetchWithRefresh(`/api/tasks/${id}/accept-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const updatedTask = transformBackendTask(data.data)
        const index = tasks.value.findIndex(t => t.id === id)
        if (index > -1) {
          tasks.value[index] = updatedTask
        }
        await calculateStats()
        return updatedTask
      } else {
        throw new Error(data.message || '接受建议失败')
      }
    } catch (err: any) {
      error.value = err.message || '接受建议失败'
      console.error('接受建议错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 驳回 AI 建议
   * POST /api/tasks/:id/reject-suggestion
   */
  async function rejectAISuggestion(id: number) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchWithRefresh(`/api/tasks/${id}/reject-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      
      if (data.success) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        await calculateStats()
      } else {
        throw new Error(data.message || '驳回建议失败')
      }
    } catch (err: any) {
      error.value = err.message || '驳回建议失败'
      console.error('驳回建议错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== 筛选和排序 ====================

  /**
   * 设置筛选条件
   */
  function setFilter(filterOptions: Partial<FilterOptions>) {
    Object.assign(filter, filterOptions)
  }

  /**
   * 搜索任务
   */
  function searchTasks(keyword: string) {
    searchKeyword.value = keyword
  }

  /**
   * 清除搜索
   */
  function clearSearch() {
    searchKeyword.value = ''
  }

  /**
   * 清除筛选
   */
  function clearFilter() {
    filter.status = 'all'
    filter.dateRange = 'all'
    filter.type = undefined
    filter.priority = undefined
  }

  // ==================== 导出接口 ====================

  return {
    // 状态
    tasks,
    stats,
    loading,
    error,
    filter,
    searchKeyword,

    // 计算属性
    filteredTasks,
    checkinTasks,
    aiSuggestedTasks,
    customTasks,
    completedCount,
    pendingCount,
    overdueCount,
    completionRate,

    // 数据获取
    fetchTasks,
    calculateStats,

    // 任务操作
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    toggleTask,

    // 打卡同步
    syncCheckinTask,
    jumpToCheckinPage,
    getCheckinTaskStatus,

    // AI建议
    generateAISuggestions,
    acceptAISuggestion,
    rejectAISuggestion,

    // 筛选搜索
    setFilter,
    searchTasks,
    clearSearch,
    clearFilter
  }
}
