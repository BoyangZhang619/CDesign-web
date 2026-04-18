import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

/**
 * 打卡记录相关接口（原有功能）
 */

// 饮食记录
export interface MealRecord {
  id: number
  daily_checkin_id: number
  user_id: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_source: string
  food_name: string
  food_detail: string
  calories: string | number
  protein_g: string | number
  fat_g: string | number
  carbohydrate_g: string | number
  fiber_g: string | number
  sugar_g: string | number
  meal_time: string
  ai_recognition_flag: number
  image_id: string | null
  created_at: string
  updated_at: string
  type: 'meal'
}

// 运动记录
export interface ExerciseRecord {
  id: number
  daily_checkin_id: number
  user_id: number
  activity_type: string
  duration_min: number
  intensity: 'light' | 'medium' | 'heavy'
  calories_burned: string | number
  start_time: string
  end_time: string
  note: string
  ai_recognition_flag: number
  created_at: string
  updated_at: string
  suggestion: string
  evaluation: string
  type: 'exercise'
}

// 睡眠记录
export interface SleepRecord {
  id: number
  daily_checkin_id: number
  user_id: number
  sleep_start_time: string
  wake_up_time: string
  sleep_duration_hours: string | number
  sleep_quality_score: number
  is_nap: number
  wake_up_times: number
  sleep_feeling: string
  created_at: string
  updated_at: string
  suggestion: string
  evaluation: string
  type: 'sleep'
}

// 通用历史记录类型
export type HistoryRecord = MealRecord | ExerciseRecord | SleepRecord

// 获取当前日期的 YYYY-MM-DD 格式
export function getCurrentDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化时间 HH:MM
export function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return dateStr
  }
}

export function useHistory() {
  const records = ref<HistoryRecord[]>([])
  const loading = ref(false)
  const errorMsg = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)

  // 筛选条件
  const filters = ref({
    type: '',
    startDate: '',
    endDate: '',
    searchText: ''
  })

  // 排序选项
  const sortOptions = [
    { label: '最新在前', value: 'newest' },
    { label: '最早在前', value: 'oldest' },
    { label: '按类型', value: 'type' }
  ]
  const currentSort = ref('newest')

  // 类型选项
  const typeOptions = [
    { label: '全部', value: '' },
    { label: '饮食', value: 'meal' },
    { label: '运动', value: 'exercise' },
    { label: '睡眠', value: 'sleep' },
    // { label: '体重', value: 'weight' },
    // { label: '心情', value: 'mood' },
    // { label: '喝水', value: 'water' }
  ]

  // 加载记录
  async function loadRecords() {
    loading.value = true
    errorMsg.value = ''

    try {
      const params = new URLSearchParams({
        page: currentPage.value.toString(),
        pageSize: pageSize.value.toString(),
        sort: currentSort.value,
        type: filters.value.type,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        search: filters.value.searchText
      })

      console.log('📝 [useHistory] 加载打卡记录，参数:', Object.fromEntries(params))

      const response = await fetchWithRefresh(`/history/get?${params}`, {
        method: 'GET'
      })

      const data = await response.json()
      console.log('✅ [useHistory] API 响应:', data)

      if (response.ok && data.success) {
        // 将 API 返回的数据正确映射到本地记录
        const apiRecords = data.data?.records || data.data?.data || []
        records.value = apiRecords as HistoryRecord[]
        totalCount.value = data.data?.total || 0
        console.log(`📊 [useHistory] 返回 ${records.value.length} 条打卡记录，总计 ${totalCount.value} 条`)
      } else {
        errorMsg.value = data.message || '加载失败'
        console.error('❌ [useHistory] 加载失败:', errorMsg.value)
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('❌ [useHistory] 错误:', error)
    } finally {
      loading.value = false
    }
  }

  // 重置筛选
  function resetFilters() {
    console.log('🔄 [useHistory] 重置筛选条件')
    filters.value = {
      type: '',
      startDate: '',
      endDate: '',
      searchText: ''
    }
    currentPage.value = 1
    loadRecords()
  }

  // 应用筛选
  function applyFilters() {
    console.log('✨ [useHistory] 应用筛选条件:', filters.value)
    currentPage.value = 1
    loadRecords()
  }

  // 改变排序
  function changeSort(sort: string) {
    console.log('📊 [useHistory] 改变排序为:', sort)
    currentSort.value = sort
    loadRecords()
  }

  // 改变类型筛选
  function changeType(type: string) {
    console.log('🏷️ [useHistory] 改变类型为:', type)
    filters.value.type = type
    currentPage.value = 1
    loadRecords()
  }

  // 删除单条记录
  async function deleteRecord(id: number | string) {
    if (!confirm('确定要删除这条记录吗？')) {
      console.log('❌ [useHistory] 用户取消删除')
      return
    }

    try {
      console.log('🗑️ [useHistory] 删除记录 ID:', id)
      const response = await fetchWithRefresh(`/history/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('✅ [useHistory] 记录删除成功')
        loadRecords()
      } else {
        errorMsg.value = '删除失败'
        console.error('❌ [useHistory] 删除失败')
      }
    } catch (error) {
      errorMsg.value = '删除出错'
      console.error('❌ [useHistory] 删除错误:', error)
    }
  }

  // 计算分页
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, totalCount.value)
    if (totalCount.value === 0) {
      return '无记录'
    }
    return `显示 ${start}-${end} 条，共 ${totalCount.value} 条`
  })

  return {
    records,
    loading,
    errorMsg,
    currentPage,
    pageSize,
    totalCount,
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
  }
}
