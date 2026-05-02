# v2.0.0 发布说明

## 新增功能

### 🤖 AI 智能助手
- **多供应商支持**: OpenAI, Anthropic Claude, Azure OpenAI, 自定义供应商
- **模型管理**: 支持添加/删除自定义模型
- **配置界面**: 可视化的供应商配置管理
- **对话界面**: 管理后台集成 AI 对话功能
- **API 调用**: 统一的 AI 对话 API (`POST /api/ai/chat`)

### 🔧 热更新机制
- **脚本路径**: `scripts/hot-update.sh`
- **用法**: `./hot-update.sh master` (默认 master 分支)
- **功能**: 
  - 自动备份当前版本
  - Git 拉取最新代码
  - 安装依赖
  - PM2 重启服务
- **回滚脚本**: `scripts/rollback.sh <备份目录>`

### 📊 数据库扩展
- `ai_providers`: AI 供应商配置
- `ai_calls`: AI 调用历史记录
- `system_configs`: 系统配置存储

## 改进内容

### 管理后台
- 添加 AI 配置菜单入口
- 添加 AI 对话菜单入口
- 顶部导航快捷按钮

### 部署
- 生成部署包: `lottery-share-platform-v2.0.0.tar.gz` (19MB)
- 包含完整前后端代码
- 包含部署脚本和文档

## 文件变更
- 新增 14 个文件
- 修改 4 个文件
- 总代码量: +1,803 行, -243 行

## 部署步骤

1. 解压部署包
```bash
tar -xzf lottery-share-platform-v2.0.0.tar.gz
cd lottery-share-platform
```

2. 运行数据库迁移
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/ai_tables.sql
```

3. 配置环境变量
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. 安装依赖并启动
```bash
cd backend && npm install
cd ../frontend && npm install && npm run build
```

5. 使用热更新脚本 (后续更新)
```bash
./scripts/hot-update.sh master
```

## 技术文档
- `AI_FEATURE_GUIDE.md` - AI 功能使用指南
- `DEPLOY_CHECKLIST.md` - 部署检查清单
- `DEPLOYMENT.md` - 部署文档

## 下一步
- [ ] 服务器部署测试
- [ ] AI 功能集成到方案分析场景
- [ ] 用户端 AI 对话功能 (积分消耗)

---
**发布日期**: 2026-05-02
**版本**: v2.0.0
