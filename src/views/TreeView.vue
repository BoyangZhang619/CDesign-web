<template>
  <div class="tree-page">
    <!-- Header -->
    <div class="tree-header">
      <h2 class="tree-title display-text">生命之树</h2>
      <p class="tree-sub">你的每一次打卡，都在滋养它</p>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="tree-loading">🌱 正在生长...</div>

    <!-- Tree SVG -->
    <div v-else class="tree-stage">
      <svg viewBox="0 0 400 480" class="tree-svg">
        <!-- 季节背景 -->
        <defs>
          <radialGradient :id="'sky'" cx="50%" cy="20%" r="60%">
            <stop offset="0%" :stop-color="skyTop"/>
            <stop offset="100%" :stop-color="skyBottom"/>
          </radialGradient>
          <radialGradient id="sun" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="white" stop-opacity=".25"/>
            <stop offset="100%" stop-color="white" stop-opacity="0"/>
          </radialGradient>
          <filter id="softShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2"/>
            <feComponentTransfer><feFuncA type="linear" slope=".1"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- 天空 -->
        <rect width="400" height="480" fill="url(#sky)"/>
        <!-- 柔光 -->
        <ellipse cx="200" cy="120" rx="180" ry="120" fill="url(#sun)"/>

        <!-- === 地面 === -->
        <ellipse cx="200" cy="420" rx="180" ry="40" fill="#D4C9B8" opacity=".4"/>
        <ellipse cx="200" cy="415" rx="160" ry="30" :fill="groundColor" opacity=".6"/>
        <ellipse cx="200" cy="412" rx="130" ry="20" fill="#8B9A7F" opacity=".35"/>

        <!-- === 根系 === -->
        <g :style="{ transition: 'all 1.2s ease', transform: `scaleY(${0.3 + tree.rootDepth * 0.7})`, transformOrigin: '200px 400px' }">
          <path d="M200 400 Q180 430 140 460" stroke="#8B7355" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M200 400 Q240 435 280 455" stroke="#8B7355" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M200 400 Q170 440 120 450" stroke="#8B7355" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
          <path d="M200 400 Q250 440 300 445" stroke="#8B7355" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
          <path d="M200 400 Q200 430 200 465" stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>

        <!-- === 树干 === -->
        <path
          d="M200 400 Q195 320 190 250 Q185 200 195 150 L190 140 Q198 130 200 120 Q202 130 210 140 L205 150 Q215 200 210 250 Q205 320 200 400"
          fill="#8B7355"
          :style="{
            transition: 'all 1.2s ease',
            transform: `scaleX(${tree.trunkWidth})`,
            transformOrigin: '200px 400px',
          }"
        />
        <!-- 树干纹理 -->
        <path d="M198 380 Q196 320 198 250 Q200 180 198 140" stroke="#7A6548" stroke-width="1" fill="none" opacity=".4"
          :style="{ transition: 'all 1.2s ease', transform: `scaleX(${tree.trunkWidth})`, transformOrigin: '200px 400px' }"/>
        <path d="M203 370 Q204 300 202 230 Q200 170 203 145" stroke="#7A6548" stroke-width=".8" fill="none" opacity=".3"
          :style="{ transition: 'all 1.2s ease', transform: `scaleX(${tree.trunkWidth})`, transformOrigin: '200px 400px' }"/>

        <!-- === 树枝 === -->
        <g :style="{ transition: 'all 1.2s ease', transform: `scale(${0.5 + tree.trunkWidth * 0.5})`, transformOrigin: '200px 200px' }">
          <!-- 主树枝 -->
          <path d="M195 160 Q160 120 120 80" stroke="#8B7355" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M205 150 Q240 110 280 75" stroke="#8B7355" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M198 140 Q175 100 170 55" stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M202 135 Q225 95 235 50" stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M200 130 Q190 90 195 40" stroke="#8B7355" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <!-- 细枝 -->
          <path d="M120 80 Q100 65 85 50" stroke="#8B7355" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M280 75 Q300 60 315 48" stroke="#8B7355" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M170 55 Q155 40 148 30" stroke="#8B7355" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path d="M235 50 Q250 38 260 28" stroke="#8B7355" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path d="M120 80 Q130 65 140 55" stroke="#8B7355" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path d="M280 75 Q265 60 255 50" stroke="#8B7355" stroke-width="1" fill="none" stroke-linecap="round"/>
        </g>

        <!-- === 叶子（循环生成）=== -->
        <g v-for="i in tree.leafCount" :key="'l'+i">
          <ellipse
            :cx="leafPositions[i % leafPositions.length]?.x"
            :cy="leafPositions[i % leafPositions.length]?.y"
            :rx="4 + Math.random() * 3"
            :ry="6 + Math.random() * 4"
            :fill="`hsl(${tree.leafHue + (Math.random()-0.5)*30}, 50%, ${40 + Math.random()*20}%)`"
            :transform="`rotate(${(Math.random()-0.5)*40} ${leafPositions[i % leafPositions.length]?.x} ${leafPositions[i % leafPositions.length]?.y})`"
            opacity=".85"
            filter="url(#softShadow)"
          />
        </g>

        <!-- === 花朵 === -->
        <g v-for="f in tree.flowerCount" :key="'fl'+f">
          <circle :cx="flowerPos[f-1]?.x" :cy="flowerPos[f-1]?.y" r="4" fill="#F5A0B5" opacity=".8"/>
          <circle :cx="flowerPos[f-1]?.x" :cy="flowerPos[f-1]?.y" r="2" fill="#FCD5DF"/>
          <circle :cx="flowerPos[f-1]?.x! + 3" :cy="flowerPos[f-1]?.y! - 2" r="1.2" fill="#F5A0B5" opacity=".6"/>
        </g>

        <!-- === 鸟巢 === -->
        <g v-if="tree.hasNest" style="transition: opacity .8s">
          <ellipse cx="268" cy="62" rx="14" ry="6" fill="#8B7355" opacity=".7"/>
          <path d="M254 60 Q268 48 282 60" stroke="#6B5535" stroke-width="1.5" fill="none"/>
          <path d="M256 62 Q268 52 280 62" stroke="#6B5535" stroke-width="1" fill="none"/>
          <!-- 蛋 -->
          <ellipse v-if="tree.hasEggs" cx="265" cy="58" rx="3" ry="4" fill="#E8F0F8" stroke="#C8D8E8" stroke-width=".5"/>
          <ellipse v-if="tree.hasEggs" cx="272" cy="57" rx="3" ry="4" fill="#E8F0F8" stroke="#C8D8E8" stroke-width=".5"/>
        </g>

        <!-- === 飘落花瓣 === -->
        <g v-for="p in tree.petalCount" :key="'p'+p">
          <ellipse
            :cx="80 + p * 28" :cy="120 + p * 15"
            rx="3" ry="2" fill="#F5A0B5" opacity=".5"
            :style="{ animation: `fall ${3 + p * 0.5}s ease-in-out ${p * 0.3}s infinite` }"
          />
        </g>

        <!-- === 底部铭文 === -->
        <text x="200" y="455" text-anchor="middle" font-size="10" fill="#8B9A7F" opacity=".6">
          连续打卡 {{ tree.streak }} 天 · 健康分 {{ tree.healthScore }}
        </text>
      </svg>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && tree.streak === 0" class="tree-empty">
      <p>还没有数据，去打卡让树长起来吧 🌱</p>
      <router-link to="/checkin" class="tree-go-btn">去打卡</router-link>
    </div>

    <!-- === 调试面板（访问 /tree?debug 即可见）=== -->
    <div v-if="isDebug" class="debug-panel">
      <div class="debug-head">
        <span>🔧 状态预览</span>
        <button @click="randomize" class="debug-btn">🎲 随机</button>
        <button @click="resetDebug" class="debug-btn">🔄 重置</button>
      </div>
      <div class="debug-grid">
        <label><span>打卡天数 streak</span>
          <input type="range" min="0" max="100" v-model.number="tree.streak" @input="onDebugChange"/> {{ tree.streak }}</label>
        <label><span>健康分 healthScore</span>
          <input type="range" min="0" max="100" v-model.number="tree.healthScore" @input="onDebugChange"/> {{ tree.healthScore }}</label>
        <label><span>运动分 exerciseScore</span>
          <input type="range" min="0" max="100" v-model.number="tree.exerciseScore" @input="onDebugChange"/> {{ tree.exerciseScore }}</label>
        <label><span>饮食分 mealScore</span>
          <input type="range" min="0" max="100" v-model.number="tree.mealScore" @input="onDebugChange"/> {{ tree.mealScore }}</label>
        <label><span>睡眠分 sleepScore</span>
          <input type="range" min="0" max="100" v-model.number="tree.sleepScore" @input="onDebugChange"/> {{ tree.sleepScore }}</label>
        <label><span>心情 mood</span>
          <input type="range" min="1" max="5" v-model.number="tree.mood" @input="onDebugChange"/> {{ tree.mood }}</label>
        <label><span>叶子 leafCount</span>
          <input type="range" min="0" max="100" v-model.number="tree.leafCount" @input="onDebugChange"/> {{ tree.leafCount }}</label>
        <label><span>色相 leafHue</span>
          <input type="range" min="20" max="140" v-model.number="tree.leafHue" @input="onDebugChange"/> {{ tree.leafHue }}</label>
        <label><span>树干 trunkWidth</span>
          <input type="range" min="0.4" max="1.6" step="0.05" v-model.number="tree.trunkWidth" @input="onDebugChange"/> {{ tree.trunkWidth }}</label>
        <label><span>根系 rootDepth</span>
          <input type="range" min="0" max="1" step="0.05" v-model.number="tree.rootDepth" @input="onDebugChange"/> {{ tree.rootDepth }}</label>
        <label><span>花朵 flowerCount</span>
          <input type="range" min="0" max="8" v-model.number="tree.flowerCount" @input="onDebugChange"/> {{ tree.flowerCount }}</label>
        <label><span>花瓣 petalCount</span>
          <input type="range" min="0" max="10" v-model.number="tree.petalCount" @input="onDebugChange"/> {{ tree.petalCount }}</label>
        <label class="debug-check"><input type="checkbox" v-model="tree.hasNest" @change="onDebugChange"/> 鸟巢</label>
        <label class="debug-check"><input type="checkbox" v-model="tree.hasEggs" @change="onDebugChange"/> 蛋</label>
        <label><span>季节 season</span>
          <select v-model="tree.season" @change="onDebugChange">
            <option value="spring">春</option><option value="summer">夏</option>
            <option value="autumn">秋</option><option value="winter">冬</option>
          </select></label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useTreeSymbol } from '../composables/useTreeSymbol'

