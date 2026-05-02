#!/bin/bash
# 回滚脚本 - 回滚到指定备份
BACKUP_DIR=$1
if [ -z "$BACKUP_DIR" ]; then
  echo "用法：./rollback.sh /opt/lottery-share-platform-backup-20260502_120000"
  exit 1
fi
cd /opt/lottery-share-platform
[ -d "$BACKUP_DIR/node_modules" ] && cp -r $BACKUP_DIR/node_modules backend/
[ -d "$BACKUP_DIR/node_modules" ] && cp -r $BACKUP_DIR/node_modules frontend/
[ -f "$BACKUP_DIR/backend.env" ] && cp $BACKUP_DIR/backend.env backend/.env
[ -f "$BACKUP_DIR/frontend.env" ] && cp $BACKUP_DIR/frontend.env frontend/.env
pm2 restart lottery-backend
echo "✅ 回滚完成"
