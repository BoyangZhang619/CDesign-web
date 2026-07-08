<template>
  <div class="explore container-md">
    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <input v-model="searchQuery" type="text" placeholder="搜索功能..." class="search-input" />
    </div>

    <!-- Filtered results (when searching) -->
    <div v-if="searchQuery" class="search-results">
      <router-link v-for="item in filteredItems" :key="item.path" :to="item.path" class="search-item">
        <span class="search-item__icon" v-html="item.icon"></span>
        <div>
          <span class="search-item__title">{{ item.label }}</span>
          <span class="search-item__desc">{{ item.desc }}</span>
        </div>
      </router-link>
      <p v-if="filteredItems.length === 0" class="empty">无匹配结果</p>
    </div>

    <!-- Quick Navigation Grid -->
    <template v-if="!searchQuery">
      <section class="section">
        <h3 class="section-title">健康管理</h3>
        <div class="nav-grid">
          <router-link v-for="item in healthItems" :key="item.path" :to="item.path" class="nav-card">
            <span class="nav-card__icon" :style="{ color: item.color }" v-html="item.icon"></span>
            <span class="nav-card__label">{{ item.label }}</span>
            <span class="nav-card__desc">{{ item.desc }}</span>
          </router-link>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">数据与工具</h3>
        <div class="nav-grid">
          <router-link v-for="item in toolItems" :key="item.path" :to="item.path" class="nav-card">
            <span class="nav-card__icon" :style="{ color: item.color }" v-html="item.icon"></span>
            <span class="nav-card__label">{{ item.label }}</span>
            <span class="nav-card__desc">{{ item.desc }}</span>
          </router-link>
        </div>
      </section>

      <!-- Daily Tip -->
      <div class="tip-card">
        <span class="tip-emoji">💡</span>
        <div>
          <p class="tip-title">每日健康贴士</p>
          <p class="tip-text">{{ dailyTip }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')

interface NavItem {
  label: string
  desc: string
  path: string
  color: string
  icon: string
}

const healthItems: NavItem[] = [
  {
    label: '每日打卡',
    desc: '记录饮食、运动、睡眠',
    path: '/checkin',
    color: '#0095F6',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    label: 'AI 健康助手',
    desc: '智能问答与建议',
    path: '/ai-chat',
    color: '#833AB4',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>`,
  },
  {
    label: 'TodoList',
    desc: '管理待办与任务',
    path: '/todolist',
    color: '#F58529',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
]

const toolItems: NavItem[] = [
  {
    label: '健康画像',
    desc: '多维健康评分雷达',
    path: '/analysis/portrait',
    color: '#DD2A7B',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
  },
  {
    label: '趋势分析',
    desc: '长期数据变化图表',
    path: '/analysis/trends',
    color: '#78C850',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`,
  },
  {
    label: '历史记录',
    desc: '查看过往健康数据',
    path: '/history',
    color: '#F77737',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
]

const allItems = [...healthItems, ...toolItems]

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return []
  return allItems.filter(
    i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
  )
})

// Rotate through a few tips
const tips = [
  '每天步行 8000 步可以显著降低心血管疾病风险。',
  '保持 7-8 小时的睡眠有助于身体恢复和免疫力提升。',
  '每餐摄入足量蔬菜，深色蔬菜营养价值更高。',
  '饭后散步 15 分钟有助于消化和控制血糖波动。',
  '每天饮水 1.5-2L，运动后需额外补充。',
  '每周至少 150 分钟中等强度运动，分散到 3-5 天完成。',
]
const dailyTip = tips[new Date().getDate() % tips.length]
</script>

<style lang="scss" scoped>
.explore {
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

// ── Search ──────────────────────────────────────────────────
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-slow);
}

.search-icon {
  color: var(--color-text-secondary);
  display: flex;
}

.search-input {
  flex: 1;
  padding: var(--space-2) 0;
  border: none;
  background: none;
  font-size: var(--font-size-base);
  color: var(--color-text);

  &::placeholder { color: var(--color-text-tertiary); }
}

// ── Search Results ──────────────────────────────────────────
.search-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.search-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);

  &:hover { background: var(--color-bg-tertiary); }
}

.search-item__icon { display: flex; color: var(--color-text-secondary); }
.search-item__title { display: block; font-size: var(--font-size-base); font-weight: var(--font-weight-medium); }
.search-item__desc { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }

.empty {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

// ── Section ─────────────────────────────────────────────────
.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
}

// ── Nav Grid ────────────────────────────────────────────────
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  text-align: center;
  transition: all var(--transition-fast);

  &:hover { background: var(--color-bg-secondary); }
  &:active { transform: scale(0.97); }
}

.nav-card__icon { display: flex; }
.nav-card__label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); }
.nav-card__desc { font-size: 11px; color: var(--color-text-secondary); }

@media (max-width: 480px) {
  .nav-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
  .nav-card { padding: var(--space-4) var(--space-2); }
  .nav-card__desc { display: none; }
}

// ── Tip Card ────────────────────────────────────────────────
.tip-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-accent-light);
  border-radius: var(--radius-lg);
}

.tip-emoji { font-size: 24px; line-height: 1; }

.tip-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  margin-bottom: var(--space-1);
}

.tip-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}
</style>
