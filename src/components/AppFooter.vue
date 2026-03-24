<template>
    <AppSidebar :isOpen="sidebarOpen" @close="closeSidebar" />
  <footer class="app-footer">
    <div class="footer-content">
      <!-- 品牌区 -->
      <div class="footer-brand">
        <h3 class="footer-logo">StuHeal</h3>
        <p class="footer-tagline">让健康成为习惯</p>
      </div>

      <!-- 快速链接 -->
      <div class="footer-section">
        <h4 class="footer-section-title">快速导航</h4>
        <ul class="footer-links">
          <li><a @click="toggleSidebar">功能介绍</a></li>
          <li><a href="#getstarted">快速开始</a></li>
          <li><a href="#about">关于我们</a></li>
        </ul>
      </div>

      <!-- 功能模块 -->
      <div class="footer-section">
        <h4 class="footer-section-title">健康打卡</h4>
        <ul class="footer-links">
          <li><a href="/exercise/checkin">运动打卡</a></li>
          <li><a href="/meal/checkin">饮食打卡</a></li>
          <li><a href="/sleep/checkin">睡眠打卡</a></li>
        </ul>
      </div>

      <!-- 帮助资源 -->
      <div class="footer-section">
        <h4 class="footer-section-title">帮助与支持</h4>
        <ul class="footer-links">
          <li><a href="#help">使用帮助</a></li>
          <li><a href="#faq">常见问题</a></li>
          <li><a href="#contact">联系我们</a></li>
        </ul>
      </div>

      <!-- 社交与联系 -->
      <!-- <div class="footer-section">
        <h4 class="footer-section-title">关注我们</h4>
        <div class="footer-social">
          <a href="#" class="social-link" title="微信">微</a>
          <a href="#" class="social-link" title="微博">博</a>
          <a href="#" class="social-link" title="抖音">抖</a>
        </div>
      </div> -->
    </div>

    <!-- 底部版权 -->
    <div class="footer-bottom">
      <p class="copyright">© 2026  SZPU 25大数据1班计算机设计小组  保留所有权利</p>
      <div class="footer-meta">
        <a href="#privacy">隐私政策</a>
        <span class="divider">·</span>
        <a href="#terms">使用条款</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer 组件 - 仅用于主页
import AppSidebar from './AppSidebar.vue';
import { ref } from 'vue';

// 切换侧栏
const sidebarOpen = ref(false)
const moreMenuOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  moreMenuOpen.value = false
}
// 关闭侧栏
function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<style scoped>
@import '@/css/AppFooter.css';
</style>
