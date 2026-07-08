<template>
  <div class="profile-right">
    <!-- 基本信息区 -->
    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">基本信息</h3>
        <button class="edit-btn" @click="$emit('edit')">
          ✏️ 编辑
        </button>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ userInfo?.email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ userInfo?.nickname || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">电话</span>
          <span class="info-value">{{ userInfo?.phone || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">角色</span>
          <span class="info-value">{{ userInfo?.role }}</span>
        </div>
      </div>
    </section>

    <!-- 个人信息区（新增） -->
    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">个人信息</h3>
        <button class="edit-btn" @click="$emit('edit')">
          ✏️ 编辑
        </button>
      </div>
      <div class="info-grid">
        <div class="info-item info-item-full">
          <span class="info-label">个人简介</span>
          <span class="info-value">{{ userInfo?.bio || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">地址</span>
          <span class="info-value">{{ userInfo?.location || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">个人网站</span>
          <span v-if="userInfo?.website" class="info-value">
            <a :href="userInfo.website" target="_blank" class="info-link">{{ userInfo.website }}</a>
          </span>
          <span v-else class="info-value">未设置</span>
        </div>
      </div>
    </section>

    <!-- 时间信息区 -->
    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">时间信息</h3>
        <button class="edit-btn" disabled>
          这个不能编辑
        </button>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">创建于</span>
          <span class="info-value">{{ formatDate(userInfo?.created_at) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">最后修改</span>
          <span class="info-value">{{ formatDate(userInfo?.updated_at) }}</span>
        </div>
        <div v-if="userInfo?.last_login_time" class="info-item">
          <span class="info-label">最后登录</span>
          <span class="info-value">{{ formatDate(userInfo.last_login_time) }}</span>
        </div>
      </div>
    </section>

    <!-- 健康档案信息区 -->
    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">健康档案</h3>
        <button
          v-if="!isHealthProfileCompleted"
          class="edit-btn setup-btn"
          @click="$emit('setup-health')"
        >
          ➕ 填写
        </button>
        <button
          v-else
          class="edit-btn"
          @click="$emit('setup-health')"
          :title="'点击更新健康档案信息'"
        >
          ✏️ 更新
        </button>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">设置状态</span>
          <span :class="['info-value', 'status-' + (isHealthProfileCompleted ? 'complete' : 'incomplete')]">
            {{ isHealthProfileCompleted ? '✓ 已完成' : '⊘ 未设置' }}
          </span>
        </div>
        <div v-if="healthProfile?.setup_date" class="info-item">
          <span class="info-label">设置于</span>
          <span class="info-value">{{ formatDate(healthProfile.setup_date) }}</span>
        </div>
      </div>

      <!-- 健康档案详细信息 - 可折叠 -->
      <div v-if="isHealthProfileCompleted" class="health-details-collapsible">
        <button
          class="collapsible-btn"
          @click="showHealthDetails = !showHealthDetails"
        >
          <span class="collapsible-icon">{{ showHealthDetails ? '▼' : '▶' }}</span>
          <span class="collapsible-text">健康档案详情</span>
        </button>
        <div v-if="showHealthDetails" class="collapsible-content">
          <div class="health-details-grid">
            <!-- 基本身体信息 -->
            <div v-if="healthProfile?.gender" class="detail-item">
              <span class="detail-label">性别</span>
              <span class="detail-value">{{ formatGender(healthProfile.gender) }}</span>
            </div>
            <div v-if="healthProfile?.birthday" class="detail-item">
              <span class="detail-label">生日</span>
              <span class="detail-value">{{ healthProfile.birthday }}</span>
            </div>
            <div v-if="healthProfile?.height_cm" class="detail-item">
              <span class="detail-label">身高</span>
              <span class="detail-value">{{ healthProfile.height_cm }} cm</span>
            </div>
            <div v-if="healthProfile?.current_weight_kg" class="detail-item">
              <span class="detail-label">当前体重</span>
              <span class="detail-value">{{ healthProfile.current_weight_kg }} kg</span>
            </div>
            <div v-if="healthProfile?.target_weight_kg" class="detail-item">
              <span class="detail-label">目标体重</span>
              <span class="detail-value">{{ healthProfile.target_weight_kg }} kg</span>
            </div>

            <!-- 生活习惯 -->
            <div v-if="healthProfile?.sleep_habit" class="detail-item">
              <span class="detail-label">作息习惯</span>
              <span class="detail-value">{{ formatSleepHabit(healthProfile.sleep_habit) }}</span>
            </div>
            <div v-if="healthProfile?.activity_level" class="detail-item">
              <span class="detail-label">活动水平</span>
              <span class="detail-value">{{ formatActivityLevel(healthProfile.activity_level) }}</span>
            </div>

            <!-- 饮食偏好 -->
            <div v-if="healthProfile?.dietary_preferences" class="detail-item detail-item-full">
              <span class="detail-label">饮食偏好</span>
              <div class="detail-tags">
                <span v-for="pref in formatArray(healthProfile.dietary_preferences)" :key="pref" class="tag">
                  {{ pref }}
                </span>
              </div>
            </div>

            <!-- 健康目标 -->
            <div v-if="healthProfile?.health_goals" class="detail-item detail-item-full">
              <span class="detail-label">健康目标</span>
              <div class="detail-tags">
                <span v-for="goal in formatArray(healthProfile.health_goals)" :key="goal" class="tag">
                  {{ goal }}
                </span>
              </div>
            </div>

            <!-- 过敏信息 -->
            <div v-if="healthProfile?.allergies" class="detail-item detail-item-full">
              <span class="detail-label">过敏信息</span>
              <span class="detail-value">{{ healthProfile.allergies }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <button class="btn btn-primary" @click="$emit('edit')">
        编辑个人资料
      </button>
      <button class="btn btn-secondary" @click="$emit('logout')">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  userInfo: any
  healthProfile: any
}>()

defineEmits<{
  edit: []
  logout: []
  'setup-health': []
}>()

const showHealthDetails = ref(false)

// 正确的健康档案检测逻辑
const isHealthProfileCompleted = computed(() => {
  // 检查 healthProfile 是否存在且 is_completed 为 true
  if (!props.healthProfile) {
    return false
  }
  return props.healthProfile.is_completed === true || props.healthProfile.is_completed === 1
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatGender = (gender: string) => {
  const genderMap: Record<string, string> = {
    'male': '男',
    'female': '女',
    'other': '其他'
  }
  return genderMap[gender] || gender
}

const formatSleepHabit = (habit: string) => {
  const habitMap: Record<string, string> = {
    'early-bird': '早睡早起（22:00前就寝）',
    'moderate': '中等规律（23:00-24:00就寝）',
    'night-owl': '晚睡（24:00后就寝）',
    'irregular': '不规律'
  }
  return habitMap[habit] || habit
}

const formatActivityLevel = (level: string) => {
  const levelMap: Record<string, string> = {
    'sedentary': '久坐（运动很少）',
    'light': '轻度活跃（每周1-3次运动）',
    'moderate': '中度活跃（每周3-5次运动）',
    'very-active': '非常活跃（每周6-7次运动）',
    'extremely-active': '极其活跃（每日高强度运动）'
  }
  return levelMap[level] || level
}

const formatArray = (value: any) => {
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === 'string') {
    return value.split(',').filter(v => v.trim())
  }
  return []
}
</script>

<style lang="scss" scoped src="@/scss/components/ProfileRightContent.scss"></style>
