/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: false, // 禁用，避免错误
  },
  // transpilePackages 需要包含 cheerio，因为它使用了 ESM 私有类字段语法
  transpilePackages: ['cheerio'],
};

module.exports = nextConfig;
