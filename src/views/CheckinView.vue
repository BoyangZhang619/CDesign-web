<template>
  <div class="checkin container-md">
    <!-- Tab Bar -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id"
        class="tab" :class="{ 'tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id">
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ============== 日常 ============== -->
    <div v-if="activeTab === 'daily'" class="section">
      <div v-if="dailyLoading" class="state-box"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="dailyError" class="state-box state-error"><p>{{ dailyError }}</p></div>
      <template v-else>
        <!-- Exercise -->
        <div class="card">
          <div class="card-head">
            <h3>🏃 运动</h3>
            <button class="card-edit" @click="editing.exercise = !editing.exercise">
              {{ editing.exercise ? '完成' : '编辑' }}
            </button>
          </div>
          <template v-if="editing.exercise">
            <div class="field"><label>时长(分钟)</label><input v-model.number="form.exercise_duration_time" type="number" min="0" class="input" /></div>
            <div class="field"><label>消耗(kcal)</label><input v-model.number="form.exercise_calories_burned" type="number" min="0" class="input" /></div>
          </template>
          <template v-else>
            <div class="info-row"><span>时长</span><strong>{{ form.exercise_duration_time || 0 }} 分钟</strong></div>
            <div class="info-row"><span>消耗</span><strong>{{ form.exercise_calories_burned || 0 }} kcal</strong></div>
            <p v-if="form.exercise_ai_summary" class="ai-note">{{ form.exercise_ai_summary }}</p>
          </template>
        </div>
        <!-- Meal -->
        <div class="card">
          <div class="card-head">
            <h3>🍽 饮食</h3>
            <button class="card-edit" @click="editing.meal = !editing.meal">
              {{ editing.meal ? '完成' : '编辑' }}
            </button>
          </div>
          <template v-if="editing.meal">
            <div class="field"><label>早餐</label><input v-model="form.meal_breakfast_type" class="input" placeholder="吃了什么..." /></div>
            <div class="field"><label>午餐</label><input v-model="form.meal_lunch_type" class="input" placeholder="吃了什么..." /></div>
            <div class="field"><label>晚餐</label><input v-model="form.meal_dinner_type" class="input" placeholder="吃了什么..." /></div>
            <div class="field"><label>热量 (kcal)</label><input v-model.number="form.meal_calories" type="number" min="0" class="input" /></div>
            <div class="field"><label>饮水 (ml)</label><input v-model.number="form.meal_water" type="number" min="0" class="input" /></div>
          </template>
          <template v-else>
            <div class="info-row"><span>早餐</span><strong>{{ form.meal_breakfast_type || '-' }}</strong></div>
            <div class="info-row"><span>午餐</span><strong>{{ form.meal_lunch_type || '-' }}</strong></div>
            <div class="info-row"><span>晚餐</span><strong>{{ form.meal_dinner_type || '-' }}</strong></div>
            <div class="info-row"><span>热量</span><strong>{{ form.meal_calories || 0 }} kcal</strong></div>
            <div class="info-row"><span>饮水</span><strong>{{ form.meal_water || 0 }} ml</strong></div>
            <p v-if="form.meal_ai_summary" class="ai-note">{{ form.meal_ai_summary }}</p>
          </template>
        </div>
        <!-- Sleep -->
        <div class="card">
          <div class="card-head">
            <h3>😴 睡眠</h3>
            <button class="card-edit" @click="editing.sleep = !editing.sleep">
              {{ editing.sleep ? '完成' : '编辑' }}
            </button>
          </div>
          <template v-if="editing.sleep">
            <div class="field"><label>入睡时间</label><input v-model="form.sleep_start_time" type="time" class="input" /></div>
            <div class="field"><label>时长(小时)</label><input v-model.number="form.sleep_duration_time" type="number" min="0" step="0.5" class="input" /></div>
            <div class="field"><label>夜醒次数</label><input v-model.number="form.sleep_wakeup_times" type="number" min="0" class="input" /></div>
          </template>
          <template v-else>
            <div class="info-row"><span>入睡</span><strong>{{ form.sleep_start_time || '-' }}</strong></div>
            <div class="info-row"><span>时长</span><strong>{{ form.sleep_duration_time || 0 }} 小时</strong></div>
            <div class="info-row"><span>夜醒</span><strong>{{ form.sleep_wakeup_times || 0 }} 次</strong></div>
            <p v-if="form.sleep_ai_summary" class="ai-note">{{ form.sleep_ai_summary }}</p>
          </template>
        </div>
      </template>
    </div>

    <!-- ============== 饮食 ============== -->
    <div v-if="activeTab === 'meal'" class="section">
      <div class="card">
        <div class="card-head"><h3>🍽 添加饮食记录</h3></div>
        <div class="field"><label>餐类</label>
          <select v-model="mealForm.meal_type" class="input">
            <option value="breakfast">早餐</option><option value="lunch">午餐</option>
            <option value="dinner">晚餐</option><option value="snack">零食</option>
          </select>
        </div>
        <div class="field"><label>食物名称</label><input v-model="mealForm.food_name" class="input" placeholder="吃了什么..." /></div>
        <div class="field"><label>热量 (kcal)</label><input v-model.number="mealForm.calories" type="number" min="0" class="input" /></div>
        <button class="btn-save" :disabled="mealSaving" @click="submitMeal">{{ mealSaving ? '保存中...' : '保存' }}</button>
        <p v-if="mealMsg" class="msg" :class="mealOk ? 'msg-ok' : 'msg-err'">{{ mealMsg }}</p>
      </div>
      <div v-if="mealRecords.length" class="card">
        <div class="card-head"><h3>今日记录</h3></div>
        <div v-for="r in mealRecords" :key="r.id" class="info-row">
          <span>{{ r.food_name }}</span><strong>{{ r.calories }} kcal</strong>
        </div>
      </div>
    </div>

    <!-- ============== 运动 ============== -->
    <div v-if="activeTab === 'exercise'" class="section">
      <div class="card">
        <div class="card-head"><h3>🏃 添加运动记录</h3></div>
        <div class="field"><label>运动类型</label><input v-model="exerciseForm.activity_type" class="input" placeholder="跑步、游泳..." /></div>
        <div class="field"><label>时长(分钟)</label><input v-model.number="exerciseForm.duration_min" type="number" min="0" class="input" /></div>
        <div class="field"><label>强度</label>
          <select v-model="exerciseForm.intensity" class="input">
            <option value="light">轻度</option><option value="medium">中度</option><option value="heavy">剧烈</option>
          </select>
        </div>
        <button class="btn-save" :disabled="exSaving" @click="submitExercise">{{ exSaving ? '保存中...' : '保存' }}</button>
        <p v-if="exMsg" class="msg" :class="exOk ? 'msg-ok' : 'msg-err'">{{ exMsg }}</p>
      </div>
    </div>

    <!-- ============== 睡眠 ============== -->
    <div v-if="activeTab === 'sleep'" class="section">
      <div class="card">
        <div class="card-head"><h3>😴 添加睡眠记录</h3></div>
        <div class="field"><label>入睡时间</label><input v-model="sleepForm.sleep_start_time" type="datetime-local" class="input" /></div>
        <div class="field"><label>醒来时间</label><input v-model="sleepForm.wake_up_time" type="datetime-local" class="input" /></div>
        <div class="field"><label>睡眠时长(小时)</label><input v-model.number="sleepForm.sleep_duration_hours" type="number" min="0" step="0.5" class="input" /></div>
        <button class="btn-save" :disabled="slSaving" @click="submitSleep">{{ slSaving ? '保存中...' : '保存' }}</button>
        <p v-if="slMsg" class="msg" :class="slOk ? 'msg-ok' : 'msg-err'">{{ slMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDailyCheckin } from '../composables/useDailyCheckin'
import { fetchWithRefresh } from '../api/http'
import { getLocalISOString } from '@/utils/dateTime'

const activeTab = ref<'daily' | 'meal' | 'exercise' | 'sleep'>('daily')
const tabs = [
  { id: 'daily' as const, label: '日常', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'meal' as const, label: '饮食', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>` },
  { id: 'exercise' as const, label: '运动', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>` },
  { id: 'sleep' as const, label: '睡眠', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
]

// ── Daily ───────────────────────────────────────────────────
const {
  form, editing: _editing, loading: dailyLoading, errorMsg: dailyError,
  loadDailyCheckin,
} = useDailyCheckin()

const editing = reactive({ exercise: false, meal: false, sleep: false })

// ── Meal tab ────────────────────────────────────────────────
const mealForm = reactive({ meal_type: 'breakfast', food_name: '', calories: 0 })
const mealSaving = ref(false); const mealMsg = ref(''); const mealOk = ref(false)
const mealRecords = ref<any[]>([])

async function submitMeal() {
  mealSaving.value = true; mealMsg.value = ''
  try {
    const res = await fetchWithRefresh('/meal-checkin/checkin/meal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...mealForm, meal_time: getLocalISOString(new Date()), food_source: 'canteen' }),
    })
    const data = await res.json()
    if (data?.success) { mealOk.value = true; mealMsg.value = '保存成功'; mealRecords.value.push({ id: Date.now(), ...mealForm }); mealForm.food_name = ''; mealForm.calories = 0 }
    else { throw new Error(data.message || '失败') }
  } catch (err: any) { mealOk.value = false; mealMsg.value = err.message }
  finally { mealSaving.value = false }
}

// ── Exercise tab ────────────────────────────────────────────
const exerciseForm = reactive({ activity_type: '', duration_min: 0, intensity: 'medium' })
const exSaving = ref(false); const exMsg = ref(''); const exOk = ref(false)

async function submitExercise() {
  exSaving.value = true; exMsg.value = ''
  try {
    const now = getLocalISOString(new Date())
    const res = await fetchWithRefresh('/exercise-checkin/checkin/exercise', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...exerciseForm, start_time: now, end_time: now }),
    })
    const data = await res.json()
    if (data?.success) { exOk.value = true; exMsg.value = '保存成功'; exerciseForm.activity_type = ''; exerciseForm.duration_min = 0 }
    else { throw new Error(data.message || '失败') }
  } catch (err: any) { exOk.value = false; exMsg.value = err.message }
  finally { exSaving.value = false }
}

