/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 生产环境启用 instrumentation 以支持定时任务
    // 开发环境也可通过设置 INSTRUMENTATION=true 来启用
    instrumentationHook: process.env.NODE_ENV === 'production',
  },
  // transpilePackages 需要包含 cheerio，因为它使用了 ESM 私有类字段语法
  transpilePackages: ['cheerio'],
};

module.exports = nextConfig;
