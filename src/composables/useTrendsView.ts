import { ref, nextTick, watch } from 'vue'
import { fetchWithRefresh } from '../api/http'

export function useTrendsView() {
  const loading = ref(false)
  const selectedRange = ref('month')
  const isControlPanelOpen = ref(true)
  const showHealthSetupModal = ref(false)

  const exerciseChart = ref<HTMLCanvasElement | null>(null)
  const mealChart = ref<HTMLCanvasElement | null>(null)
  const sleepChart = ref<HTMLCanvasElement | null>(null)

  // 每日数据用于图表
  const chartData = ref<Array<{date: string; exercise: number; meal: number; sleep: number}>>([])

  // 时间范围选项
  const dateRanges = [
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' },
    { label: '本季度', value: 'quarter' },
    { label: '本年', value: 'year' }
  ]

  // 统计数据
  const stats = ref({
    avgExercise: 0,
    maxExercise: 0,
    avgMealCalories: 0,
    maxMealCalories: 0,
    avgSleep: 0,
    maxSleep: 0,
    totalCalories: 0,
    totalExerciseTime: 0,
    totalSleepTime: 0,
    healthScore: 0,
    caloriesTrend: 0,
    exerciseTrend: 0,
    sleepTrend: 0,
    scoreTrend: 0
  })

  // 习惯养成数据
  const habits = ref<Array<{id: number; title: string; description: string; days: number; progress: number; target: number}>>([])

  // 对比数据
  const comparison = ref({
    exerciseFrequencyCurrent: 0,
    exerciseFrequencyPrev: 0,
    exerciseTrend: 0,
    sleepCurrent: 0,
    sleepPrev: 0,
    sleepTrend: 0,
    mealBalanceCurrent: 0,
    mealBalancePrev: 0,
    mealTrend: 0
  })

  /**
   * 处理健康档案关闭
   */
  function handleHealthSetupClose() {
    console.log('用户选择稍后设置健康档案')
  }

  /**
   * 处理健康档案成功
   */
  function handleHealthSetupSuccess() {
    showHealthSetupModal.value = false
    console.log('用户完成了健康档案设置！')
    loadTrendsData()
  }

  /**
   * 选择时间范围
   */
  function selectRange(range: string) {
    selectedRange.value = range
  }

  /**
   * 加载趋势数据
   */
  async function loadTrendsData() {
    loading.value = true
    try {
      const response = await fetchWithRefresh(
        `/api/analysis/trends?range=${selectedRange.value}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data?.success && data.data) {
          const trendsData = data.data
          Object.assign(stats.value, {
            avgExercise: trendsData.avgExercise || 0,
            maxExercise: trendsData.maxExercise || 0,
            avgMealCalories: trendsData.avgMealCalories || 0,
            maxMealCalories: trendsData.maxMealCalories || 0,
            avgSleep: trendsData.avgSleep || 0,
            maxSleep: trendsData.maxSleep || 0,
            totalCalories: trendsData.totalCalories || 0,
            totalExerciseTime: trendsData.totalExerciseTime || 0,
            totalSleepTime: trendsData.totalSleepTime || 0,
            healthScore: trendsData.healthScore || 0,
            caloriesTrend: trendsData.caloriesTrend || 0,
            exerciseTrend: trendsData.exerciseTrend || 0,
            sleepTrend: trendsData.sleepTrend || 0,
            scoreTrend: trendsData.scoreTrend || 0
          })

          // 更新对比数据
          if (trendsData.weekComparison) {
            const wc = trendsData.weekComparison
            Object.assign(comparison.value, {
              exerciseFrequencyCurrent: wc.exerciseFrequency || 0,
              exerciseFrequencyPrev: wc.exerciseFrequencyPrev || 0,
              exerciseTrend: wc.exerciseFrequencyTrend || 0,
              sleepCurrent: wc.avgSleepCurrent || 0,
              sleepPrev: wc.avgSleepPrev || 0,
              sleepTrend: wc.sleepTrend || 0,
              mealBalanceCurrent: wc.mealBalance || 0,
              mealBalancePrev: (wc.mealBalance || 0) * (1 - (wc.mealBalanceTrend || 0) / 100),
              mealTrend: wc.mealBalanceTrend || 0
            })
          }

          // 更新每日数据用于图表
          if (trendsData.dailyData && trendsData.dailyData.length > 0) {
            chartData.value = trendsData.dailyData
            await nextTick()
            initCharts()
          }

          // 更新习惯养成数据
          if (trendsData.habits && trendsData.habits.length > 0) {
            habits.value = trendsData.habits
          } else {
            habits.value = []
          }
        }
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 初始化所有图表
   */
  function initCharts() {
    const dates = chartData.value.map(d => d.date)
    const exerciseData = chartData.value.map(d => d.exercise)
    const mealData = chartData.value.map(d => d.meal)
    const sleepData = chartData.value.map(d => d.sleep)

    if (exerciseChart.value && exerciseData.length > 0) {
      drawChart(exerciseChart.value, dates, exerciseData, '#e8b4b8')
    }

    if (mealChart.value && mealData.length > 0) {
      drawChart(mealChart.value, dates, mealData, '#daa76f')
    }

    if (sleepChart.value && sleepData.length > 0) {
      drawChart(sleepChart.value, dates, sleepData, '#a79368')
    }
  }

  /**
   * 绘制图表 - Canvas绘制线图
   * @param canvas 画布元素
   * @param dates 日期数组
   * @param data 数据数组
   * @param color 数据线颜色
   */
  function drawChart(
    canvas: HTMLCanvasElement,
    dates: string[],
    data: number[],
    color: string
  ) {
    if (data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 600
    canvas.height = 300

    const padding = 40
    const graphWidth = canvas.width - 2 * padding
    const graphHeight = canvas.height - 2 * padding - 20
    const maxValue = Math.max(...data) * 1.2
    const xStep = graphWidth / (dates.length - 1)
    const scale = graphHeight / maxValue

    // 绘制网格线
    ctx.strokeStyle = '#e0d9d1'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // 绘制数据线和区域
    ctx.fillStyle = color + '33'
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)

    data.forEach((value, index) => {
      const x = padding + index * xStep
      const y = canvas.height - padding - value * scale
      ctx.lineTo(x, y)
    })

    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.closePath()
    ctx.fill()

    // 绘制数据线
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = padding + index * xStep
      const y = canvas.height - padding - value * scale
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制数据点
    ctx.fillStyle = color
    data.forEach((value, index) => {
      const x = padding + index * xStep
      const y = canvas.height - padding - value * scale
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // 绘制 X 轴标签
    ctx.fillStyle = '#6d6d6d'
    ctx.font = '12px Montserrat, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    dates.forEach((date, index) => {
      const x = padding + index * xStep
      ctx.fillText(date, x, canvas.height - padding + 10)
    })
  }

  /**
   * 初始化页面数据
   */
  async function initTrends() {
    try {
      await loadTrendsData()
      await nextTick()
      if (chartData.value.length > 0) {
        initCharts()
      }
    } catch (err) {
      console.error('页面初始化错误:', err)
    }
  }

  /**
   * 设置时间范围变化监听
   */
  function setupRangeWatch() {
    watch(selectedRange, async () => {
      await loadTrendsData()
    })
  }

  return {
    // State
    loading,
    selectedRange,
    isControlPanelOpen,
    showHealthSetupModal,
    exerciseChart,
    mealChart,
    sleepChart,
    chartData,
    dateRanges,
    stats,
    habits,
    comparison,
    // Methods
    handleHealthSetupClose,
    handleHealthSetupSuccess,
    selectRange,
    loadTrendsData,
    initCharts,
    drawChart,
    initTrends,
    setupRangeWatch
  }
}
