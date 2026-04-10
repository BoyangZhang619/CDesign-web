<template>
  <div class="portrait-layout">
    <!-- 侧栏 -->
    <Sidebar ref="sidebarRef" />

    <!-- 健康档案设置浮窗（必须完成） -->
    <HealthSetupModal
      :show="showHealthSetupModal"
      :force-complete="true"
      @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess"
    />

    <div class="main-content">
      <!-- 头部 -->
      <TopHeader @toggle-sidebar="toggleSidebar" :title="'健康画像'" :subtitle="'基于您的健康数据构建的个性化健康模型'" />

      <!-- 内容区 -->
      <div class="content-area" v-if="!showHealthSetupModal">
        <!-- 页面标题 -->
        <!-- <section class="portrait-header">
          <div class="header-content">
            <h1 class="page-title">健康画像</h1>
            <p class="page-subtitle">基于您的健康数据构建的个性化健康模型</p>
          </div>
        </section> -->

        <!-- 左右布局 -->
        <div class="portrait-main">
          <!-- 左块：评分和维度分析 -->
          <div class="portrait-left-block">
            <PortraitLeftContent 
              :portrait-data="portraitData" 
              :is-refreshing="isRefreshing"
              @refresh="handleRefreshClick"
            />
          </div>

          <!-- 右块：指标、建议、历程 -->
          <div class="portrait-right-block">
            <PortraitRightContent 
              :portrait-data="portraitData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/homeView/Sidebar.vue'
import TopHeader from '../components/homeView/TopHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import PortraitLeftContent from '../components/portraitView/PortraitLeftContent.vue'
import PortraitRightContent from '../components/portraitView/PortraitRightContent.vue'
import { usePortraitView } from '../composables/usePortraitView'
import { onMounted } from 'vue'

const {
  showHealthSetupModal,
  isRefreshing,
  portraitData,
  handleHealthSetupClose,
  handleHealthSetupSuccess,
  handleRefreshClick,
  initPortrait
} = usePortraitView()

const sidebarRef = ref()

onMounted(() => {
  initPortrait()
})

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}
</script>

<style scoped>
@import '@/css/PortraitView.css';
</style>
