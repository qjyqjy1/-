# 前后端数据对接配置说明

## 📋 概述

本文档详细说明前端与后端 API 的数据对接方式，确保所有展示内容与数据库数据完全匹配。

---

## 🔗 后端 API 端点

### 基础配置

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
// 生产环境配置
// const API_BASE_URL = 'https://your-domain.com/api';
```

### 1. 统计数据 API

**端点**: `GET /api/stats`

**响应**:
```json
{
  "success": true,
  "data": {
    "totalPlans": 1247,
    "activeUsers": 8532,
    "historicalAccuracy": 72.5,
    "todayPlans": 48,
    "todayUsers": 1247
  }
}
```

**前端调用**:
```javascript
async function loadStatistics() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  const data = await response.json();
  
  if (data.success) {
    document.getElementById('totalPlans').textContent = data.data.totalPlans.toLocaleString();
    document.getElementById('activeUsers').textContent = data.data.activeUsers.toLocaleString();
    document.getElementById('todayPlans').textContent = '+' + data.data.todayPlans.toLocaleString();
  }
}
```

---

### 2. 方案列表 API

**端点**: `GET /api/plans`

**参数**:
- `type` (可选): 彩种类型代码 `football`, `basketball`, `lottery`
- `page` (默认 1): 页码
- `limit` (默认 20): 每页数量
- `sortBy` (可选): 排序方式 `latest`, `hot`, `price`

**响应**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": 1,
        "title": "英超第 28 轮赛事历史数据复盘参考",
        "summary": "包含 8 场赛事技术指标、历史交锋、主客场表现对比等核心数据维度",
        "lotteryType": {
          "id": 1,
          "name": "英超",
          "code": "football"
        },
        "author": {
          "id": 101,
          "username": "数据分析达人",
          "avatar": null
        },
        "pricePoints": 50,
        "unlockCount": 342,
        "likeCount": 128,
        "isHot": true,
        "historicalAccuracy": 78.5,
        "createdAt": "2026-05-02T08:00:00Z",
        "publishedAt": "2026-05-02T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1247,
      "totalPages": 63
    }
  }
}
```

**前端调用**:
```javascript
async function loadPlans(type, page = 1) {
  const params = new URLSearchParams({
    type: type,
    page: page.toString(),
    limit: '20'
  });
  
  const response = await fetch(`${API_BASE_URL}/plans?${params}`);
  const data = await response.json();
  
  if (data.success) {
    const container = document.getElementById('planContainer');
    container.innerHTML = data.data.plans.map(plan => createPlanCard(plan)).join('');
  }
}
```

---

### 3. 方案详情 API

**端点**: `GET /api/plans/:id`

**响应**:
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": 1,
      "title": "英超第 28 轮赛事历史数据复盘参考",
      "summary": "包含 8 场赛事技术指标...",
      "content": "完整内容...",
      "publicContent": "免费试看部分...",
      "lotteryType": {
        "id": 1,
        "name": "英超"
      },
      "author": {
        "id": 101,
        "username": "数据分析达人",
        "totalPlans": 156,
        "totalFollowers": 2341
      },
      "pricePoints": 50,
      "unlockCount": 342,
      "likeCount": 128,
      "isUnlocked": false,
      "isLiked": false,
      "isCollected": false,
      "createdAt": "2026-05-02T08:00:00Z"
    }
  }
}
```

---

### 4. 用户信息 API

**端点**: `GET /api/user/profile`

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 101,
      "username": "数据分析达人",
      "email": "user@example.com",
      "pointsBalance": 1250,
      "totalPlans": 156,
      "totalFollowers": 2341,
      "totalFollowing": 89,
      "avatar": null,
      "createdAt": "2025-12-15T08:00:00Z"
    }
  }
}
```

---

### 5. 积分相关 API

**签到**: `POST /api/points/signin`

**响应**:
```json
{
  "success": true,
  "data": {
    "pointsEarned": 20,
    "isConsecutive": true,
    "consecutiveDays": 3,
    "bonusPoints": 10,
    "totalPoints": 30,
    "newBalance": 1280
  },
  "message": "签到成功！连续签到 3 天，额外奖励 10 积分"
}
```

**积分记录**: `GET /api/points/history?page=1&limit=20`

**响应**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1001,
        "type": "earn",
        "amount": 20,
        "source": "signin",
        "sourceDescription": "每日签到",
        "createdAt": "2026-05-02T08:00:00Z"
      },
      {
        "id": 1000,
        "type": "spend",
        "amount": 50,
        "source": "plan_unlock",
        "sourceDescription": "解锁方案：英超第 28 轮...",
        "createdAt": "2026-05-01T20:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156
    }
  }
}
```

---

### 6. 广告相关 API

**获取可用广告**: `GET /api/ads/available`

**响应**:
```json
{
  "success": true,
  "data": {
    "ads": [
      {
        "id": 1,
        "title": "体育装备促销",
        "adType": "video",
        "duration": 30,
        "pointsReward": 10,
        "thumbnailUrl": "https://cdn.example.com/ad1.jpg",
        "videoUrl": "https://cdn.example.com/ad1.mp4"
      }
    ]
  }
}
```

**观看广告**: `POST /api/ads/watch`

**请求**:
```json
{
  "adId": 1,
  "watchDuration": 30
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "pointsEarned": 10,
    "newBalance": 1290
  },
  "message": "观看完成！获得 10 积分"
}
```

---

### 7. 认证 API

**注册**: `POST /api/auth/register`

**请求**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 102,
      "username": "newuser",
      "email": "user@example.com",
      "pointsBalance": 100
    }
  }
}
```

**登录**: `POST /api/auth/login`

**响应**: 同上

---

### 8. 收藏与点赞

**收藏方案**: `POST /api/plans/:id/favorite`

