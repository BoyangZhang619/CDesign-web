<template>
  <div style="padding: 24px;">
    <h1>登录</h1>

    <div style="margin-bottom: 12px;">
      <input v-model="email" placeholder="邮箱" />
    </div>

    <div style="margin-bottom: 12px;">
      <input v-model="password" type="password" placeholder="密码" />
    </div>

    <button @click="handleLogin">登录</button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('test@example.com');
const password = ref('123456');
const message = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function handleLogin() {
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });

    message.value = '登录成功';
    router.push('/');
  } catch (error) {
    message.value = error?.response?.data?.message || '登录失败';
  }
}
</script>