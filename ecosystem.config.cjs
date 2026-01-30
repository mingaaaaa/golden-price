module.exports = {
  apps: [
    {
      name: 'golden-price',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // 启用定时任务（必需）
        ENABLE_SCHEDULER: 'true',
        // 生产环境数据库路径（必需）
        DATABASE_URL: 'file:./prisma/prod.db',
        // 从服务器的 .env 文件中复制以下变量
        DINGTALK_WEBHOOK: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN_HERE',
        // 可选配置
        DATA_RETENTION_DAYS: '35',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
