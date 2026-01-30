# 黄金价格监控与推送系统

实时监控 AUTD（黄金延期）价格，定时推送钉钉通知。

## 🎯 核心功能

- ✅ **数据采集**：每5分钟采集 AUTD 价格
- ✅ **数据可视化**：时视图（近24h）、天视图（近35天）
- ✅ **定时推送**：每小时整点推送（8:00-24:00）
- ✅ **预警推送**：价格超过/低于目标价时推送
- ✅ **日报推送**：每天24:00推送当日汇总
- ✅ **异常告警**：接口连续失败3次推送通知
- ✅ **数据清理**：每天凌晨2:00清理超过35天的数据

## 🛠️ 技术栈

- **框架**：Next.js 14 + TypeScript
- **UI库**：Ant Design + Recharts
- **ORM**：Prisma + SQLite
- **定时任务**：node-schedule
- **HTTP客户端**：axios
- **部署**：PM2

## 📦 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置钉钉 Webhook：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
ENABLE_SCHEDULER=false  # 开发环境设为false
```

### 3. 初始化数据库

```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 5. 测试接口

```bash
# 测试实时金价
curl http://localhost:3000/api/gold/realtime

# 测试历史数据
curl http://localhost:3000/api/gold/history?view=hour

# 测试预警配置
curl http://localhost:3000/api/alert/config

# 测试预警检查
curl -X POST http://localhost:3000/api/alert/check
```

## 🚀 生产部署

### 1. 构建项目

```bash
# 注意：需要 Node.js 20.9.0+
pnpm build
```

### 2. 启动服务（PM2）

```bash
pnpm pm2:start
```

### 3. 查看日志

```bash
pnpm pm2:logs
```

### 4. 查看状态

```bash
pm2 status
```

### 5. 重启服务

```bash
pnpm pm2:restart
```

### 6. 停止服务

```bash
pnpm pm2:stop
```

## ⚙️ 环境变量说明

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| `DATABASE_URL` | SQLite数据库路径 | 是 | `file:./prisma/dev.db` |
| `DINGTALK_WEBHOOK` | 钉钉机器人Webhook | 是 | - |
| `DINGTALK_SECRET` | 钉钉机器人密钥（可选） | 否 | - |
| `PORT` | 服务端口 | 否 | `3000` |
| `NODE_ENV` | 环境（development/production） | 否 | `development` |
| `GOLD_API_URL` | 黄金API地址 | 否 | `https://www.huilvbiao.com/api/gold_indexApi` |
| `COLLECTION_INTERVAL_MINUTES` | 采集间隔（分钟） | 否 | `5` |
| `ENABLE_SCHEDULER` | 是否启用定时任务 | 否 | `false` |
| `DATA_RETENTION_DAYS` | 数据保留天数 | 否 | `35` |

## 📊 数据库设计

### 表结构

#### GoldPrice（价格数据表）
- `price`: 当前价格
- `openPrice`: 开盘价
- `highPrice`: 最高价
- `lowPrice`: 最低价
- `buyPrice`: 买入价
- `sellPrice`: 卖出价
- `changePercent`: 涨跌幅（%）
- `changeAmount`: 涨跌额
- `collectedAt`: 采集时间（唯一索引）

#### AlertConfig（预警配置表）
- `highPrice`: 高位预警价格
- `lowPrice`: 低位预警价格
- `enabled`: 预警开关

#### PushLog（推送记录表）
- `type`: 推送类型（hourly/alert/daily/error）
- `content`: 推送内容
- `success`: 是否成功
- `createdAt`: 推送时间

## 🔔 钉钉机器人配置

### 1. 创建钉钉群机器人

1. 打开钉钉群
2. 点击群设置 → 智能群助手 → 添加机器人 → 自定义
3. 机器人名称：黄金价格监控
4. 安全设置：选择"自定义关键词"（如：价格）
5. 复制 Webhook 地址到 `.env` 文件

### 2. 推送消息格式

**小时报**：
```
【黄金价格小时报】10:00
当前AUTD价格：1248.40 元/克
今日涨跌幅：+0.52%（+6.48元）
今日最高：1255.00 元/克
今日最低：1242.00 元/克
```

**预警**：
```
【黄金价格预警】⚠️
AUTD价格突破目标价！
当前价格：1250.50 元/克
目标价格：1250.00 元/克
```

**日报**：
```
【黄金价格日报 - 2026-01-29】
AUTD（黄金延期）：
开盘：1234.0 元/克
收盘：1245.4 元/克
最高：1255.0 元/克
最低：1242.0 元/克
涨跌幅：+7.08%
```

## 📁 项目结构

```
golden_price/
├── app/
│   ├── api/                    # API Routes
│   │   ├── gold/realtime/      # 实时金价
│   │   ├── gold/history/       # 历史数据
│   │   └── alert/              # 预警配置和检查
│   ├── dashboard/              # Dashboard页面和组件
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页（重定向到/dashboard）
├── lib/                        # 核心服务
│   ├── db.ts                   # Prisma客户端
│   ├── gold-service.ts         # 黄金价格服务
│   ├── dingtalk.ts             # 钉钉推送服务
│   └── scheduler.ts            # 定时任务调度
├── prisma/
│   ├── schema.prisma           # 数据库模型
│   ├── migrations/             # 数据库迁移文件
│   └── dev.db                  # SQLite数据库文件
├── public/
│   └── ecosystem.config.cjs     # PM2配置文件
├── types/                      # TypeScript类型定义
├── .env.example                # 环境变量示例
└── package.json
```

## ⚠️ 常见问题

### 1. 构建失败（ESM error）

**问题**：Node.js 18 在 Windows 下构建失败

**解决方案**：
- 升级 Node.js 到 20.9.0+
- 或使用开发模式 `pnpm dev` 运行

### 2. 定时任务未启动

**检查**：
- `.env` 文件中 `ENABLE_SCHEDULER=true`
- 是否为生产环境（`pnpm build && pnpm start`）

### 3. 数据库没有数据

**手动采集**：
```bash
curl http://localhost:3000/api/gold/realtime
```

### 4. 钉钉推送失败

**检查**：
- Webhook 地址是否正确
- 钉钉机器人关键词是否包含消息中的关键词

## 📝 维护建议

1. **定期备份数据库**：
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

2. **清理日志文件**：
   ```bash
   rm logs/pm2-*.log
   ```

3. **查看推送统计**：
   - 在数据库中查询 `PushLog` 表

4. **手动触发采集**：
   - 访问 http://localhost:3000/api/gold/realtime

## 🔒 安全建议

1. 不要将 `.env` 文件提交到 Git
2. 定期更新依赖包
3. 使用防火墙限制服务器访问
4. 定期检查钉钉推送日志

## 📄 许可证

MIT

---

**创建时间**：2026-01-29
**维护者**：Claude Code
