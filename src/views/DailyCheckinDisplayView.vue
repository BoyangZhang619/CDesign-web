<template>
  <div class="daily-display-page">
    <AppHeader />
    
    <main class="daily-display-main">
      <!-- 顶部装饰线 -->
      <div class="page-divider"></div>
      
      <!-- 页面标题区 -->
      <section class="daily-title-section">
        <div class="title-container">
          <h1 class="daily-title">每日健康总结</h1>
          <p class="daily-subtitle">您今日的健康数据概览</p>
          <div class="date-display">{{ formatDate(form.date) }}</div>
        </div>
      </section>

      <!-- 核心数据区 - 三大支柱 -->
      <section class="daily-core-metrics">
        <!-- 运动数据 -->
        <div class="metric-card metric-exercise" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">🏃</span>
            <h3 class="metric-title">运动</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.exercise_duration_time }}</div>
              <div class="metric-unit">分钟</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">消耗</span>
                <span class="value">{{ form.exercise_calories_burned }}</span>
                <span class="unit">kcal</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toExerciseCheckin">查看详情</button>
        </div>

        <!-- 饮食数据 -->
        <div class="metric-card metric-meal" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">🍽️</span>
            <h3 class="metric-title">饮食</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.meal_calories }}</div>
              <div class="metric-unit">kcal</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">蛋白</span>
                <span class="value">{{ form.meal_protein }}</span>
                <span class="unit">g</span>
              </div>
              <div class="metric-item">
                <span class="label">脂肪</span>
                <span class="value">{{ form.meal_fat }}</span>
                <span class="unit">g</span>
              </div>
              <div class="metric-item">
                <span class="label">碳水</span>
                <span class="value">{{ form.meal_carb }}</span>
                <span class="unit">g</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toMealCheckin">查看详情</button>
        </div>

        <!-- 睡眠数据 -->
        <div class="metric-card metric-sleep" :class="{ 'loading': loading }">
          <div class="metric-header">
            <span class="metric-icon">😴</span>
            <h3 class="metric-title">睡眠</h3>
          </div>
          <div class="metric-content">
            <div class="metric-main">
              <div class="metric-value">{{ form.sleep_duration_time }}</div>
              <div class="metric-unit">小时</div>
            </div>
            <div class="metric-secondary">
              <div class="metric-item">
                <span class="label">就寝</span>
                <span class="value">{{ form.sleep_start_time }}</span>
              </div>
              <div class="metric-item">
                <span class="label">夜醒</span>
                <span class="value">{{ form.sleep_wakeup_times }}</span>
                <span class="unit">次</span>
              </div>
            </div>
          </div>
          <button class="metric-button" @click="toSleepCheckin">查看详情</button>
        </div>
      </section>

      <!-- AI 总结区 -->
      <section class="daily-ai-section" v-if="form.total_ai_summary">
        <div class="ai-card">
          <div class="ai-header">
            <span class="ai-badge">✨ AI 分析</span>
            <h2 class="ai-title">您的今日总结</h2>
          </div>
          
          <!-- AI 总体评价 -->
          <div class="ai-content">
            <p class="ai-text">{{ form.total_ai_summary }}</p>
          </div>

          <!-- 各领域 AI 分析 -->
          <div class="ai-details">
            <!-- 运动分析 -->
            <div v-if="form.exercise_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">🏃 运动分析</div>
              <p class="ai-detail-text">{{ form.exercise_ai_summary }}</p>
            </div>

            <!-- 饮食分析 -->
            <div v-if="form.meal_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">🍽️ 饮食分析</div>
              <p class="ai-detail-text">{{ form.meal_ai_summary }}</p>
            </div>

            <!-- 睡眠分析 -->
            <div v-if="form.sleep_ai_summary" class="ai-detail-item">
              <div class="ai-detail-title">😴 睡眠分析</div>
              <p class="ai-detail-text">{{ form.sleep_ai_summary }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 详细数据区 -->
      <section class="daily-detail-section">
        <!-- 饮食详情 -->
        <div class="detail-card">
          <h3 class="detail-title">🍽️ 饮食详情</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">早餐</span>
              <span class="detail-value">{{ form.meal_breakfast_type || '未记录' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">午餐</span>
              <span class="detail-value">{{ form.meal_lunch_type || '未记录' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">晚餐</span>
              <span class="detail-value">{{ form.meal_dinner_type || '未记录' }}</span>
              </div>
            <div class="detail-item">
              <span class="detail-label">零食</span>
              <span class="detail-value">{{ form.meal_snacks_type || '未记录' }}</span>
            </div>
          </div>
        </div>

        <!-- 营养详情 -->
        <div class="detail-card">
          <h3 class="detail-title">📊 营养详情</h3>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_protein, 50) + '%' }"></div>
              </div>
              <span class="nutrition-label">蛋白 {{ form.meal_protein }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_fat, 80) + '%' }"></div>
              </div>
              <span class="nutrition-label">脂肪 {{ form.meal_fat }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_carb, 300) + '%' }"></div>
              </div>
              <span class="nutrition-label">碳水 {{ form.meal_carb }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_fiber, 30) + '%' }"></div>
              </div>
              <span class="nutrition-label">纤维 {{ form.meal_fiber }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_sugar, 50) + '%' }"></div>
              </div>
              <span class="nutrition-label">糖分 {{ form.meal_sugar }}g</span>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-bar">
                <div class="nutrition-fill" :style="{ width: getPercentage(form.meal_water, 2500) + '%' }"></div>
              </div>
              <span class="nutrition-label">饮水 {{ form.meal_water }}ml</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMsg }}</span>
      </div>

      <!-- 底部空白 -->
      <div class="daily-footer"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { onMounted } from 'vue'
import { useDailyCheckin} from '../composables/useDailyCheckin'
import { formatDate, getPercentage } from '../utils/dateTime'

const { form, loading, errorMsg, loadDailyCheckin, toExerciseCheckin, toMealCheckin, toSleepCheckin } = useDailyCheckin()

onMounted(async () => {
  await loadDailyCheckin()
})
</script>

<style scoped>
@import "@/css/checkin/DailyCheckinDisplay.css";
</style>