const { tree, loading, loadTreeData } = useTreeSymbol()

// ── 调试模式 ──
const route = useRoute()
const isDebug = route.query.debug !== undefined

function onDebugChange() {
  // 直接操作 tree 对象，响应式自动更新 SVG
}

function randomize() {
  tree.value.streak = rand(0, 100)
  tree.value.healthScore = rand(0, 100)
  tree.value.exerciseScore = rand(0, 100)
  tree.value.mealScore = rand(0, 100)
  tree.value.sleepScore = rand(0, 100)
  tree.value.mood = rand(1, 5)
  tree.value.leafCount = rand(0, 100)
  tree.value.leafHue = rand(30, 120)
  tree.value.trunkWidth = Math.round(rand(40, 160)) / 100
  tree.value.rootDepth = Math.round(rand(10, 100)) / 100
  tree.value.flowerCount = rand(0, 8)
  tree.value.petalCount = rand(0, 10)
  tree.value.hasNest = Math.random() > 0.5
  tree.value.hasEggs = tree.value.hasNest && Math.random() > 0.5
  tree.value.season = ['spring','summer','autumn','winter'][rand(0, 3)] as any
}

function resetDebug() {
  tree.value.streak = 5
  tree.value.healthScore = 50
  tree.value.exerciseScore = 50
  tree.value.mealScore = 50
  tree.value.sleepScore = 50
  tree.value.mood = 3
  tree.value.leafCount = 30
  tree.value.leafHue = 80
  tree.value.trunkWidth = 1
  tree.value.rootDepth = 0.5
  tree.value.flowerCount = 3
  tree.value.petalCount = 0
  tree.value.hasNest = false
  tree.value.hasEggs = false
  tree.value.season = 'spring'
}

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

