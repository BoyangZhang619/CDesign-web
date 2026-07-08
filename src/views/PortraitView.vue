<template>
  <div class="portrait container-md">
    <HealthSetupModal :show="showHealthSetupModal" :force-complete="true"
      @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />

    <div v-if="isRefreshing" class="state-box"><div class="spinner"></div><p>加载中...</p></div>

    <template v-else-if="!showHealthSetupModal">
      <!-- Score ring -->
      <div class="score-hero">
        <div class="score-ring" :style="{ '--pct': portraitData?.healthScore || 0 }">
          <span class="score-num">{{ portraitData?.healthScore || '--' }}</span>
          <span class="score-label">健康分</span>
        </div>
      </div>

      <!-- Dimension bars -->
      <div class="dims">
        <div class="dim" v-for="d in dimensions" :key="d.label">
          <div class="dim-bar-wrap">
            <div class="dim-bar" :style="{ width: d.score + '%', background: d.color }"></div>
          </div>
          <span class="dim-label">{{ d.label }}</span>
          <span class="dim-val">{{ d.score }}</span>
        </div>
      </div>

      <!-- Radar -->
      <div v-if="portraitData?.radarData" class="card">
        <h3 class="card-title">维度分析</h3>
        <canvas ref="radarCanvas" class="radar-canvas"></canvas>
      </div>

      <!-- Recommendations -->
      <div v-if="portraitData?.recommendations?.length" class="recs">
        <h3 class="section-title">健康建议</h3>
        <div v-for="r in portraitData.recommendations" :key="r.id" class="rec-card"
          :class="'pri-' + r.priority">
          <span class="rec-icon">{{ r.icon }}</span>
          <div><span class="rec-title">{{ r.title }}</span><span class="rec-desc">{{ r.description }}</span></div>
        </div>
      </div>

      <!-- Timeline -->
      <div v-if="portraitData?.timelineEvents?.length" class="card">
        <h3 class="card-title">健康时间线</h3>
        <div v-for="e in portraitData.timelineEvents" :key="e.id" class="tl-item">
          <div class="tl-dot" :class="{ done: e.status === 'completed' }"></div>
          <div><span class="tl-title">{{ e.title }}</span><span class="tl-date">{{ e.date }}</span><span class="tl-desc">{{ e.description }}</span></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { usePortraitView } from '../composables/usePortraitView'

const {
  showHealthSetupModal, isRefreshing, portraitData,
  handleHealthSetupClose, handleHealthSetupSuccess, initPortrait,
} = usePortraitView()

const radarCanvas = ref<HTMLCanvasElement | null>(null)

const dimensions = computed(() => {
  const d = portraitData.value
  if (!d) return []
  return [
    { label: '运动', score: d.exerciseScore || 0, color: '#F58529' },
    { label: '饮食', score: d.mealScore || 0, color: '#78C850' },
    { label: '睡眠', score: d.sleepScore || 0, color: '#833AB4' },
  ]
})

function drawRadar() {
  const c = radarCanvas.value; if (!c) return
  const rd = portraitData.value?.radarData; if (!rd?.dimensions?.length) return
  c.width = 300; c.height = 300
  const ctx = c.getContext('2d'); if (!ctx) return
  const cx = 150, cy = 150, r = 100, n = rd.dimensions.length

  ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 1
  for (let lvl = 1; lvl <= 5; lvl++) {
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + (r/5)*lvl * Math.cos(a), y = cy + (r/5)*lvl * Math.sin(a)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath(); ctx.stroke()
  }
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); ctx.stroke()
  }
  const maxV = Math.max(...rd.ideal, ...rd.current, 1)
  ctx.fillStyle = 'rgba(0,149,246,0.12)'; ctx.strokeStyle = '#0095F6'; ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    const rr = (rd.current[i] / maxV) * r
    const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#8E8E8E'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    ctx.fillText(rd.dimensions[i], cx + (r + 18) * Math.cos(a), cy + (r + 18) * Math.sin(a) + 4)
  }
}

watch(() => portraitData.value?.radarData, async () => { await nextTick(); drawRadar() })

onMounted(async () => { await initPortrait(); await nextTick(); drawRadar() })
</script>

<style lang="scss" scoped>
.portrait { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
}
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// Score
.score-hero { display: flex; justify-content: center; padding: var(--space-6) 0; }
.score-ring {
  width: 140px; height: 140px; border-radius: 50%;
  background: conic-gradient(var(--color-accent) calc(var(--pct)*1%), var(--color-bg-tertiary) 0);
  display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
  &::after { content:''; position:absolute; inset:12px; background:var(--color-bg); border-radius:50%; }
  span { position:relative; z-index:1; }
}
.score-num { font-size: 36px; font-weight: var(--font-weight-bold); color: var(--color-text); }
.score-label { font-size: var(--font-size-xs); color: var(--color-text-secondary); }

// Dims
.dims { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.dim { display: flex; align-items: center; gap: var(--space-3); }
.dim-bar-wrap { flex: 1; height: 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
.dim-bar { height: 100%; border-radius: var(--radius-full); transition: width .6s var(--ease-out-expo); }
.dim-label { font-size: var(--font-size-sm); color: var(--color-text); width: 40px; }
.dim-val { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); width: 30px; text-align: right; }

// Card
.card { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
.card-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: var(--space-4); }
.radar-canvas { width: 100%; max-width: 300px; display: block; margin: 0 auto; }

// Recs
.recs { display: flex; flex-direction: column; gap: var(--space-3); }
.section-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); }
.rec-card { display: flex; gap: var(--space-3); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); align-items: flex-start; }
// .pri-high { border-left: 3px solid var(--color-danger); }
// .pri-medium { border-left: 3px solid var(--color-warning); }
// .pri-low { border-left: 3px solid var(--color-accent); }
.rec-icon { font-size: 20px; flex-shrink: 0; }
.rec-title { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); }
.rec-desc { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }

// Timeline
.tl-item { display: flex; gap: var(--space-3); padding: var(--space-3) 0;
  &:not(:last-child) { border-bottom: 1px solid var(--color-separator); }
  &:last-child { padding-bottom: 0; }
}
.tl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-border); margin-top: 4px; flex-shrink: 0;
  &.done { background: var(--color-success); }
}
.tl-title { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text); }
.tl-date { display: block; font-size: var(--font-size-xs); color: var(--color-text-tertiary); }
.tl-desc { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }
</style>
