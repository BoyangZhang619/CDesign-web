<template>
  <div class="right-content">
    <CheckConditionCard :visible="!hasData" @reload="fetchHealthData" v-if="!isMobile" />
    <!-- 健康评分卡 -->
    <PortraitScoreCard 
      :health-score="portraitData.healthScore"
      :exercise-score="portraitData.exerciseScore"
      :meal-score="portraitData.mealScore"
      :sleep-score="portraitData.sleepScore"
      :is-refreshing="isRefreshing"
      @refresh="$emit('refresh')"
    />
    <!-- <AppointmentsSection /> -->
    <DailyProgress />
  </div>
</template>

<script setup lang="ts">
// import AppointmentsSection from './RightContent/AppointmentsSection.vue'
import DailyProgress from './RightContent/DailyProgress.vue'
import PortraitScoreCard from '../portraitView/PortraitScoreCard.vue'
import CheckConditionCard from './LeftContent/CheckConditionCard.vue'
import { computed } from 'vue'
import { type HealthData } from '../../composables/useHealthData'
import { getCurrentDateTime } from '@/utils/dateTime'

interface Props {
  healthData?: HealthData
  portraitData: any // 或者定义一个具体的接口
  isRefreshing?: boolean
}

// 2. 如果需要默认值，使用 withDefaults
const props = withDefaults(defineProps<Props>(), {
  isRefreshing: false
})


// 判断是否有完整数据
const hasData = computed(() => {
  console.log('Checking data completeness:', getCurrentDateTime().split('T')[0], props.healthData?.lastUpdated, props.healthData)
  return !!(
    (props.healthData?.lastUpdated?.split(' ')[0] == getCurrentDateTime().split('T')[0]) &&
    (props.healthData?.gender ||
      props.healthData?.birthday ||
      props.healthData?.height ||
      props.healthData?.currentWeight ||
      props.healthData?.targetWeight
    ))
})

const fetchHealthData = () => {
  emit('reload')
}

// 3. 将所有 Emits 合并在一起定义，且只调用一次
const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'reload'): void
}>()

const isMobile = computed(() => {
  return navigator.userAgent.includes('Mobile')
})

</script>

<style lang="scss" scoped src="@/scss/components/homeView/RightContent.scss"></style>