// 叶子位置库（树枝末端的散布点）
const leafPositions = reactive(
  Array.from({ length: 50 }, (_, i) => {
    const angles = [
      { x: 115, y: 70 }, { x: 95, y: 58 }, { x: 85, y: 48 }, { x: 78, y: 38 },
      { x: 285, y: 65 }, { x: 300, y: 53 }, { x: 312, y: 45 }, { x: 320, y: 35 },
      { x: 155, y: 42 }, { x: 140, y: 33 }, { x: 148, y: 28 }, { x: 170, y: 55 },
      { x: 248, y: 45 }, { x: 255, y: 35 }, { x: 248, y: 28 }, { x: 240, y: 52 },
      { x: 190, y: 32 }, { x: 185, y: 25 }, { x: 200, y: 30 }, { x: 210, y: 35 },
      { x: 130, y: 65 }, { x: 108, y: 58 }, { x: 270, y: 58 }, { x: 290, y: 52 },
      { x: 160, y: 50 }, { x: 150, y: 40 }, { x: 175, y: 48 }, { x: 225, y: 40 },
      { x: 245, y: 55 }, { x: 260, y: 40 }, { x: 135, y: 48 }, { x: 98, y: 50 },
      { x: 195, y: 38 }, { x: 205, y: 28 }, { x: 215, y: 32 }, { x: 182, y: 35 },
      { x: 305, y: 50 }, { x: 295, y: 42 }, { x: 128, y: 42 }, { x: 268, y: 38 },
      { x: 155, y: 35 }, { x: 178, y: 42 }, { x: 220, y: 38 }, { x: 238, y: 42 },
      { x: 218, y: 28 }, { x: 192, y: 42 }, { x: 258, y: 48 }, { x: 142, y: 52 },
      { x: 265, y: 35 }, { x: 310, y: 38 },
    ]
    return angles[i % angles.length]
  })
)

