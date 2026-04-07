<template>
  <header class="top-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="greeting">Hi, {{ userName }}</h1>
        <p class="subtitle">Let's track your health daily!</p>
      </div>
      <div class="header-right">
        <button class="search-btn">🔍</button>
        <button class="notification-btn">🔔</button>
        <div class="user-profile">
          <img src="https://via.placeholder.com/40" alt="User" class="profile-avatar">
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userName = ref('Samantha W.')
</script>

<style scoped>
.top-header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
}

.header-left {
  flex: 1;
}

.greeting {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-btn,
.notification-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.search-btn:hover,
.notification-btn:hover {
  background: #f0f0f0;
}

.user-profile {
  margin-left: 10px;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e67e22;
}
</style>
