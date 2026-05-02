#!/bin/bash

# 竞彩福彩赛事数据分享平台 - 热更新脚本
# 用法：./hot-update.sh [branch_name]

set -e

BRANCH=${1:-master}
PROJECT_DIR="/opt/lottery-share-platform"
BACKUP_DIR="/opt/lottery-share-platform-backup-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/lottery-update.log"

echo "=====================================" | tee -a $LOG_FILE
echo "🔄 开始热更新 - $(date)" | tee -a $LOG_FILE
echo "📍 分支：$BRANCH" | tee -a $LOG_FILE
echo "=====================================" | tee -a $LOG_FILE

cd $PROJECT_DIR

# 备份配置
echo "📦 备份当前版本..." | tee -a $LOG_FILE
mkdir -p $BACKUP_DIR
cp -r backend/node_modules $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/node_modules $BACKUP_DIR/ 2>/dev/null || true
cp backend/.env $BACKUP_DIR/backend.env 2>/dev/null || true
cp frontend/.env $BACKUP_DIR/frontend.env 2>/dev/null || true

# 拉取代码
echo "📥 拉取最新代码..." | tee -a $LOG_FILE
git stash 2>/dev/null || true
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 更新后端
echo "🔧 更新后端..." | tee -a $LOG_FILE
cd backend
npm install --production
[ -f "$BACKUP_DIR/backend.env" ] && cp $BACKUP_DIR/backend.env .env
pm2 restart lottery-backend

# 更新前端
echo "🎨 更新前端..." | tee -a $LOG_FILE
cd ../frontend
npm install --production
[ -f "$BACKUP_DIR/frontend.env" ] && cp $BACKUP_DIR/frontend.env .env
npm run build

echo "🎉 热更新完成 - $(date)" | tee -a $LOG_FILE
echo "💾 备份：$BACKUP_DIR" | tee -a $LOG_FILE
