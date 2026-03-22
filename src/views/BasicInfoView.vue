<template>
  <div class="basic-info-view">
    <AppHeader />

    <div class="basic-info-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>健康信息完善</h1>
        <p>请完整填写以下信息，帮助我们更好地了解你的健康状况</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="alert alert-error">
        <div class="alert-content">
          <span>{{ errorMsg }}</span>
          <button @click="errorMsg = ''" class="alert-close">×</button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>保存中...</p>
      </div>

      <!-- 表单 -->
      <form v-show="!loading" @submit.prevent="handleSubmit" class="health-form">
        <!-- 基本信息 -->
        <section class="form-section">
          <h2 class="section-title">基本信息</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="realname">真实姓名 <span class="required">*</span></label>
              <input
                id="realname"
                v-model="form.realname"
                type="text"
                class="form-input"
                placeholder="请输入你的真实姓名"
                required
              />
            </div>

            <div class="form-group">
              <label for="studentId">学号 <span class="required">*</span></label>
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
              <label for="gender">性别</label>
              <select id="gender" v-model="form.gender" class="form-input">
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label for="birthday">出生日期</label>
              <input
                id="birthday"
                v-model="form.birthday"
                type="date"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <!-- 体重管理 -->
        <section class="form-section">
          <h2 class="section-title">体重管理</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="height">身高 (cm)</label>
              <input
                id="height"
                v-model.number="form.height_cm"
                type="number"
                class="form-input"
                min="1"
                max="250"
                placeholder="请输入身高"
              />
            </div>

            <div class="form-group">
              <label for="weight">当前体重 (kg)</label>
              <input
                id="weight"
                v-model.number="form.current_weight_kg"
                type="number"
                class="form-input"
                min="1"
                max="300"
                step="0.1"
                placeholder="请输入当前体重"
              />
            </div>

            <div class="form-group">
              <label for="targetWeight">目标体重 (kg)</label>
              <input
                id="targetWeight"
                v-model.number="form.target_weight_kg"
                type="number"
                class="form-input"
                min="1"
                max="300"
                step="0.1"
                placeholder="请输入目标体重"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="goalType">健康目标</label>
            <select id="goalType" v-model="form.goal_type" class="form-input">
              <option value="maintain">保持现状</option>
              <option value="weight_loss">减重</option>
              <option value="weight_gain">增重</option>
              <option value="muscle_gain">增肌</option>
              <option value="fitness">提高体能</option>
            </select>
          </div>

          <div class="form-group">
            <label for="healthGoal">健康目标描述</label>
            <textarea
              id="healthGoal"
              v-model="form.health_goal_desc"
              class="form-input form-textarea"
              placeholder="请描述你的健康目标和期望"
              rows="4"
            ></textarea>
          </div>
        </section>

        <!-- 生活习惯 -->
        <section class="form-section">
          <h2 class="section-title">生活习惯</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="activity">活动水平</label>
              <select id="activity" v-model="form.activity_level" class="form-input">
                <option value="sedentary">久坐不动</option>
                <option value="light">轻度活动</option>
                <option value="moderate">中等活动</option>
                <option value="active">高度活动</option>
                <option value="very_active">非常活跃</option>
              </select>
            </div>

            <div class="form-group">
              <label for="dietary">饮食偏好</label>
              <input
                id="dietary"
                v-model="form.dietary_preference"
                type="text"
                class="form-input"
                placeholder="如：素食、无糖等"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="workRest">作息习惯</label>
              <input
                id="workRest"
                v-model="form.work_rest_habit"
                type="text"
                class="form-input"
                placeholder="如：早起、熬夜等"
              />
            </div>

            <div class="form-group">
              <label for="allergy">过敏信息</label>
              <input
                id="allergy"
                v-model="form.allergy_info"
                type="text"
                class="form-input"
                placeholder="请输入食物或药物过敏"
              />
            </div>
          </div>
        </section>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="button" @click="handleCancel" class="btn btn-cancel">
            取消
          </button>
          <button type="submit" class="btn btn-submit" :disabled="loading">
            {{ loading ? '保存中...' : '保存信息' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useBasicInfo } from '../composables/useBasicInfo'

const router = useRouter()
const { form, handleSubmit: composableHandleSubmit } = useBasicInfo()

const loading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  errorMsg.value = ''
  loading.value = true

  try {
    await composableHandleSubmit()
    setTimeout(() => {
      router.push('/home')
    }, 800)
  } catch (error: any) {
    errorMsg.value = error.message || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/home')
}
</script>

<style src="@/css/BasicInfoView.css"></style>
