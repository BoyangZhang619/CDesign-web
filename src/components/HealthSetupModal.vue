<template>
  <div v-if="showModal" class="health-setup-modal-overlay">
    <div class="health-setup-modal">
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h1 class="modal-title">健康档案设置</h1>
        <p class="modal-subtitle">完成基础信息，为您提供个性化健康建议</p>
        
        <!-- 进度条 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">第 {{ currentStep }}/{{ totalSteps }} 步</p>
        </div>
      </div>

      <!-- 模态框内容 -->
      <div class="modal-body">
        <form @submit.prevent="handleNext" class="health-form">
          <!-- 步骤 1: 基本信息 - 性别 -->
          <section v-if="currentStep === 1" class="form-step">
            <div class="step-header">
              <h3 class="step-title">01 基本信息</h3>
              <p class="step-subtitle">身体数据是个性化建议的基础</p>
            </div>
            <div class="form-field">
              <label class="form-label">性别</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input v-model="healthInfo.gender" type="radio" value="male" class="radio-input" />
                  <span class="radio-text">男</span>
                </label>
                <label class="radio-option">
                  <input v-model="healthInfo.gender" type="radio" value="female" class="radio-input" />
                  <span class="radio-text">女</span>
                </label>
                <label class="radio-option">
                  <input v-model="healthInfo.gender" type="radio" value="other" class="radio-input" />
                  <span class="radio-text">其他</span>
                </label>
              </div>
            </div>
          </section>

          <!-- 步骤 2: 生日 -->
          <section v-if="currentStep === 2" class="form-step">
            <div class="step-header">
              <h3 class="step-title">01 基本信息</h3>
              <p class="step-subtitle">身体数据是个性化建议的基础</p>
            </div>
            <div class="form-field">
              <label for="birthday" class="form-label">生日</label>
              <input id="birthday" v-model="healthInfo.birthday" type="date" class="form-input" />
            </div>
          </section>

          <!-- 步骤 3: 身高 -->
          <section v-if="currentStep === 3" class="form-step">
            <div class="step-header">
              <h3 class="step-title">01 基本信息</h3>
              <p class="step-subtitle">身体数据是个性化建议的基础</p>
            </div>
            <div class="form-field">
              <label for="height" class="form-label">身高 (cm)</label>
              <input id="height" v-model.number="healthInfo.height" type="number" class="form-input" placeholder="170"
                min="100" max="250" />
            </div>
          </section>

          <!-- 步骤 4: 当前体重 -->
          <section v-if="currentStep === 4" class="form-step">
            <div class="step-header">
              <h3 class="step-title">01 基本信息</h3>
              <p class="step-subtitle">身体数据是个性化建议的基础</p>
            </div>
            <div class="form-field">
              <label for="currentWeight" class="form-label">当前体重 (kg)</label>
              <input id="currentWeight" v-model.number="healthInfo.currentWeight" type="number" class="form-input"
                placeholder="70" min="30" max="300" step="0.1" />
            </div>
          </section>

          <!-- 步骤 5: 目标体重 -->
          <section v-if="currentStep === 5" class="form-step">
            <div class="step-header">
              <h3 class="step-title">01 基本信息</h3>
              <p class="step-subtitle">身体数据是个性化建议的基础</p>
            </div>
            <div class="form-field">
              <label for="targetWeight" class="form-label">目标体重 (kg)</label>
              <input id="targetWeight" v-model.number="healthInfo.targetWeight" type="number" class="form-input"
                placeholder="65" min="30" max="300" step="0.1" />
            </div>
          </section>

          <!-- 步骤 6: 饮食偏好 -->
          <section v-if="currentStep === 6" class="form-step">
            <div class="step-header">
              <h3 class="step-title">02 饮食与目标</h3>
              <p class="step-subtitle">帮助我们更好地了解您的需求</p>
            </div>
            <div class="form-field full-width">
              <label class="form-label">饮食偏好</label>
              <div class="checkbox-group">
                <label class="checkbox-option" v-for="diet in dietOptions" :key="diet">
                  <input v-model="healthInfo.dietPreferences" type="checkbox" :value="diet" class="checkbox-input" />
                  <span class="checkbox-text">{{ diet }}</span>
                </label>
                <label class="checkbox-option">
                  <input v-model="healthInfo.dietOther" type="checkbox" :value="true" class="checkbox-input" />
                  <span class="checkbox-text">其他</span>
                </label>
              </div>
              <input v-if="healthInfo.dietOther" v-model="healthInfo.dietOtherText" type="text" class="form-input"
                placeholder="请说明其他饮食偏好" style="margin-top: 12px" />
            </div>
          </section>

          <!-- 步骤 7: 健康目标 -->
          <section v-if="currentStep === 7" class="form-step">
            <div class="step-header">
              <h3 class="step-title">02 饮食与目标</h3>
              <p class="step-subtitle">帮助我们更好地了解您的需求</p>
            </div>
            <div class="form-field full-width">
              <label class="form-label">健康目标</label>
              <div class="checkbox-group">
                <label class="checkbox-option" v-for="goal in goalOptions" :key="goal">
                  <input v-model="healthInfo.healthGoals" type="checkbox" :value="goal" class="checkbox-input" />
                  <span class="checkbox-text">{{ goal }}</span>
                </label>
                <label class="checkbox-option">
                  <input v-model="healthInfo.goalOther" type="checkbox" :value="true" class="checkbox-input" />
                  <span class="checkbox-text">其他</span>
                </label>
              </div>
              <input v-if="healthInfo.goalOther" v-model="healthInfo.goalOtherText" type="text" class="form-input"
                placeholder="请说明其他健康目标" style="margin-top: 12px" />
            </div>
          </section>

          <!-- 步骤 8: 过敏信息 -->
          <section v-if="currentStep === 8" class="form-step">
            <div class="step-header">
              <h3 class="step-title">03 生活习惯</h3>
              <p class="step-subtitle">了解您的日常生活方式</p>
            </div>
            <div class="form-field full-width">
              <label for="allergies" class="form-label">过敏信息</label>
              <textarea id="allergies" v-model="healthInfo.allergies" class="form-textarea"
                placeholder="如无过敏可留空。例如：花生、海鲜、乳制品" rows="3"></textarea>
            </div>
          </section>

          <!-- 步骤 9: 作息习惯 -->
          <section v-if="currentStep === 9" class="form-step">
            <div class="step-header">
              <h3 class="step-title">03 生活习惯</h3>
              <p class="step-subtitle">了解您的日常生活方式</p>
            </div>
            <div class="form-field">
              <label for="sleepHabit" class="form-label">作息习惯</label>
              <div class="select-wrapper">
                <select id="sleepHabit" v-model="healthInfo.sleepHabit" class="form-select">
                  <option value="" disabled>请选择</option>
                  <option value="early-bird">早睡早起（22:00前就寝）</option>
                  <option value="moderate">中等规律（23:00-24:00就寝）</option>
                  <option value="night-owl">晚睡（24:00后就寝）</option>
                  <option value="irregular">不规律</option>
                </select>
              </div>
            </div>
          </section>

          <!-- 步骤 10: 日常活动水平 -->
          <section v-if="currentStep === 10" class="form-step">
            <div class="step-header">
              <h3 class="step-title">03 生活习惯</h3>
              <p class="step-subtitle">了解您的日常生活方式</p>
            </div>
            <div class="form-field">
              <label for="activityLevel" class="form-label">日常活动水平</label>
              <div class="select-wrapper">
                <select id="activityLevel" v-model="healthInfo.activityLevel" class="form-select">
                  <option value="" disabled>请选择</option>
                  <option value="sedentary">久坐（运动很少）</option>
                  <option value="light">轻度活跃（每周1-3次运动）</option>
                  <option value="moderate">中度活跃（每周3-5次运动）</option>
                  <option value="very-active">非常活跃（每周6-7次运动）</option>
                  <option value="extremely-active">极其活跃（每日高强度运动）</option>
                </select>
              </div>
            </div>
          </section>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleSkipClick"
              :disabled="loading || props.forceComplete"
              :title="props.forceComplete ? '此页面需要完成健康档案设置' : ''"
            >
              稍后设置
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading || !isCurrentStepValid()"
            >
              {{ isLastStep ? (loading ? '保存中...' : '完成设置') : '下一步' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useHealthSetup } from '../composables/useHealthSetup'

const props = defineProps<{
  show: boolean
  forceComplete?: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const {
  loading,
  errorMsg: composableErrorMsg,
  healthInfo,
  dietOptions,
  goalOptions,
  handleSubmit,
  handleSkip
} = useHealthSetup()

const currentStep = ref(1)
const totalSteps = 10
const errorMsg = ref('')

const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100
})

