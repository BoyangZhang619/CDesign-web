<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <div class="checkin-wrapper">
        <div class="checkin-header">
          <h1 class="checkin-title">📝 健康打卡</h1>
          <p class="checkin-subtitle">记录您今天的健康数据</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: completionPercentage + '%' }"></div>
          </div>
          <p class="progress-text">已完成 {{ completedFields }}/{{ 6 }} 项</p>
        </div>

        <form @submit.prevent="handleSubmit" class="checkin-form">
          <!-- 日期和体重 -->
          <section class="form-section">
            <h2 class="section-title">⚖️ 基础数据</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="date" class="form-label">打卡日期 *</label>
                <input
                  id="date"
                  v-model="form.date"
                  type="date"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="weight" class="form-label">当前体重 (kg) *</label>
                <input
                  id="weight"
                  v-model.number="form.weight"
                  type="number"
                  step="0.1"
                  min="0"
                  class="form-input"
                  placeholder="例：70.5"
                  required
                />
              </div>
            </div>
          </section>

          <!-- 饮食和水分 -->
          <section class="form-section">
            <h2 class="section-title">🥗 饮食和水分</h2>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">今日饮食评分</label>
                <div class="option-group">
                  <label
                    v-for="option in mealOptions"
                    :key="option.value"
                    class="option-label"
                  >
                    <input
                      v-model="form.mealIntake"
                      type="radio"
                      :value="option.value"
                      class="option-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="waterIntake" class="form-label">喝水杯数</label>
                <div class="input-with-unit">
                  <input
                    id="waterIntake"
                    v-model.number="form.waterIntake"
                    type="number"
                    min="0"
                    class="form-input"
                    placeholder="0"
                  />
                  <span class="unit">杯</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 运动和睡眠 -->
          <section class="form-section">
            <h2 class="section-title">💪 运动和睡眠</h2>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">今日运动</label>
                <div class="option-group">
                  <label
                    v-for="option in exerciseOptions"
                    :key="option.value"
                    class="option-label"
                  >
                    <input
                      v-model="form.exercise"
                      type="radio"
                      :value="option.value"
                      class="option-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="sleepHours" class="form-label">昨晚睡眠时长</label>
                <div class="input-with-unit">
                  <input
                    id="sleepHours"
                    v-model.number="form.sleepHours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    class="form-input"
                    placeholder="0"
                  />
                  <span class="unit">小时</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">睡眠质量</label>
                <div class="option-group">
                  <label
                    v-for="option in sleepQualityOptions"
                    :key="option.value"
                    class="option-label"
                  >
                    <input
                      v-model="form.sleepQuality"
                      type="radio"
                      :value="option.value"
                      class="option-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- 心情和精力 -->
          <section class="form-section">
            <h2 class="section-title">😊 心理状态</h2>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">今日心情</label>
                <div class="option-group">
                  <label
                    v-for="option in moodOptions"
                    :key="option.value"
                    class="option-label"
                  >
                    <input
                      v-model="form.mood"
                      type="radio"
                      :value="option.value"
                      class="option-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">精力状态</label>
                <div class="option-group">
                  <label
                    v-for="option in energyOptions"
                    :key="option.value"
                    class="option-label"
                  >
                    <input
                      v-model="form.energy"
                      type="radio"
                      :value="option.value"
                      class="option-input"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- 备注 -->
          <section class="form-section">
            <h2 class="section-title">📌 备注</h2>

            <div class="form-group">
              <label for="notes" class="form-label">今日其他补充说明</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="form-textarea"
                placeholder="例如：今天在健身房运动一小时，感觉很好..."
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
              {{ loading ? '保存中...' : '✓ 提交打卡' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { useDailyCheckin } from '../composables/useDailyCheckin'

const {
  form,
  loading,
  errorMsg,
  successMsg,
  mealOptions,
  exerciseOptions,
  sleepQualityOptions,
  moodOptions,
  energyOptions,
  handleSubmit,
  completedFields,
  completionPercentage
} = useDailyCheckin()
</script>

<style scoped>
@import '../css/DailyCheckinView.css';
</style>
