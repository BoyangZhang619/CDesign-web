<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="form-wrapper">
        <div class="form-header">
          <h1 class="form-title">健康档案设置</h1>
          <p class="form-subtitle">完成基础信息，为您提供个性化健康建议</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">已完成 {{ completedFields }}/{{ totalFields }} 项</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="health-form">
          <!-- 基本信息部分 -->
          <section class="form-section">
            <div class="section-header">
              <h2 class="section-title">01 基本信息</h2>
              <p class="section-subtitle">身体数据是个性化建议的基础</p>
            </div>

            <div class="form-fields">
              <!-- 性别 -->
              <div class="form-group">
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

              <!-- 生日 -->
              <div class="form-group">
                <label for="birthday" class="form-label">生日</label>
                <input id="birthday" v-model="healthInfo.birthday" type="date" class="form-input" />
              </div>

              <!-- 身高 -->
              <div class="form-group">
                <label for="height" class="form-label">身高 (cm)</label>
                <input id="height" v-model.number="healthInfo.height" type="number" class="form-input" placeholder="170"
                  min="100" max="250" />
              </div>

              <!-- 当前体重 -->
              <div class="form-group">
                <label for="currentWeight" class="form-label">当前体重 (kg)</label>
                <input id="currentWeight" v-model.number="healthInfo.currentWeight" type="number" class="form-input"
                  placeholder="70" min="30" max="300" step="0.1" />
              </div>

              <!-- 目标体重 -->
              <div class="form-group">
                <label for="targetWeight" class="form-label">目标体重 (kg)</label>
                <input id="targetWeight" v-model.number="healthInfo.targetWeight" type="number" class="form-input"
                  placeholder="65" min="30" max="300" step="0.1" />
              </div>
            </div>
          </section>

          <!-- 饮食与目标 -->
          <section class="form-section">
            <div class="section-header">
              <h2 class="section-title">02 饮食与目标</h2>
              <p class="section-subtitle">帮助我们更好地了解您的需求</p>
            </div>

            <div class="form-fields">
              <!-- 饮食偏好 -->
              <div class="form-group full-width">
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

              <!-- 健康目标 -->
              <div class="form-group full-width">
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
            </div>
          </section>

          <!-- 生活习惯 -->
          <section class="form-section">
            <div class="section-header">
              <h2 class="section-title">03 生活习惯</h2>
              <p class="section-subtitle">了解您的日常生活方式</p>
            </div>

            <div class="form-fields">
              <!-- 过敏信息 -->
              <div class="form-group full-width">
                <label for="allergies" class="form-label">过敏信息</label>
                <textarea id="allergies" v-model="healthInfo.allergies" class="form-textarea"
                  placeholder="如无过敏可留空。例如：花生、海鲜、乳制品" rows="3"></textarea>
              </div>

              <!-- 作息习惯 -->
              <div class="form-group">
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

              <!-- 日常活动水平 -->
              <div class="form-group">
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
            </div>
          </section>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="handleSkip">
              稍后设置
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '完成设置' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useHealthSetup } from '../composables/useHealthSetup'

const {
  loading,
  errorMsg,
  healthInfo,
  dietOptions,
  goalOptions,
  completedFields,
  progressPercentage,
  handleSubmit,
  handleSkip
} = useHealthSetup()

const totalFields = 10
</script>

<style src="../css/HealthSetupView.css"></style>
