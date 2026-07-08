<template>
  <div class="checkin container-md">
    <!-- Tab Bar -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ 'tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- 日常 -->
      <div v-if="activeTab === 'daily'" class="daily-section">
        <DailyLeftPanel
          :selected-date="selectedDate"
          :completed-count="completedCount"
          :total-count="totalCount"
          :exercise-status="exerciseStatus"
          :exercise-data="exerciseData"
          :meal-status="mealStatus"
          :meal-data="mealData"
          :meal-records="mealRecords"
          :sleep-status="sleepStatus"
          :sleep-data="sleepData"
          :sleep-records="sleepRecords"
          :ai-summary="aiSummary"
          :ai-loading="aiLoading"
          :ai-error="aiError"
          @date-change="handleDateChange"
          @today="selectToday"
          @refresh="refreshAllData"
          @retry-ai-summary="retryAISummary"
        />
        <DailyRightPanel
          :exercise-status="exerciseStatus"
          :exercise-data="exerciseData"
          :meal-status="mealStatus"
          :meal-data="mealData"
          :meal-records="mealRecords"
          :sleep-status="sleepStatus"
          :sleep-data="sleepData"
          :sleep-records="sleepRecords"
          @exercise-refresh="handleExerciseRefresh"
          @meal-refresh="handleMealRefresh"
          @sleep-refresh="handleSleepRefresh"
        />
      </div>

      <!-- 饮食 -->
      <div v-if="activeTab === 'meal'" class="tab-placeholder">
        <MealCheckinSection />
      </div>

      <!-- 运动 -->
      <div v-if="activeTab === 'exercise'" class="tab-placeholder">
        <ExerciseCheckinSection />
      </div>

      <!-- 睡眠 -->
      <div v-if="activeTab === 'sleep'" class="tab-placeholder">
        <SleepCheckinSection />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DailyLeftPanel from '../components/dailyCheckinView/DailyLeftPanel.vue'
import DailyRightPanel from '../components/dailyCheckinView/DailyRightPanel.vue'
import MealCheckinSection from '../components/mealCheckinView/MealCheckinSection.vue'
import ExerciseCheckinSection from '../components/exerciseCheckinView/ExerciseCheckinSection.vue'
import SleepCheckinSection from '../components/sleepCheckinView/SleepCheckinSection.vue'
import { useDailyCheckin } from '../composables/useDailyCheckin'

const activeTab = ref<'daily' | 'meal' | 'exercise' | 'sleep'>('daily')

const tabs = [
  {
    id: 'daily' as const,
    label: '日常',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
  {
    id: 'meal' as const,
    label: '饮食',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  },
  {
    id: 'exercise' as const,
    label: '运动',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`,
  },
  {
    id: 'sleep' as const,
    label: '睡眠',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  },
]

// Daily checkin composable (existing logic)
const {
  selectedDate,
  completedCount,
  totalCount,
  exerciseStatus,
  exerciseData,
  mealStatus,
  mealData,
  mealRecords,
  sleepStatus,
  sleepData,
  sleepRecords,
  aiSummary,
  aiLoading,
  aiError,
  handleDateChange,
  selectToday,
  refreshAllData,
  retryAISummary,
  handleExerciseRefresh,
  handleMealRefresh,
  handleSleepRefresh,
} = useDailyCheckin()
</script>

<style lang="scss" scoped>
.checkin {
  padding: var(--space-4);
}

// ── Tab Bar ─────────────────────────────────────────────────
.tabs {
  display: flex;
  gap: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover { color: var(--color-text); }
}

.tab--active {
  color: var(--color-accent);
  background: var(--color-accent-light);
  font-weight: var(--font-weight-semibold);
}

.tab-icon { display: flex; }

.tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
