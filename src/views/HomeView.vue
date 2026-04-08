<template>
  <div class="home-layout">
    <Sidebar ref="sidebarRef" />
    <div class="main-content">
      <TopHeader @toggle-sidebar="toggleSidebar" />
      <div class="content-area">
        <LeftContent />
        <RightContent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import TopHeader from '../components/TopHeader.vue'
import LeftContent from '../components/LeftContent.vue'
import RightContent from '../components/RightContent.vue'

const sidebarRef = ref<InstanceType<typeof Sidebar>>()

// 用于手机端切换侧栏
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebarFromHeader()
}
</script>

<style scoped>
.home-layout {
  margin: 0 auto;
  display: flex;
  height: calc(100vh - 10px);
  background: linear-gradient(135deg, #D4C4B0 0%, #E8DDD0 100%);
  border: 5px solid #5A7A87;
  border-radius: 20px;
  overflow: hidden;
  border-radius: 20px;
  box-sizing: content-box;
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
    height: 100vh;
  }

  .content-area {
    flex-direction: column;
    padding: 15px 20px;
    gap: 15px;
  }
}
</style>
