# AppHeader.vue 完全重构 - 现代化导航设计

## 📋 概述

全新的 AppHeader 组件已经重构完成，采用"现代欧式简约"设计风格，功能更强大，交互更流畅。

---

## ✨ 核心功能变更

### 之前的设计
```
[返回] [Logo] [导航链接] [用户邮箱] [登出按钮]
```

### 现在的设计
```
[菜单] [Logo] [搜索/AI聊天] [用户头像] [更多菜单]
  ↓                                      ↓
侧栏导航                            登出按钮
（12个功能）                       （下拉菜单）
```

---

## 🎯 主要特性

### 1. **左侧：菜单 + Logo**
- 汉堡菜单按钮（自动匹配屏幕尺寸显隐）
- "StuHeal" Logo，点击回到首页
- 菜单动画：按钮从 ☰ 变为 ✕（X）

### 2. **中间：搜索栏 → AI 聊天**
- 优雅的搜索输入框
- 点击或输入即可跳转 AI 聊天页面
- 带有搜索图标，暗示交互
- 搜索框设为 `readonly`，点击直接导航

### 3. **右侧：用户头像 + 更多菜单**
- 用户头像显示（有则显示，无则显示默认 SVG）
- 点击头像跳转个人资料页面
- 三点菜单按钮，包含登出选项
- 下拉菜单动画显示

### 4. **侧栏快速导航（新增）**
替代了 HomeView 的功能展示，包含 12 个核心功能：
```
01 个人基础信息     07 情景模拟
02 健康打卡         08 个性化建议
03 历史记录         09 健康目标
04 健康画像         10 校园饮食推荐
05 趋势分析         11 消息与提醒
06 未来预测         12 AI 对话
```

每个导航项包含：
- 序号 (01-12)
- 功能名称
- 功能标签（如"初始化"、"数据采集"等）

---

## 🎨 设计风格应用

### 颜色系统
| 元素 | 颜色 | 用途 |
|-----|------|------|
| 主文本 | #3a3a3a (深灰) | 所有可见文字 |
| 副文本 | #8a8a8a (莫兰迪灰) | 标签、提示文字 |
| 边框 | #e8e8e8 (浅灰) | 所有边界线 |
| 背景 | #fafaf9 (象牙白) | 悬停背景 |
| 白色 | #ffffff | 页面背景 |

### 字体
| 用途 | 字体 | 大小 | 权重 |
|-----|------|------|------|
| Logo | Playfair Display | 20px | 600 |
| 导航项 | Montserrat | 13px | 400 |
| 标签 | Montserrat | 11px | 600 |

### 间距和边距
- 顶栏高度：64px (桌面)，56px (平板/手机)
- 侧栏宽度：280px (桌面)，240px (平板)，100% (手机)
- gap 值：12-32px (根据上下文)
- padding：24px (充足空间)

