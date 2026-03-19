<template>
  <div class="page">
    <AppHeader />

    <main class="content">
      <!-- 页面标题区 -->
      <div class="header-section">
        <h1 class="main-title">健康数字孪生系统</h1>
        <p class="subtitle">以数据驱动个性化健康管理，构建您的专属数字模型</p>
      </div>

      <!-- 核心功能区 -->
      <section class="features-section">
        <div class="section-label">核心功能</div>
        
        <div class="feature-grid">
          <!-- 个人基础信息 -->
          <router-link to="/profile/basic-info" class="feature-card">
            <div class="card-icon">👤</div>
            <h3 class="card-title">个人基础信息</h3>
            <p class="card-description">配置健康模型初始参数，采集身体与目标数据</p>
            <div class="card-badge">初始化</div>
          </router-link>

          <!-- 健康打卡 -->
          <router-link to="/health/daily-checkin" class="feature-card">
            <div class="card-icon">📝</div>
            <h3 class="card-title">健康打卡</h3>
            <p class="card-description">记录每日饮食、运动、体重、睡眠等实时数据</p>
            <div class="card-badge">数据采集</div>
          </router-link>

          <!-- 历史记录 -->
          <router-link to="/health/history" class="feature-card">
            <div class="card-icon">📊</div>
            <h3 class="card-title">历史记录</h3>
            <p class="card-description">查询历史打卡详情，按类型和时间筛选</p>
            <div class="card-badge">数据回溯</div>
          </router-link>

          <!-- 健康画像 -->
          <router-link to="/analysis/portrait" class="feature-card">
            <div class="card-icon">🎨</div>
            <h3 class="card-title">健康画像</h3>
            <p class="card-description">查看数字孪生模型，展示多维健康指标</p>
            <div class="card-badge">模型展示</div>
          </router-link>

          <!-- 趋势分析 -->
          <router-link to="/analysis/trends" class="feature-card">
            <div class="card-icon">📈</div>
            <h3 class="card-title">趋势分析</h3>
            <p class="card-description">分析体重、摄入、运动等指标的变化趋势</p>
            <div class="card-badge">演化过程</div>
          </router-link>

          <!-- 未来预测 -->
          <router-link to="/analysis/forecast" class="feature-card">
            <div class="card-icon">🔮</div>
            <h3 class="card-title">未来预测</h3>
            <p class="card-description">预测体重与健康评分变化，识别潜在风险</p>
            <div class="card-badge">预测能力</div>
          </router-link>

          <!-- 情景模拟 -->
          <router-link to="/analysis/simulation" class="feature-card">
            <div class="card-icon">🧪</div>
            <h3 class="card-title">情景模拟</h3>
            <p class="card-description">调整变量查看不同生活方式的健康结果</p>
            <div class="card-badge">可实验性</div>
          </router-link>

          <!-- 个性化建议 -->
          <router-link to="/recommendations" class="feature-card">
            <div class="card-icon">💡</div>
            <h3 class="card-title">个性化建议</h3>
            <p class="card-description">获取基于分析的饮食、运动、作息建议</p>
            <div class="card-badge">干预指导</div>
          </router-link>

          <!-- 健康目标 -->
          <router-link to="/goals" class="feature-card">
            <div class="card-icon">🎯</div>
            <h3 class="card-title">健康目标</h3>
            <p class="card-description">设定和跟踪健康目标，展示完成进度</p>
            <div class="card-badge">目标导向</div>
          </router-link>

          <!-- 校园饮食推荐 -->
          <router-link to="/recommendations/campus-diet" class="feature-card">
            <div class="card-icon">🍽️</div>
            <h3 class="card-title">校园饮食推荐</h3>
            <p class="card-description">提供食堂搭配、外卖选择和宿舍方案</p>
            <div class="card-badge">落地方案</div>
          </router-link>

          <!-- 消息与提醒 -->
          <router-link to="/notifications" class="feature-card">
            <div class="card-icon">🔔</div>
            <h3 class="card-title">消息与提醒</h3>
            <p class="card-description">打卡提醒、健康警告和周期性总结推送</p>
            <div class="card-badge">行为引导</div>
          </router-link>

          <!-- AI 对话 -->
          <router-link to="/ai-chat" class="feature-card">
            <div class="card-icon">🤖</div>
            <h3 class="card-title">AI 对话</h3>
            <p class="card-description">与AI助手交互获取个性化健康咨询</p>
            <div class="card-badge">智能助手</div>
          </router-link>
        </div>
      </section>

      <!-- 快速开始 -->
      <section class="quick-start">
        <div class="section-label">快速开始</div>
        <div class="quick-start-cards">
          <div class="quick-card">
            <span class="step">1</span>
            <h4>完成基础信息</h4>
            <p>设置初始健康参数</p>
          </div>
          <div class="quick-card">
            <span class="step">2</span>
            <h4>开始每日打卡</h4>
            <p>持续记录健康数据</p>
          </div>
          <div class="quick-card">
            <span class="step">3</span>
            <h4>查看健康画像</h4>
            <p>了解您的数字孪生</p>
          </div>
          <div class="quick-card">
            <span class="step">4</span>
            <h4>获取个性化建议</h4>
            <p>执行健康行动方案</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// 加载用户信息
