<template>
  <section v-if="visible" class="check-condition-card">
    <div class="card-layout">
      <!-- 左侧内容 -->
      <div class="card-left">
        <div class="card-content">
          <h3 class="card-title">📋 完成今日状态</h3>
          <p class="card-subtitle">更新你的健康信息，获得个性化建议</p>
          <button class="check-btn" @click="triggerHealthSetup">立即填写</button>
        </div>
      </div>
      <!-- 右侧装饰 -->
      <div class="card-right"></div>
    </div>
  </section>
  <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="handleHealthSetupSuccess" />
</template>

<script setup lang="ts">
import HealthSetupModal from '../../HealthSetupModal.vue'
import { useTrendsView } from '../../../composables/useTrendsView'

interface Props {
  visible?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: true
})

const { showHealthSetupModal, handleHealthSetupClose, handleHealthSetupSuccess, triggerHealthSetup } = useTrendsView()
</script>

<style scoped>
.check-condition-card {
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-layout {
  display: flex;
  align-items: stretch;
  height: 160px;
  min-width: 0;
}

.card-left {
  flex: 1 1 auto;
  min-width: 220px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #fefcfa94 0%, #f8f6f3b4 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.card-subtitle {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.check-btn {
  background: linear-gradient(135deg, #9DB4A0 0%, #7FA08F 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.check-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.check-btn:active {
  transform: translateY(0);
}

.card-right {
  flex: 0 1 140px;
  min-width: 80px;
  background: linear-gradient(135deg, #5A7A87 0%, #7A8F95 100%);
  position: relative;
  display: none;
}

/* 小屏幕隐藏右侧装饰 */
@media (max-width: 768px) {
  .card-layout {
    height: 140px;
  }

  .card-left {
    padding: 20px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-subtitle {
    font-size: 11px;
  }
}
</style>