**取消收藏**: `DELETE /api/plans/:id/favorite`

**点赞方案**: `POST /api/plans/:id/like`

**取消点赞**: `DELETE /api/plans/:id/like`

---

## 📊 数据库字段映射

### lottery_plans 表

| 字段 | 前端展示 | 说明 |
|------|---------|------|
| `title` | 方案标题 | 卡片主标题 |
| `summary` | 方案简介 | 卡片描述 |
| `content` | 完整内容 | 解锁后显示 |
| `public_content` | 免费试看 | 详情页预览 |
| `price_points` | 解锁价格 | 显示为"X 积分" |
| `unlock_count` | 解锁次数 | 统计数据 |
| `view_count` | 浏览次数 | 作者统计 |
| `like_count` | 点赞数 | 社交互动 |
| `lottery_type_id` | 彩种分类 | 关联 lottery_types 表 |
| `author_id` | 作者 | 关联 users 表 |
| `is_hot` | 热门标识 | 显示"热门"徽章 |
| `historical_accuracy` | 准确率 | 显示为"准确率 X%" |

### users 表

| 字段 | 前端展示 | 说明 |
|------|---------|------|
| `username` | 用户名 | 作者名称 |
| `points_balance` | 当前积分 | 个人中心显示 |
| `avatar` | 头像 | 默认用首字母渐变 |
| `total_plans` | 发布方案数 | 作者主页统计 |
| `total_followers` | 粉丝数 | 社交数据 |

### points_transactions 表

| 字段 | 前端展示 | 说明 |
|------|---------|------|
| `type` | 收入/支出 | earn=收入，spend=支出 |
| `points` | 积分数 | 显示为"+X"或"-X" |
| `source` | 来源 | signin/ad/unlock 等 |
| `created_at` | 时间 | 格式化显示 |
| `is_expired` | 是否过期 | 过期标记 |

---

## 🎨 前端 HTML 结构映射

### 1. 方案卡片

```html
<!-- 数据来自 GET /api/plans -->
<div class="plan-card" data-plan-id="1">
  <!-- lottery_type.name -->
  <span class="badge bg-primary">英超</span>
  
  <!-- historical_accuracy 或默认文案 -->
  <span class="badge bg-success">准确率 78%</span>
  
  <!-- title -->
  <h3 class="plan-title">英超第 28 轮赛事历史数据复盘参考</h3>
  
  <!-- summary -->
  <p class="plan-meta">包含 8 场赛事技术指标...</p>
  
  <!-- users.username -->
  <div class="author-name">数据分析达人</div>
  
  <!-- like_count -->
  <span><i class="bi bi-heart"></i>128</span>
  
  <!-- unlock_count -->
  <span><i class="bi bi-eye"></i>342</span>
  
  <!-- price_points -->
  <div class="plan-price">50 积分</div>
</div>
```

### 2. 统计卡片

```html
<!-- GET /api/stats -->
<div class="stats-card">
  <!-- total_plans -->
  <div class="stats-number">1,247</div>
  <div class="stats-label">优质方案</div>
</div>
```

### 3. 作者头像

```html
<!-- 如果没有 avatar，使用 username 首字母 -->
<div class="author-avatar">
  <!-- users.username[0].toUpperCase() -->
  A
</div>
```

---

## 📱 移动端适配配置

### 响应式断点

```javascript
const BREAKPOINTS = {
  MOBILE: 576,
  TABLET: 768,
  DESKTOP: 1024
};

function isMobile() {
  return window.innerWidth < BREAKPOINTS.MOBILE;
}
```

### 列表加载优化

```javascript
// 移动端每页加载 10 条，桌面端 20 条
const limit = isMobile() ? 10 : 20;
```

---

## 🔒 安全配置

### JWT Token 处理

```javascript
// 登录成功后保存 token
localStorage.setItem('auth_token', token);

// 请求时带上 token
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
};

// Token 过期处理
function checkTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}
```

---

## ✅ 对接检查清单

### 首页
- [ ] 统计数据对接 `/api/stats`
- [ ] 方案列表对接 `/api/plans`
- [ ] 彩种筛选参数传递
- [ ] 搜索功能对接
- [ ] 分页加载实现
- [ ] 热门方案标记显示

### 详情页
- [ ] 方案内容获取 `/api/plans/:id`
- [ ] 解锁状态判断 `isUnlocked`
- [ ] 点赞功能 `/api/plans/:id/like`
- [ ] 收藏功能 `/api/plans/:id/favorite`
- [ ] 作者信息展示

### 用户中心
- [ ] 用户信息 `/api/user/profile`
- [ ] 积分余额显示
- [ ] 签到功能 `/api/points/signin`
- [ ] 积分记录 `/api/points/history`
- [ ] 广告任务 `/api/ads/available`

### 管理后台
- [ ] 用户列表 `/api/admin/users`
- [ ] 方案审核 `/api/admin/plans/:id/review`
- [ ] 积分配置 `/api/admin/config`
- [ ] 数据统计 `/api/admin/stats`

---

## 🐛 错误处理

```javascript
async function fetchWithAuth(url, options = {}) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    // 显示错误提示
    alert(error.message);
    throw error;
  }
}
```

---

## 📦 配置文件

### 环境配置 `.env`

```env
# 前端环境配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AD_UNION_ID=your_ad_id
VITE_AD_PLACEMENT_ID=your_placement_id
```

### 常量配置 `config.js`

```javascript
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEFAULT_PLAN_PRICE: 50,
  DEFAULT_SIGNIN_POINTS: 20,
  MAX_AD_VIEWS_PER_DAY: 50,
  POINTS_EXPIRE_DAYS: 30
};
```

---

**前后端对接完成！** 🎉

所有展示数据已映射到后端 API 字段，确保内容一致性。
