<template>
  <div class="n404">
    <svg class="n404-art" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 草地 -->
      <ellipse cx="160" cy="200" rx="140" ry="16" fill="#E1EDF5" opacity=".6"/>
      <!-- 鸟巢基底 -->
      <ellipse cx="160" cy="175" rx="48" ry="8" fill="#C8B090" opacity=".5"/>
      <!-- 巢：交错的树枝 -->
      <path d="M112 175 Q135 160 160 158 Q185 160 208 175" stroke="#A08060" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M115 177 Q140 164 160 162 Q180 164 205 177" stroke="#B89070" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M118 179 Q145 168 160 166 Q175 168 202 179" stroke="#A08060" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
      <!-- 巢内衬 -->
      <ellipse cx="160" cy="168" rx="38" ry="12" fill="#D4C0A0"/>
      <ellipse cx="160" cy="166" rx="35" ry="9" fill="#E0D0B8"/>
      <!-- 蛋1：有一条小裂痕 -->
      <ellipse cx="148" cy="162" rx="11" ry="14" fill="#F8F4EC" stroke="#D8CCC0" stroke-width=".7"/>
      <path d="M144 157 L146 154 L148 155" stroke="#C8B8A8" stroke-width=".7" stroke-linecap="round" fill="none"/>
      <!-- 蛋2：完好圆润 -->
      <ellipse cx="172" cy="160" rx="10.5" ry="13" fill="#F8F4EC" stroke="#D8CCC0" stroke-width=".7"/>
      <!-- ❓ -->
      <text x="188" y="152" font-size="14" fill="#6A9AB8" font-weight="700" opacity=".6">?</text>
      <!-- 散落的干草 -->
      <line x1="128" y1="182" x2="122" y2="176" stroke="#A0B878" stroke-width=".8" opacity=".5"/>
      <line x1="195" y1="180" x2="202" y2="174" stroke="#A0B878" stroke-width=".8" opacity=".4"/>
      <line x1="150" y1="184" x2="148" y2="178" stroke="#B0C088" stroke-width=".6" opacity=".35"/>
      <!-- 小脚印 -->
      <ellipse cx="100" cy="202" rx="4" ry="3" fill="#D0C4B8" opacity=".35"/>
      <ellipse cx="88" cy="203" rx="3.5" ry="2.5" fill="#D0C4B8" opacity=".25"/>
      <ellipse cx="77" cy="202" rx="3" ry="2" fill="#D0C4B8" opacity=".15"/>
    </svg>

    <h1 class="n404-num">4<span class="egg-wiggle" @click="handleEggClick">🥚</span>4</h1>
    <p class="n404-msg">这颗蛋还没孵出来…</p>
    <p class="n404-sub">或者——这个蛋永远不会孵化(你进错页面了)</p>

    <div class="n404-actions">
      <router-link to="/home" class="n404-btn n404-btn--primary">← 回主页</router-link>
      <button class="n404-btn" @click="$router.back()">← 上一步</button>
    </div>
  </div>
</template>

<script setup lang="ts">
let egg_click_count = 0;

function handleEggClick() {
  // 处理蛋的点击事件
  egg_click_count++;
  if (egg_click_count > 20) {
    alert(`你都把蛋摸坏了，他现在已经孵化不出来小鸡🐥了，再摸我就要打110了🤯，这是我的第${egg_click_count-20}次警告！`);
  } else if (egg_click_count == 20) {
    alert(`你整整摸了${egg_click_count}次蛋！它被你摸坏了！`);
  } else {
    alert(`你已经摸了${egg_click_count}次蛋，不过它还是没孵出来~`);
  }
  // TODO: 添加更多交互逻辑，比如来一个蛋打开有一句话（一言接口）或者什么别的动画之类的
}

</script>

<style lang="scss" scoped>
.n404 {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: calc(100dvh - var(--topbar-height) - var(--bottombar-height));
  padding: var(--space-8) var(--space-6); text-align: center;
}
.n404-art { width: 100%; max-width: 320px; margin-bottom: var(--space-6); }
.n404-num {
  font-family: var(--font-display); font-size: 64px; font-weight: var(--font-weight-bold);
  color: var(--text-primary); letter-spacing: 4px; margin-bottom: var(--space-3);
}
.egg-wiggle {
  display: inline-block; animation: eggRock 2.5s ease-in-out infinite;
}
.n404-msg {
  font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);
  color: var(--text-primary); margin-bottom: var(--space-1);
}
.n404-sub {
  font-size: var(--font-size-sm); color: var(--text-secondary);
  margin-bottom: var(--space-8); max-width: 300px;
}
.n404-actions {
  display: flex; gap: var(--space-3);
}
.n404-btn {
  padding: var(--space-3) var(--space-6); font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold); color: var(--text-primary);
  background: var(--bg-main); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); cursor: pointer; text-decoration: none;
  transition: all var(--transition-fast);
  &:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
  &--primary { background: var(--text-primary); color: var(--text-inverse); border-color: var(--text-primary);
    &:hover { background: var(--brand-blue); border-color: var(--brand-blue); }
  }
}
@keyframes eggRock {
  0%, 100% { transform: rotate(0deg) scale(1); }
  15% { transform: rotate(6deg) scale(1.05); }
  30% { transform: rotate(-5deg) scale(.98); }
  45% { transform: rotate(3deg) scale(1.03); }
  60% { transform: rotate(0deg) scale(1); }
}
</style>
