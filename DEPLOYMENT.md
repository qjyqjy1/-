# 竞彩福彩赛事数据分享平台 - 完整部署说明

## 项目概述

这是一个**合规的体育赛事数据分析分享平台**，用户通过签到/观看广告获取积分，解锁查看优质数据分析方案。

### 核心特性

- 合规运营：使用"数据分析/走势参考"等中性表述，规避监管风险
- 积分系统：签到 + 广告获取积分，30 天有效期强制活跃
- 广告变现：接入广告联盟，无需付费充值功能
- 防刷机制：IP 限制、设备指纹、观看时长校验
- SEO 优化：自动生成 TDK、sitemap.xml、静态化页面
- 后台管理：用户监控、黑名单、方案审核、积分配置

---

## 技术架构

### 前端
- **框架**: Vue 3.3 + Composition API
- **UI**: Bootstrap 5.3 + Bootstrap Icons
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite 5
- **HTTP 客户端**: Axios

### 后端
- **运行环境**: Node.js 18+
- **Web 框架**: Express 4
- **ORM**: Sequelize (MySQL)
- **认证**: JWT (jsonwebtoken)
- **加密**: bcryptjs
- **验证**: Joi

### 数据库
- **类型**: MySQL 8.0+
- **字符集**: utf8mb4

---

## 快速部署 (开发环境)

### 1. 环境准备

```bash
# 安装 Node.js 18+ (如未安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装 MySQL 8 (如未安装)
apt-get install -y mysql-server

# 启动 MySQL 服务
systemctl start mysql
systemctl enable mysql
```

### 2. 克隆项目

```bash
cd /workspace
git clone <repository-url> lottery-share-platform
cd lottery-share-platform
```

### 3. 数据库配置

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE lottery_share CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lottery_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lottery_share.* TO 'lottery_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入数据表结构
mysql -u lottery_user -p lottery_share < database/schema.sql
```

### 4. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env  # 编辑数据库连接、JWT 密钥等配置
```

**.env 配置说明**:

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lottery_share
DB_USER=lottery_user
DB_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_32_chars

# 积分配置
POINTS_SIGNIN_BASE=20
POINTS_AD_VIEW=10
POINTS_AD_CLICK=5
POINTS_PLAN_UNLOCK=50
POINTS_EXPIRE_DAYS=30

# 广告防刷配置
AD_IP_DAILY_LIMIT=20
AD_USER_DAILY_LIMIT=50
AD_MIN_WATCH_TIME=15
AD_COOLDOWN_TIME=60

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# 跨域配置 (生产环境填写实际域名)
CORS_ORIGIN=*
```

```bash
# 启动后端服务
npm run dev  # 开发环境
# 或
npm start    # 生产环境
```

后端服务将在 `http://localhost:3000` 启动

### 5. 前端部署

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
```

**.env 配置说明**:

```env
# API 地址
VITE_API_BASE_URL=http://localhost:3000/api

# 广告联盟配置
VITE_AD_UNION_ID=your_ad_union_id
VITE_AD_PLACEMENT_ID=your_ad_placement_id
```

```bash
# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build

# 预览生产版本
npm run preview
```

前端开发服务器将在 `http://localhost:5173` 启动

---

## 生产环境部署

### 1. 前端静态化部署 (推荐)

```bash
# 前端构建
cd frontend
npm install
npm run build

# 构建产物输出到 dist/ 目录
# 将 dist/ 内容部署到 Nginx/Apache
```

### 2. Nginx 配置

创建 `/etc/nginx/sites-available/lottery-share`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/lottery-share/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 禁止访问敏感路径
    location ~ /\. {
        deny all;
    }
}
```

启用站点:

```bash
ln -s /etc/nginx/sites-available/lottery-share /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. 后端 PM2 部署

```bash
# 全局安装 PM2
npm install -g pm2

# 进入后端目录
cd backend

# 安装依赖
npm install --production

# 启动应用
pm2 start src/server.js --name lottery-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 4. SSL 证书配置 (Let's Encrypt)

```bash
# 安装 Certbot
apt-get install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 功能测试

### 1. 访问演示页面

演示页面已预先构建，可直接访问:

```bash
# 在任意机器上打开浏览器
https://8080-c82ee4705a6810f9.monkeycode-ai.online/
```

或访问具体页面:
- 合规首页：`home-compliant.html`
- 管理后台：`admin-compliant.html`
- 积分配置：`points-config.html`
- 用户行为监控：`monitor-behavior.html`
- SEO 工具：`seo-tools.html`
- 免责声明：`disclaimer.html`

### 2. 管理员账号

默认管理员账号:
- **用户名**: admin
- **密码**: admin123

**首次登录后请立即修改密码!**

### 3. API 测试

