<template>
  <div class="trends container-md">
    <!-- Date range picker -->
    <div class="date-picker">
      <button v-for="p in presets" :key="p.days" class="preset-btn"
        @click="applyPreset(p.days)">{{ p.label }}</button>
      <div class="date-inputs">
        <input type="date" v-model="startDate" class="date-input" />
        <span class="date-sep">→</span>
        <input type="date" v-model="endDate" class="date-input" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box"><div class="spinner"></div><p>加载中...</p></div>

    <!-- Error -->
    <div v-else-if="error" class="state-box state-error">
      <p>{{ error }}</p>
      <button @click="loadTrendsData()">重试</button>
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <div class="overview">
        <div class="stat-card">
          <span class="stat-num">{{ stats.avgExercise.toFixed(0) }}</span>
          <span class="stat-label">运动(分/天)</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ stats.avgMealCalories.toFixed(0) }}</span>
          <span class="stat-label">饮食(千卡/天)</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ stats.avgSleep.toFixed(1) }}</span>
          <span class="stat-label">睡眠(时/天)</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ stats.healthScore.toFixed(0) }}</span>
          <span class="stat-label">健康评分</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>运动趋势</h3>
          <div class="chart-wrap"><canvas ref="exerciseChart"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>饮食趋势</h3>
          <div class="chart-wrap"><canvas ref="mealChart"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>睡眠趋势</h3>
          <div class="chart-wrap"><canvas ref="sleepChart"></canvas></div>
        </div>
      </div>

      <!-- Habits -->
      <div v-if="habits.length" class="habits-section">
        <h3 class="section-title">习惯养成</h3>
        <div v-for="h in habits" :key="h.id" class="habit-row">
          <div class="habit-info">
            <span class="habit-title">{{ h.title }}</span>
            <span class="habit-desc">{{ h.description }}</span>
          </div>
          <div class="habit-bar-wrap">
            <div class="habit-bar" :style="{ width: h.progress + '%' }"></div>
          </div>
          <span class="habit-days">{{ h.days }}/{{ h.target }}天</span>
        </div>
      </div>

      <!-- Comparison -->
      <div v-if="comparison.exerciseTrend !== 0 || comparison.sleepTrend !== 0" class="comparison">
        <h3 class="section-title">环比变化</h3>
        <div class="comp-row">
          <span>运动频率</span>
          <span :class="comparison.exerciseTrend >= 0 ? 'up' : 'down'">
            {{ comparison.exerciseTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(comparison.exerciseTrend) }}%
          </span>
        </div>
        <div class="comp-row">
          <span>睡眠质量</span>
          <span :class="comparison.sleepTrend >= 0 ? 'up' : 'down'">
            {{ comparison.sleepTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(comparison.sleepTrend) }}%
          </span>
        </div>
        <div class="comp-row">
          <span>饮食均衡</span>
          <span :class="comparison.mealTrend >= 0 ? 'up' : 'down'">
            {{ comparison.mealTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(comparison.mealTrend) }}%
          </span>
        </div>
      </div>
    </template>

    <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useTrendsView } from '../composables/useTrendsView'

const {
  loading, error, showHealthSetupModal,
  startDate, endDate, presets, applyPreset,
  exerciseChart, mealChart, sleepChart,
  stats, habits, comparison,
  handleHealthSetupClose, handleHealthSetupSuccess,
  loadTrendsData, initTrends,
} = useTrendsView()
void exerciseChart; void mealChart; void sleepChart

onMounted(() => initTrends())
</script>

<style lang="scss" scoped>
.trends { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

// Date picker
.date-picker {
  display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center;
}
.preset-btn {
  padding: var(--space-1) var(--space-3); font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); background: var(--color-bg); color: var(--color-text-secondary);
  cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--color-accent); color: var(--color-accent); }
}
.date-inputs { display: flex; align-items: center; gap: var(--space-1); margin-left: auto; }
.date-input {
  padding: var(--space-1) var(--space-2); font-size: var(--font-size-xs);
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: var(--color-bg); color: var(--color-text);
  width: auto;
  &:focus { border-color: var(--color-accent); }
}
.date-sep { color: var(--color-text-tertiary); font-size: var(--font-size-sm); }

// States
.state-box { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
  button { padding: var(--space-2) var(--space-4); background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; }
}
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-error p { color: var(--color-danger); }

// Overview
.overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); }
.stat-card {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-4); text-align: center;
  display: flex; flex-direction: column; gap: var(--space-1);
}
.stat-num { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text); }
.stat-label { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
@media (max-width: 480px) { .overview { grid-template-columns: repeat(2, 1fr); } }

// Charts
.charts-section { display: flex; flex-direction: column; gap: var(--space-4); }
.chart-card {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-4);
  h3 { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: var(--space-3); }
}
.chart-wrap { overflow-x: auto;
  canvas { max-width: 100%; height: auto; }
}

// Habits
.habits-section { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
.section-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: var(--space-4); }
.habit-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);
  &:last-child { margin-bottom: 0; }
}
.habit-info { flex: 1; min-width: 0; }
.habit-title { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text); }
.habit-desc { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }
.habit-bar-wrap { flex: 2; height: 8px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
.habit-bar { height: 100%; background: var(--color-accent); border-radius: var(--radius-full); transition: width .5s var(--ease-out-expo); }
.habit-days { font-size: var(--font-size-xs); color: var(--color-text-secondary); white-space: nowrap; }

// Comparison
.comparison { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
.comp-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-text);
  &:not(:last-child) { border-bottom: 1px solid var(--color-separator); }
  .up { color: var(--color-success); font-weight: var(--font-weight-semibold); }
  .down { color: var(--color-danger); font-weight: var(--font-weight-semibold); }
}
</style>