async function loadUserInfo() {
  try {
    await authStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 初始化
loadUserInfo()
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafaf9 0%, #f5f4f0 100%);
}

.content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* =============== 标题区 =============== */
.header-section {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-title {
  margin: 0;
  font-size: 40px;
  font-weight: 400;
  color: #2d2d2a;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #6f6f6a;
  font-weight: 300;
  letter-spacing: 0px;
}

/* =============== 分类标签 =============== */
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #d8a88f;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

/* =============== 功能网格 =============== */
.features-section {
  margin-bottom: 80px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  background: white;
  border: 1px solid #f0ebe5;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  animation: cardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  border-color: #d8a88f;
  box-shadow: 0 12px 32px rgba(216, 168, 143, 0.15);
  transform: translateY(-4px);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(216, 168, 143, 0.05) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.feature-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #2d2d2a;
  letter-spacing: -0.3px;
}

.card-description {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #6f6f6a;
  line-height: 1.6;
  flex: 1;
}

.card-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(216, 168, 143, 0.1);
  color: #d8a88f;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* =============== 快速开始 =============== */
.quick-start {
  margin-top: 60px;
}

.quick-start-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.quick-card {
  padding: 28px;
  background: white;
  border: 1px solid #f0ebe5;
  border-radius: 12px;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.quick-card:hover {
  border-color: #d8a88f;
  box-shadow: 0 8px 24px rgba(216, 168, 143, 0.12);
  transform: translateY(-2px);
}

.step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #d8a88f, #d09680);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 18px;
}

.quick-card h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 500;
  color: #2d2d2a;
}

.quick-card p {
  margin: 0;
  font-size: 12px;
  color: #6f6f6a;
}

/* =============== 动画 =============== */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:nth-child(1) { animation-delay: 0.05s; }
.feature-card:nth-child(2) { animation-delay: 0.1s; }
.feature-card:nth-child(3) { animation-delay: 0.15s; }
.feature-card:nth-child(4) { animation-delay: 0.2s; }
.feature-card:nth-child(5) { animation-delay: 0.25s; }
.feature-card:nth-child(6) { animation-delay: 0.3s; }
.feature-card:nth-child(7) { animation-delay: 0.35s; }
.feature-card:nth-child(8) { animation-delay: 0.4s; }
.feature-card:nth-child(9) { animation-delay: 0.45s; }
.feature-card:nth-child(10) { animation-delay: 0.5s; }
.feature-card:nth-child(11) { animation-delay: 0.55s; }
.feature-card:nth-child(12) { animation-delay: 0.6s; }

/* =============== 响应式 =============== */
@media (max-width: 768px) {
  .main-title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 14px;
  }

  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .feature-card {
    padding: 20px;
  }

  .quick-start-cards {
    grid-template-columns: 1fr;
  }
}
</style>

