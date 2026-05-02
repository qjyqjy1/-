# 部署说明文档

## 一、服务器环境要求

### 1. 硬件配置（推荐）
- CPU: 2 核
- 内存：4GB
- 硬盘：40GB
- 带宽：3Mbps 以上

### 2. 软件环境
- CentOS 7+ / Ubuntu 18.04+
- Node.js >= 16.0.0
- MySQL >= 8.0
- Nginx
- Git

## 二、服务器环境搭建

### 1. 安装 Node.js

```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装 MySQL

```bash
# CentOS
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Ubuntu
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 3. 安装 Nginx

```bash
# CentOS
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ubuntu
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 三、项目部署

### 1. 克隆项目

```bash
cd /var/www
git clone <your-repo-url> lottery-platform
cd lottery-platform
```

### 2. 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
mysql -u root -p < database/schema.sql

# 修改密码（可选）
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY '你的强密码';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 部署后端

```bash
cd /var/www/lottery-platform/backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
vi .env

# 修改以下配置：
# DB_HOST=localhost
# DB_NAME=lottery_platform
# DB_USER=root
# DB_PASSWORD=你的数据库密码
# JWT_SECRET=生成一个随机字符串（可以使用 openssl rand -hex 32）

# 使用 PM2 管理进程
npm install -g pm2
pm2 start src/server.js --name lottery-backend
pm2 save
pm2 startup
```

### 4. 部署前端

```bash
cd /var/www/lottery-platform/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建产物在 dist 目录
```

### 5. 配置 Nginx

```bash
sudo vi /etc/nginx/conf.d/lottery-platform.conf
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/lottery-platform/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
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
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 配置防火墙

```bash
# CentOS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

## 四、HTTPS 配置（推荐）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo yum install -y certbot python3-certbot-nginx  # CentOS
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 3 * * * certbot renew --quiet
```

## 五、优化配置

### 1. 系统优化

```bash
# 增加文件打开数限制
ulimit -n 65535

# 优化 TCP 配置
sudo vi /etc/sysctl.conf

# 添加以下内容：
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
```

### 2. MySQL 优化

```bash
sudo vi /etc/my.cnf  # 或 /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加配置：

```ini
[mysqld]
max_connections = 500
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 64M
```

### 3. PM2 集群模式

修改后端启动命令：

```bash
pm2 start src/server.js --name lottery-backend -i max
```

## 六、常见问题排查

### 1. 后端启动失败

```bash
# 查看日志
pm2 logs lottery-backend

# 检查数据库连接
mysql -u root -p
```

### 2. 前端页面访问 404

```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 数据库连接超时

```bash
# 检查 MySQL 状态
sudo systemctl status mysqld

# 检查防火墙
sudo firewall-cmd --list-all
```

## 七、备份方案

### 1. 数据库备份

```bash
# 每天凌晨 2 点备份
#!/bin/bash
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p'密码' lottery_platform > $BACKUP_DIR/lottery_$DATE.sql
```

### 2. 代码备份

使用 Git 版本控制，定期推送到远程仓库。

## 八、监控告警

### 1. PM2 监控

```bash
pm2 monit
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. 服务器监控

安装监控工具如 Zabbix、Prometheus 等。

## 九、日常维护

### 每周检查

- 查看错误日志
- 检查磁盘空间
- 查看备份是否成功

### 每月维护

- 更新系统补丁
- 优化数据库
- 清理日志文件

## 十、性能优化建议

1. 使用 CDN 加速静态资源
2. 启用 Gzip 压缩
3. 配置 Redis 缓存
4. 数据库读写分离
5. 静态资源 CDN

## 客服联系方式

如遇到问题，请查看：
- 后端日志：`pm2 logs lottery-backend`
- Nginx 日志：`/var/log/nginx/error.log`
- MySQL 日志：`/var/log/mysql/error.log`
