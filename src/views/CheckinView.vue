<template>
  <div class="checkin container-md">
    <!-- Tab Row -->
    <div class="tab-row">
      <button class="overview-capsule" :class="{ active: activeTab === 'overview' }" @click="switchTab('overview')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        <span>总览</span>
      </button>
      <div class="tabs">
        <button v-for="t in tabs" :key="t.id" class="tab" :class="{ 'tab--active': activeTab === t.id }" @click="switchTab(t.id)">
          <span class="tab-icon" v-html="t.icon"></span><span class="tab-label">{{ t.label }}</span>
        </button>
      </div>
    </div>

    <!-- ====== 总览 ====== -->
    <div v-if="activeTab === 'overview'" class="overview">
      <div class="hero-card">
        <h2 class="display-text">{{ greeting }}</h2>
        <p>{{ todayStr }} · {{ summary.total }} 条记录</p>
      </div>
      <div class="overview-grid">
        <div v-for="s in overviewStats" :key="s.type" class="ov-card" :class="s.bg" @click="switchTab(s.type)">
          <span class="ov-num">{{ s.count }}</span><span class="ov-label">{{ s.label }}</span><span class="ov-hint">{{ s.hint }}</span>
        </div>
      </div>
    </div>

    <!-- ====== 类型页 ====== -->
    <template v-else>
      <!-- Guide -->
      <div v-if="!showForm" class="section">
        <div class="guide-card" :class="currentGuide.bg">
          <h3 class="display-text">{{ currentGuide.title }}</h3>
          <p>{{ currentGuide.desc }}</p>
          <button class="btn-start" @click="startCheckin">开始打卡</button>
        </div>
        <div class="recent">
          <h4 class="section-label">最近记录</h4>
          <div v-if="recentRecords.length === 0" class="empty-msg">还没有{{ currentGuide.label }}记录</div>
          <div v-for="r in recentRecords" :key="r.id" class="rec-row" @click="openDetail(r)">
            <div class="rec-info">
              <span class="rec-subtype">{{ r.subtype || r.checkin_type }}</span>
              <span class="rec-date">{{ formatDate(r.checkin_date) }}</span>
            </div>
            <span class="rec-notes">{{ r.notes || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Create form with transition -->
      <Transition name="form-enter">
        <div v-if="showForm" class="form-card">
          <div class="form-head">
            <button class="back-btn" @click="showForm = false">← 返回</button>
            <h3>新建{{ currentGuide.label }}</h3>
            <span class="step-indicator">{{ currentStep }}/{{ totalSteps }}</span>
          </div>

          <!-- Questionnaire steps -->
          <div class="form-body">
            <!-- === MEAL === -->
            <template v-if="activeTab === 'meal'">
              <div v-if="currentStep === 1" class="q-card">
                <h4 class="q-title">选择餐段</h4>
                <div class="q-options">
                  <button v-for="o in mealPeriods" :key="o.v" class="q-opt" :class="{ picked: form.meal_period === o.v }" @click="form.meal_period = o.v">{{ o.l }}</button>
                </div>
              </div>
              <div v-if="currentStep === 2" class="q-card">
                <h4 class="q-title">食物名称</h4>
                <input v-model="form.food_name" class="input" placeholder="吃了什么..." />
              </div>
              <div v-if="currentStep === 3" class="q-card">
                <h4 class="q-title">食物来源</h4>
                <div class="q-options">
                  <button v-for="o in foodSources" :key="o.v" class="q-opt" :class="{ picked: form.food_source === o.v }" @click="form.food_source = o.v">{{ o.l }}</button>
                </div>
              </div>
              <div v-if="currentStep === 4" class="q-card">
                <h4 class="q-title">热量估算</h4>
                <input v-model.number="form.calories" type="number" class="input" placeholder="大约多少 kcal" />
                <input v-model.number="form.water_ml" type="number" class="input" placeholder="饮水量 ml" style="margin-top:var(--space-2)" />
              </div>
              <div v-if="currentStep === 5" class="q-card">
                <h4 class="q-title">想记点什么？</h4>
                <textarea v-model="form.notes" class="input" rows="3" placeholder="备注（可选）" />
              </div>
            </template>

            <!-- === EXERCISE === -->
            <template v-else-if="activeTab === 'exercise'">
              <div v-if="currentStep === 1" class="q-card">
                <h4 class="q-title">运动类型</h4>
                <div class="q-options q-options--grid">
                  <button v-for="o in activityTypes" :key="o.v" class="q-opt" :class="{ picked: form.activity_type === o.v }" @click="form.activity_type = o.v">{{ o.l }}</button>
                </div>
              </div>
              <div v-if="currentStep === 2" class="q-card">
                <h4 class="q-title">时长与强度</h4>
                <div class="field-row">
                  <div class="field"><label>时长(分)</label><input v-model.number="form.duration_min" type="number" min="0" class="input" /></div>
                  <div class="field"><label>强度</label>
                    <div class="q-options" style="margin-top:var(--space-1)">
                      <button v-for="o in intensities" :key="o.v" class="q-opt q-opt--sm" :class="{ picked: form.intensity === o.v }" @click="form.intensity = o.v">{{ o.l }}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="currentStep === 3" class="q-card">
                <h4 class="q-title">消耗与距离</h4>
                <div class="field-row"><div class="field"><label>消耗(kcal)</label><input v-model.number="form.calories_burned" type="number" class="input" /></div><div class="field"><label>距离(km)</label><input v-model.number="form.distance_km" type="number" step="0.1" class="input" /></div></div>
              </div>
              <div v-if="currentStep === 4" class="q-card">
                <h4 class="q-title">想记点什么？</h4>
                <textarea v-model="form.notes" class="input" rows="3" placeholder="备注（可选）" />
              </div>
            </template>

            <!-- === SLEEP === -->
            <template v-else-if="activeTab === 'sleep'">
              <div v-if="currentStep === 1" class="q-card">
                <h4 class="q-title">睡眠类型</h4>
                <div class="q-options">
                  <button v-for="o in sleepTypes" :key="o.v" class="q-opt" :class="{ picked: form.sleep_type === o.v }" @click="form.sleep_type = o.v">{{ o.l }}</button>
                </div>
              </div>
              <div v-if="currentStep === 2" class="q-card">
                <h4 class="q-title">入睡 & 醒来</h4>
                <div class="field"><label>开始</label><input v-model="form.start_time" type="datetime-local" class="input" /></div>
                <div class="field" style="margin-top:var(--space-3)"><label>结束</label><input v-model="form.end_time" type="datetime-local" class="input" /></div>
              </div>
              <div v-if="currentStep === 3" class="q-card">
                <h4 class="q-title">睡眠质量</h4>
                <div class="q-options">
                  <button v-for="i in 5" :key="i" class="q-opt" :class="{ picked: form.quality === i }" @click="form.quality = i">{{ '⭐'.repeat(i) }}</button>
                </div>
                <div class="field" style="margin-top:var(--space-3)"><label>醒来次数</label><input v-model.number="form.wake_count" type="number" min="0" class="input" /></div>
              </div>
              <div v-if="currentStep === 4" class="q-card">
                <h4 class="q-title">梦境记录</h4>
                <textarea v-model="form.dream_notes" class="input" rows="3" placeholder="还记得做了什么梦吗..." />
              </div>
            </template>

            <!-- === DAILY === -->
            <template v-else>
              <div v-if="currentStep === 1" class="q-card">
                <h4 class="q-title">今天主要做了什么？</h4>
                <div class="q-options q-options--grid">
                  <button v-for="o in activityCats" :key="o.v" class="q-opt" :class="{ picked: form.activity_category === o.v }" @click="form.activity_category = o.v">{{ o.l }}</button>
                </div>
              </div>
              <div v-if="currentStep === 2" class="q-card">
                <h4 class="q-title">心情怎么样？</h4>
                <div class="q-options">
                  <button v-for="i in 5" :key="i" class="q-opt" :class="{ picked: form.mood === i }" @click="form.mood = i">{{ moodEmoji(i) }}</button>
                </div>
              </div>
              <div v-if="currentStep === 3" class="q-card">
                <h4 class="q-title">精力水平</h4>
                <div class="q-options">
                  <button v-for="i in 5" :key="i" class="q-opt" :class="{ picked: form.energy === i }" @click="form.energy = i">{{ '⚡'.repeat(i) }}</button>
                </div>
              </div>
              <div v-if="currentStep === 4" class="q-card">
                <h4 class="q-title">饮水量 (ml)</h4>
                <input v-model.number="form.water_ml" type="number" class="input" placeholder="今天喝了多少水" />
              </div>
              <div v-if="currentStep === 5" class="q-card">
                <h4 class="q-title">描述一下今天</h4>
                <textarea v-model="form.description" class="input" rows="3" placeholder="随便写点什么..." />
              </div>
            </template>

            <!-- Nav buttons -->
            <div class="step-nav">
              <button v-if="currentStep > 1" class="step-btn" @click="currentStep--">← 上一步</button>
              <span v-else></span>
              <button v-if="currentStep < totalSteps" class="step-btn step-btn--next" @click="currentStep++">下一步 →</button>
              <button v-else class="step-btn step-btn--save" :disabled="saving" @click="submitCheckin">{{ saving ? '保存中...' : '✓ 完成打卡' }}</button>
            </div>
            <p v-if="msg" class="form-msg" :class="msgOk ? 'msg-ok' : 'msg-err'">{{ msg }}</p>
            <div class="ai-placeholder"><span>🤖 AI 分析即将上线</span></div>
          </div>
        </div>
      </Transition>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="detailRecord" class="modal-overlay" @click.self="detailRecord = null">
          <div class="modal-sheet">
            <button class="modal-close" @click="detailRecord = null">✕</button>
            <h3>{{ typeLabel(detailRecord.checkin_type) }} 详情</h3>
            <div class="detail-grid">
              <div v-for="(v,k) in flatDetail" :key="k" class="detail-row">
                <span class="dk">{{ k }}</span><span class="dv">{{ v }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { fetchWithRefresh } from '../api/http'

const activeTab = ref<'overview'|'daily'|'meal'|'exercise'|'sleep'>('overview')
const showForm = ref(false); const currentStep = ref(1)
const saving = ref(false); const msg = ref(''); const msgOk = ref(false)
const summary = reactive({ total: 0, byType: {} as any })
const recentRecords = ref<any[]>([])
const detailRecord = ref<any>(null)

const todayStr = new Date().toISOString().split('T')[0]
const greeting = computed(() => { const h = new Date().getHours(); return h<12?'早上好 ☀️':h<18?'下午好 🌤':'晚上好 🌙' })
const tabs = [
  { id: 'daily' as const, label: '日常', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'meal' as const, label: '饮食', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>` },
  { id: 'exercise' as const, label: '运动', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
  { id: 'sleep' as const, label: '睡眠', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
]

const overviewStats = computed(() => [
  { type: 'daily', label: '日常', count: summary.byType?.daily||0, hint: '今天活动', bg: 'card-blue' },
  { type: 'meal', label: '饮食', count: summary.byType?.meal||0, hint: '今天饮食', bg: 'card-yellow' },
  { type: 'exercise', label: '运动', count: summary.byType?.exercise||0, hint: '今天运动', bg: 'card-pink' },
  { type: 'sleep', label: '睡眠', count: summary.byType?.sleep||0, hint: '今天睡眠', bg: 'card-green' },
])

const guideMeta: Record<string,any> = {
  daily: { label:'日常', title:'记录今天', desc:'学习、工作、休闲——记录你的每一天', bg:'card-blue' },
  meal: { label:'饮食', title:'吃了什么', desc:'每一餐都值得被记录', bg:'card-yellow' },
  exercise: { label:'运动', title:'动起来', desc:'跑步、游泳、瑜伽——选一个开始', bg:'card-pink' },
  sleep: { label:'睡眠', title:'好好睡觉', desc:'晚间睡眠、午觉、回笼觉', bg:'card-green' },
}
const currentGuide = computed(() => guideMeta[activeTab.value] || guideMeta.daily)

// Option pools
const mealPeriods = [{l:'早餐',v:'breakfast'},{l:'午餐',v:'lunch'},{l:'晚餐',v:'dinner'},{l:'零食',v:'snack'},{l:'夜宵',v:'late_night'},{l:'其他',v:'other'}]
const foodSources = [{l:'食堂',v:'canteen'},{l:'外卖',v:'takeout'},{l:'自制',v:'homemade'},{l:'餐厅',v:'restaurant'},{l:'其他',v:'other'}]
const activityTypes = [{l:'跑步',v:'running'},{l:'散步',v:'walking'},{l:'游泳',v:'swimming'},{l:'健身房',v:'gym'},{l:'瑜伽',v:'yoga'},{l:'骑行',v:'cycling'},{l:'篮球',v:'basketball'},{l:'足球',v:'football'},{l:'羽毛球',v:'badminton'},{l:'攀岩',v:'climbing'},{l:'其他',v:'other'}]
const intensities = [{l:'轻度',v:'light'},{l:'中度',v:'medium'},{l:'剧烈',v:'heavy'},{l:'极限',v:'extreme'}]
const sleepTypes = [{l:'晚间睡眠',v:'night'},{l:'午觉',v:'nap'},{l:'回笼觉',v:'back_sleep'},{l:'其他',v:'other'}]
const activityCats = [{l:'学习',v:'study'},{l:'工作',v:'work'},{l:'休闲',v:'leisure'},{l:'社交',v:'social'},{l:'休息',v:'rest'},{l:'家务',v:'chores'},{l:'运动',v:'exercise'},{l:'其他',v:'other'}]

const stepsMap: Record<string,number> = { daily:5, meal:5, exercise:4, sleep:4 }
const totalSteps = computed(() => stepsMap[activeTab.value] || 4)

const form = reactive<any>({
  meal_period:'breakfast', food_name:'', food_source:'canteen', calories:0, water_ml:0, notes:'',
  activity_type:'running', duration_min:0, intensity:'medium', calories_burned:0, distance_km:null,
  sleep_type:'night', start_time:'', end_time:'', quality:3, wake_count:0, dream_notes:'',
  activity_category:'study', mood:3, energy:3, description:'',
})
function resetForm() {
  Object.keys(form).forEach(k => { if (typeof form[k] === 'number') form[k] = 0; else if (typeof form[k] === 'string') form[k] = ''; })
  form.quality = 3; form.mood = 3; form.energy = 3; form.meal_period = 'breakfast'; form.food_source = 'canteen'; form.activity_type = 'running'; form.intensity = 'medium'; form.sleep_type = 'night'; form.activity_category = 'study'
}

function moodEmoji(i:number) { return ['😢','😕','😐','😊','😄'][i-1] }

async function submitCheckin() {
  saving.value = true; msg.value = ''
  const type = activeTab.value
  const details: Record<string,any> = {}
  if (type === 'meal') { details.meal_period=form.meal_period; details.food_name=form.food_name; details.food_source=form.food_source; details.calories=Number(form.calories)||0; details.protein_g=0; details.fat_g=0; details.carb_g=0; details.fiber_g=0; details.sugar_g=0; details.water_ml=Number(form.water_ml)||0 }
  else if (type === 'exercise') { details.activity_type=form.activity_type; details.duration_min=Number(form.duration_min)||0; details.intensity=form.intensity; details.calories_burned=Number(form.calories_burned)||0; details.distance_km=form.distance_km?Number(form.distance_km):null }
  else if (type === 'sleep') { details.sleep_type=form.sleep_type; details.start_time=form.start_time; details.end_time=form.end_time; details.duration_hours=0; details.quality=Number(form.quality)||3; details.wake_count=Number(form.wake_count)||0; details.dream_notes=form.dream_notes||null }
  else { details.activity_category=form.activity_category; details.mood=Number(form.mood)||null; details.energy=Number(form.energy)||null; details.description=form.description||null; details.water_ml=Number(form.water_ml)||0 }
  try {
    const res = await fetchWithRefresh('/checkin', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ checkin_type:type, subtype: subtypeFromForm(), checkin_date:todayStr, notes:form.notes||null, details })
    })
    const data = await res.json()
    if (data?.success) { msgOk.value = true; msg.value = '打卡成功!'; showForm.value = false; loadRecent(); loadSummary() }
    else throw new Error(data.message||'失败')
  } catch (err: any) { msgOk.value = false; msg.value = err.message }
  finally { saving.value = false }
}

async function loadSummary() {
  try { const r = await fetchWithRefresh('/checkin/summary', { method:'GET' }); if (r.ok) { const d = await r.json(); if (d?.success) { summary.total = d.data.total; summary.byType = d.data.byType } } } catch {}
}
async function loadRecent() {
  try { const r = await fetchWithRefresh(`/checkin?type=${activeTab.value}&limit=5`, { method:'GET' }); if (r.ok) { const d = await r.json(); if (d?.success) recentRecords.value = d.data.records||[] } } catch {}
}

function subtypeFromForm() {
  const t = activeTab.value
  if (t === 'meal') return form.meal_period
  if (t === 'exercise') return form.activity_type
  if (t === 'sleep') return form.sleep_type
  if (t === 'daily') return form.activity_category
  return null
}

async function openDetail(r: any) {
  detailRecord.value = r
  if (!r._details) {
    try {
      const res = await fetchWithRefresh(`/checkin/${r.id}`, { method:'GET' })
      if (res.ok) { const d = await res.json(); if (d?.success && d.data.details) { r._details = d.data.details } }
    } catch {}
  }
}
const flatDetail = computed(() => {
  if (!detailRecord.value) return {}
  const out: Record<string,any> = {}
  for (const [k,v] of Object.entries(detailRecord.value)) { if (!k.startsWith('_') && k !== 'id' && k !== 'user_id' && v !== null && v !== '') out[k] = v }
  if (detailRecord.value._details) for (const [k,v] of Object.entries(detailRecord.value._details)) { if (k !== 'id' && k !== 'record_id' && v !== null && v !== '') out[k] = v }
  return out
})

function typeLabel(t:string) { return ({daily:'日常',meal:'饮食',exercise:'运动',sleep:'睡眠'} as any)[t]||t }
function formatDate(d: string) { if (!d) return '-'; return new Date(d).toLocaleDateString('zh-CN', { month:'short', day:'numeric' }) }

function switchTab(id: string) { activeTab.value = id as any; showForm.value = false; currentStep.value = 1; loadRecent(); if (id === 'overview') loadSummary() }
function startCheckin() { showForm.value = true; currentStep.value = 1; resetForm() }

watch(activeTab, () => { if (activeTab.value !== 'overview') loadRecent() })
onMounted(() => { loadSummary() })
</script>

<style lang="scss" scoped>
.checkin { padding: var(--space-5) var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

// Tab row
.tab-row { display: flex; align-items: stretch; gap: var(--space-2); }
.overview-capsule { display: flex; align-items: center; gap: var(--space-1); flex-shrink: 0; padding: var(--space-2) var(--space-4); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); border-radius: var(--radius-full); border: 1px solid var(--color-border); background: var(--bg-card-white); color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); }
  &.active { background: var(--text-primary); color: var(--text-inverse); border-color: var(--text-primary); }
}
.tabs { display: flex; flex: 1; background: var(--bg-card-white); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--space-2) var(--space-1); background: transparent; border: none; color: var(--text-secondary); font-size: 10px; cursor: pointer; transition: all var(--transition-fast);
  &:hover { color: var(--text-primary); }
  &--active { color: var(--brand-blue); background: var(--bg-blue-light); font-weight: var(--font-weight-semibold); }
}
.tab-icon { display: flex; }

// Overview
.hero-card { background: var(--bg-blue-light); border-radius: var(--radius-lg); padding: var(--space-6);
  h2 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--text-primary); margin-bottom: var(--space-1); }
  p { font-size: var(--font-size-sm); color: var(--text-secondary); }
}
.overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-4); }
.ov-card { border-radius: var(--radius-lg); padding: var(--space-5); cursor: pointer; display: flex; flex-direction: column; gap: var(--space-1); transition: transform var(--transition-fast);
  &:active { transform: scale(.98); }
}
.ov-num { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--text-primary); }
.ov-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
.ov-hint { font-size: var(--font-size-xs); color: var(--text-secondary); }
.card-blue { background: var(--bg-blue-light); } .card-yellow { background: var(--bg-yellow-light); }
.card-pink { background: var(--bg-pink-light); } .card-green { background: var(--bg-green-light); }

// Section
.section { display: flex; flex-direction: column; gap: var(--space-4); }

// Guide
.guide-card { border-radius: var(--radius-lg); padding: var(--space-8) var(--space-6); text-align: center;
  h3 { margin-bottom: var(--space-2); color: var(--text-primary); font-size: var(--font-size-2xl); }
  p { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-6); }
}
.btn-start { padding: var(--space-3) var(--space-10); font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); border-radius: var(--radius-full); background: var(--text-primary); color: var(--text-inverse); border: none; cursor: pointer; transition: all var(--transition-fast);
  &:hover { transform: scale(1.04); }
  &:active { transform: scale(.98); }
}

// Recent
.recent { display: flex; flex-direction: column; gap: var(--space-2); }
.section-label { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
.empty-msg { padding: var(--space-8); text-align: center; font-size: var(--font-size-sm); color: var(--text-tertiary); }
.rec-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--bg-card-white); border-radius: var(--radius-md); cursor: pointer; transition: background var(--transition-fast);
  &:hover { background: var(--bg-blue-light); }
}
.rec-info { display: flex; flex-direction: column; gap: 2px; }
.rec-subtype { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--text-primary); }
.rec-date { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.rec-notes { font-size: var(--font-size-sm); color: var(--text-secondary); max-width: 50%; text-align: right; }

// Form transitions
.form-enter-enter-active { transition: all .3s var(--ease-out-expo); }
.form-enter-leave-active { transition: all .15s ease; }
.form-enter-enter-from { opacity: 0; transform: translateY(16px); }
.form-enter-leave-to { opacity: 0; transform: translateY(-8px); }

// Form card
.form-card { background: var(--bg-card-white); border-radius: var(--radius-xl); overflow: hidden; }
.form-head { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--color-separator);
  h3 { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); }
}
.back-btn { font-size: var(--font-size-sm); color: var(--brand-blue); font-weight: var(--font-weight-medium); cursor: pointer; border: none; background: none; }
.step-indicator { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.form-body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }

// Question card
.q-card { background: var(--bg-main); border-radius: var(--radius-lg); padding: var(--space-5); }
.q-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-4); }
.q-options { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.q-options--grid { display: grid; grid-template-columns: repeat(3, 1fr); }
.q-opt { padding: var(--space-3) var(--space-5); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); border-radius: var(--radius-lg); background: var(--bg-card-white); color: var(--text-primary); border: 1px solid var(--color-border); cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); }
  &.picked { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }
}
.q-opt--sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-xs); border-radius: var(--radius-md); }

.keep-text-btn { background: none; border: none; padding: 0; font-size: inherit; }

// Step nav
.step-nav { display: flex; justify-content: space-between; align-items: center; }
.step-btn { padding: var(--space-3) var(--space-5); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); border: none; border-radius: var(--radius-md); background: var(--bg-main); color: var(--text-primary); cursor: pointer; }
.step-btn--next, .step-btn--save { background: var(--brand-blue); color: #fff; }
.step-btn--save { background: var(--text-primary); }
.step-btn:disabled { opacity: .5; }

.form-msg { font-size: var(--font-size-xs); text-align: center; }
.msg-ok { color: var(--color-success); }
.msg-err { color: var(--color-danger); }
.ai-placeholder { padding: var(--space-3); background: var(--bg-lavender-light); border-radius: var(--radius-md); text-align: center; font-size: var(--font-size-xs); color: var(--text-secondary); }

// Field / input
.field { display: flex; flex-direction: column; gap: var(--space-1);
  label { font-size: var(--font-size-xs); color: var(--text-secondary); font-weight: var(--font-weight-medium); }
}
.field-row { display: flex; gap: var(--space-3); .field { flex: 1; } }
.input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--bg-card-white); color: var(--text-primary); font-size: var(--font-size-base);
  &:focus { border-color: var(--brand-blue); outline: none; }
}

// Modal
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 2000; display: flex; align-items: flex-end; justify-content: center;
  @media(min-width:768px) { align-items: center; }
}
.modal-sheet { background: var(--bg-card-white); border-radius: var(--radius-2xl) var(--radius-2xl) 0 0; padding: var(--space-6); width: 100%; max-width: 480px; max-height: 65dvh; overflow-y: auto; position: relative;
  @media(min-width:768px) { border-radius: var(--radius-xl); }
  h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-4); }
}
.modal-close { position: absolute; top: var(--space-4); right: var(--space-4); width: 32px; height: 32px; border-radius: var(--radius-full); border: none; background: var(--bg-main); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text-primary); }
.detail-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-separator); font-size: var(--font-size-sm);
  &:last-child { border-bottom: none; }
}
.dk { color: var(--text-secondary); }
.dv { color: var(--text-primary); max-width: 60%; text-align: right; word-break: break-all; }

// Modal transition
.modal-fade-enter-active { transition: all .25s var(--ease-out-expo);
  .modal-sheet { transition: transform .25s var(--ease-out-expo); }
}
.modal-fade-leave-active { transition: all .2s ease;
  .modal-sheet { transition: transform .2s ease; }
}
.modal-fade-enter-from { opacity: 0; .modal-sheet { transform: translateY(100%); } }
.modal-fade-leave-to { opacity: 0; .modal-sheet { transform: translateY(100%); } }
@media(min-width:768px) {
  .modal-fade-enter-from .modal-sheet { transform: translateY(20px) scale(.96); }
  .modal-fade-leave-to .modal-sheet { transform: translateY(20px) scale(.96); }
}
</style>
