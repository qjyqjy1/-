#!/bin/bash

# 竞彩福彩投注方案分享平台 - 快速启动脚本

echo "======================================"
echo " 竞彩福彩投注方案分享平台"
echo " 快速启动脚本"
echo "======================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误：未检测到 Node.js，请先安装 Node.js >= 16"
    exit 1
fi

# 检查 MySQL
if ! command -v mysql &> /dev/null; then
    echo "错误：未检测到 MySQL，请先安装 MySQL >= 8.0"
    exit 1
fi

# 安装后端依赖
echo ""
echo "1. 安装后端依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo ""
echo "2. 安装前端依赖..."
cd frontend
npm install
cd ..

# 提示配置
echo ""
echo "3. 请配置后端环境变量"
echo "  编辑 backend/.env 文件，设置数据库连接信息"

# 启动后端
echo ""
echo "4. 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "  后端已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "5. 启动前端开发服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "  前端已启动 (PID: $FRONTEND_PID)"

echo ""
echo "======================================"
echo " 启动完成！"
echo "======================================"
echo ""
echo "访问地址：http://localhost:5173"
echo "后端 API：http://localhost:3001"
echo ""
echo "管理员账号：admin / admin123"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

wait
