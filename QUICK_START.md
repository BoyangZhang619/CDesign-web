# 认证与健康设置 - 快速开始指南

## 🎯 项目完成度

所有核心功能已完成：

- ✅ 合并登录/注册页面（AuthView.vue）
- ✅ 创建健康信息设置页面（HealthSetupView.vue）
- ✅ 欧式现代建筑风格设计
- ✅ 完整的 TypeScript 类型安全
- ✅ 响应式布局（Desktop、Tablet、Mobile）
- ✅ 路由守卫与权限管理
- ⏳ 后端 API 集成（await implementation）

---

## 🚀 如何运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
# http://localhost:5173
```

---

## 📍 页面导航

### 1. 首页重定向 `/`

```
自动根据登录状态跳转：
├─ 已登录 → /home (AI对话页)
└─ 未登录 → /auth (登录/注册)
```

### 2. 认证页 `/auth`

**双模式设计**

- **登录模式**
  - 邮箱输入
  - 密码输入
  - 自动检查健康信息完成度
  - 成功 → `/health-setup` 或 `/home`

- **注册模式**
  - 邮箱输入
  - 密码输入
  - 密码确认
  - 成功 → 回到登录模式

**关键代码位置**

```typescript
// src/views/AuthView.vue (第 153-161 行)

async function checkHealthInfoNeeded(): Promise<boolean> {
  // TODO: 调用后端 API
  // const response = await fetch('/api/user/health-info/check')
  // return response.data.needsSetup
  return false // 暂时默认返回 false
}
```

### 3. 健康设置页 `/health-setup`

**表单分为 3 个区块**

#### 基本信息
- 性别：男性 / 女性 / 其他
- 生日：日期选择
- 身高：100-250cm
- 当前体重：30-300kg
- 目标体重：30-300kg

#### 饮食与目标
- 饮食偏好：可多选 + 自定义
  - 素食、无肉、无乳制品、无麸质、低碳水、高蛋白、其他
- 健康目标：可多选 + 自定义
  - 减重、增肌、增重、保持、改善心肺、提高灵活性、改善睡眠、增强免疫力、其他

#### 生活习惯
- 过敏信息：自由文本（可选）
- 作息习惯：4 种预设选项
- 日常活动水平：5 个等级

**保存逻辑**

```typescript
// src/views/HealthSetupView.vue (第 382-400 行)

async function handleSubmit() {
  // 1. 验证表单（10 个必填字段检查）
  if (!validateForm()) return
  
  // 2. TODO: 调用后端 API
  // const response = await fetch('/api/user/health-info/save', {
  //   method: 'POST',
  //   body: JSON.stringify(healthInfo)
  // })
  
  // 3. 成功后跳转到首页
  router.push('/home')
}
```

### 4. AI 对话页 `/home`

（已有，无变更）

### 5. 个人中心 `/profile`

（已有，无变更）

---

## 🎨 样式特点速览

### AuthView.vue

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  左侧品牌区 (深色)    │    右侧表单区 (米白)    │
│  ・品牌标题          │    ・邮箱输入          │
│  ・品牌副标题        │    ・密码输入          │
│  ・价值主张          │    ・确认密码          │
│                      │    ・登录/注册按钮     │
│                      │    ・模式切换          │
│                      │                         │
└─────────────────────────────────────────────────┘
```

### HealthSetupView.vue

```
┌────────────────────────────────────────────────┐
│  进度条与百分比 (5/10 已完成)                  │
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │ 基本信息                                 │  │
│  │ ├─ 性别 [O] [O] [O]                     │  │
│  │ ├─ 生日 [日期选择]                      │  │
│  │ ├─ 身高 [数字输入]  目标体重 [数字输入]│  │
│  │ ├─ 当前体重 [数字]  目标体重 [数字]    │  │
│  │ └─ ...                                 │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │ 饮食与目标                               │  │
│  │ ├─ 饮食偏好（☑ 素食 ☑ 低碳水）         │  │
│  │ ├─ 其他 [自定义文本]                    │  │
│  │ └─ 健康目标（☑ 减重 ☑ 增肌）           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │ 生活习惯                                 │  │
│  │ ├─ 过敏信息 [多行文本]                  │  │
│  │ ├─ 作息习惯 [下拉选择]                  │  │
│  │ └─ 活动水平 [下拉选择]                  │  │
│  └──────────────────────────────────────────┘  │
│  [跳过]  [完成设置]                           │
└────────────────────────────────────────────────┘
```

---

## 🔌 与后端集成点

### 需要实现的接口

#### 1. 检查健康信息完成度

```http
GET /api/user/health-info/check
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "needsSetup": true,  // 是否需要填写
    "completedAt": "2024-01-15T10:00:00Z"  // 上次完成时间（可选）
  }
}
```

**调用位置**