### 按钮和控件
- 所有按钮：**直角设计** (border-radius: 0)
- 边框：**1px solid** (#e8e8e8)
- 悬停效果：边框变深灰，背景变象牙白
- 过渡时间：**0.4s ease** (平缓优雅)

---

## 📐 响应式布局

### 桌面 (> 768px)
```
┌─────────────────────────────────────────────┐
│ [☰] [StuHeal] [搜索栏] [头像] [⋮]          │
└─────────────────────────────────────────────┘
```
- 菜单隐藏（仅代码中可用）
- Logo 完整显示
- 所有元素可见

### 平板 (768px)
```
┌──────────────────────────────────┐
│ [☰] [StuHeal] [搜索] [头像] [⋮] │
└──────────────────────────────────┘
```
- 菜单显示
- Logo 缩小
- 侧栏宽度 240px

### 手机 (< 480px)
```
┌──────────────────┐
│ [☰] [搜索] [头像]│
└──────────────────┘
```
- 菜单显示且占据左侧
- 搜索栏绝对定位居中
- Logo 隐藏或仅显示小图标

---

## 🔧 技术实现细节

### 导航项数据结构
```javascript
const navigationItems = [
  {
    id: '01',
    title: '个人基础信息',
    path: '/profile',
    badge: '初始化'
  },
  // ... 共 12 项
]
```

### 状态管理
```javascript
const sidebarOpen = ref(false)      // 侧栏开关
const moreMenuOpen = ref(false)     // 菜单开关
const loading = ref(false)          // 登出加载状态
```

### 关键方法
```javascript
// 切换侧栏
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  moreMenuOpen.value = false  // 自动关闭其他菜单
}

// 导航到 AI 聊天
function goToAIChat() {
  closeSidebar()
  closeMenus()
  router.push('/ai-chat')
}

// 导航到个人资料
function goToProfile() {
  closeSidebar()
  closeMenus()
  router.push('/profile')
}

// 登出
async function handleLogout() {
  if (!confirm('确定要登出吗？')) return
  loading.value = true
  try {
    await authStore.logout()
    router.push('/auth')
  } finally {
    loading.value = false
  }
}
```

### 点击外部自动关闭菜单
```javascript
function handleClickOutside(e) {
  const header = document.querySelector('.app-header')
  if (header && !header.contains(e.target)) {
    closeMenus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
```

---

## 🎬 动画效果

### 侧栏动画
- **进入**：从左滑入 (translateX -100% → 0)
- **退出**：向左滑出
- **速度**：0.4s
- **缓动**：ease (自然流畅)

### 下拉菜单动画
- **进入**：向下滑入 + 淡入
- **关键帧**：
  ```css
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
  ```

### 菜单按钮动画
- **闭合状态**：3 条平行线
- **打开状态**：
  - 上线：旋转 45°（↗）
  - 中线：隐藏（opacity: 0）
  - 下线：旋转 -45°（↙）

---

## 🚀 使用方式

### 1. 导入组件
```vue
<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <!-- 页面内容 -->
</template>
```

### 2. 配置路由
确保以下路由已在 router 中配置：
```javascript
'/profile'              // 个人资料
'/health/daily-checkin' // 健康打卡
'/health/history'       // 历史记录
'/analysis/portrait'    // 健康画像
'/analysis/trends'      // 趋势分析
'/analysis/forecast'    // 未来预测
'/analysis/simulation'  // 情景模拟
'/recommendations'      // 个性化建议
'/goals'               // 健康目标
'/recommendations/campus-diet'  // 校园饮食推荐
'/notifications'       // 消息与提醒
'/ai-chat'            // AI 对话
```

### 3. 配置用户信息
确保 authStore 提供以下字段：
```javascript
authStore.userInfo = {
  email: 'user@example.com',
  avatar: 'https://...', // 可选
  credits: 100          // 可选
}
```

---

## 🎯 交互流程

### 搜索栏 → AI 聊天
```
用户点击搜索栏
  ↓
closeMenus() + closeSidebar()
  ↓
router.push('/ai-chat')
```

### 用户头像 → 个人资料
```
用户点击头像
  ↓
closeMenus() + closeSidebar()
  ↓
router.push('/profile')
```

### 菜单按钮 → 登出
```
用户点击三点菜单
  ↓
下拉菜单显示
  ↓
用户点击"登出"
  ↓
confirm() 确认
  ↓
authStore.logout()
  ↓
router.push('/auth')
```

### 侧栏导航 → 功能页面
```
用户点击菜单按钮
  ↓
侧栏从左滑入
  ↓
用户选择任意导航项
  ↓
closeSidebar()
  ↓
router.push(item.path)
```

---

## ✅ 测试清单

在部署前，请验证以下功能：

- [ ] 菜单按钮在桌面隐藏，平板/手机显示
- [ ] 菜单按钮点击时变成 ✕，再点击回到 ☰
- [ ] 侧栏从左边平滑滑入，点击外部关闭
- [ ] 搜索栏只读，点击跳转到 /ai-chat
- [ ] 用户头像显示正确（有图则显示，无图显示 SVG）
- [ ] 点击头像跳转 /profile
- [ ] 三点菜单显示/隐藏正常
- [ ] 登出确认弹窗出现，确认后跳转 /auth
- [ ] 所有导航链接 (01-12) 跳转正确
- [ ] 响应式布局在 480px/768px 断点正确
- [ ] 所有动画流畅（无卡顿）
- [ ] 侧栏在不同尺寸下宽度适应

---

## 🎨 设计说明

### 为什么选择这个设计？

1. **侧栏导航替代 HomeView**
   - ✅ 更高效的导航体验
   - ✅ 节省屏幕空间
   - ✅ 符合现代 App 设计趋势
   - ✅ 移动端友好

2. **搜索栏 → AI 聊天**
   - ✅ 提升 AI 功能的可见性
   - ✅ 减少点击层级
   - ✅ 搜索和聊天是相关功能
   - ✅ 顶栏空间最大化利用

3. **头像按钮替代邮箱显示**
   - ✅ 视觉更吸引
   - ✅ 头像有身份识别功能
   - ✅ 点击即可进个人资料
   - ✅ 节省空间

4. **直角 + 极细边框**
   - ✅ 符合现代欧式简约风格
   - ✅ 与页面其他部分风格一致
   - ✅ 视觉更清晰

5. **0.4s 过渡时间**
   - ✅ 比 0.3s 稍慢，显得优雅
   - ✅ 用户能清楚看到动画过程
   - ✅ UX 最佳实践

---

## 📚 文件位置

- **组件文件**：`src/components/AppHeader.vue`
- **应用场景**：所有页面顶部（包括 HomeView）

---

## 🔄 未来优化方向

1. **搜索功能**
   - 目前搜索栏为跳转到 AI 聊天
   - 可扩展为真实搜索功能

2. **消息提醒**
   - 可在菜单按钮右上角添加红点提示

3. **主题切换**
   - 可在更多菜单中添加深色模式切换

4. **快捷键**
   - Cmd+K (Mac) / Ctrl+K (Windows) 打开搜索
   - Esc 关闭所有菜单

---

**重构完成日期**：2026 年 3 月 22 日  
**设计风格**：Modern European Minimalist  
**状态**：✅ 已完成，无错误

