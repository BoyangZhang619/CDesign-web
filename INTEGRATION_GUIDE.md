# 前端API集成完整指南

## 📌 快速开始

### 1. 环境配置

首先确保环境变量已配置：

```bash
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://cda.api.zbyblq.xin
```

### 2. 基本使用

在Vue组件中导入并使用认证store：

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
```

---

## 🔐 认证流程

### 登录流程

```typescript
async function handleLogin() {
  try {
    await authStore.login({ 
      username: 'testuser', 
      password: 'password123' 
    })
    
    // 登录成功后的操作
    console.log('用户信息:', authStore.userInfo)
    // 路由会自动跳转到首页（由路由守卫处理）
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "username": "testuser"
    }
  }
}
```

### 获取用户信息

```typescript
async function loadUserInfo() {
  try {
    await authStore.fetchUserInfo()
    
    console.log('用户ID:', authStore.userInfo?.id)
    console.log('用户邮箱:', authStore.userInfo?.email)
    console.log('用户额度:', authStore.userInfo?.credits)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "success",
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "credits": 1000,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 登出流程

```typescript
async function handleLogout() {
  try {
    await authStore.logout()
    
    // 登出成功，状态已清除
    // 路由会自动跳转到登录页
  } catch (error) {
    console.error('登出失败:', error)
  }
}
```

---

## 🔄 Token管理

### 自动Token刷新

当accessToken过期时，HTTP拦截器会自动：

1. **拦截401错误**
2. **调用POST /api/auth/refresh**
3. **使用Cookie中的refreshToken**
4. **获得新的accessToken**
5. **自动重试原始请求**

**流程图：**

```
API请求返回401 (Token过期)
         ↓
HTTP拦截器捕获
         ↓
调用/api/auth/refresh
         ↓
使用Cookie中的refreshToken
         ↓
获得新Token并更新store
         ↓
通知等待的请求继续
         ↓
重试原始请求
         ↓
返回新数据
```

### 手动刷新Token

如果需要主动刷新（虽然通常不需要）：

```typescript
async function refreshMyToken() {
  try {
    await authStore.refreshToken()
    console.log('Token已刷新')
  } catch (error) {
    console.error('刷新失败，请重新登录')
  }
}
```

---

## 🛡️ 安全特性

### accessToken 存储

- **存储位置：** localStorage
- **生命周期：** 短期（通常15-30分钟）
- **发送方式：** 每个请求的 `Authorization: Bearer {token}` 请求头

```typescript
// 自动添加到每个请求
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### refreshToken 存储

- **存储位置：** HttpOnly Cookie（浏览器自动管理）
- **生命周期：** 长期（通常7天）
- **安全性：** JavaScript无法访问，防止XSS攻击

```
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

### Token轮换

每次刷新时，服务器会：
1. 作废旧的refreshToken
2. 发放新的refreshToken
3. 发放新的accessToken

---

## 📋 API端点速查

### 认证相关

| 功能 | 方法 | 端点 | 认证 |
|------|------|------|------|
| 注册 | POST | `/api/auth/register` | ❌ |
| 登录 | POST | `/api/auth/login` | ❌ |
| 获取用户信息 | GET | `/api/auth/me` | ✅ |
| 刷新Token | POST | `/api/auth/refresh` | Cookie |
| 登出 | POST | `/api/auth/logout` | Cookie |
| 全设备登出 | POST | `/api/auth/logout-all` | ✅ |

---

## ⚠️ 常见错误处理

### 401 Unauthorized

**原因：** Token无效或过期

**自动处理：** HTTP拦截器自动尝试刷新Token

**如果刷新也失败：** 清除登录状态，重定向到登录页

### 403 Forbidden

**原因：** 权限不足（通常是额度不足）

**处理方式：** 显示提示信息，引导用户充值

### 400 Bad Request

**原因：** 请求参数不正确

**处理方式：** 检查请求体参数是否符合API文档

### 500 Server Error

**原因：** 服务器错误

**处理方式：** 显示错误提示，建议用户稍后重试

---

## 🧪 测试检查列表

在集成API后，请进行以下测试：

- [ ] 注册新用户成功
- [ ] 登录成功获得Token
- [ ] Token保存到localStorage
- [ ] Cookie中有refreshToken
- [ ] 能够获取用户信息
- [ ] 发送API请求时自动添加Authorization请求头
- [ ] Token过期时自动刷新
- [ ] 刷新失败时清除登录状态并重定向
- [ ] 单设备登出成功
- [ ] 全设备登出成功
- [ ] 未登录时访问受保护页面重定向到登录页
- [ ] 已登录时访问登录页重定向到首页

---

## 📚 文件对应表

| 文件 | 功能 | 说明 |
|------|------|------|
| `src/api/http.ts` | HTTP客户端配置 | 包含拦截器和Token自动刷新逻辑 |
| `src/api/modules/auth.ts` | 认证API接口 | 登录、注册、刷新等接口定义 |
| `src/stores/auth.ts` | 认证状态管理 | Pinia store，管理token和用户信息 |
| `src/utils/token.ts` | Token工具函数 | 获取、设置、删除token |
| `src/router/index.ts` | 路由配置 | 包含路由守卫和认证检查 |
| `src/api/examples.ts` | 使用示例 | 完整的API使用示例代码 |
| `.env.development` | 开发环境配置 | 本地后端地址 |
| `.env.production` | 生产环境配置 | 生产后端地址 |

---

## 🔗 相关文档

- [后端API完整文档](../API.md)
- [API校对报告](../API_VALIDATION_REPORT.md)

---

## 💡 最佳实践

### 1. 始终检查登录状态

```typescript
if (!authStore.isLoggedIn) {
  // 未登录，显示登录页或提示
}
```

### 2. 处理异步操作中的loading状态

```typescript
<button :disabled="authStore.loading">登录</button>
```

### 3. 在敏感操作前刷新用户信息

```typescript
// 在展示用户信息之前
await authStore.fetchUserInfo()
```

### 4. 合理处理错误提示

```typescript
try {
  await authStore.login(credentials)
} catch (error) {
  // 显示用户友好的错误提示
  message.error('登录失败，请检查用户名和密码')
}
```

### 5. 定期刷新Token

```typescript
// 在应用初始化时
watch(() => authStore.isLoggedIn, () => {
  if (authStore.isLoggedIn) {
    // 定期刷新（可选）
  }
})
```

---

## 🚀 后续改进建议

1. **添加请求重试机制**
   - 网络错误时自动重试
   - 指数退避算法

2. **实现完整的错误提示**
   - 使用toast/notification组件
   - 根据错误码显示不同提示

3. **添加加载动画**
   - 在登录/登出时显示加载状态
   - 在获取用户信息时显示骨架屏

4. **集成第三方认证**
   - OAuth 2.0集成
   - 第三方登录选项

5. **实现Remember Me功能**
   - 记住登录状态
   - 自动登录

---

祝您集成顺利！有任何问题请参考API文档。
