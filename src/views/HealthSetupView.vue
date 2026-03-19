<template>
  <div class="health-setup-page">
    <!-- 进度指示器 -->
    <div class="setup-progress">
      <div class="progress-header">
        <h1 class="progress-title">健康档案设置</h1>
        <p class="progress-subtitle">完成健康信息设置，为您提供个性化建议</p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <p class="progress-text">{{ completedFields }} / {{ totalFields }} 项已完成</p>
    </div>

    <!-- 表单内容 -->
    <form @submit.prevent="handleSubmit" class="health-form">
      <!-- 第一部分：基本信息 -->
      <section class="form-section">
        <div class="section-header">
          <h2 class="section-title">基本信息</h2>
          <p class="section-description">请填写您的基本身体信息</p>
        </div>

        <div class="form-grid">
          <!-- 性别 -->
          <div class="form-group">
            <label class="form-label">性别</label>
            <div class="radio-group">
              <label class="radio-item">
                <input
                  v-model="healthInfo.gender"
                  type="radio"
                  value="male"
                  class="radio-input"
                />
                <span class="radio-label">男性</span>
              </label>
              <label class="radio-item">
                <input
                  v-model="healthInfo.gender"
                  type="radio"
                  value="female"
                  class="radio-input"
                />
                <span class="radio-label">女性</span>
              </label>
              <label class="radio-item">
                <input
                  v-model="healthInfo.gender"
                  type="radio"
                  value="other"
                  class="radio-input"
                />
                <span class="radio-label">其他</span>
              </label>
            </div>
          </div>

          <!-- 生日 -->
          <div class="form-group">
            <label for="birthday" class="form-label">生日</label>
            <input
              id="birthday"
              v-model="healthInfo.birthday"
              type="date"
              class="form-input"
            />
          </div>

          <!-- 身高 -->
          <div class="form-group">
            <label for="height" class="form-label">身高 (cm)</label>
            <input
              id="height"
              v-model.number="healthInfo.height"
              type="number"
              class="form-input"
              placeholder="例如：170"
              min="100"
              max="250"
            />
          </div>

          <!-- 当前体重 -->
          <div class="form-group">
            <label for="currentWeight" class="form-label">当前体重 (kg)</label>
            <input
              id="currentWeight"
              v-model.number="healthInfo.currentWeight"
              type="number"
              class="form-input"
              placeholder="例如：70"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          <!-- 目标体重 -->
          <div class="form-group">
            <label for="targetWeight" class="form-label">目标体重 (kg)</label>
            <input
              id="targetWeight"
              v-model.number="healthInfo.targetWeight"
              type="number"
              class="form-input"
              placeholder="例如：65"
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>
      </section>

      <!-- 第二部分：饮食与目标 -->
      <section class="form-section">
        <div class="section-header">
          <h2 class="section-title">饮食与目标</h2>
          <p class="section-description">告诉我们您的饮食偏好和健康目标</p>
        </div>

        <div class="form-grid">
          <!-- 饮食偏好 -->
          <div class="form-group full-width">
            <label class="form-label">饮食偏好（可多选）</label>
            <div class="checkbox-group">
              <label class="checkbox-item" v-for="diet in dietOptions" :key="diet">
                <input
                  v-model="healthInfo.dietPreferences"
                  type="checkbox"
                  :value="diet"
                  class="checkbox-input"
                />
                <span class="checkbox-label">{{ diet }}</span>
              </label>
              <label class="checkbox-item">
                <input
                  v-model="healthInfo.dietOther"
                  type="checkbox"
                  :value="true"
                  class="checkbox-input"
                />
                <span class="checkbox-label">其他</span>
              </label>
            </div>
            <input
              v-if="healthInfo.dietOther"
              v-model="healthInfo.dietOtherText"
              type="text"
              class="form-input"
              placeholder="请说明其他饮食偏好"
              style="margin-top: 12px"
            />
          </div>

          <!-- 健康目标 -->
          <div class="form-group full-width">
            <label class="form-label">健康目标（可多选）</label>
            <div class="checkbox-group">
              <label class="checkbox-item" v-for="goal in goalOptions" :key="goal">
                <input
                  v-model="healthInfo.healthGoals"
                  type="checkbox"
                  :value="goal"
                  class="checkbox-input"
                />
                <span class="checkbox-label">{{ goal }}</span>
              </label>
              <label class="checkbox-item">
                <input
                  v-model="healthInfo.goalOther"
                  type="checkbox"
                  :value="true"
                  class="checkbox-input"
                />
                <span class="checkbox-label">其他</span>
              </label>
            </div>
            <input
              v-if="healthInfo.goalOther"
              v-model="healthInfo.goalOtherText"
              type="text"
              class="form-input"
              placeholder="请说明其他健康目标"
              style="margin-top: 12px"
            />
          </div>
        </div>
      </section>

      <!-- 第三部分：生活习惯 -->
      <section class="form-section">
        <div class="section-header">
          <h2 class="section-title">生活习惯</h2>
          <p class="section-description">了解您的日常生活方式</p>
        </div>

        <div class="form-grid">
          <!-- 过敏信息 -->
          <div class="form-group full-width">
            <label for="allergies" class="form-label">过敏信息</label>
            <textarea
              id="allergies"
              v-model="healthInfo.allergies"
              class="form-textarea"
              placeholder="例如：花生、海鲜、乳制品等（如无过敏可留空）"
              rows="3"
            ></textarea>
          </div>

          <!-- 作息习惯 -->
          <div class="form-group full-width">
            <label class="form-label">作息习惯</label>
            <div class="select-group">
              <select v-model="healthInfo.sleepHabit" class="form-select">
                <option value="">请选择</option>
                <option value="early-bird">早睡早起（22:00前就寝）</option>
                <option value="moderate">中等规律（23:00-24:00就寝）</option>
                <option value="night-owl">晚睡（24:00后就寝）</option>
                <option value="irregular">不规律</option>
              </select>
            </div>
          </div>

          <!-- 日常活动水平 -->
          <div class="form-group full-width">
            <label class="form-label">日常活动水平</label>
            <div class="select-group">
              <select v-model="healthInfo.activityLevel" class="form-select">
                <option value="">请选择</option>
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
      <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="handleSkip">
          跳过（稍后设置）
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '保存中...' : '完成设置' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')

