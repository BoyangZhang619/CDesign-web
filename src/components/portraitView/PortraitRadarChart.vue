<template>
  <div class="portrait-radar-chart">
    <div class="chart-header">
      <div class="chart-title">健康维度分析</div>
    </div>

    <div class="chart-container">
      <canvas ref="canvasRef" class="radar-canvas"></canvas>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color current"></div>
          <span class="legend-label">当前水平</span>
        </div>
        <div class="legend-item">
          <div class="legend-color ideal"></div>
          <span class="legend-label">理想水平</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

interface RadarData {
  dimensions: string[]
  current: number[]
  ideal: number[]
}

interface DrawConfig {
  centerX: number
  centerY: number
  radius: number
  levels: number
  angleSlice: number
}

const props = defineProps({
  radarData: {
    type: Object as () => RadarData,
    default: () => ({
      dimensions: ['运动', '饮食', '睡眠', '心理', '社交'],
      current: [75, 68, 72, 65, 70],
      ideal: [85, 80, 85, 80, 80]
    })
  }
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

const drawRadarChart = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 获取设备像素比
  const dpr = window.devicePixelRatio || 1
  canvas.width = 300 * dpr
  canvas.height = 300 * dpr
  ctx.scale(dpr, dpr)

  const config: DrawConfig = {
    centerX: 150,
    centerY: 150,
    radius: 100,
    levels: 5,
    angleSlice: (Math.PI * 2) / props.radarData.dimensions.length
  }

  // 清空画布
  ctx.clearRect(0, 0, 300, 300)

  // 绘制背景网格和等级圆
  drawLevels(ctx, config)

  // 绘制轴线和标签
  drawAxes(ctx, config)

  // 绘制数据 - 理想水平（浅绿色）
  drawDataPolygon(ctx, config, props.radarData.ideal, '#9DB4A0', 0.15)

  // 绘制数据 - 当前水平（深蓝色）
  drawDataPolygon(ctx, config, props.radarData.current, '#5A7A87', 0.25)
}

const drawLevels = (ctx: CanvasRenderingContext2D, config: DrawConfig) => {
  ctx.strokeStyle = '#E8E1D6'
  ctx.lineWidth = 1
  ctx.fillStyle = 'transparent'

  for (let level = 1; level <= config.levels; level++) {
    const levelRadius = (config.radius / config.levels) * level
    ctx.beginPath()
    ctx.arc(config.centerX, config.centerY, levelRadius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

const drawAxes = (ctx: CanvasRenderingContext2D, config: DrawConfig) => {
  ctx.strokeStyle = '#D1CAC0'
  ctx.lineWidth = 1
  ctx.fillStyle = '#5A7A87'
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < props.radarData.dimensions.length; i++) {
    const angle = config.angleSlice * i - Math.PI / 2
    const x = config.centerX + config.radius * Math.cos(angle)
    const y = config.centerY + config.radius * Math.sin(angle)

    // 绘制轴线
    ctx.beginPath()
    ctx.moveTo(config.centerX, config.centerY)
    ctx.lineTo(x, y)
    ctx.stroke()

    // 绘制标签
    const labelDistance = config.radius + 25
    const labelX = config.centerX + labelDistance * Math.cos(angle)
    const labelY = config.centerY + labelDistance * Math.sin(angle)
    ctx.fillText(props.radarData.dimensions[i], labelX, labelY)
  }
}

const drawDataPolygon = (
  ctx: CanvasRenderingContext2D,
  config: DrawConfig,
  data: number[],
  color: string,
  alpha: number
) => {
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = alpha

  ctx.beginPath()

  for (let i = 0; i < data.length; i++) {
    const angle = config.angleSlice * i - Math.PI / 2
    const value = data[i] / 100
    const x = config.centerX + (config.radius * value) * Math.cos(angle)
    const y = config.centerY + (config.radius * value) * Math.sin(angle)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()

  // 绘制数据点
  ctx.fillStyle = color
  ctx.globalAlpha = 1
  for (let i = 0; i < data.length; i++) {
    const angle = config.angleSlice * i - Math.PI / 2
    const value = data[i] / 100
    const x = config.centerX + (config.radius * value) * Math.cos(angle)
    const y = config.centerY + (config.radius * value) * Math.sin(angle)

    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

onMounted(() => {
  drawRadarChart()
})

watch(() => props.radarData, () => {
  drawRadarChart()
}, { deep: true })
</script>

<style scoped>
.portrait-radar-chart {
  background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%);
  border: 1px solid #E8E1D6;
  border-radius: 12px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E1D9D0;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #5A7A87;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.radar-canvas {
  width: 300px;
  height: 300px;
  max-width: 100%;
}

.chart-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5A7A87;
  font-weight: 600;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.current {
  background: #5A7A87;
}

.legend-color.ideal {
  background: #9DB4A0;
}

.legend-label {
  white-space: nowrap;
}

@media (max-width: 480px) {
  .portrait-radar-chart {
    padding: 15px;
  }

  .radar-canvas {
    width: 250px;
    height: 250px;
  }
}
</style>
