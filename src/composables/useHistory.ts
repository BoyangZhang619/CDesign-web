import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface HistoryRecord {
  id: string
  date: string
  type: 'meal' | 'exercise' | 'sleep' | 'weight' | 'mood' | 'water'
  title: string
  value: string | number
  description: string
  time: string
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
    { label: '体重', value: 'weight' },
    { label: '心情', value: 'mood' },
    { label: '喝水', value: 'water' }
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

      const response = await fetchWithRefresh(`/history?${params}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        records.value = data.records || []
        totalCount.value = data.total || 0
      } else {
        errorMsg.value = data.message || '加载失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Load records error:', error)
    } finally {
      loading.value = false
    }
  }

  // 重置筛选
  function resetFilters() {
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
    currentPage.value = 1
    loadRecords()
  }

  // 改变排序
  function changeSort(sort: string) {
    currentSort.value = sort
    loadRecords()
  }

  // 改变类型筛选
  function changeType(type: string) {
    filters.value.type = type
    currentPage.value = 1
    loadRecords()
  }

  // 删除单条记录
  async function deleteRecord(id: string) {
    if (!confirm('确定要删除这条记录吗？')) {
      return
    }

    try {
      const response = await fetchWithRefresh(`/history/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadRecords()
      } else {
        errorMsg.value = '删除失败'
      }
    } catch (error) {
      errorMsg.value = '删除出错'
      console.error('Delete error:', error)
    }
  }

  // 计算分页
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, totalCount.value)
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
