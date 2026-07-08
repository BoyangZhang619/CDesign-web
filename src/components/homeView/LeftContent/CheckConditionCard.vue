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
  <HealthSetupModal :show="showHealthSetupModal" @close="handleHealthSetupClose" @success="success" />
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


const emit = defineEmits<{
  reload: []
}>()

const success = () => {
  handleHealthSetupSuccess()
  emit('reload')
}
</script>

<style lang="scss" scoped src="@/scss/components/homeView/LeftContent/CheckConditionCard.scss"></style>