```bash
# 用户注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'

# 用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取用户信息 (需要 JWT Token)
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 签到
curl -X POST http://localhost:3000/api/points/signin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取广告列表
curl -X GET http://localhost:3000/api/ads/available
```

---

## 运维管理

### 1. 日志查看

```bash
# 后端日志
tail -f /root/.pm2/logs/lottery-backend-out.log
tail -f /root/.pm2/logs/lottery-backend-error.log

# Nginx 访问日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. 数据库备份

创建备份脚本 `/usr/local/bin/backup-lottery.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup/lottery"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u lottery_user -p'your_secure_password' \
  --single-transaction \
  --routines \
  --triggers \
  lottery_share > $BACKUP_DIR/lottery_share_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/lottery_share_$DATE.sql

# 清理 7 天前备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: lottery_share_$DATE.sql.gz"
```

设置定时任务:

```bash
chmod +x /usr/local/bin/backup-lottery.sh
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /usr/local/bin/backup-lottery.sh
```

### 3. 监控告警

安装监控工具:

```bash
# 安装 PM2 监控
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 安装 Node.js 性能监控
npm install -g pm2-io-agent
```

### 4. 性能优化

**数据库索引优化**:

```sql
-- 用户表索引
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON users(status);

-- 方案表索引
CREATE INDEX idx_lottery_type ON lottery_plans(lottery_type);
CREATE INDEX idx_author_id ON lottery_plans(author_id);
CREATE INDEX idx_status_created ON lottery_plans(status, created_at);

-- 积分记录表索引
CREATE INDEX idx_user_created ON points_transactions(user_id, created_at);
CREATE INDEX idx_type ON points_transactions(type);

-- 广告记录表索引
CREATE INDEX idx_user_created ON ad_records(user_id, created_at);
CREATE INDEX idx_device_ip ON ad_records(device_fingerprint, ip_address);
```

**Redis 缓存 (可选)**:

```bash
# 安装 Redis
apt-get install -y redis-server

# 安装 Node.js Redis 客户端
cd backend
npm install redis

# 在 server.js 中添加缓存逻辑
```

---

## 常见问题 FAQ

### Q1: 前端页面刷新后 404

**原因**: Vue Router 使用 history 模式，需要服务器配置支持。

**解决**: 确保 Nginx 配置中包含 `try_files $uri $uri/ /index.html;`

### Q2: 积分过期功能未生效

**检查**: 
1. 确保后端定时任务已启动
2. 检查 `scheduled-tasks.js` 中的 cron 表达式
3. 查看 PM2 日志确认任务执行情况

### Q3: 广告点击无效

**检查**:
1. 浏览器控制台是否有 JS 错误
2. 广告联盟 ID 配置是否正确
3. 防刷机制是否误拦截 (查看 `ad-anti-cheat.js` 日志)

### Q4: 无法上传图片/文件

**检查**:
1. Nginx `client_max_body_size` 配置
2. 后端 `MAX_FILE_SIZE` 环境变量
3. uploads/ 目录权限 (应该为 755)

### Q5: SEO 页面不被收录

**解决**:
1. 使用 SEO 工具生成 sitemap.xml 并提交到搜索引擎
2. 确保每个页面有独立的 TDK
3. 执行批量静态化，生成预渲染 HTML
4. 在 robots.txt 中允许爬虫访问

---

## 安全建议

### 1. 基础安全

```bash
# 修改默认管理员密码
# 在管理后台 -> 系统设置 -> 修改密码

# 定期更新依赖
cd backend && npm update
cd frontend && npm update

# 配置防火墙
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 2. 数据库安全

```sql
-- 限制数据库用户权限
REVOKE FILE, SUPER, PROCESS ON *.* FROM 'lottery_user'@'localhost';

-- 修改默认端口
-- 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
# port = 3307  # 改为非标准端口

-- 禁用远程连接
# bind-address = 127.0.0.1
```

### 3. API 安全

- 所有 API 请求必须携带 JWT Token
- 敏感操作 (如修改密码、提现) 需要二次验证
- 配置 CORS 白名单，禁止通配符 `*`
- 启用速率限制 (express-rate-limit)

---

## 技术支持

- **项目文档**: `.monkeycode/docs/` 目录
- **API 文档**: 启动后端后访问 `http://localhost:3000/api-docs`
- **更新日志**: `CHANGELOG.md`
- **问题反馈**: 提交 Issue 到项目仓库

---

## 合规声明

本平台仅提供体育赛事历史数据整理与分析参考，不提供任何形式的投注推荐、赔率分析、中奖预测。所有方案内容仅供学术交流与数据研究使用。

请严格遵守《广告法》、《互联网信息服务管理办法》等相关法律法规，合法合规运营。

---

**部署完成后，请访问 https://your-domain.com 查看平台效果!**
