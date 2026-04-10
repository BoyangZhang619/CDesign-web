<template>
  <div class="trends-charts-section">
    <div class="trends-chart-card">
      <div class="trends-chart-header">
        <h3 class="trends-chart-title">运动趋势</h3>
      </div>
      <div class="trends-chart-container">
        <canvas ref="exerciseChart" class="trends-chart-canvas"></canvas>
      </div>
    </div>

    <div class="trends-chart-card">
      <div class="trends-chart-header">
        <h3 class="trends-chart-title">饮食趋势</h3>
      </div>
      <div class="trends-chart-container">
        <canvas ref="mealChart" class="trends-chart-canvas"></canvas>
      </div>
    </div>

    <div class="trends-chart-card">
      <div class="trends-chart-header">
        <h3 class="trends-chart-title">睡眠趋势</h3>
      </div>
      <div class="trends-chart-container">
        <canvas ref="sleepChart" class="trends-chart-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  chartData: Array<{date: string; exercise: number; meal: number; sleep: number}>
}>()

const exerciseChart = ref<HTMLCanvasElement | null>(null)
const mealChart = ref<HTMLCanvasElement | null>(null)
const sleepChart = ref<HTMLCanvasElement | null>(null)

// 绘制图表 - Canvas绘制线图
function drawChart(
  canvas: HTMLCanvasElement,
  dates: string[],
  data: number[],
  color: string
) {
  if (dates.length === 0 || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 600
  canvas.height = 300

  const padding = 40
  const graphWidth = canvas.width - 2 * padding
  const graphHeight = canvas.height - 2 * padding - 20
  const maxValue = data.length > 0 ? Math.max(...data) * 1.2 : 100
  const xStep = dates.length > 1 ? graphWidth / (dates.length - 1) : graphWidth
  const scale = maxValue > 0 ? graphHeight / maxValue : graphHeight / 100

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

function generateDefaultData(count: number = 7) {
  const dates = []
  const data = []
  const today = new Date()
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}-${date.getDate()}`)
    data.push(0)
  }
  
  return { dates, data }
}

function initCharts() {
  let dates = props.chartData.map(d => d.date)
  let exerciseData = props.chartData.map(d => d.exercise)
  let mealData = props.chartData.map(d => d.meal)
  let sleepData = props.chartData.map(d => d.sleep)

  // 如果没有数据，生成全 0 的默认数据
  if (dates.length === 0) {
    const defaultData = generateDefaultData(7)
    dates = defaultData.dates
    exerciseData = defaultData.data
    mealData = defaultData.data
    sleepData = defaultData.data
  }

  if (exerciseChart.value) {
    drawChart(exerciseChart.value, dates, exerciseData, '#e8b4b8')
  }

  if (mealChart.value) {
    drawChart(mealChart.value, dates, mealData, '#daa76f')
  }

  if (sleepChart.value) {
    drawChart(sleepChart.value, dates, sleepData, '#a79368')
  }
}

watch(() => props.chartData, async () => {
  await nextTick()
  initCharts()
}, { deep: true, immediate: true })
</script>

<style scoped>
@import '@/css/components/TrendsCharts.css';
</style>