const isLastStep = computed(() => {
  return currentStep.value === totalSteps
})

const showModal = computed(() => {
  return props.show
})

// 监听外部 errorMsg 变化
watch(composableErrorMsg, (newVal) => {
  errorMsg.value = newVal
})

function isCurrentStepValid(): boolean {
  switch (currentStep.value) {
    case 1:
      return !!healthInfo.gender
    case 2:
      return !!healthInfo.birthday
    case 3:
      return !!healthInfo.height
    case 4:
      return !!healthInfo.currentWeight
    case 5:
      return !!healthInfo.targetWeight
    case 6:
      return healthInfo.dietPreferences.length > 0 || !healthInfo.dietOther
    case 7:
      return healthInfo.healthGoals.length > 0 || !healthInfo.goalOther
    case 8:
      return true // 过敏信息可选
    case 9:
      return !!healthInfo.sleepHabit
    case 10:
      return !!healthInfo.activityLevel
    default:
      return false
  }
}

async function handleNext() {
  errorMsg.value = ''

  if (!isCurrentStepValid()) {
    errorMsg.value = '请完成当前步骤'
    return
  }

  if (isLastStep.value) {
    // 最后一步，执行提交
    try {
      await handleSubmit()
      emit('success')
    } catch (error: any) {
      errorMsg.value = error.message || '保存失败，请重试'
    }
  } else {
    // 移到下一步
    currentStep.value++
  }
}

function handleSkipClick() {
  currentStep.value = 1
  errorMsg.value = ''
  handleSkip()
  emit('close')
}
</script>

<style scoped>
@import '@/css/HealthSetupModal.css';
</style>
