<template>
  <div class="trends-layout">
    <!-- Sidebar -->
    <Sidebar :active="'trends'" />

    <!-- Main Content -->
    <div class="trends-main">
      <!-- Top Header -->
      <TopHeader title="趋势分析" :showToggle="true" @toggle="isControlPanelOpen = !isControlPanelOpen" />

      <!-- Control Panel -->
      <TrendsControlPanel
        v-show="isControlPanelOpen"
        :selectedRange="selectedRange"
        :dateRanges="dateRanges"
        @select="selectRange"
      />

      <!-- Content Area -->
      <div class="trends-content">
        <!-- Loading State -->
        <div v-if="loading" class="trends-loading">
          加载数据中...
        </div>

        <!-- Overview Cards -->
        <template v-else>
          <TrendsOverviewCards :stats="stats" />
          <TrendsCharts :chartData="chartData" />
          <TrendsHabits :habits="habits" />
          <TrendsComparison :comparison="comparison" />
        </template>
      </div>
    </div>

    <!-- Health Setup Modal -->
    <HealthSetupModal
      :show="showHealthSetupModal"
      @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import TrendsControlPanel from '../components/trendsView/TrendsControlPanel.vue'
import TrendsOverviewCards from '../components/trendsView/TrendsOverviewCards.vue'
import TrendsCharts from '../components/trendsView/TrendsCharts.vue'
import TrendsHabits from '../components/trendsView/TrendsHabits.vue'
import TrendsComparison from '../components/trendsView/TrendsComparison.vue'
import { useAuthForm } from '../composables/useAuthForm'
import { useTrendsView } from '../composables/useTrendsView'

const { checkHealthInfoNeeded } = useAuthForm()
const {
  loading,
  selectedRange,
  isControlPanelOpen,
  showHealthSetupModal,
  chartData,
  dateRanges,
  stats,
  habits,
  comparison,
  handleHealthSetupClose,
  handleHealthSetupSuccess,
  selectRange,
  initTrends,
  setupRangeWatch
} = useTrendsView()

onMounted(async () => {
  try {
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      showHealthSetupModal.value = true
      return
    }

    await initTrends()
    setupRangeWatch()
  } catch (err) {
    console.error('页面初始化错误:', err)
  }
})
</script>

<style scoped>
@import '@/css/TrendsView.css';
</style>
