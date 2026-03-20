<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="form-wrapper">
        <div class="form-header">
          <h1 class="form-title">健康档案</h1>
          <p class="form-subtitle">完成您的个人健康信息设置</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: completionPercentage + '%' }"></div>
          </div>
          <p class="progress-text">已完成 {{ completedFields }}/{{ totalFields }} 项</p>
        </div>

        <form @submit.prevent="handleSubmit" class="basic-form">
          <!-- 个人基础信息 -->
          <section class="form-section">
            <h2 class="section-title">👤 基本信息</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="realname" class="form-label">真实姓名 *</label>
                <input
                  id="realname"
                  v-model="form.realname"
                  type="text"
                  class="form-input"
                  placeholder="请输入您的真实姓名"
                  required
                />
              </div>

              <div class="form-group">
                <label for="studentId" class="form-label">学号 *</label>
                <input
                  id="studentId"
                  v-model="form.studentId"
                  type="text"
                  class="form-input"
                  placeholder="请输入学号"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="birthday" class="form-label">出生日期 *</label>
                <input
                  id="birthday"
                  v-model="form.birthday"
                  type="date"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">性别</label>
                <div class="radio-group">
                  <label
                    v-for="option in genderOptions"
                    :key="option.value"
                    class="radio-label"
                  >
                    <input
                      v-model="form.gender"
                      type="radio"
                      :value="option.value"
                      class="radio-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- 身体数据 -->
          <section class="form-section">
            <h2 class="section-title">⚖️ 身体数据</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="height_cm" class="form-label">身高 (cm) *</label>
                <input
                  id="height_cm"
                  v-model.number="form.height_cm"
                  type="number"
                  step="0.1"
                  min="50"
                  max="250"
                  class="form-input"
                  placeholder="例：170"
                  required
                />
              </div>

              <div class="form-group">
                <label for="current_weight_kg" class="form-label">当前体重 (kg) *</label>
                <input
                  id="current_weight_kg"
                  v-model.number="form.current_weight_kg"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  class="form-input"
                  placeholder="例：70"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="target_weight_kg" class="form-label">目标体重 (kg) *</label>
                <input
                  id="target_weight_kg"
                  v-model.number="form.target_weight_kg"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  class="form-input"
                  placeholder="例：65"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">健康目标</label>
                <select v-model="form.goal_type" class="form-input">
                  <option v-for="option in goalOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </section>

          <!-- 健康习惯 -->
          <section class="form-section">
            <h2 class="section-title">🏃 健康习惯</h2>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">日常活动水平</label>
                <select v-model="form.activity_level" class="form-input">
                  <option
                    v-for="option in activityLevelOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="dietary_preference" class="form-label">饮食偏好</label>
                <input
                  id="dietary_preference"
                  v-model="form.dietary_preference"
                  type="text"
                  class="form-input"
                  placeholder="例：清淡饮食，避免油腻"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="allergy_info" class="form-label">过敏信息</label>
                <input
                  id="allergy_info"
                  v-model="form.allergy_info"
                  type="text"
                  class="form-input"
                  placeholder="例：对花生过敏"
                />
              </div>

              <div class="form-group">
                <label for="work_rest_habit" class="form-label">作息习惯</label>
                <input
                  id="work_rest_habit"
                  v-model="form.work_rest_habit"
                  type="text"
                  class="form-input"
                  placeholder="例：晚上11点睡觉，早上7点起床"
                />
              </div>
            </div>
          </section>

          <!-- 健康目标描述 -->
          <section class="form-section">
            <h2 class="section-title">📝 健康目标描述</h2>

            <div class="form-group">
              <label for="health_goal_desc" class="form-label">您的健康目标</label>
              <textarea
                id="health_goal_desc"
                v-model="form.health_goal_desc"
                class="form-textarea"
                placeholder="详细描述您的健康目标，例如想要达到的体重、增强体能等"
                rows="4"
              ></textarea>
            </div>
          </section>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-box">
            {{ errorMsg }}
          </div>

          <!-- 成功提示 -->
          <div v-if="successMsg" class="success-box">
            {{ successMsg }}
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary"
            >
              {{ loading ? '保存中...' : '✓ 保存健康档案' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useBasicInfo } from '../composables/useBasicInfo'

const {
  form,
  loading,
  errorMsg,
  successMsg,
  genderOptions,
  goalOptions,
  activityLevelOptions,
  handleSubmit,
  loadHealthInfo,
  completedFields,
  completionPercentage,
  totalFields
} = useBasicInfo()

// 初始化时加载健康信息
onMounted(() => {
  loadHealthInfo()
})
</script>

<style scoped>
@import '../css/BasicInfoView.css';
</style>
