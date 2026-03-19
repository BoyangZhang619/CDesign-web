<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="form-wrapper">
        <div class="form-header">
          <h1 class="form-title">个人基础信息</h1>
          <p class="form-subtitle">完成您的个人档案设置</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: completionPercentage + '%' }"></div>
          </div>
          <p class="progress-text">已完成 {{ completedFields }}/{{ 6 }} 项</p>
        </div>

        <form @submit.prevent="handleSubmit" class="basic-form">
          <!-- 个人信息部分 -->
          <section class="form-section">
            <h2 class="section-title">📋 个人信息</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="name" class="form-label">真实姓名 *</label>
                <input
                  id="name"
                  v-model="form.name"
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
                <label for="major" class="form-label">专业/院系 *</label>
                <input
                  id="major"
                  v-model="form.major"
                  type="text"
                  class="form-input"
                  placeholder="例：计算机科学与技术"
                  required
                />
              </div>

              <div class="form-group">
                <label for="grade" class="form-label">年级</label>
                <select id="grade" v-model="form.grade" class="form-input">
                  <option v-for="g in gradeOptions" :key="g" :value="g">
                    {{ g }}
                  </option>
                </select>
              </div>
            </div>
          </section>

          <!-- 联系信息部分 -->
          <section class="form-section">
            <h2 class="section-title">📞 联系方式</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="phone" class="form-label">手机号 *</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  placeholder="请输入手机号码"
                  pattern="^1\d{10}$"
                  required
                />
              </div>

              <div class="form-group">
                <label for="emergencyContact" class="form-label">紧急联系人 *</label>
                <input
                  id="emergencyContact"
                  v-model="form.emergencyContact"
                  type="text"
                  class="form-input"
                  placeholder="姓名或手机号"
                  required
                />
              </div>
            </div>
          </section>

          <!-- 健康信息部分 -->
          <section class="form-section">
            <h2 class="section-title">🏥 健康信息</h2>

            <div class="form-group">
              <label class="form-label">既往病史</label>
              <div class="checkbox-group">
                <label
                  v-for="option in medicalOptions"
                  :key="option.value"
                  class="checkbox-label"
                >
                  <input
                    v-model="form.medicalConditions"
                    type="checkbox"
                    :value="option.value"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ option.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="notes" class="form-label">其他补充说明</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="form-textarea"
                placeholder="如有其他重要健康信息，请在此说明"
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
              {{ loading ? '保存中...' : '保存信息' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { useBasicInfo } from '../composables/useBasicInfo'

const {
  form,
  loading,
  errorMsg,
  successMsg,
  medicalOptions,
  gradeOptions,
  handleSubmit,
  completedFields,
  completionPercentage
} = useBasicInfo()
</script>

<style scoped>
@import '../css/BasicInfoView.css';
</style>