/** 花朵位置（8个预定义位置） */
const flowerPos = [
  { x: 118, y: 72 }, { x: 282, y: 68 }, { x: 168, y: 50 },
  { x: 238, y: 46 }, { x: 143, y: 38 }, { x: 252, y: 35 },
  { x: 192, y: 30 }, { x: 210, y: 28 },
]

/** 季节色 */
import { computed } from 'vue'
const skyTop = computed(() => ({ spring: '#D4E8D4', summer: '#C8E0F0', autumn: '#E8DCC8', winter: '#E0E4E8' }[tree.value.season]))
const skyBottom = computed(() => ({ spring: '#E8F0E0', summer: '#E0ECF4', autumn: '#F0E8D8', winter: '#EEF0F4' }[tree.value.season]))
const groundColor = computed(() => ({ spring: '#B8C8A8', summer: '#A0B898', autumn: '#C8B898', winter: '#C0C4C8' }[tree.value.season]))

onMounted(() => loadTreeData())
</script>

<style lang="scss" scoped>
.tree-page {
  padding: var(--space-5) var(--space-4);
  display: flex; flex-direction: column; align-items: center;
  min-height: 100%;
}
.tree-header {
  text-align: center; margin-bottom: var(--space-2);
  h2 { font-size: var(--font-size-xl); color: var(--text-primary); }
  p { font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: var(--space-1); }
}
.tree-loading {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-lg); color: var(--text-secondary);
}
.tree-stage {
  flex: 1; width: 100%; max-width: 400px;
  display: flex; align-items: center; justify-content: center;
}
.tree-svg {
  width: 100%; max-height: 60vh;
}
.tree-empty {
  text-align: center; padding: var(--space-6);
  p { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-4); }
}
.tree-go-btn {
  display: inline-block; padding: var(--space-3) var(--space-8);
  font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
  color: #fff; background: var(--text-primary);
  border-radius: var(--radius-full); text-decoration: none;
  transition: transform var(--transition-fast);
  &:active { transform: scale(.96); }
}
@keyframes fall {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: .5; }
  50% { transform: translateY(40px) rotate(180deg); opacity: .2; }
}

// ── 调试面板 ──
.debug-panel {
  width: 100%; max-width: 400px; margin-top: var(--space-4);
  background: var(--bg-card-white); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-4);
  font-size: var(--font-size-xs);
}
.debug-head {
  display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);
  font-weight: var(--font-weight-semibold); color: var(--text-primary);
}
.debug-btn {
  padding: var(--space-1) var(--space-3); font-size: var(--font-size-xs);
  border: 1px solid var(--color-border); border-radius: var(--radius-full);
  background: var(--bg-main); color: var(--text-secondary); cursor: pointer;
  &:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
}
.debug-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2) var(--space-3);
  label { display: flex; align-items: center; gap: var(--space-1); color: var(--text-secondary);
    input[type=range] { flex: 1; accent-color: var(--brand-blue); width: 60px; }
    select { font-size: var(--font-size-xs); }
  }
}
.debug-check { cursor: pointer; }
</style>