```typescript
// src/views/AuthView.vue
async function checkHealthInfoNeeded(): Promise<boolean> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/user/health-info/check`,
    {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      credentials: 'include'
    }
  )
  
  if (!response.ok) {
    throw new Error('检查失败')
  }
  
  const data = await response.json()
  return data.data.needsSetup
}
```

#### 2. 保存健康信息

```http
POST /api/user/health-info/save
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "gender": "male" | "female" | "other",
  "birthday": "1990-01-15",
  "height": 175,
  "currentWeight": 75.5,
  "targetWeight": 70,
  "dietPreferences": ["素食", "低碳水"],
  "dietOtherText": "",
  "healthGoals": ["减重", "增肌"],
  "goalOtherText": "",
  "allergies": "花生、海鲜",
  "sleepHabit": "moderate",
  "activityLevel": "light"
}

Response:
{
  "success": true,
  "message": "健康信息保存成功",
  "data": {
    "userId": 123,
    "savedAt": "2024-01-15T10:00:00Z"
  }
}
```

**调用位置**

```typescript
// src/views/HealthSetupView.vue
async function handleSubmit() {
  errorMsg.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/health-info/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        credentials: 'include',
        body: JSON.stringify(healthInfo)
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || '保存失败')
    }
    
    router.push('/home')
  } catch (error: any) {
    errorMsg.value = error?.message || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}
```

---

## 📋 表单验证规则

### AuthView.vue

| 字段 | 规则 | 错误提示 |
| --- | --- | --- |
| 邮箱 | 必填 + 有效邮箱格式 | "请输入邮箱和密码" |
| 密码 | 必填 + ≥6位 | "密码至少需要6位" |
| 确认密码 | 必填 + 与密码一致 | "两次输入的密码不一致" |

### HealthSetupView.vue

| 字段 | 规则 | 错误提示 |
| --- | --- | --- |
| 性别 | 必选 | "请选择性别" |
| 生日 | 必填 | "请选择生日" |
| 身高 | 必填 + 100-250 | "请输入身高" |
| 当前体重 | 必填 + 30-300 | "请输入当前体重" |
| 目标体重 | 必填 + 30-300 | "请输入目标体重" |
| 饮食偏好 | ≥1 项或自定义文本 | "请选择至少一个饮食偏好" |
| 健康目标 | ≥1 项或自定义文本 | "请选择至少一个健康目标" |
| 作息习惯 | 必选 | "请选择作息习惯" |
| 活动水平 | 必选 | "请选择日常活动水平" |

---

## 💾 数据模型

### HealthInfo 类型（TypeScript）

```typescript
interface HealthInfo {
  gender: 'male' | 'female' | 'other'
  birthday: string  // YYYY-MM-DD
  height: number    // cm
  currentWeight: number  // kg
  targetWeight: number   // kg
  dietPreferences: string[]
  dietOther: boolean
  dietOtherText: string
  healthGoals: string[]
  goalOther: boolean
  goalOtherText: string
  allergies: string  // 可选
  sleepHabit: 'early-bird' | 'moderate' | 'night-owl' | 'irregular'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very-active' | 'extremely-active'
}
```

---

## 🧪 测试用例

### AuthView 测试

1. **登录流程**
   - [ ] 输入有效邮箱和密码 → 成功登录
   - [ ] 输入错误密码 → 显示错误提示
   - [ ] 未输入邮箱 → 验证提示
   - [ ] 密码少于6位 → 验证提示

2. **注册流程**
   - [ ] 填写所有字段 → 成功注册
   - [ ] 密码不匹配 → 验证提示
   - [ ] 邮箱已存在 → 显示错误提示
   - [ ] 切换到登录 → 返回登录模式

3. **模式切换**
   - [ ] 登录 → 注册 → 登录 → 表单清空
   - [ ] 注册成功 → 自动切换到登录 + 邮箱预填

### HealthSetupView 测试

1. **表单验证**
   - [ ] 空表单提交 → 显示多个错误
   - [ ] 不完整表单 → 进度条更新
   - [ ] 全部填完 → 进度条 100%

2. **多选功能**
   - [ ] 选择多个饮食偏好 → 正确保存
   - [ ] 选择"其他"并输入文本 → 包含自定义内容
   - [ ] 取消选中选项 → 列表更新

3. **数值验证**
   - [ ] 身高: 99 → 错误提示；150 → 成功
   - [ ] 体重: 29 → 错误提示；70.5 → 成功

---

## 🐛 常见问题

### Q: 为什么登录后没有进入健康设置页？

**A:** 因为 `checkHealthInfoNeeded()` 函数暂时硬编码返回 `false`。需要：

1. 后端实现 `/api/user/health-info/check` 接口
2. 取消注释代码并调用该接口

### Q: 为什么健康信息保存后没有反应？

**A:** 因为 `handleSubmit()` 中的后端调用被注释了。需要：

1. 后端实现 `/api/user/health-info/save` 接口
2. 取消注释代码并调用该接口

### Q: 响应式设计在哪里测试？

**A:** 使用 Chrome DevTools：

```
F12 → Ctrl+Shift+M → 选择不同设备尺寸
```

---

## 📚 参考资源

- [Vue 3 官方文档](https://vuejs.org)
- [Vue Router 官方文档](https://router.vuejs.org)
- [Pinia 状态管理](https://pinia.vuejs.org)

---

**项目更新日期**：2026-03-19

**下一里程碑**：后端 API 集成完成