// 选项列表
const dietOptions = [
  '素食',
  '无肉',
  '无乳制品',
  '无麸质',
  '低碳水',
  '高蛋白'
]

const goalOptions = [
  '减重',
  '增肌',
  '增重',
  '保持',
  '改善心肺功能',
  '提高灵活性',
  '改善睡眠',
  '增强免疫力'
]

// 健康信息表单
const healthInfo = reactive({
  gender: '',
  birthday: '',
  height: undefined as number | undefined,
  currentWeight: undefined as number | undefined,
  targetWeight: undefined as number | undefined,
  dietPreferences: [] as string[],
  dietOther: false,
  dietOtherText: '',
  healthGoals: [] as string[],
  goalOther: false,
  goalOtherText: '',
  allergies: '',
  sleepHabit: '',
  activityLevel: ''
})

// 计算完成百分比
const totalFields = 10
const completedFields = computed(() => {
  let count = 0
  if (healthInfo.gender) count++
  if (healthInfo.birthday) count++
  if (healthInfo.height) count++
  if (healthInfo.currentWeight) count++
  if (healthInfo.targetWeight) count++
  if (healthInfo.dietPreferences.length > 0 || healthInfo.dietOtherText) count++
  if (healthInfo.healthGoals.length > 0 || healthInfo.goalOtherText) count++
  if (healthInfo.allergies) count++
  if (healthInfo.sleepHabit) count++
  if (healthInfo.activityLevel) count++
  return count
})

const progressPercentage = computed(() => {
  return Math.round((completedFields.value / totalFields) * 100)
})

/**
 * 验证表单
 */
