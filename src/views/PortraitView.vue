<template>
  <div class="portrait-page">
    <AppHeader />

    <!-- 健康档案设置浮窗（必须完成） -->
    <HealthSetupModal
      :show="showHealthSetupModal"
      :force-complete="true"
      @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess"
    />

    <!-- 主内容区 -->
    <main class="portrait-main" v-if="!showHealthSetupModal">
      <!-- 页面标题 -->
      <section class="portrait-header">
        <div class="header-content">
          <h1 class="page-title">健康画像</h1>
          <p class="page-subtitle">基于您的健康数据构建的个性化健康模型</p>
        </div>
      </section>

      <!-- 健康评分卡 -->
      <section class="portrait-score-card">
        <div class="score-container">
          <div class="score-circle">
            <svg viewBox="0 0 120 120" class="score-ring">
              <circle
                cx="60"
                cy="60"
                r="54"
                class="score-ring-bg"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                class="score-ring-progress"
                :style="{ strokeDashoffset: scoreOffset }"
              />
            </svg>
            <div class="score-text">
              <div class="score-value">{{ healthScore }}</div>
              <div class="score-label">总体评分</div>
            </div>
          </div>

          <div class="score-details">
            <div class="score-item">
              <span class="score-icon">🏃</span>
              <span class="score-name">运动</span>
              <div class="score-bar">
                <div
                  class="score-fill exercise"
                  :style="{ width: portraitData.exerciseScore + '%' }"
                ></div>
              </div>
              <span class="score-num">{{ portraitData.exerciseScore }}</span>
            </div>

            <div class="score-item">
              <span class="score-icon">🍽️</span>
              <span class="score-name">饮食</span>
              <div class="score-bar">
                <div
                  class="score-fill meal"
                  :style="{ width: portraitData.mealScore + '%' }"
                ></div>
              </div>
              <span class="score-num">{{ portraitData.mealScore }}</span>
            </div>

            <div class="score-item">
              <span class="score-icon">😴</span>
              <span class="score-name">睡眠</span>
              <div class="score-bar">
                <div
                  class="score-fill sleep"
                  :style="{ width: portraitData.sleepScore + '%' }"
                ></div>
              </div>
              <span class="score-num">{{ portraitData.sleepScore }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 健康指标雷达图 -->
      <section class="portrait-radar-section">
        <h2 class="section-title">健康维度分析</h2>
        <div class="radar-container">
          <canvas ref="radarChart" class="radar-chart"></canvas>
          <div class="radar-legend">
            <div class="legend-item">
              <span class="legend-color" style="background: var(--color-accent-primary)"></span>
              <span>当前水平</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: var(--color-oatmeal)"></span>
              <span>理想水平</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 身体指标卡片 -->
      <section class="portrait-metrics">
        <h2 class="section-title">身体指标</h2>
        <div class="metrics-grid">
          <!-- BMI 指标 -->
          <div class="metric-card" :class="portraitData.bmiStatus">
            <div class="metric-icon">📏</div>
            <div class="metric-info">
              <div class="metric-label">BMI 指数</div>
              <div class="metric-value">{{ portraitData.bmi }}</div>
              <div class="metric-status">{{ portraitData.bmiStatus }}</div>
            </div>
          </div>

          <!-- 心肺功能 -->
          <div class="metric-card" :class="portraitData.cardioStatus">
            <div class="metric-icon">❤️</div>
            <div class="metric-info">
              <div class="metric-label">心肺功能</div>
              <div class="metric-value">{{ portraitData.cardioLevel }}</div>
              <div class="metric-status">{{ portraitData.cardioStatus }}</div>
            </div>
          </div>

          <!-- 代谢指数 -->
          <div class="metric-card" :class="portraitData.metabolismStatus">
            <div class="metric-icon">⚡</div>
            <div class="metric-info">
              <div class="metric-label">代谢指数</div>
              <div class="metric-value">{{ portraitData.metabolism }}</div>
              <div class="metric-status">{{ portraitData.metabolismStatus }}</div>
            </div>
          </div>

          <!-- 睡眠质量 -->
          <div class="metric-card" :class="portraitData.sleepQualityStatus">
            <div class="metric-icon">🌙</div>
            <div class="metric-info">
              <div class="metric-label">睡眠质量</div>
              <div class="metric-value">{{ portraitData.sleepQuality }}</div>
              <div class="metric-status">{{ portraitData.sleepQualityStatus }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 健康建议 -->
      <section class="portrait-recommendations">
        <h2 class="section-title">个性化建议</h2>
        <div class="recommendations-list">
          <div
            v-for="(rec, index) in portraitData.recommendations"
            :key="index"
            class="recommendation-item"
          >
            <div class="rec-icon">{{ rec.icon }}</div>
            <div class="rec-content">
              <h3 class="rec-title">{{ rec.title }}</h3>
              <p class="rec-description">{{ rec.description }}</p>
            </div>
            <div class="rec-priority" :class="rec.priority">
              {{ rec.priority }}
            </div>
          </div>
        </div>
      </section>

      <!-- 健康历程 -->
      <section class="portrait-timeline">
        <h2 class="section-title">健康进度</h2>
        <div class="timeline">
          <div
            v-for="(event, index) in portraitData.timeline"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-marker" :class="event.status"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ event.date }}</div>
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-description">{{ event.description }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useAuthForm } from '../composables/useAuthForm'
import { fetchWithRefresh } from '../api/http'

const { checkHealthInfoNeeded } = useAuthForm()

const showHealthSetupModal = ref(false)
const loading = ref(false)
const radarChart = ref<HTMLCanvasElement | null>(null)

// 健康画像数据
const portraitData = ref({
  // 评分
  exerciseScore: 75,
  mealScore: 68,
  sleepScore: 82,

  // 身体指标
  bmi: 22.5,
  bmiStatus: 'normal',
  cardioLevel: '良好',
  cardioStatus: 'good',
  metabolism: 85,
  metabolismStatus: 'normal',
  sleepQuality: '较好',
  sleepQualityStatus: 'good',

  // 建议
  recommendations: [
    {
      icon: '🏃',
      title: '增加有氧运动',
      description: '建议每周进行3-5次有氧运动，每次30分钟，可以有效提升心肺功能',
      priority: '高'
    },
    {
      icon: '🥗',
      title: '均衡膳食结构',
      description: '增加蔬菜水果摄入，减少高热量食物，保持营养均衡',
      priority: '中'
    },
    {
      icon: '🌙',
      title: '规律作息',
      description: '建议22:30前入睡，保证7-8小时睡眠，提升睡眠质量',
      priority: '高'
    },
    {
      icon: '💧',
      title: '适当补水',
      description: '每天建议饮用8杯水，保持身体水分平衡',
      priority: '低'
    }
  ],

  // 时间轴
  timeline: [
    {
      date: '2024年3月',
      title: '健康数据初始化',
      description: '完成基础信息和体检数据录入，建立个人健康档案',
      status: 'completed'
    },
    {
      date: '2024年4月',
      title: '运动习惯养成',
      description: '连续30天运动打卡，运动评分从60提升到75',
      status: 'completed'
    },
    {
      date: '2024年5月',
      title: '睡眠质量改善',
      description: '通过规律作息，睡眠评分从70提升到82',
      status: 'completed'
    },
    {
      date: '2024年6月',
      title: '综合健康优化',
      description: '三大维度均衡发展，总体评分目标达到85分',
      status: 'in-progress'
    }
  ]
})

// 计算健康总分
const healthScore = computed(() => {
  return Math.round(
    (portraitData.value.exerciseScore +
      portraitData.value.mealScore +
      portraitData.value.sleepScore) /
      3
  )
})

// 计算圆形进度条的偏移量
const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 54
  return circumference - (healthScore.value / 100) * circumference
})