// ── Sleep tab ───────────────────────────────────────────────
const sleepForm = reactive({ sleep_start_time: '', wake_up_time: '', sleep_duration_hours: 0 })
const slSaving = ref(false); const slMsg = ref(''); const slOk = ref(false)

async function submitSleep() {
  slSaving.value = true; slMsg.value = ''
  try {
    const res = await fetchWithRefresh('/sleep-checkin/checkin/sleep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sleepForm),
    })
    const data = await res.json()
    if (data?.success) { slOk.value = true; slMsg.value = '保存成功' }
    else { throw new Error(data.message || '失败') }
  } catch (err: any) { slOk.value = false; slMsg.value = err.message }
  finally { slSaving.value = false }
}

loadDailyCheckin()
</script>

<style lang="scss" scoped>
.checkin { padding: var(--space-4); }
.section { display: flex; flex-direction: column; gap: var(--space-4); }

.tabs { display: flex; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-4); }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-1); padding: var(--space-3) var(--space-2); background: transparent; border: none; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast);
  &:hover { color: var(--color-text); }
}
.tab--active { color: var(--color-accent); background: var(--color-accent-light); font-weight: var(--font-weight-semibold); }
.tab-icon { display: flex; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-3);
  p { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
}
.state-error p { color: var(--color-danger); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.card { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);
  h3 { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-text); }
}
.card-edit { font-size: var(--font-size-xs); color: var(--color-accent); font-weight: var(--font-weight-semibold); background: none; border: none; cursor: pointer; }

.info-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-separator); font-size: var(--font-size-sm);
  &:last-child { border-bottom: none; }
  span { color: var(--color-text-secondary); }
  strong { color: var(--color-text); font-weight: var(--font-weight-medium); }
}
.ai-note { margin-top: var(--space-3); font-size: var(--font-size-xs); color: var(--color-text-secondary); font-style: italic; line-height: var(--line-height-relaxed); }

.field { margin-bottom: var(--space-3);
  label { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
  &:last-child { margin-bottom: 0; }
}
.input { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-secondary); color: var(--color-text); font-size: var(--font-size-base);
  &:focus { border-color: var(--color-accent); outline: none; }
}

.btn-save { width: 100%; padding: var(--space-3); background: var(--color-accent); color: #fff; font-weight: var(--font-weight-semibold); border: none; border-radius: var(--radius-md); cursor: pointer; margin-top: var(--space-3);
  &:hover:not(:disabled) { background: var(--color-accent-hover); }
  &:disabled { opacity: .5; cursor: not-allowed; }
}
.msg { margin-top: var(--space-2); font-size: var(--font-size-xs); }
.msg-ok { color: var(--color-success); }
.msg-err { color: var(--color-danger); }
</style>
