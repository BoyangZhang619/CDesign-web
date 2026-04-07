<template>
  <div class="home-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader />
      <div class="content-area">
        <LeftContent />
        <RightContent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
import TopHeader from '../components/TopHeader.vue'
import LeftContent from '../components/LeftContent.vue'
import RightContent from '../components/RightContent.vue'
</script>

<style scoped>
.home-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 100px;
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
</style>
