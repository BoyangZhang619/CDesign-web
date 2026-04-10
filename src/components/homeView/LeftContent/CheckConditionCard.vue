<template>
  <section class="check-condition-card">
    <div class="card-layout">
      <!-- 左侧用户头像和信息 -->
      <div class="card-left">
        <div class="card-info">
          <h3 class="card-title">设置今日状态</h3>
          <p class="card-subtitle">更新今天的状态吧！</p>
          <button class="check-btn">开始填写</button>
        </div>
      </div>
      <!-- 右侧背景蓝色区域 -->
      <div class="card-right"></div>
    </div>
  </section>
  <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />
</template>

<script setup lang="ts">
import HealthSetupModal from '../../HealthSetupModal.vue';
import { useTrendsView } from '../../../composables/useTrendsView'
const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess } = useTrendsView()

</script>

<style scoped>
.check-condition-card {
  /* background: linear-gradient(135deg, #FEFCFA 0%, #F8F6F3 100%); */
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-layout {
  display: flex;
  align-items: stretch;
  height: 200px;
  min-width: 0;
}

.card-left {
  flex: 1 1 auto;
  min-width: 240px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, #fefcfa94 0%, #f8f6f3b4 100%);
}

.user-avatar {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* .card-info>* {
  text-align: center;
  margin: 0 auto;
} */

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.check-btn {
  background: linear-gradient(135deg, #9DB4A0 0%, #7FA08F 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  width: fit-content;
}

.check-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-right {
  flex: 0 1 200px;
  min-width: 80px;
  background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
  position: relative;
}
</style>
