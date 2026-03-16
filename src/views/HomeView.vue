<template>
  <div style="padding: 24px;">
    <h1>首页</h1>

    <div style="margin-bottom: 12px;">
      <button @click="loadMe">获取当前用户</button>
      <button @click="handleLogout" style="margin-left: 8px;">退出登录</button>
    </div>

    <div style="margin-bottom: 12px;">
      <textarea v-model="prompt" rows="4" cols="50" placeholder="输入你的问题"></textarea>
    </div>

    <div style="margin-bottom: 12px;">
      <button @click="callAI">调用 AI</button>
    </div>

    <pre>{{ userInfo }}</pre>
    <pre>{{ result }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { chatApi } from '../api/auth';

const authStore = useAuthStore();
const router = useRouter();

const prompt = ref('帮我写一段介绍 JWT 的话');
const userInfo = ref('');
const result = ref('');

async function loadMe() {
  try {
    const user = await authStore.fetchMe();
    userInfo.value = JSON.stringify(user, null, 2);
  } catch (error) {
    userInfo.value = error?.response?.data?.message || '获取失败';
  }
}

async function callAI() {
  try {
    const res = await chatApi({
      prompt: prompt.value
    });
    result.value = JSON.stringify(res.data, null, 2);
  } catch (error) {
    result.value = error?.response?.data?.message || '调用失败';
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>