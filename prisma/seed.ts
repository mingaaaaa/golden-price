import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 初始化预警配置
  const alertConfig = await prisma.alertConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      highPrice: 1250.0,
      lowPrice: 1200.0,
      enabled: true,
    },
  });

  console.log('预警配置已初始化:', alertConfig);

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
