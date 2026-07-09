<template>
  <div class="home container-md">
    <!-- Hero greeting -->
    <div class="hero">
      <h1 class="hero-title display-text">Have a nice day</h1>
      <p class="hero-sub">{{ dateStr }}</p>
    </div>

    <!-- Dashboard grid -->
    <div class="dashboard">
      <!-- Health score -->
      <div class="dash-card card-blue">
        <span class="dash-label">健康评分</span>
        <span class="dash-num display-text">{{ portraitData?.healthScore || '--' }}</span>
        <span class="dash-hint">/ 100</span>
      </div>

      <!-- Sleep -->
      <div class="dash-card card-pink">
        <span class="dash-label">睡眠质量</span>
        <span class="dash-num display-text">{{ portraitData?.sleepScore || '--' }}</span>
      </div>

      <!-- Exercise -->
      <div class="dash-card card-yellow">
        <span class="dash-label">运动表现</span>
        <span class="dash-num display-text">{{ portraitData?.exerciseScore || '--' }}</span>
      </div>

      <!-- Meal -->
      <div class="dash-card card-green">
        <span class="dash-label">饮食均衡</span>
        <span class="dash-num display-text">{{ portraitData?.mealScore || '--' }}</span>
      </div>

      <!-- Quick actions -->
      <router-link to="/checkin" class="dash-card card-blue" style="grid-column: span 2;">
        <span class="dash-label">今日打卡</span>
        <span class="dash-action">开始记录 →</span>
      </router-link>
    </div>

    <!-- Quick pills -->
    <div class="pills">
      <router-link v-for="a in actions" :key="a.to" :to="a.to" class="pill">{{ a.label }}</router-link>
    </div>

    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTrendsView } from '../composables/useTrendsView'
import { useHealthInfoCheck } from '../composables/useHealthInfoCheck'
import { usePortraitView } from '../composables/usePortraitView'
import HealthSetupModal from '../components/HealthSetupModal.vue'

const { portraitData, initPortrait } = usePortraitView()
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()
const { checkAndFetchHealthInfo } = useHealthInfoCheck()

const now = new Date()
const dateStr = computed(() =>
  now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)

const actions = [
  { label: 'AI 对话', to: '/ai-chat' },
  { label: '健康画像', to: '/analysis/portrait' },
  { label: '趋势分析', to: '/analysis/trends' },
  { label: 'TodoList', to: '/todolist' },
  { label: '历史记录', to: '/history' },
]

onMounted(async () => { await checkAndFetchHealthInfo(); initPortrait() })
</script>

<style lang="scss" scoped>
.home { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }

// Hero
.hero { padding: var(--space-4) 0; }
.hero-title { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--text-primary); margin-bottom: var(--space-1); }
.hero-sub { font-size: var(--font-size-sm); color: var(--text-secondary); }

// Dashboard grid
.dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.dash-card {
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex; flex-direction: column; gap: var(--space-2);
  text-decoration: none; transition: transform var(--transition-fast);
  &:active { transform: scale(.98); }
}
.dash-label { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
.dash-num { font-size: var(--font-size-3xl); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.dash-hint { font-size: var(--font-size-xs); color: var(--text-secondary); }
.dash-action { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--brand-blue); margin-top: auto; }

// Color cards
.card-blue   { background: var(--bg-blue-light); }
.card-yellow { background: var(--bg-yellow-light); }
.card-pink   { background: var(--bg-pink-light); }
.card-green  { background: var(--bg-green-light); }

// Pills
.pills { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.pill {
  padding: var(--space-2) var(--space-5);
  font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full); background: var(--bg-card-white);
  color: var(--text-primary); text-decoration: none;
  border: 1px solid var(--color-border); transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
  &.active { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }
}
</style>
