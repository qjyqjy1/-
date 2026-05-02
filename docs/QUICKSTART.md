# 快速开始指南

## 本地开发（5 分钟启动）

### 1. 准备工作

确保已安装：
- Node.js >= 16.0.0
- MySQL >= 8.0

### 2. 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
source /path/to/lottery-share-platform/database/schema.sql

# 或者使用命令行直接导入
mysql -u root -p < database/schema.sql
```

### 3. 快速启动

```bash
# 方式 1：使用启动脚本
chmod +x start.sh
./start.sh

# 方式 2：手动启动
# 安装后端依赖
cd backend
npm install

# 配置后端
cp .env.example .env
# 编辑 .env，修改数据库配置

# 启动后端
npm run dev

# 新开终端，安装前端依赖
cd frontend
npm install

# 启动前端
npm run dev
```

### 4. 访问网站

浏览器打开：http://localhost:5173

默认管理员账号：`admin / admin123`

## 生产环境部署

详细部署文档请查看：[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### 快速部署命令

```bash
# 1. 导入数据库
mysql -u root -p < database/schema.sql

# 2. 配置后端
cd backend
npm install
cp .env.example .env
# 编辑 .env，配置生产环境参数

# 3. 启动后端（使用 PM2）
npm install -g pm2
npm install
pm2 start src/server.js --name lottery-platform
pm2 save

# 4. 构建前端
cd ../frontend
npm install
npm run build

# 5. 配置 Nginx
# 参考 docs/DEPLOYMENT.md 中的 Nginx 配置
```

## 广告接入

详细广告接入指南请查看：[docs/AD_GUIDE.md](docs/AD_GUIDE.md)

### 配置步骤

1. 申请广告联盟账号
2. 获取广告 JS 代码
3. 登录后台管理（http://your-domain.com/admin）
4. 进入"广告管理"
5. 编辑广告位，粘贴广告代码
6. 保存

## 常见问题

### Q: 后端启动失败？

A: 
- 检查 MySQL 是否运行
- 检查 .env 配置是否正确
- 查看日志：`pm2 logs lottery-platform`

### Q: 前端页面空白？

A:
- 检查控制台是否有错误
- 确认后端 API 是否可访问
- 清除浏览器缓存

### Q: 数据库连接失败？

A:
- 确认 MySQL 服务已启动
- 检查数据库用户名密码
- 确认数据库已创建：`SHOW DATABASES;`

### Q: 如何修改积分规则？

A:
1. 登录后台管理
2. 进入"系统配置"
3. 修改对应配置项
4. 保存

默认积分规则：
- 每日签到：20 积分
- 观看广告：10 积分
- 查看方案：50 积分

## 下一步

- [ ] 配置你的第一个广告位
- [ ] 发布测试方案
- [ ] 邀请用户测试
- [ ] 配置域名和 HTTPS
- [ ] 上线推广

## 技术支持

如遇到问题，请查看：
- 完整文档：docs/ 目录
- 后端日志：`pm2 logs`
- Nginx 日志：`/var/log/nginx/error.log`
