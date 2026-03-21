import { ref, computed } from 'vue'
import { fetchWithRefresh } from '../api/http'

export interface MealRecord {
  id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_source: 'canteen' | 'takeout' | 'dormitory' | 'other'
  food_name: string
  food_detail: string
  calories: number
  protein_g: number
  fat_g: number
  carbohydrate_g: number
  fiber_g: number
  sugar_g: number
  meal_time: string
  ai_recognition_flag: boolean
  image_id: string | null
  created_at: string
  updated_at: string
}

export interface MealCheckinForm {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_source: 'canteen' | 'takeout' | 'dormitory' | 'other'
  food_name: string
  food_detail: string
  meal_time: string
  calories?: number
  protein_g?: number
  fat_g?: number
  carbohydrate_g?: number
  fiber_g?: number
  sugar_g?: number
  ai_recognition_flag?: boolean
  image_id?: string | null
}

export function useMealCheckin() {
  const form = ref<MealCheckinForm>({
    meal_type: 'breakfast',
    food_source: 'canteen',
    food_name: '',
    food_detail: '',
    meal_time: new Date().toISOString().slice(0, 16),
    calories: 0,
    protein_g: 0,
    fat_g: 0,
    carbohydrate_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    ai_recognition_flag: false,
    image_id: null
  })

  const records = ref<MealRecord[]>([])
  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')
  const pollIntervalId = ref<number | null>(null)

  // 选项
  const mealTypeOptions = [
    { label: '早餐', value: 'breakfast' },
    { label: '午餐', value: 'lunch' },
    { label: '晚餐', value: 'dinner' },
    { label: '零食', value: 'snack' }
  ]

  const foodSourceOptions = [
    { label: '学校食堂', value: 'canteen' },
    { label: '外卖平台', value: 'takeout' },
    { label: '宿舍自做', value: 'dormitory' },
    { label: '其他来源', value: 'other' }
  ]

  // 验证表单
  function validateForm(): boolean {
    errorMsg.value = ''

    if (!form.value.food_name?.trim()) {
      errorMsg.value = '请输入食物名称'
      return false
    }

    if (!form.value.food_detail?.trim()) {
      errorMsg.value = '请输入食物描述'
      return false
    }

    if (!form.value.meal_time) {
      errorMsg.value = '请选择进食时间'
      return false
    }

    return true
  }

  // 添加新打卡记录
  async function addMealRecord() {
    if (!validateForm()) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const payload: MealCheckinForm = {
        meal_type: form.value.meal_type,
        food_source: form.value.food_source,
        food_name: form.value.food_name,
        food_detail: form.value.food_detail,
        meal_time: new Date(form.value.meal_time).toISOString().replace('T', ' ').slice(0, 19),
        calories: 0,
        protein_g: 0,
        fat_g: 0,
        carbohydrate_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        ai_recognition_flag: form.value.ai_recognition_flag || false,
        image_id: form.value.image_id || null
      }

      const response = await fetchWithRefresh('/api/meal-checkin/checkin/meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        successMsg.value = '记录已保存，AI正在计算营养数据...'
        // 重置表单
        form.value = {
          meal_type: 'breakfast',
          food_source: 'canteen',
          food_name: '',
          food_detail: '',
          meal_time: new Date().toISOString().slice(0, 16),
          calories: 0,
          protein_g: 0,
          fat_g: 0,
          carbohydrate_g: 0,
          fiber_g: 0,
          sugar_g: 0,
          ai_recognition_flag: false,
          image_id: null
        }
        // 立即加载新记录
        await loadRecords()
        // 启动轮询以获取最新的营养数据
        startPolling()
      } else {
        errorMsg.value = data.message || '保存失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误'
      console.error('Add meal record error:', error)
    } finally {
      loading.value = false
    }
  }

  // 加载今天的所有饮食记录
  async function loadRecords() {
    try {
      const response = await fetchWithRefresh('/api/meal-checkin/checkin/meal', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        // 确保所有营养值都是数字
        const rawRecords = data.data.records || []
        records.value = rawRecords.map((record: any) => ({
          ...record,
          calories: Number(record.calories) || 0,
          protein_g: Number(record.protein_g) || 0,
          fat_g: Number(record.fat_g) || 0,
          carbohydrate_g: Number(record.carbohydrate_g) || 0,
          fiber_g: Number(record.fiber_g) || 0,
          sugar_g: Number(record.sugar_g) || 0
        }))
      } else {
        console.error('Load records error:', data.message)
      }
    } catch (error) {
      console.error('Load records error:', error)
    }
  }

  // 开始轮询以获取最新数据
  function startPolling() {
    if (pollIntervalId.value) return

    pollIntervalId.value = window.setInterval(async () => {
      await loadRecords()
      // 检查是否有记录还在计算中
      const hasCalculating = records.value.some(r => r.calories === 0)
      if (!hasCalculating) {
        stopPolling()
      }
    }, 3000) // 每3秒检查一次
  }

  // 停止轮询
  function stopPolling() {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value)
      pollIntervalId.value = null
    }
  }

  // 计算总营养
  const totalNutrition = computed(() => {
    const totals = {
      calories: records.value.reduce((sum, r) => sum + (Number(r.calories) || 0), 0),
      protein: records.value.reduce((sum, r) => sum + (Number(r.protein_g) || 0), 0),
      fat: records.value.reduce((sum, r) => sum + (Number(r.fat_g) || 0), 0),
      carbohydrate: records.value.reduce((sum, r) => sum + (Number(r.carbohydrate_g) || 0), 0),
      fiber: records.value.reduce((sum, r) => sum + (Number(r.fiber_g) || 0), 0),
      sugar: records.value.reduce((sum, r) => sum + (Number(r.sugar_g) || 0), 0),
      count: records.value.length
    }
    
    // 格式化为两位小数
    return {
      calories: parseFloat(totals.calories.toFixed(2)),
      protein: parseFloat(totals.protein.toFixed(2)),
      fat: parseFloat(totals.fat.toFixed(2)),
      carbohydrate: parseFloat(totals.carbohydrate.toFixed(2)),
      fiber: parseFloat(totals.fiber.toFixed(2)),
      sugar: parseFloat(totals.sugar.toFixed(2)),
      count: totals.count
    }
  })

  // 获取进食时段显示文本
  const getMealTypeText = (type: string) => {
    const option = mealTypeOptions.find(o => o.value === type)
    return option?.label || type
  }

  // 获取食物来源显示文本
  const getFoodSourceText = (source: string) => {
    const option = foodSourceOptions.find(o => o.value === source)
    return option?.label || source
  }

  // 判断是否在计算中
  const isCalculating = (record: MealRecord) => record.calories === 0

  return {
    form,
    records,
    loading,
    errorMsg,
    successMsg,
    mealTypeOptions,
    foodSourceOptions,
    totalNutrition,
    validateForm,
    addMealRecord,
    loadRecords,
    startPolling,
    stopPolling,
    getMealTypeText,
    getFoodSourceText,
    isCalculating
  }
}
