/**
 * Next.js Instrumentation
 * 在服务启动时执行初始化代码
 * 文档: https://nextjs.org/docs/app/building-your-application/configuring/instrumentation
 */

export async function register() {
  // 只在 Node.js 运行时执行（服务端）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initScheduler } = await import('./lib/scheduler');
    initScheduler();
  }
}
