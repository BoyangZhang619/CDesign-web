import { ref, nextTick, watch } from 'vue'
import { fetchWithRefresh } from '../api/http'

export function useTrendsView() {
  const loading = ref(false)
  const error = ref('')
  const showHealthSetupModal = ref(false)

  // 自定义日期区间（默认近7天）
  const startDate = ref(formatDate(daysAgo(7)))
  const endDate = ref(formatDate(new Date()))

  const exerciseChart = ref<HTMLCanvasElement | null>(null)
  const mealChart = ref<HTMLCanvasElement | null>(null)
  const sleepChart = ref<HTMLCanvasElement | null>(null)

  const chartData = ref<Array<{date: string; exercise: number; meal: number; sleep: number}>>([])

  // 预设区间（快捷按钮）
  const presets = [
    { label: '7天', days: 7 },
    { label: '30天', days: 30 },
    { label: '90天', days: 90 },
    { label: '一年', days: 365 },
  ]

  const stats = ref({
    avgExercise: 0, maxExercise: 0,
    avgMealCalories: 0, maxMealCalories: 0,
    avgSleep: 0, maxSleep: 0,
    totalCalories: 0, totalExerciseTime: 0, totalSleepTime: 0,
    healthScore: 0, caloriesTrend: 0, exerciseTrend: 0,
    sleepTrend: 0, scoreTrend: 0,
  })

  const habits = ref<Array<{id: number; title: string; description: string; days: number; progress: number; target: number}>>([])

  const comparison = ref({
    exerciseFrequencyCurrent: 0, exerciseFrequencyPrev: 0, exerciseTrend: 0,
    sleepCurrent: 0, sleepPrev: 0, sleepTrend: 0,
    mealBalanceCurrent: 0, mealBalancePrev: 0, mealTrend: 0,
  })

  // ── helpers ─────────────────────────────────────────────────
  function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d }
  function formatDate(d: Date) { return d.toISOString().split('T')[0] }

  function applyPreset(days: number) {
    startDate.value = formatDate(daysAgo(days))
    endDate.value = formatDate(new Date())
  }

  // ── handlers ───────────────────────────────────────────────
  function handleHealthSetupClose() { showHealthSetupModal.value = false }
  function handleHealthSetupSuccess() { showHealthSetupModal.value = false; loadTrendsData(); }

  async function loadTrendsData() {
    loading.value = true
    error.value = ''
    try {
      const params = new URLSearchParams({ startDate: startDate.value, endDate: endDate.value })
      const response = await fetchWithRefresh(`/analysis/trends?${params}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        if (data?.success && data.data) {
          const t = data.data
          Object.assign(stats.value, {
            avgExercise: t.avgExercise || 0, maxExercise: t.maxExercise || 0,
            avgMealCalories: t.avgMealCalories || 0, maxMealCalories: t.maxMealCalories || 0,
            avgSleep: t.avgSleep || 0, maxSleep: t.maxSleep || 0,
            totalCalories: t.totalCalories || 0, totalExerciseTime: t.totalExerciseTime || 0,
            totalSleepTime: t.totalSleepTime || 0, healthScore: t.healthScore || 0,
            caloriesTrend: t.caloriesTrend || 0, exerciseTrend: t.exerciseTrend || 0,
            sleepTrend: t.sleepTrend || 0, scoreTrend: t.scoreTrend || 0,
          })
          if (t.weekComparison) {
            const w = t.weekComparison
            Object.assign(comparison.value, {
              exerciseFrequencyCurrent: w.exerciseFrequencyCurrent || 0,
              exerciseFrequencyPrev: w.exerciseFrequencyPrev || 0,
              exerciseTrend: w.exerciseFrequencyTrend || 0,
              sleepCurrent: w.sleepCurrent || 0, sleepPrev: w.sleepPrev || 0,
              sleepTrend: w.sleepTrend || 0,
              mealBalanceCurrent: w.mealBalanceCurrent || 0,
              mealBalancePrev: w.mealBalancePrev || 0, mealTrend: w.mealTrend || 0,
            })
          }
          if (t.dailyData?.length) {
            chartData.value = t.dailyData
            await nextTick(); initCharts()
          }
          habits.value = t.habits?.length ? t.habits : []
        }
      }
    } catch (err: any) {
      error.value = err.message || '加载趋势数据失败'
    } finally { loading.value = false }
  }

  // ── charts ─────────────────────────────────────────────────
  function initCharts() {
    const dates = chartData.value.map(d => d.date)
    if (exerciseChart.value && dates.length) drawChart(exerciseChart.value, dates, chartData.value.map(d => d.exercise), '#F58529')
    if (mealChart.value && dates.length) drawChart(mealChart.value, dates, chartData.value.map(d => d.meal), '#78C850')
    if (sleepChart.value && dates.length) drawChart(sleepChart.value, dates, chartData.value.map(d => d.sleep), '#833AB4')
  }

  function drawChart(canvas: HTMLCanvasElement, dates: string[], data: number[], color: string) {
    if (!data.length) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    canvas.width = 600; canvas.height = 280
    const pad = 40, gw = canvas.width - 2*pad, gh = canvas.height - 2*pad - 20
    const maxV = Math.max(...data) * 1.2 || 1, xStep = gw / (dates.length - 1 || 1), scale = gh / maxV

    // Grid
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = pad + (gh/5)*i
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(canvas.width-pad, y); ctx.stroke()
    }
    // Area
    ctx.fillStyle = color + '22'
    ctx.beginPath(); ctx.moveTo(pad, canvas.height-pad)
    data.forEach((v, i) => { const x = pad + i*xStep; ctx.lineTo(x, canvas.height-pad - v*scale) })
    ctx.lineTo(canvas.width-pad, canvas.height-pad); ctx.closePath(); ctx.fill()
    // Line
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath()
    data.forEach((v, i) => { const x = pad + i*xStep; if (i===0) ctx.moveTo(x, canvas.height-pad - v*scale); else ctx.lineTo(x, canvas.height-pad - v*scale) })
    ctx.stroke()
    // Dots
    ctx.fillStyle = color
    data.forEach((v, i) => { const x = pad + i*xStep; ctx.beginPath(); ctx.arc(x, canvas.height-pad - v*scale, 3, 0, Math.PI*2); ctx.fill() })
    // Labels
    ctx.fillStyle = '#8E8E8E'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    dates.forEach((d, i) => ctx.fillText(d.slice(5), pad + i*xStep, canvas.height-pad+10))
  }

  async function initTrends() {
    await loadTrendsData()
    if (chartData.value.length) { await nextTick(); initCharts() }
  }

  // Watch date changes
  watch([startDate, endDate], async () => { await loadTrendsData() })

  return {
    loading, error, showHealthSetupModal,
    startDate, endDate, presets, applyPreset,
    exerciseChart, mealChart, sleepChart,
    chartData, stats, habits, comparison,
    handleHealthSetupClose, handleHealthSetupSuccess,
    loadTrendsData, initTrends,
  }
}
