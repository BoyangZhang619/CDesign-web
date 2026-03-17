# 🚀 前端API集成 - 快速参考卡片

## 📌 核心改动一览

```
src/api/http.ts              → ✅ 添加自动Token刷新 + 错误处理
src/api/modules/auth.ts      → ✅ 完整实现所有认证API
src/stores/auth.ts           → ✅ 改进登录/刷新/登出逻辑
src/utils/token.ts           → ✅ 添加详细注释
src/router/index.ts          → ✅ 添加路由守卫和用户信息获取
.env.development             → ✅ 新建（开发环境配置）
.env.production              → ✅ 新建（生产环境配置）
```

---

## 🔑 关键代码片段

### 1. 登录

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

async function handleLogin(username: string, password: string) {
  try {
    await authStore.login({ username, password })
    // 登录成功，自动跳转到首页
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

### 2. 获取用户信息

```typescript
async function loadUser() {
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

### 3. 登出

```typescript
async function handleLogout() {
  try {
    await authStore.logout()
    // 登出成功，自动跳转到登录页
  } catch (error) {
    console.error('登出失败:', error)
  }
}
```

### 4. 检查登录状态

```typescript
if (authStore.isLoggedIn) {
  console.log('用户已登录')
} else {
  console.log('用户未登录')
}
```

---

## 📋 API端点速查

| 功能 | 请求 | 路由 | 认证 | 返回 |
|------|------|------|------|------|
| 注册 | POST | `/api/auth/register` | ❌ | `{success, message, data: {message}}` |
| 登录 | POST | `/api/auth/login` | ❌ | `{success, message, data: {accessToken, user}}` |
| 用户信息 | GET | `/api/auth/me` | ✅ | `{success, message, data: {user: {id, email, credits}}}` |
| 刷新Token | POST | `/api/auth/refresh` | Cookie | `{success, message, data: {accessToken, user}}` |
| 登出 | POST | `/api/auth/logout` | Cookie | `{success, message, data: {message}}` |
| 全部登出 | POST | `/api/auth/logout-all` | ✅ | `{success, message, data: {message}}` |

---

## 🔄 Token生命周期

```
用户登录
  ↓
获得accessToken + refreshToken
  ↓
accessToken保存到localStorage
refreshToken自动保存到HttpOnly Cookie
  ↓
每个请求自动添加Authorization请求头
  ↓
accessToken过期时 → 自动调用/api/auth/refresh
  ↓
获得新Token → 重试原始请求
  ↓
用户登出 → 删除所有Token
```

---

## 🧪 测试命令

```bash
# 开发环境启动
npm run dev
# 自动使用 .env.development

# 生产构建
npm run build
# 自动使用 .env.production

# 预览构建结果
npm run preview
```

---

## 💾 文件位置

```
project-root/
├── src/
│   ├── api/
│   │   ├── http.ts              ← HTTP客户端配置
│   │   ├── modules/
│   │   │   └── auth.ts          ← 认证API接口
│   │   └── examples.ts          ← 使用示例（可删除）
│   ├── stores/
│   │   └── auth.ts              ← 认证状态管理
│   ├── utils/
│   │   └── token.ts             ← Token工具
│   ├── router/
│   │   └── index.ts             ← 路由配置
│   └── ...
├── .env.development             ← 开发环境配置
├── .env.production              ← 生产环境配置
├── API.md                       ← 后端API文档
├── API_VALIDATION_REPORT.md     ← 校对报告
├── INTEGRATION_GUIDE.md         ← 集成指南（重要！）
├── CHANGES_SUMMARY.md           ← 修改总结
└── ...
```

---

## ⚙️ 环境变量配置

### 开发环境 (.env.development)
```
VITE_API_URL=http://localhost:8080
```

### 生产环境 (.env.production)
```
VITE_API_URL=https://cda.api.zbyblq.xin
```

---

## 🔒 安全特性

| 特性 | 实现 | 说明 |
|------|------|------|
| Bearer Token | ✅ | 每个请求自动添加 Authorization 请求头 |
| Token存储 | ✅ | accessToken在localStorage，refreshToken在HttpOnly Cookie |
| 自动刷新 | ✅ | Token过期时自动调用refresh接口 |
| 请求队列 | ✅ | 多个请求同时过期时，避免多次刷新 |
| 错误处理 | ✅ | 401自动处理，刷新失败自动登出 |

---

## ⚠️ 常见错误

### 401 Unauthorized
```
原因：Token无效或过期
处理：自动刷新或重定向到登录
```

### 400 Bad Request
```
原因：请求参数不正确
处理：检查API文档中的参数要求
```

### 403 Forbidden
```
原因：权限不足或额度不足
处理：显示错误提示
```

### 500 Server Error
```
原因：服务器错误
处理：显示提示，建议用户稍后重试
```

---

## 📞 获取帮助

1. **API文档** → 查看 `API.md`
2. **集成指南** → 查看 `INTEGRATION_GUIDE.md`
3. **使用示例** → 查看 `src/api/examples.ts`
4. **修改详情** → 查看 `API_VALIDATION_REPORT.md`

---

## ✅ 集成检查清单

- [ ] 环境变量文件已创建
- [ ] 前端可以正常启动
- [ ] 能够成功登录
- [ ] Token正确保存
- [ ] 能够获取用户信息
- [ ] 能够成功登出
- [ ] 路由守卫正常工作
- [ ] 401错误自动处理

**全部✅完成后，可以开始开发Vue组件了！** 🎉
