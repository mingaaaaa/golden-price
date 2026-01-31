# 生产环境部署指南

## 修改说明

已更新 `ecosystem.config.cjs` 配置文件，添加了必需的环境变量：
- `ENABLE_SCHEDULER: 'true'` - 启用定时任务
- `DATABASE_URL: 'file:./prisma/prod.db'` - 生产环境数据库路径
- `DINGTALK_WEBHOOK` - 钉钉通知 webhook（需要你填写）

---

## 服务器部署步骤

### 1. 更新服务器上的代码

首先将修改后的 `ecosystem.config.cjs` 部署到服务器：

```bash
# 在服务器上拉取最新代码
git pull origin master
```

或者手动上传修改后的 `ecosystem.config.cjs` 文件到服务器。

### 2. 配置钉钉 Webhook

编辑服务器上的 `ecosystem.config.cjs` 文件，将 `DINGTALK_WEBHOOK` 的值替换为你的实际钉钉机器人 webhook 地址：

```bash
# 在服务器上编辑
nano ecosystem.config.cjs
# 或
vim ecosystem.config.cjs
```

找到这一行：
```javascript
DINGTALK_WEBHOOK: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN_HERE',
```

将 `YOUR_TOKEN_HERE` 替换为你的实际 access token。

### 3. 初始化数据库

在服务器上运行以下命令：

```bash
# 进入项目目录
cd /path/to/golden-price

# 1. 生成 Prisma Client
pnpm prisma:generate

# 2. 创建生产环境数据库文件并执行迁移
# 方法 A：使用 prisma migrate deploy（推荐）
npx prisma migrate deploy

# 如果方法 A 失败，使用方法 B：直接推送 schema
# npx prisma db push --skip-generate

# 3. 可选：运行种子数据填充初始配置
pnpm prisma:seed
```

### 4. 重启 PM2 服务

```bash
# 停止现有进程
pnpm pm2:stop

# 删除旧进程
pnpm pm2:delete

# 使用新配置启动
pnpm pm2:start

# 查看日志确认定时任务已启动
pnpm pm2:logs
```

---

## 验证部署结果

### 检查 1：定时任务是否启动

查看 PM2 日志，应该看到以下信息：

```bash
pnpm pm2:logs
```

**成功的日志示例：**
```
初始化定时任务...
✓ 已调度：采集金价任务（每5分钟）
✓ 已调度：小时报任务（8:00-23:00 每小时）
✓ 已调度：日报任务（每天 24:00）
✓ 已调度：预警检查任务（每5分钟）
✓ 已调度：数据清理任务（每天 2:00）
所有定时任务已启动！
```

**如果看到：**
```
定时任务未启用（ENABLE_SCHEDULER=false）
```
说明环境变量没有正确设置，请检查 `ecosystem.config.cjs` 中的 `ENABLE_SCHEDULER: 'true'`。

### 检查 2：数据库是否创建成功

```bash
ls -la prisma/prod.db
```

应该看到数据库文件存在：
```
-rw-r--r-- 1 user user 8192 Jan 31 10:00 prisma/prod.db
```

### 检查 3：预警设置是否能保存

1. 打开仪表盘页面
2. 尝试修改预警配置
3. 点击保存
4. 应该显示"预警配置已更新"的成功提示

### 检查 4：价格采集是否正常工作

等待 5 分钟后，检查 PM2 日志：

```bash
pnpm pm2:logs
```

应该看到：
```
[2026-01-31T10:05:00.000Z] 开始采集金价...
```

---

## 常见问题排查

### 问题：定时任务仍未启动

**解决方案：**

1. 检查环境变量是否在 PM2 中正确设置：

```bash
# 查看当前 PM2 进程的环境变量
pm2 show golden-price
```

2. 如果环境变量不对，重新加载配置：

```bash
pm2 reload ecosystem.config.cjs
# 或完全重启
pnpm pm2:restart
```

3. 确认 `ecosystem.config.cjs` 中的配置：

```javascript
env: {
  ENABLE_SCHEDULER: 'true',  // 确认是字符串 'true'，不是布尔值 true
}
```

### 问题：预警设置保存失败

**解决方案：**

1. 检查数据库文件权限：

```bash
# 确保数据库文件可写
chmod 664 prisma/prod.db
# 或
chmod 666 prisma/prod.db
```

2. 查看 PM2 错误日志：

```bash
pnpm pm2:logs --err
```

3. 确认数据库已正确初始化：

```bash
npx prisma migrate status
```

4. 在浏览器开发者工具中检查 API 响应：
   - 打开 F12 开发者工具
   - 切换到 Network 面板
   - 保存预警设置
   - 查看 `/api/alert/config` 请求的响应内容

### 问题：数据库迁移失败

**解决方案：**

1. 删除现有数据库文件（如果存在）：

```bash
rm -f prisma/prod.db
```

2. 重新创建数据库：

```bash
# 方法 A：创建迁移（仅开发环境）
npx prisma migrate dev --name init

# 方法 B：直接推送 schema（生产环境推荐）
npx prisma db push
```

3. 确认数据库文件已创建：

```bash
ls -la prisma/
```

### 问题：钉钉通知没有收到

**解决方案：**

1. 确认 `ecosystem.config.cjs` 中的 `DINGTALK_WEBHOOK` 已正确配置

2. 测试 webhook 是否有效：

```bash
curl -X POST "你的钉钉webhook地址" \
  -H "Content-Type: application/json" \
  -d '{"msgtype":"text","text":{"content":"测试消息"}}'
```

3. 检查钉钉机器人设置：
   - 确认机器人已启用
   - 确认安全设置（关键词、IP 白名单等）是否正确配置

---

## 完整的 PM2 命令参考

```bash
# 启动服务
pnpm pm2:start

# 停止服务
pnpm pm2:stop

# 重启服务
pnpm pm2:restart

# 删除服务
pnpm pm2:delete

# 查看日志
pnpm pm2:logs

# 查看实时日志
pm2 logs golden-price --lines 100

# 查看进程信息
pm2 show golden-price

# 查看所有进程
pm2 list

# 监控进程
pm2 monit
```

---

## 维护建议

1. **定期备份数据库**

```bash
# 创建备份脚本
cp prisma/prod.db prisma/backup/prod.db.$(date +%Y%m%d_%H%M%S)
```

2. **监控日志文件**

定期检查 PM2 日志，确保服务正常运行：
```bash
pnpm pm2:logs
```

3. **设置 PM2 开机自启动**

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机启动脚本
pm2 startup
# 按照提示执行输出的命令
```

4. **定期清理日志**

```bash
# 清理 PM2 日志（可选）
pm2 flush
```
