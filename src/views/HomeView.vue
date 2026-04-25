<template>
  <div class="home-layout">
    <Sidebar ref="sidebarRef" />
    <div class="main-content">
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'首页'" :subtitle="'你好喔~'" />
      <div class="content-area">
        <LeftContent 
        :health-data="healthData" 
        @reload="checkAndFetchHealthInfo"
        :portrait-data="portraitData" 
        :is-refreshing="isRefreshing"
        @refresh="handleRefreshClick" 
        />
        <RightContent
          :portrait-data="portraitData"
          :is-refreshing="isRefreshing"
          @refresh="handleRefreshClick"
        />
      </div>
    </div>

    <!-- AI 聊天浮窗已移到 App.vue 全局级别 -->

    <!-- 健康档案设置浮窗 -->
    <HealthSetupModal 
      :show="showHealthSetupModal" 
      @close="handleHealthSetupClose" 
      @success="handleHealthSetupSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import LeftContent from '../components/homeView/LeftContent.vue'
import RightContent from '../components/homeView/RightContent.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useTrendsView } from '../composables/useTrendsView'
import { useHealthInfoCheck } from '../composables/useHealthInfoCheck'
import { usePortraitView } from '../composables/usePortraitView'

const {
  isRefreshing,
  portraitData,
  handleRefreshClick,
  initPortrait
} = usePortraitView()

const sidebarRef = ref<InstanceType<typeof Sidebar>>()

const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()
const { healthData, checkAndFetchHealthInfo } = useHealthInfoCheck()

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}

onMounted(async () => {
  await checkAndFetchHealthInfo()
  initPortrait()
})
</script>

<style scoped>
.home-layout {
  margin: 0 auto;
  display: flex;
  height: calc(100dvh - 10px);
  background: none;
  border: 5px solid #5A7A87;
  border-radius: 20px;
  overflow: hidden;
  box-sizing: content-box;
  position: relative;
  width: 100vw;
}

.home-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/bg.png') center/cover no-repeat;
  background-attachment: fixed;
  filter: blur(8px);
  pointer-events: none;
  z-index: -1;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-area {
  flex: 1;
  display: flex;
  padding: 20px 30px;
  gap: 20px;
  overflow-y: auto;
}

/* 滚动条样式 */
.content-area::-webkit-scrollbar {
  width: 8px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

/* ============================================
   响应式设计 - 手机端
   ============================================ */

@media (max-width: 768px) {
  .home-layout {
    border: none;
    border-radius: 0;
    height: 100dvh;
    width: 100vw;
  }

  .content-area {
    flex-direction: column;
    padding: 15px 20px;
    gap: 15px;
  }
}
</style>
