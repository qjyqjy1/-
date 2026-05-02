# 竞彩福彩赛事数据分享平台

> 合规运营的体育赛事数据分析分享平台 - 用户通过签到/观看广告获取积分，解锁查看优质数据分析方案

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/lottery-share-platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/vue-3.3-green.svg)](https://vuejs.org/)

---

## 🎯 项目亮点

### ✅ 合规运营
- 删除所有"预测、命中率、赔率、推荐"等敏感词汇
- 使用"数据分析、走势参考、历史复盘"等中性表述
- 完善的免责声明和用户协议

### 💰 积分经济系统
- **获取方式**: 每日签到 + 观看广告
- **消费场景**: 解锁优质方案 (50 积分/次)
- **过期机制**: 30 天有效期，强制用户持续活跃
- **防刷机制**: IP 限制、设备指纹、观看时长校验

### 📈 广告变现模式
- 接入主流广告联盟 (百度、Google)
- 单 IP 每日点击上限 20 次
- 单账号每日观看上限 50 次
- 最小观看时长 15 秒才发放积分
- 60 秒冷却时间防重复点击

### 🛡️ 风控系统
- 多维度设备指纹识别
- IP 关联账号检测
- 异常行为实时监控
- 自动拉黑机制
- 后台用户行为监控面板

### 🔍 SEO 优化
- 自动生成 TDK (标题/描述/关键词)
- sitemap.xml 动态生成
- 页面静态化预渲染
- 结构化数据 (JSON-LD)
- SEO 检测工具集成

---

## 📁 项目结构

```
lottery-share-platform/
├── database/              # 数据库相关
│   └── schema.sql         # 完整表结构 (11 张表)
├── backend/               # Node.js 后端
│   ├── src/
│   │   ├── server.js              # 服务入口
│   │   ├── config/                # 配置文件
│   │   ├── models/                # Sequelize 模型
│   │   ├── controllers/           # 业务控制器
│   │   ├── routes/                # API 路由
│   │   ├── middleware/            # 中间件
│   │   ├── utils/                 # 工具函数
│   │   └── tasks/                 # 定时任务
│   ├── package.json
│   └── .env.example
├── frontend/              # Vue3 前端
│   ├── src/
│   │   ├── main.js                # 应用入口
│   │   ├── router/                # 路由配置
│   │   ├── stores/                # Pinia 状态管理
│   │   ├── views/                 # 页面组件
│   │   ├── components/            # 公共组件
│   │   └── utils/                 # 工具函数
│   ├── package.json
│   └── .env.example
├── lottery-demo/          # 纯 HTML 演示页面
│   ├── home-compliant.html        # 合规首页
│   ├── admin-compliant.html       # 管理后台
│   ├── points-config.html         # 积分配置
│   ├── monitor-behavior.html      # 用户行为监控
│   ├── seo-tools.html             # SEO 工具
│   ├── points-system.html         # 积分任务中心
│   ├── profile-compliant.html     # 个人中心
│   └── disclaimer.html            # 免责声明
├── DEPLOYMENT.md          # 详细部署文档
├── PROJECT_SUMMARY.md     # 项目总结
├── UPDATE_v2.md           # v2.0 更新说明
└── README.md              # 本文件
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/lottery-share-platform.git
cd lottery-share-platform
```

### 2. 数据库配置

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE lottery_share CHARACTER SET utf8mb4;
CREATE USER 'lottery_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON lottery_share.* TO 'lottery_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入表结构
mysql -u lottery_user -p lottery_share < database/schema.sql
```

### 3. 后端启动

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 配置数据库连接和 JWT 密钥
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

### 4. 前端启动

```bash
# 打开新终端
cd frontend
npm install
cp .env.example .env
# 编辑 .env 配置 API 地址
npm run dev
```

前端开发服务器将在 `http://localhost:5173` 启动

### 5. 访问演示页面

无需构建，直接打开浏览器访问：

```
https://8080-c82ee4705a6810f9.monkeycode-ai.online/
```

或访问具体页面:
- 合规首页演示：`home-compliant.html`
- 管理后台：`admin-compliant.html`
- 用户行为监控：`monitor-behavior.html`
- SEO 工具：`seo-tools.html`

---

## 🎮 核心功能演示

### 用户端

| 功能 | 说明 | 状态 |
|------|------|------|
| 用户注册/登录 | 支持用户名密码、手机号验证 | ✅ |
| 每日签到 | 基础 20 积分，连续签到额外奖励 | ✅ |
| 广告任务 | 观看广告得 10 积分/次 | ✅ |
| 方案浏览 | 按彩种分类筛选 | ✅ |
| 方案详情 | 查看免费预览，积分解锁全文 | ✅ |
| 发布方案 | 设置积分价格、上传内容 | ✅ |
| 收藏方案 | 分类管理收藏 | ✅ |
| 个人中心 | 积分明细、消息通知 | ✅ |

### 管理后台

| 功能 | 说明 | 状态 |
|------|------|------|
| 控制台 | 实时数据概览 | ✅ |
| 用户管理 | 列表、审核、黑名单 | ✅ |
| 行为监控 | IP 追踪、设备指纹、风险评分 | ✅ |
| 方案管理 | 审核、编辑、上下架 | ✅ |
| 积分配置 | 调整规则、手动调整 | ✅ |
| 广告管理 | 广告位、广告主、收益统计 | ✅ |
| SEO 工具 | TDK 生成、sitemap、静态化 | ✅ |
| 公告管理 | 发布/编辑系统公告 | ✅ |

---

## 📊 数据库设计

### 核心数据表 (11 张)

1. **users** - 用户表
   - 存储用户基础信息、积分余额、状态

2. **lottery_plans** - 方案表
   - 方案内容、作者、价格、状态

3. **points_transactions** - 积分流水表
   - 收入/支出记录、过期时间、使用状态

4. **ad_records** - 广告记录表
   - 观看/点击记录、IP、设备指纹

5. **user_favorites** - 收藏表
   - 用户收藏的方案及分类

6. **messages** - 站内信表
   - 系统通知、私信

7. **advertisers** - 广告主表
   - 广告主信息、账户余额

8. **ads** - 广告表
   - 广告素材、投放策略

9. **announcements** - 公告表
   - 平台公告

10. **audit_logs** - 审计日志表
    - 后台操作记录

11. **real_blacklist** - 黑名单表
    - 拉黑的 IP、设备、用户

---

## 💡 合规性说明

### 敏感词替换

| ❌ 原词汇 | ✅ 新词汇 |
|----------|----------|
| 预测分析 | 历史数据整理 |
| 命中分析 | 走势参考 |
| 赔率数据 | 技术指标 |
| 推荐方案 | 数据分析方案 |
| 中奖率 | 历史准确率 |
| 稳赚/必中 | 优质方案 |
| 投注 | 参与 |

### 免责声明

每个方案详情页、支付页面、用户注册页面均显示免责声明：

> 本平台仅提供体育赛事历史数据整理与分析参考，不提供任何形式的投注推荐、赔率分析、中奖预测。所有方案内容仅供学术交流与数据研究使用。请您理性参考，遵守所在地法律法规。

---

## 📈 盈利模式

### 收入来源

1. **广告联盟** (主要收入)
   - 百度联盟、Google AdSense
   - 预估 RPM: $3-8 (体育类)
   - 日活 1000 时，预计收入 $50-150/天

2. **广告主直投** (未来扩展)
   - 自主投放平台
   - CPM/CPC 计费
   - 平台抽成 20%

### 成本结构

| 项目 | 费用 |
|------|------|
| 服务器 | ¥200-500/月 |
| 域名 | ¥60/年 |
| 短信 | ¥0.04/条 |
| **总计** | **¥300-600/月** |

### 盈亏平衡

- 日活 300 用户 → 覆盖成本
- 日活 500 用户 → 开始盈利
- 日活 2000 用户 → 月利润 ¥5000+

---

## 🛡️ 风控措施

### 广告防刷

- **IP 限制**: 单 IP 每日最多 20 次点击
- **账号限制**: 单账号每日最多 50 次观看
- **设备指纹**: 识别并拉黑多账号共用设备
- **观看时长**: 必须观看满 15 秒才发放积分
- **冷却时间**: 两次广告间隔至少 60 秒
- **异常检测**: 自动识别 scripted 行为

### 积分风控

- **过期机制**: 30 天有效期，防止积分囤积
- **发放限制**: 每日签到最多 1 次
- **使用监控**: 异常解锁行为预警
- **手动调整**: 后台可追溯调整积分

---

## 🔧 技术栈

### 前端
- Vue 3.3 (Composition API)
- Bootstrap 5.3
- Pinia (状态管理)
- Vue Router 4
- Axios
- Vite 5

### 后端
- Node.js 18+
- Express 4
- Sequelize (ORM)
- JWT (认证)
- bcryptjs (加密)
- Joi (参数验证)

### 数据库
- MySQL 8.0+
- utf8mb4 字符集

### 部署
- Nginx (反向代理)
- PM2 (进程管理)
- Let's Encrypt (SSL)

---

## 📖 文档

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 完整部署指南
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 项目总结
- **[UPDATE_v2.md](UPDATE_v2.md)** - v2.0 更新说明

---

## 🧪 测试账号

### 管理员账号
- 用户名：`admin`
- 密码：`admin123`

### 测试用户
- 用户名：`testuser`
- 密码：`test123`

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## ⚠️ 法律合规声明

1. 本平台定位为**体育赛事数据分析分享平台**，不涉及任何形式的博彩投注业务
2. 所有方案内容仅供**数据研究与学术交流**使用
3. 运营前请务必咨询当地法律专业人士，确保符合相关法规
4. 建议办理 ICP 备案、公安联网备案等资质

---

## 📞 技术支持

- 项目文档：`/docs` 目录
- API 文档：部署后访问 `http://your-domain.com/api-docs`
- 问题反馈：提交 Issue

---

## 🎯 下一版本规划 (v3.0)

- [ ] 移动端 APP (React Native)
- [ ] 会员体系 (免广告、专属标识)
- [ ] 广告主自助投放平台
- [ ] 数据可视化升级 (ECharts)
- [ ] WebSocket 实时通知
- [ ] AI 数据分析助手

---

**祝项目运营成功!** 🚀

---

<details>
<summary><strong>展开查看 API 快速参考</strong></summary>

### 认证 API

```bash
# 注册
POST /api/auth/register
{
  "username": "testuser",
  "password": "test123",
  "email": "test@example.com"
}

# 登录
POST /api/auth/login
{
  "username": "testuser",
  "password": "test123"
}

# 获取当前用户信息
GET /api/user/profile
Authorization: Bearer <token>
```

### 积分 API

```bash
# 签到
POST /api/points/signin
Authorization: Bearer <token>

# 获取积分明细
GET /api/points/history?page=1&limit=20
Authorization: Bearer <token>
```

### 方案 API

```bash
# 获取方案列表
GET /api/plans?page=1&limit=20&type=football

# 获取方案详情
GET /api/plans/:id

# 解锁方案
POST /api/plans/:id/unlock
Authorization: Bearer <token>

# 发布方案
POST /api/plans
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### 广告 API

```bash
# 获取可用广告
GET /api/ads/available

# 记录广告观看
POST /api/ads/watch
Authorization: Bearer <token>
{
  "ad_id": 1,
  "watch_duration": 20
}

# 记录广告点击
POST /api/ads/click
Authorization: Bearer <token>
{
  "ad_id": 1
}
```

</details>
