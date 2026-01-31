#!/bin/bash

# 金价监控项目部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "================================"
echo "开始部署金价监控项目"
echo "================================"

# 1. 检查 Node.js 版本
echo ""
echo "📦 检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18.x 或更高版本"
    echo "当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 2. 安装依赖
echo ""
echo "📦 安装项目依赖..."
pnpm install

# 3. 生成 Prisma Client
echo ""
echo "📦 生成 Prisma Client..."
pnpm prisma generate

# 4. 构建项目
echo ""
echo "🔨 构建 Next.js 项目..."
pnpm build

# 5. 运行数据库迁移
echo ""
echo "🗄️ 运行数据库迁移..."
pnpm prisma migrate deploy

# 6. 创建日志目录
echo ""
echo "📁 创建日志目录..."
mkdir -p logs

# 7. 检查环境变量
echo ""
echo "🔍 检查环境变量..."
if [ ! -f .env ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "请先创建 .env 文件并配置以下变量:"
    echo "  - DATABASE_URL"
    echo "  - DINGTALK_WEBHOOK"
    echo "  - ENABLE_SCHEDULER"
    echo "  - DATA_RETENTION_DAYS"
    echo ""
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 8. 停止旧进程（如果存在）
echo ""
echo "🛑 停止旧进程..."
pm2 stop golden-price 2>/dev/null || echo "没有运行中的进程"
pm2 delete golden-price 2>/dev/null || true

# 9. 启动应用
echo ""
echo "🚀 启动应用..."
pm2 start ecosystem.config.cjs

# 10. 保存 PM2 配置
echo ""
echo "💾 保存 PM2 配置..."
pm2 save

# 11. 设置 PM2 开机自启（仅首次需要）
echo ""
echo "📋 PM2 开机自启设置提示:"
echo "如果是首次部署，请运行以下命令设置开机自启:"
echo "  pm2 startup"
echo "  (然后按照提示执行输出的命令)"

# 12. 显示状态
echo ""
echo "================================"
echo "✅ 部署完成！"
echo "================================"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs golden-price"
echo "  查看状态: pm2 status"
echo "  重启应用: pm2 restart golden-price"
echo "  停止应用: pm2 stop golden-price"
echo ""
echo "🌐 访问地址: http://localhost:3000"
echo ""

pm2 status
