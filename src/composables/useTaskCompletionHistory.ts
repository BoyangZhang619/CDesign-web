/**
 * 任务完成历史 Composable
 * 用于获取和管理任务完成记录
 */

import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

// 任务完成记录接口
export interface TaskCompletionRecord {
  id: number
  user_id: number
  task_id: number | null
  task_title: string
  task_type: 'checkin_exercise' | 'checkin_meal' | 'checkin_sleep' | 'custom' | 'ai_suggested'
  category: 'diet' | 'exercise' | 'sleep' | 'custom'
  preset_type: string | null
  task_priority: 'high' | 'medium' | 'low'
  completion_date: string // YYYY-MM-DD
  completion_time: string // datetime
  due_date: string | null // YYYY-MM-DD
  category_icon: string | null
  completion_status: 'on_time' | 'late' | 'early'
  created_at: string // datetime
}

// 统计信息接口
export interface TaskCompletionStats {
  total_completed: number
  days_with_completion: number
  on_time_count: number
  late_count: number
  early_count: number
  exercise_count: number
  meal_count: number
  sleep_count: number
  custom_count: number
  ai_suggested_count: number
}

// 按日期汇总接口
export interface CompletionByDate {
  date: string
  count: number
  on_time: number
  late: number
  early: number
}

export function useTaskCompletionHistory() {
  const records = ref<TaskCompletionRecord[]>([])
  const stats = ref<TaskCompletionStats | null>(null)
  const completionByDate = ref<CompletionByDate[]>([])
  const loading = ref(false)
  const errorMsg = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalCount = ref(0)

  // 筛选条件
  const filters = ref({
    type: '',
    category: '',
    priority: '',
    completionStatus: '',
    startDate: '',
    endDate: '',
    searchText: ''
  })

  // 排序选项
  const sortOptions = [
    { label: '最新在前', value: 'newest' },
    { label: '最早在前', value: 'oldest' },
    { label: '按优先级', value: 'priority' }
  ]
  const currentSort = ref('newest')

  // 任务类型选项
  const typeOptions = [
    { label: '全部', value: '' },
    { label: '运动打卡', value: 'checkin_exercise' },
    { label: '饮食打卡', value: 'checkin_meal' },
    { label: '睡眠打卡', value: 'checkin_sleep' },
    { label: '自定义任务', value: 'custom' },
    { label: 'AI建议', value: 'ai_suggested' }
  ]

  // 分类选项
  const categoryOptions = [
    { label: '全部', value: '' },
    { label: '饮食', value: 'diet' },
    { label: '运动', value: 'exercise' },
    { label: '睡眠', value: 'sleep' },
    { label: '自定义', value: 'custom' }
  ]

  // 优先级选项
  const priorityOptions = [
    { label: '全部', value: '' },
    { label: '高', value: 'high' },
    { label: '中', value: 'medium' },
    { label: '低', value: 'low' }
  ]

  // 完成状态选项
  const statusOptions = [
    { label: '全部', value: '' },
    { label: '准时', value: 'on_time' },
    { label: '迟到', value: 'late' },
    { label: '提前', value: 'early' }
  ]

  /**
   * 加载任务完成记录列表
   */
  async function loadRecords() {
    loading.value = true
    errorMsg.value = ''

    try {
      const params = new URLSearchParams({
        page: currentPage.value.toString(),
        limit: pageSize.value.toString(),
        sort: currentSort.value,
        type: filters.value.type,
        category: filters.value.category,
        priority: filters.value.priority,
        completionStatus: filters.value.completionStatus,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        search: filters.value.searchText
      })

      console.log('📝 [useTaskCompletionHistory] 加载记录，参数:', Object.fromEntries(params))

      const response = await fetchWithRefresh(
        `/api/task-completion-history?${params}`,
        { method: 'GET' }
      )

      const data = await response.json()
      console.log('✅ [useTaskCompletionHistory] API 响应:', data)

      if (response.ok && data.success) {
        records.value = (data.data?.data || []) as TaskCompletionRecord[]
        totalCount.value = data.data?.pagination?.total || 0
        console.log(`📊 [useTaskCompletionHistory] 返回 ${records.value.length} 条记录，总计 ${totalCount.value} 条`)
      } else {
        errorMsg.value = data.message || '加载失败'
        console.error('❌ [useTaskCompletionHistory] 加载失败:', errorMsg.value)
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('❌ [useTaskCompletionHistory] 错误:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载统计信息
   */
  async function loadStats() {
    try {
      console.log('📊 [useTaskCompletionHistory] 加载统计信息')

      const response = await fetchWithRefresh(
        '/api/task-completion-history/stats',
        { method: 'GET' }
      )

      const data = await response.json()
      console.log('✅ [useTaskCompletionHistory] 统计信息响应:', data)

      if (response.ok && data.success) {
        stats.value = data.data?.data || null
        console.log('📊 [useTaskCompletionHistory] 统计数据:', stats.value)
      }
    } catch (error) {
      console.error('❌ [useTaskCompletionHistory] 统计信息加载错误:', error)
    }
  }

  /**
   * 加载按日期的汇总信息
   */
  async function loadCompletionByDate(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      console.log('📅 [useTaskCompletionHistory] 加载日期汇总')

      const response = await fetchWithRefresh(
        `/api/task-completion-history/by-date?${params}`,
        { method: 'GET' }
      )

      const data = await response.json()
      console.log('✅ [useTaskCompletionHistory] 日期汇总响应:', data)

      if (response.ok && data.success) {
        completionByDate.value = data.data?.data || []
        console.log('📅 [useTaskCompletionHistory] 日期汇总数据:', completionByDate.value)
      }
    } catch (error) {
      console.error('❌ [useTaskCompletionHistory] 日期汇总加载错误:', error)
    }
  }

  /**
   * 重置筛选条件
   */
  function resetFilters() {
    filters.value = {
      type: '',
      category: '',
      priority: '',
      completionStatus: '',
      startDate: '',
      endDate: '',
      searchText: ''
    }
    currentPage.value = 1
    loadRecords()
  }

  /**
   * 应用筛选条件
   */
  function applyFilters() {
    currentPage.value = 1
    loadRecords()
  }

  /**
   * 改变排序方式
   */
  function changeSort(sort: string) {
    currentSort.value = sort
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 改变任务类型过滤
   */
  function changeType(type: string) {
    filters.value.type = type
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 改变分类过滤
   */
  function changeCategory(category: string) {
    filters.value.category = category
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 改变优先级过滤
   */
  function changePriority(priority: string) {
    filters.value.priority = priority
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 改变完成状态过滤
   */
  function changeStatus(status: string) {
    filters.value.completionStatus = status
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 设置日期范围
   */
  function setDateRange(startDate: string, endDate: string) {
    filters.value.startDate = startDate
    filters.value.endDate = endDate
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 搜索任务
   */
  function searchTasks(text: string) {
    filters.value.searchText = text
    currentPage.value = 1
    // loadRecords()
  }

  /**
   * 计算总页数
   */
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  /**
   * 分页信息
   */
  const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, totalCount.value)
    if (totalCount.value === 0) {
      return '无记录'
    }
    return `显示 ${start}-${end} 条，共 ${totalCount.value} 条`
  })

  /**
   * 获取任务类型标签
   */
  function getTaskTypeLabel(type: string): string {
    const option = typeOptions.find(opt => opt.value === type)
    return option?.label || type
  }

  /**
   * 获取分类标签
   */
  function getCategoryLabel(category: string): string {
    const option = categoryOptions.find(opt => opt.value === category)
    return option?.label || category
  }

  /**
   * 获取优先级标签
   */
  function getPriorityLabel(priority: string): string {
    const option = priorityOptions.find(opt => opt.value === priority)
    return option?.label || priority
  }

  /**
   * 获取完成状态标签
   */
  function getStatusLabel(status: string): string {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.label || status
  }

  return {
    // 状态
    records,
    stats,
    completionByDate,
    loading,
    errorMsg,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    
    // 筛选和排序
    filters,
    currentSort,
    sortOptions,
    typeOptions,
    categoryOptions,
    priorityOptions,
    statusOptions,

    // 方法
    loadRecords,
    loadStats,
    loadCompletionByDate,
    resetFilters,
    applyFilters,
    changeSort,
    changeType,
    changeCategory,
    changePriority,
    changeStatus,
    setDateRange,
    searchTasks,
    
    // 计算属性和工具
    paginationInfo,
    getTaskTypeLabel,
    getCategoryLabel,
    getPriorityLabel,
    getStatusLabel
  }
}
