<template>
  <div class="portrait container-md">
    <!-- 健康档案设置浮窗 -->
    <HealthSetupModal :show="showHealthSetupModal" :force-complete="true" @close="handleHealthSetupClose"
      @success="handleHealthSetupSuccess" />

    <div class="content-area" v-if="!showHealthSetupModal">
      <!-- 左右布局 -->
      <div class="portrait-main">
        <!-- 左块：评分和维度分析 -->
        <div class="portrait-left-block">
          <PortraitLeftContent :portrait-data="portraitData" :is-refreshing="isRefreshing"
            @refresh="handleRefreshClick" />
        </div>

        <!-- 右块：指标、建议、历程 -->
        <div class="portrait-right-block">
          <PortraitRightContent :portrait-data="portraitData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
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


onMounted(() => {
  initPortrait()
})
</script>

<style lang="scss" scoped src="@/scss/views/PortraitView.scss"></style>
