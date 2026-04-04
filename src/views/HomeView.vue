<template>
  <div class="page">
    <AppHeader />

    <!-- 健康档案设置浮窗 -->
    <HealthSetupModal 
      :show="showHealthSetupModal" 
      @close="handleHealthSetupClose" 
      @success="handleHealthSetupSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import HealthSetupModal from '../components/HealthSetupModal.vue'
import { useHomePageLogic } from '../composables/useHomePageLogic'
import { useAuthForm } from '../composables/useAuthForm'

const {
  loadAllData,
  refreshTimeData
} = useHomePageLogic()

const { checkHealthInfoNeeded } = useAuthForm()

const showHealthSetupModal = ref(false)

// 初始化
onMounted(async () => {
  loadAllData()
  
  // 检查是否需要完成健康档案设置
  try {
    const needsHealthInfo = await checkHealthInfoNeeded()
    if (needsHealthInfo) {
      showHealthSetupModal.value = true
    }
  } catch (error) {
    console.error('检查健康档案状态失败:', error)
  }
  
  // 每分钟更新一次时间和日期
  const timer = setInterval(() => {
    refreshTimeData()
  }, 60000)

  return () => clearInterval(timer)
})

function handleHealthSetupClose() {
  showHealthSetupModal.value = false
}

function handleHealthSetupSuccess() {
  showHealthSetupModal.value = false
  // 可选：重新加载数据或显示成功消息
  console.log('健康档案设置完成！')
}
</script>

<style scoped>
@import '@/css/HomeView.css';
</style>
