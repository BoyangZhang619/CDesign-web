<template>
  <div class="home container-md">
    <!-- Greeting Card -->
    <div class="card card-greeting">
      <div class="greeting-text">
        <h2 class="greeting-title">{{ greeting }}</h2>
        <p class="greeting-sub">{{ dateStr }}</p>
      </div>
      <div class="greeting-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="quick-actions">
      <router-link v-for="action in quickActions" :key="action.label" :to="action.to"
        class="action-card" :style="{ '--accent': action.color }">
        <span class="action-icon" v-html="action.icon"></span>
        <span class="action-label">{{ action.label }}</span>
      </router-link>
    </div>

    <!-- Portrait Summary Card -->
    <div v-if="portraitData" class="card">
      <div class="card-header">
        <h3 class="card-title">健康概览</h3>
        <router-link to="/analysis/portrait" class="card-link">查看画像 →</router-link>
      </div>
      <div class="stat-row">
        <div class="stat" v-for="s in healthStats" :key="s.label">
          <span class="stat-value" :style="{ color: s.color }">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Health Setup Modal trigger if needed -->
    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess" />
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

// Greeting based on time
const greeting = computed(() => {
  const h = now.getHours()
  if (h < 12) return '早上好 ☀️'
  if (h < 18) return '下午好 🌤'
  return '晚上好 🌙'
})

const dateStr = computed(() =>
  now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)

// Quick actions grid
const quickActions = [
  {
    label: '打卡',
    to: '/checkin',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    color: '#0095F6',
  },
  {
    label: 'AI 对话',
    to: '/ai-chat',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>`,
    color: '#833AB4',
  },
  {
    label: '健康画像',
    to: '/analysis/portrait',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
    color: '#F58529',
  },
  {
    label: '趋势',
    to: '/analysis/trends',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    color: '#78C850',
  },
]

// Health stats from portrait data
const healthStats = computed(() => [
  { label: '运动', value: portraitData.value?.exerciseScore ?? '--', color: '#F58529' },
  { label: '饮食', value: portraitData.value?.mealScore ?? '--', color: '#78C850' },
  { label: '睡眠', value: portraitData.value?.sleepScore ?? '--', color: '#833AB4' },
])

onMounted(async () => {
  await checkAndFetchHealthInfo()
  initPortrait()
})
</script>

<style lang="scss" scoped>
.home {
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

// ── Greeting Card ───────────────────────────────────────────
.card-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.greeting-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.greeting-sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.greeting-icon {
  color: var(--color-accent);
  opacity: 0.6;
}

// ── Quick Actions ───────────────────────────────────────────
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  transition: all var(--transition-fast);

  &:hover { background: var(--color-bg-secondary); }
  &:active { transform: scale(0.97); }
}

.action-icon {
  color: var(--accent, var(--color-accent));
}

.action-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

@media (max-width: 480px) {
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }
  .action-card { padding: var(--space-3) var(--space-1); }
}

// ── Card ────────────────────────────────────────────────────
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.card-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);

  &:hover { color: var(--color-accent-hover); }
}

// ── Stat Row ────────────────────────────────────────────────
.stat-row {
  display: flex;
  justify-content: space-around;
  gap: var(--space-4);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
