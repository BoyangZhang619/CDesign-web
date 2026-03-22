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
          <!-- 01 个人基础信息 -->
          <router-link to="/profile" class="feature-card">
            <div class="card-number">01</div>
            <h3 class="card-title">个人基础信息</h3>
            <p class="card-description">配置健康模型初始参数，采集身体与目标数据</p>
            <div class="card-badge">初始化</div>
          </router-link>

          <!-- 02 健康打卡 -->
          <router-link to="/health/daily-checkin" class="feature-card">
            <div class="card-number">02</div>
            <h3 class="card-title">健康打卡</h3>
            <p class="card-description">记录每日饮食、运动、体重、睡眠等实时数据</p>
            <div class="card-badge">数据采集</div>
          </router-link>

          <!-- 03 历史记录 -->
          <router-link to="/health/history" class="feature-card">
            <div class="card-number">03</div>
            <h3 class="card-title">历史记录</h3>
            <p class="card-description">查询历史打卡详情，按类型和时间筛选</p>
            <div class="card-badge">数据回溯</div>
          </router-link>

          <!-- 04 健康画像 -->
          <router-link to="/analysis/portrait" class="feature-card">
            <div class="card-number">04</div>
            <h3 class="card-title">健康画像</h3>
            <p class="card-description">查看数字孪生模型，展示多维健康指标</p>
            <div class="card-badge">模型展示</div>
          </router-link>

          <!-- 05 趋势分析 -->
          <router-link to="/analysis/trends" class="feature-card">
            <div class="card-number">05</div>
            <h3 class="card-title">趋势分析</h3>
            <p class="card-description">分析体重、摄入、运动等指标的变化趋势</p>
            <div class="card-badge">演化过程</div>
          </router-link>

          <!-- 06 未来预测 -->
          <router-link to="/analysis/forecast" class="feature-card">
            <div class="card-number">06</div>
            <h3 class="card-title">未来预测</h3>
            <p class="card-description">预测体重与健康评分变化，识别潜在风险</p>
            <div class="card-badge">预测能力</div>
          </router-link>

          <!-- 07 情景模拟 -->
          <router-link to="/analysis/simulation" class="feature-card">
            <div class="card-number">07</div>
            <h3 class="card-title">情景模拟</h3>
            <p class="card-description">调整变量查看不同生活方式的健康结果</p>
            <div class="card-badge">可实验性</div>
          </router-link>

          <!-- 08 个性化建议 -->
          <router-link to="/recommendations" class="feature-card">
            <div class="card-number">08</div>
            <h3 class="card-title">个性化建议</h3>
            <p class="card-description">获取基于分析的饮食、运动、作息建议</p>
            <div class="card-badge">干预指导</div>
          </router-link>

          <!-- 09 健康目标 -->
          <router-link to="/goals" class="feature-card">
            <div class="card-number">09</div>
            <h3 class="card-title">健康目标</h3>
            <p class="card-description">设定和跟踪健康目标，展示完成进度</p>
            <div class="card-badge">目标导向</div>
          </router-link>

          <!-- 10 校园饮食推荐 -->
          <router-link to="/recommendations/campus-diet" class="feature-card">
            <div class="card-number">10</div>
            <h3 class="card-title">校园饮食推荐</h3>
            <p class="card-description">提供食堂搭配、外卖选择和宿舍方案</p>
            <div class="card-badge">落地方案</div>
          </router-link>

          <!-- 11 消息与提醒 -->
          <router-link to="/notifications" class="feature-card">
            <div class="card-number">11</div>
            <h3 class="card-title">消息与提醒</h3>
            <p class="card-description">打卡提醒、健康警告和周期性总结推送</p>
            <div class="card-badge">行为引导</div>
          </router-link>

          <!-- 12 AI 对话 -->
          <router-link to="/ai-chat" class="feature-card">
            <div class="card-number">12</div>
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
@import '@/css/HomeView.css';
</style>
