import { PrismaClient } from '@prisma/client';

// 全局变量，用于在开发环境缓存Prisma客户端实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 创建Prisma客户端实例
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 在开发环境中缓存Prisma客户端实例，避免热重载时创建多个实例
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
