# v2.2.0 更新说明

## 变更内容

### 🔒 权限控制增强
- AI 相关功能仅限管理员使用
- 用户端完全隐藏 AI 入口

### 🚫 功能下线
- **评论系统已关闭**（包括评论、回复、删除）
- 用户端无任何 AI 相关字样和入口

### 📝 前端变更
- 导航栏移除 "AI 写方案" 入口
- 方案详情页移除评论区域
- 删除 AIGenerate.vue 页面
- 清理相关路由配置

### 🔐 后端变更
- `/api/ai/*` - 限制为管理员 (auth + admin)
- `/api/ai-generate/*` - 限制为管理员 (auth + admin)
- `/api/comments/*` - 完全禁用 (返回 503)

## 用户端可见功能

### 保留功能
- ✅ 方案浏览/搜索
- ✅ 方案解锁（积分支付）
- ✅ 收藏/点赞
- ✅ 签到赚积分
- ✅ 发布方案
- ✅ 个人中心

### 已移除功能
- ❌ 评论系统
- ❌ AI 写方案（用户端）
- ❌ AI 对话（用户端）

## 管理员保留功能

### 管理后台可用
- AI 配置管理（/admin/ai-config）
- AI 对话（/admin/ai-chat）
- AI 自动生成方案
- 方案审核管理
- 用户管理

## 部署更新

```bash
# 新版部署包
lottery-share-platform-v2.2.0.tar.gz (19MB)

# 热更新
./scripts/hot-update.sh master
```

## API 变更

| 端点 | 变更 |
|------|------|
| POST /api/ai/chat | 需管理员权限 |
| POST /api/ai-generate/generate | 需管理员权限 |
| POST /api/ai-generate/auto-publish | 需管理员权限 |
| GET /api/comments/* | 已禁用 (503) |
| POST /api/comments | 已禁用 (503) |

---

**版本**: v2.2.0  
**日期**: 2026-05-02  
**类型**: 权限控制 + 功能精简
