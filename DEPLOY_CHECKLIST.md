# 部署检查清单

## 📦 打包完成

**版本**: v2.0.0  
**提交**: `c742a57`  
**时间**: 2026-05-02  
**文件数**: 103  
**代码行数**: 22,130+

---

## 🎯 部署步骤

### 1. 准备服务器

**推荐配置**:
- CPU: 2 核+
- 内存：4GB+
- 硬盘：40GB+ SSD
- 系统：Ubuntu 20.04+ / CentOS 7+

**必需软件**:
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# MySQL 8.0+
apt-get install -y mysql-server

# Git
apt-get install -y git

# PM2 (进程管理)
npm install -g pm2

# Nginx (反向代理)
apt-get install -y nginx
```

---

### 2. 上传代码

**方式一：Git 推送** (推荐)
```bash
# 在本地执行
cd /workspace/lottery-share-platform

# 添加远程仓库 (替换为您的仓库地址)
git remote add origin https://github.com/your-username/lottery-share-platform.git
# 或 SSH 方式
git remote add origin git@github.com:your-username/lottery-share-platform.git

# 推送到远程
git push -u origin master

# 在服务器上克隆
git clone https://github.com/your-username/lottery-share-platform.git
cd lottery-share-platform
```

**方式二：压缩包上传**
```bash
# 上传压缩包到服务器
scp lottery-share-platform-v2.0.0.tar.gz user@your-server:/opt/

# 解压
cd /opt
tar -xzf lottery-share-platform-v2.0.0.tar.gz
cd lottery-share-platform
```

---

### 3. 数据库配置

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE lottery_share CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lottery_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON lottery_share.* TO 'lottery_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入表结构
mysql -u lottery_user -p lottery_share < database/schema.sql

# 验证导入
mysql -u lottery_user -p -e "USE lottery_share; SHOW TABLES;"
```

**预期输出**: 应该显示 14 张表

---

### 4. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置
```

**.env 必改项**:
```ini
# 数据库密码 (改为实际密码)
DB_PASSWORD=YourSecurePassword123!

# JWT 密钥 (生成 32 位以上随机字符串)
JWT_SECRET=$(openssl rand -base64 32)

# 生产环境域名
CORS_ORIGIN=https://your-domain.com
ALLOWED_HOSTS=https://your-domain.com
```

**测试后端**:
```bash
# 开发模式
npm run dev

# 或使用 PM2 (生产环境)
pm2 start src/server.js --name lottery-backend
pm2 save
pm2 startup
```

**验证**: 访问 `http://localhost:3001/api/health` 应返回 `{"status":"ok"}`

---

### 5. 前端配置

```bash
cd ../frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
```

**.env 必改项**:
```ini
# 后端 API 地址
VITE_API_BASE_URL=https://your-domain.com/api

# 广告联盟 ID (如果有)
VITE_AD_UNION_ID=your_ad_id
VITE_AD_PLACEMENT_ID=your_placement_id
```

**构建**:
```bash
# 生产构建
npm run build

# 构建产物在 dist/ 目录
ls -lh dist/
```

---

### 6. Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/lottery-share
```

**配置文件**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /opt/lottery-share-platform/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

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
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

**启用站点**:
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/lottery-share /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

### 7. SSL 证书 (可选但推荐)

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run

# 设置自动续期 (crontab)
sudo crontab -e
# 添加：0 3 * * * certbot renew --quiet
```

---

### 8. 启动服务

**后端 PM2 管理**:
```bash
cd /opt/lottery-share-platform/backend

# 启动
pm2 start src/server.js --name lottery-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs lottery-backend
```

**前端 Nginx**: 已自动启动

**数据库**:
```bash
sudo systemctl status mysql
sudo systemctl enable mysql  # 开机自启
```

---

## ✅ 验证部署

### 1. 后端 API 测试

```bash
# 健康检查
curl https://your-domain.com/api/health

# 统计数据
curl https://your-domain.com/api/stats

# 彩种列表
curl https://your-domain.com/api/lottery-types
```

### 2. 前端页面测试

访问：`https://your-domain.com`

- [ ] 首页正常加载
- [ ] 用户可以注册
- [ ] 用户可以登录
- [ ] 可以浏览方案列表
- [ ] 方案详情正常显示

### 3. 功能测试

- [ ] 用户签到 (积分增加)
- [ ] 观看广告 (积分增加)
- [ ] 发布方案 (需要登录)
- [ ] 解锁方案 (积分扣除)
- [ ] 后台登录 (admin/admin123)
- [ ] 后台审核方案

---

## 🔧 常用运维命令

### PM2 管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs lottery-backend

# 重启
pm2 restart lottery-backend

# 停止
pm2 stop lottery-backend

# 删除
pm2 delete lottery-backend
```

### Nginx 管理

```bash
# 重载配置
sudo nginx -t && sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据库管理

```bash
# 备份
mysqldump -u lottery_user -p lottery_share > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u lottery_user -p lottery_share < backup_20260502.sql

# 查看连接数
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

---

## 📊 监控建议

### 1. 服务器监控

```bash
# 安装 htop
apt-get install -y htop

# 查看资源使用
htop

# 查看磁盘
df -h

# 查看内存
free -h
```

### 2. 应用监控

```bash
# PM2 监控
pm2 monit

# 安装日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. 数据库监控

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看表大小
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'lottery_share'
ORDER BY (data_length + index_length) DESC;
```

---

## ⚠️ 常见问题

### 1. 端口被占用

```bash
# 查看占用端口的进程
sudo lsof -i :3001
sudo kill -9 <PID>
```

### 2. 权限问题

```bash
# 修改目录权限
chown -R www-data:www-data /opt/lottery-share-platform/frontend/dist
chmod -R 755 /opt/lottery-share-platform/frontend/dist
```

### 3. CORS 错误

检查 `.env` 中的 `CORS_ORIGIN` 和 `ALLOWED_HOSTS` 是否配置为实际域名

### 4. 数据库连接失败

- 检查 MySQL 服务状态：`sudo systemctl status mysql`
- 检查 .env 中的数据库配置
- 检查用户权限：`mysql -u root -p -e "SHOW GRANTS FOR 'lottery_user'@'localhost';"`

---

## 🎉 部署完成!

访问：`https://your-domain.com`

**默认管理员**:
- 用户名：`admin`
- 密码：`admin123`

**请尽快修改密码!**

---

**部署日期**: 2026-05-02  
**部署版本**: v2.0.0  
**文档**: DEPLOYMENT.md, README.md
