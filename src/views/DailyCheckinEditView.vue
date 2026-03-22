<template>
  <div class="page">
    <AppHeader />
    <main class="content">
      <div class="edit-container">
        <div class="edit-header">
          <h1>编辑健康打卡</h1>
          <p>记录和修改您的健康数据</p>
        </div>

        <form @submit.prevent="handleSubmit" class="edit-form">
          <!-- 基础数据 -->
          <section class="form-section">
            <h2>⚖️ 基础数据</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="date">打卡日期 *</label>
                <input v-model="form.date" id="date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label for="weight">体重 (kg) *</label>
                <input v-model.number="form.body_weight_kg" id="weight" type="number" step="0.1" min="0"
                  class="form-input" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="sleepStart">睡眠开始时间</label>
                <input v-model="form.sleep_start_time" id="sleepStart" type="time" class="form-input" />
              </div>
              <div class="form-group">
                <label for="sleepDuration">睡眠时长 (小时)</label>
                <input v-model.number="form.sleep_duration_hours" id="sleepDuration" type="number" step="0.5" min="0"
                  max="24" class="form-input" />
              </div>
            </div>
          </section>

          <!-- 活动数据 -->
          <section class="form-section">
            <h2>💪 活动和饮水</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="exercise">运动时长 (分钟)</label>
                <input v-model.number="form.exercise_duration_min" id="exercise" type="number" step="1" min="0"
                  class="form-input" />
              </div>
              <div class="form-group">
                <label for="water">饮水 (ml)</label>
                <input v-model.number="form.water_intake_ml" id="water" type="number" step="100" min="0"
                  class="form-input" />
              </div>
            </div>
          </section>

          <!-- 饮食记录 -->
          <section class="form-section">
            <h2>🍽️ 饮食记录</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="breakfast">早餐</label>
                <input v-model="form.breakfast" id="breakfast" type="text" class="form-input"
                  placeholder="例：鸡蛋+牛奶+面包" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="lunch">午餐</label>
                <input v-model="form.lunch" id="lunch" type="text" class="form-input" placeholder="例：米饭+红烧肉+青菜" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dinner">晚餐</label>
                <input v-model="form.dinner" id="dinner" type="text" class="form-input" placeholder="例：面条+番茄鸡蛋" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="snack">宵夜</label>
                <input v-model="form.midnight_snack" id="snack" type="text" class="form-input" placeholder="例：酸奶+水果" />
              </div>
            </div>
          </section>

          <!-- 睡眠质量 -->
          <section class="form-section">
            <h2>😴 睡眠质量</h2>
            <div class="radio-group">
              <label v-for="opt in sleepQualityOptions" :key="opt.value" class="radio-item">
                <input v-model="form.sleep_quality" type="radio" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </section>

          <!-- 心情状态 -->
          <section class="form-section">
            <h2>😊 心情状态</h2>
            <div class="radio-group">
              <label v-for="opt in moodOptions" :key="opt.value" class="radio-item">
                <input v-model="form.mood" type="radio" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </section>

          <!-- 精力水平 -->
          <section class="form-section">
            <h2>⚡ 精力水平</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="energy">评分 (0-5) *</label>
                <input v-model.number="form.energy_level" id="energy" type="number" step="1" min="0" max="5"
                  class="form-input" required />
              </div>
            </div>
          </section>

          <!-- 备注 -->
          <section class="form-section">
            <h2>📝 备注</h2>
            <div class="form-group">
              <label for="note">其他补充说明</label>
              <textarea v-model="form.note" id="note" class="form-textarea" placeholder="例如：今天在健身房运动一小时，感觉很好..."
                rows="4"></textarea>
            </div>
          </section>

          <!-- 消息 -->
          <div v-if="errorMsg" class="alert error-alert">{{ errorMsg }}</div>
          <div v-if="successMsg" class="alert success-alert">{{ successMsg }}</div>

          <!-- 按钮 -->
          <div class="form-actions">
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? '保存中...' : '✓ 保存打卡' }}
            </button>
            <button type="button" @click="goBack" class="btn-secondary">返回</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useDailyCheckin } from '../composables/useDailyCheckin'

const router = useRouter()

const {
  form,
  loading,
  errorMsg,
  successMsg,
  sleepQualityOptions,
  moodOptions,
  handleSubmit,
  loadDailyCheckin,
  enterEditMode
} = useDailyCheckin()

const goBack = () => {
  router.back()
}

onMounted(() => {
  enterEditMode()
  loadDailyCheckin()
})
</script>

<style scoped>
@import "@/css/checkin/DailyCheckinEdit.css";
</style>