function validateForm(): boolean {
  if (!healthInfo.gender) {
    errorMsg.value = '请选择性别'
    return false
  }
  if (!healthInfo.birthday) {
    errorMsg.value = '请选择生日'
    return false
  }
  if (!healthInfo.height) {
    errorMsg.value = '请输入身高'
    return false
  }
  if (!healthInfo.currentWeight) {
    errorMsg.value = '请输入当前体重'
    return false
  }
  if (!healthInfo.targetWeight) {
    errorMsg.value = '请输入目标体重'
    return false
  }
  if (healthInfo.dietPreferences.length === 0 && !healthInfo.dietOtherText) {
    errorMsg.value = '请选择至少一个饮食偏好'
    return false
  }
  if (healthInfo.healthGoals.length === 0 && !healthInfo.goalOtherText) {
    errorMsg.value = '请选择至少一个健康目标'
    return false
  }
  if (!healthInfo.sleepHabit) {
    errorMsg.value = '请选择作息习惯'
    return false
  }
  if (!healthInfo.activityLevel) {
    errorMsg.value = '请选择日常活动水平'
    return false
  }
  return true
}

/**
 * 提交表单
 */
async function handleSubmit() {
  errorMsg.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // TODO: 调用后端 API 保存健康信息
    // await saveHealthInfo(healthInfo)

    // 暂时直接跳转
    router.push('/home')
  } catch (error: any) {
    errorMsg.value = error?.message || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

/**
 * 跳过设置
 */
function handleSkip() {
  router.push('/home')
}
</script>

<style scoped lang="css">
/* =============== 页面布局 =============== */
.health-setup-page {
  min-height: 100vh;
  background: #fafaf8;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* =============== 进度指示器 =============== */
.setup-progress {
  width: 100%;
  max-width: 720px;
  margin-bottom: 48px;
}

.progress-header {
  text-align: center;
  margin-bottom: 32px;
}

.progress-title {
  margin: 0;
  font-size: 32px;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.progress-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8a8a85;
  font-weight: 300;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: #e0dcd8;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2c2c2c 0%, #3a3a38 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.progress-text {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #8a8a85;
  letter-spacing: 0.3px;
}

/* =============== 表单容器 =============== */
.health-form {
  width: 100%;
  max-width: 720px;
}

/* =============== 表单区域 =============== */
.form-section {
  margin-bottom: 48px;
  padding: 32px;
  background: #ffffff;
  border: 1px solid #e0dcd8;
  border-radius: 6px;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-section:hover {
  box-shadow: 0 8px 24px rgba(44, 44, 44, 0.06);
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e6e2;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #2c2c2c;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}

.section-description {
  margin: 0;
  font-size: 13px;
  color: #8a8a85;
  font-weight: 300;
}

/* =============== 网格布局 =============== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* =============== 表单元素 =============== */
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #3a3a38;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #e0dcd8;
  background: #fdfdfb;
  color: #2c2c2c;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  letter-spacing: 0.3px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8a8a85;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e8e6e2, 0 0 0 3px rgba(138, 138, 133, 0.08);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #a8a8a3;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238a8a85' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* =============== 单选框 =============== */
.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item,
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.radio-input,
.checkbox-input {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2c2c2c;
}

.radio-label,
.checkbox-label {
  font-size: 13px;
  color: #3a3a38;
  letter-spacing: 0.3px;
  line-height: 1.5;
}

.radio-item:hover .radio-label,
.checkbox-item:hover .checkbox-label {
  color: #2c2c2c;
}

/* =============== 错误提示 =============== */
.form-error {
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #7a3c3c;
  background: #f5e6e6;
  border: 1px solid #e8d4d4;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

/* =============== 操作按钮 =============== */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 48px;
}

.btn {
  padding: 13px 32px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 180px;
}

.btn-primary {
  color: #ffffff;
  background: #2c2c2c;
}

.btn-primary:hover:not(:disabled) {
  background: #3a3a38;
  box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  color: #8a8a85;
  background: transparent;
  border: 1px solid #e0dcd8;
}

.btn-secondary:hover {
  border-color: #8a8a85;
  background: rgba(138, 138, 133, 0.04);
  color: #3a3a38;
}

/* =============== 响应式设计 =============== */
@media (max-width: 768px) {
  .health-setup-page {
    padding: 40px 20px;
  }

  .setup-progress {
    margin-bottom: 32px;
  }

  .progress-title {
    font-size: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-section {
    padding: 24px;
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    min-width: 100%;
  }
}
</style>
