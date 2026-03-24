import { ref } from 'vue'
import { fetchWithRefresh } from '../api/http'

// 获取本地时间的 ISO 字符串（不转换为 UTC）
function getLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export interface DailyCheckin {
  date: string
  exercise_duration_time: number // min
  exercise_calories_burned: number // g
  exercise_ai_summary: string
  meal_breakfast_type: string // text
  meal_lunch_type: string
  meal_dinner_type: string
  meal_snacks_type: string
  meal_calories: number // kcal
  meal_protein: number // g
  meal_fat: number // g
  meal_carb: number // g
  meal_fiber: number // g
  meal_sugar: number // g
  meal_water: number // ml
  meal_ai_summary: string
  sleep_duration_time: number // hours
  sleep_start_time: string
  sleep_wakeup_times: number
  sleep_ai_summary: string
  total_ai_summary?: string
}

export interface AiSummaryResponse {
  records: Array<{
    exercise_ai_summary: string
    meal_ai_summary: string
    sleep_ai_summary: string
    total_ai_summary: string
  }>
}

export function useDailyCheckin() {
  const form = ref<DailyCheckin>({
    date: getLocalISOString(new Date()).split('T')[0],
    exercise_duration_time: 0,
    exercise_calories_burned: 0,
    exercise_ai_summary: '',
    meal_breakfast_type: '',
    meal_lunch_type: '',
    meal_dinner_type: '',
    meal_snacks_type: '',
    meal_calories: 0,
    meal_protein: 0,
    meal_fat: 0,
    meal_carb: 0,
    meal_fiber: 0,
    meal_sugar: 0,
    meal_water: 0,
    meal_ai_summary: '',
    sleep_duration_time: 0,
    sleep_start_time: '22:00',
    sleep_wakeup_times: 0,
    sleep_ai_summary: '',
    total_ai_summary: ''
  })

  // const displayData = ref<DailyCheckin | null>(null)
  // const loading = ref(false)
  // const editing = ref(false)
  // const sleep_duration_time = ref(0)
  // const sleep_start_time = ref('22:00')
  // const sleep_wakeup_times = ref(0)
  // const sleep_ai_summary = ref('')

  // })

  const displayData = ref<DailyCheckin | null>(null)
  const loading = ref(false)
  const editing = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  // 加载数据
  async function loadDailyCheckin() {
    loading.value = true
    errorMsg.value = ''

    try {
      const exerciseData = await loadCheckin('/api/exercise-checkin/checkin/exercise/summary');
      const mealData = await loadCheckin('/api/meal-checkin/checkin/meal/summary');
      const sleepData = await loadCheckin('/api/sleep-checkin/checkin/sleep/summary');

      const aiSummary = await loadCheckin('/api/exercise-checkin/checkin/exercise/ai-summary');
      console.log('AI Summary response:', aiSummary);
      form.value.exercise_duration_time = (exerciseData as DailyCheckin).exercise_duration_time || 0
      form.value.exercise_calories_burned = (exerciseData as DailyCheckin).exercise_calories_burned || 0
      form.value.exercise_ai_summary = (aiSummary as AiSummaryResponse).records[0].exercise_ai_summary || ''
      form.value.meal_breakfast_type = (mealData as DailyCheckin).meal_breakfast_type || ''
      form.value.meal_lunch_type = (mealData as DailyCheckin).meal_lunch_type || ''
      form.value.meal_dinner_type = (mealData as DailyCheckin).meal_dinner_type || ''
      form.value.meal_calories = (mealData as DailyCheckin).meal_calories || 0
      form.value.meal_protein = (mealData as DailyCheckin).meal_protein || 0
      form.value.meal_fat = (mealData as DailyCheckin).meal_fat || 0
      form.value.meal_carb = (mealData as DailyCheckin).meal_carb || 0
      form.value.meal_fiber = (mealData as DailyCheckin).meal_fiber || 0
      form.value.meal_sugar = (mealData as DailyCheckin).meal_sugar || 0
      form.value.meal_water = (mealData as DailyCheckin).meal_water || 0
      form.value.meal_ai_summary = (aiSummary as AiSummaryResponse).records[0].meal_ai_summary || ''
      form.value.sleep_duration_time = (sleepData as DailyCheckin).sleep_duration_time || 0
      form.value.sleep_start_time = (sleepData as DailyCheckin).sleep_start_time || '22:00'
      form.value.sleep_wakeup_times = (sleepData as DailyCheckin).sleep_wakeup_times || 0
      form.value.sleep_ai_summary = (aiSummary as AiSummaryResponse).records[0].sleep_ai_summary || ''
      form.value.total_ai_summary = (aiSummary as AiSummaryResponse).records[0].total_ai_summary || ''

      console.log('Loaded daily check-in data:', form.value);
      console.log('ai summary:', aiSummary);
      // console.log('Meal summary:', aiSummary);
      // console.log('Sleep summary:', aiSummary);
    } catch (error) {
      errorMsg.value = '网络错误，请检查连接后重试'
      console.error('Load error:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadCheckin(endpoint: string): Promise<object> {
    try {
      const response = await fetchWithRefresh(endpoint, { method: 'GET' })
      const data = await response.json()
      if (response.ok && data) {
        loading.value = false
        return data.data || {};
      } else {
        errorMsg.value = data.message || '加载失败'
      }
    } catch (error) {
      errorMsg.value = '网络错误，请检查连接后重试'
      console.error('Load error:', error)
    }
    loading.value = false
    return {};
  }

  function toMealCheckin() {
    window.location.href = '/meal/checkin'
  }

  function toSleepCheckin() {
    window.location.href = '/sleep/checkin'
  }

  function toExerciseCheckin() {
    window.location.href = '/exercise/checkin'
  }

  return {
    form,
    displayData,
    editing,
    loading,
    errorMsg,
    successMsg,
    loadDailyCheckin,
    loadCheckin,
    toMealCheckin,
    toSleepCheckin,
    toExerciseCheckin,
  }
}
