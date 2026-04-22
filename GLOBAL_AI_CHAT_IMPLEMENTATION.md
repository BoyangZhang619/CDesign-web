# 全局 AI 聊天浮窗系统实现说明

## 架构设计

### 1. 核心组件位置
- **App.vue** - 最顶级（全局级别）
  - 放置 `AIChatFloatingWindow` 组件
  - 导入并使用 `useAIChatStore`
  - 浮窗状态完全由全局 Store 管理

### 2. 状态管理 Store
- **stores/aiChat.ts** - 全局 AI Chat Store（Pinia）
  ```typescript
  export const useAIChatStore = defineStore('aiChat', () => {
    const isOpen = ref(false)
    
    const openChat = () => { isOpen.value = true }
    const closeChat = () => { isOpen.value = false }
    const toggleChat = () => { isOpen.value = !isOpen.value }
  })
  ```

### 3. 相关更新

#### App.vue
```vue
<template>
  <div class="app-wrapper">
    <router-view />
    <!-- 全局 AI 聊天浮窗 -->
    <AIChatFloatingWindow :isOpen="aiChatStore.isOpen" @close="aiChatStore.closeChat()" />
  </div>
</template>

<script setup lang="ts">
import { useAIChatStore } from './stores/aiChat'
import AIChatFloatingWindow from './components/AIChatFloatingWindow.vue'
const aiChatStore = useAIChatStore()
</script>
```

#### TopHeader.vue（所有页面共用）
```typescript
import { useAIChatStore } from '../../stores/aiChat'
const aiChatStore = useAIChatStore()

function toggleAIChat() {
  aiChatStore.toggleChat()
}
```

#### 各 View 组件（HomeView、TodolistView 等）
- 从 template 中移除 `<AIChatFloatingWindow />`
- 从 script 中移除本地 AI Chat 状态
- 保持 TopHeader 的 `@toggle-sidebar` 事件

## 功能特性

### ✅ 全局状态
- 浮窗状态由全局 Store 管理
- 所有页面共享同一个浮窗实例
- 状态持久化，路由切换不影响

### ✅ 路由切换行为
- 路由切换时浮窗保持当前状态
- 如果之前打开，切换路由后仍为打开状态
- 可以在任何页面打开/关闭浮窗

### ✅ 跨页面控制
- TopHeader 在所有页面都可以控制浮窗
- 任何页面都可以通过 `aiChatStore.toggleChat()` 控制
- 无需传递 props 或 emit 事件

### ✅ 性能优化
- 只有一个浮窗实例在 DOM 中
- 减少组件复制和内存占用
- 浮窗位置、消息历史等全局保留

## 在其他 View 中使用

如果你需要在其他 View 中也能控制浮窗：

```typescript
// 任何组件中
import { useAIChatStore } from '../stores/aiChat'

export default {
  setup() {
    const aiChatStore = useAIChatStore()
    
    // 打开浮窗
    const handleOpenAI = () => {
      aiChatStore.openChat()
    }
    
    // 关闭浮窗
    const handleCloseAI = () => {
      aiChatStore.closeChat()
    }
    
    // 切换浮窗
    const handleToggleAI = () => {
      aiChatStore.toggleChat()
    }
    
    return { aiChatStore, handleOpenAI, handleCloseAI, handleToggleAI }
  }
}
```

## 扩展功能建议

### 如果需要保存浮窗位置
```typescript
// stores/aiChat.ts
const windowPosition = ref({
  bottom: 20,
  right: 20
})

const setPosition = (bottom: number, right: number) => {
  windowPosition.value = { bottom, right }
}
```

### 如果需要保存消息历史（跨会话）
```typescript
const messageHistory = ref<Message[]>([])

const addMessage = (message: Message) => {
  messageHistory.value.push(message)
}
```

## 注意事项

1. **浮窗消息状态** - 仍由 `useAIChat()` composable 管理，与浮窗打开/关闭状态分离
2. **全局 vs 局部** - 浮窗容器和位置是全局的，消息内容可以根据会话分离
3. **组件卸载** - 即使 View 卸载，浮窗仍会保留在 App.vue 层级，不会被销毁
4. **样式继承** - 确保 AIChatFloatingWindow 的 z-index 足够高，在所有其他元素之上

## 测试清单

- [ ] 在 HomeView 打开浮窗，切换到 TodolistView，浮窗保持打开
- [ ] 在任何页面点击顶部搜索按钮，浮窗能正确切换
- [ ] 关闭浮窗后，切换页面，浮窗保持关闭状态
- [ ] 浮窗的拖动位置在页面切换后保持不变
- [ ] 浮窗内的消息在路由切换时保留
- [ ] 在移动端和桌面端都能正常操作浮窗