// 处理健康档案关闭
function handleHealthSetupClose() {
  console.log('用户选择稍后设置健康档案')
}

// 处理健康档案成功
function handleHealthSetupSuccess() {
  showHealthSetupModal.value = false
  console.log('用户完成了健康档案设置！')
  // 重新加载数据
  loadPortraitData()
}

// 加载健康画像数据
async function loadPortraitData() {
  loading.value = true
  try {
    const response = await fetchWithRefresh(
      '/api/health/portrait',
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
        // 合并后端返回的数据
        Object.assign(portraitData.value, data.data)
      }
    }
  } catch (error) {
    console.error('加载健康画像数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  try {
    // 检查是否需要完成健康档案设置
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      showHealthSetupModal.value = true
      return
    }

    // 加载数据
    await loadPortraitData()
    await nextTick()
    initRadarChart()
  } catch (err) {
    console.error('页面初始化错误:', err)
  }
})

// 初始化雷达图
function initRadarChart() {
  if (!radarChart.value) return

  const ctx = radarChart.value.getContext('2d')
  if (!ctx) return

  const centerX = radarChart.value.width / 2
  const centerY = radarChart.value.height / 2
  const radius = 80

  // 设置雷达图尺寸
  radarChart.value.width = 300
  radarChart.value.height = 300

  const labels = ['运动', '饮食', '睡眠', '心肺', '代谢', '压力管理']
  const currentData = [
    portraitData.value.exerciseScore,
    portraitData.value.mealScore,
    portraitData.value.sleepScore,
    75,
    portraitData.value.metabolism,
    70
  ]
  const idealData = [85, 85, 85, 85, 85, 85]

  const angles = labels.map((_, i) => (i / labels.length) * Math.PI * 2 - Math.PI / 2)

  // 绘制网格
  const gridColor = '#e0d9d1'
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1

  for (let i = 1; i <= 5; i++) {
    const gridRadius = (radius / 5) * i
    ctx.beginPath()
    angles.forEach((angle, index) => {
      const x = centerX + gridRadius * Math.cos(angle)
      const y = centerY + gridRadius * Math.sin(angle)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.stroke()
  }

  // 绘制轴线
  angles.forEach((angle) => {
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  })

  // 绘制理想数据（浅色）
  ctx.fillStyle = '#ede6de'
  ctx.beginPath()
  idealData.forEach((value, index) => {
    const angle = angles[index]
    const r = (value / 100) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#b9a796'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制当前数据（深色）
  ctx.fillStyle = 'rgba(167, 147, 104, 0.3)'
  ctx.beginPath()
  currentData.forEach((value, index) => {
    const angle = angles[index]
    const r = (value / 100) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#a79368'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制数据点
  ctx.fillStyle = '#a79368'
  currentData.forEach((value, index) => {
    const angle = angles[index]
    const r = (value / 100) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // 绘制标签
  ctx.fillStyle = '#2d2d2d'
  ctx.font = '12px Montserrat, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  labels.forEach((label, index) => {
    const angle = angles[index]
    const x = centerX + (radius + 25) * Math.cos(angle)
    const y = centerY + (radius + 25) * Math.sin(angle)
    ctx.fillText(label, x, y)
  })
}
</script>

<style scoped>
@import '@/css/PortraitView.css';
</style>