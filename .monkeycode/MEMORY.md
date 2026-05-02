# 项目记忆

## 项目定位
竞彩福彩赛事数据分享平台 - 合规的数据分析参考平台，不含任何预测/推荐中奖内容

## 核心功能
1. 用户通过签到/看广告赚取积分
2. 积分解锁赛事数据分析方案
3. 作者发布方案获得积分分成
4. AI 辅助生成方案内容
5. 自动发布机制（无需审核）

## 技术栈
- 前端：Vue 3 + Bootstrap 5
- 后端：Node.js + Express + Sequelize
- 数据库：MySQL 8.0
- 部署：PM2 + Nginx

## 特殊规则
- 积分 30 天过期
- 单 IP/账号每日广告点击上限 5 次
- 方案自动发布（无需审核）
- 敏感词汇过滤（预测、命中率、赔率等）

## 部署方式
- 热更新：`./scripts/hot-update.sh master`
- 回滚：`./scripts/rollback.sh <备份目录>`
- 压缩包：`/workspace/lottery-share-platform-v2.0.0.tar.gz`
