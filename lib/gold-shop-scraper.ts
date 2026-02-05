import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from './db';
import { GoldShopBrandPrice, GoldShopPriceRecord } from '@/types';

// 目标URL
const GOLD_SHOP_URL = 'https://www.huilvbiao.com/gold/p';

/**
 * 抓取金店价格数据（返回品牌价格数组和日期）
 */
export async function fetchGoldShopPrices(): Promise<{ date: string; prices: GoldShopBrandPrice[] }> {
  try {
    console.log(`[${new Date().toISOString()}] 开始抓取金店价格数据...`);

    // 1. 发起HTTP请求
    const response = await axios.get(GOLD_SHOP_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    // 2. 解析HTML
    const $ = cheerio.load(response.data);

    // 3. 定位目标元素
    const prices: GoldShopBrandPrice[] = [];
    let updateDate = '';

    // 查找 main 标签下第一个 class="card" 的元素
    const firstCard = $('main .card').first();

    if (firstCard.length === 0) {
      throw new Error('未找到价格表格：未定位到 .card 元素');
    }

    // 4. 提取表格数据
    const table = firstCard.find('table.table');
    if (table.length === 0) {
      throw new Error('未找到价格表格：未定位到 table.table 元素');
    }

    const rows = table.find('tbody tr');

    if (rows.length === 0) {
      throw new Error('未找到价格数据：表格为空');
    }

    // 跳过表头（第一行），从第二行开始
    rows.slice(1).each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');

      if (cells.length >= 6) {
        const brandName = $(cells[0]).text().trim();
        const goldPriceStr = $(cells[1]).text().trim();
        const platinumPriceStr = $(cells[2]).text().trim();
        const barPriceStr = $(cells[3]).text().trim();
        const unit = $(cells[4]).text().trim();
        const dateStr = $(cells[5]).text().trim();

        // 从第一行数据提取日期
        if (index === 0) {
          updateDate = dateStr;
        }

        // 解析价格
        const goldPrice = parseFloat(goldPriceStr);
        const platinumPrice = parseOptionalFloat(platinumPriceStr);
        const barPrice = parseOptionalFloat(barPriceStr);

        // 验证必填字段
        if (brandName && !isNaN(goldPrice) && dateStr) {
          prices.push({
            brandName,
            goldPrice,
            platinumPrice,
            barPrice,
            unit: unit || '元/克',
            updateDate: dateStr, // 添加更新日期字段
          });
        }
      }
    });

    if (prices.length === 0) {
      throw new Error('未解析到任何价格数据');
    }

    console.log(`✓ 成功解析 ${prices.length} 家金店价格数据（日期：${updateDate}）`);
    return { date: updateDate, prices };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('✗ 抓取金店价格失败:', error.message);
      throw error;
    }
    console.error('✗ 解析金店价格失败:', error);
    throw error;
  }
}

/**
 * 解析可选的浮点数
 */
function parseOptionalFloat(value: string): number | undefined {
  if (!value || value === '-' || value.trim() === '') {
    return undefined;
  }
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * 验证单个品牌价格数据
 */
export function validateGoldShopBrandPrice(data: GoldShopBrandPrice): boolean {
  // 品牌名称验证
  if (!data.brandName || data.brandName.length > 50) {
    console.error(`品牌名称无效: ${data.brandName}`);
    return false;
  }

  // 黄金价格验证（500-2000元/克）
  if (data.goldPrice < 500 || data.goldPrice > 2000) {
    console.error(`黄金价格超出合理范围: ${data.goldPrice} (品牌: ${data.brandName})`);
    return false;
  }

  // 铂金价格验证（如果存在）
  if (data.platinumPrice !== undefined) {
    if (data.platinumPrice < 200 || data.platinumPrice > 1500) {
      console.error(`铂金价格超出合理范围: ${data.platinumPrice} (品牌: ${data.brandName})`);
      return false;
    }
  }

  // 金条价格验证（如果存在）
  if (data.barPrice !== undefined) {
    if (data.barPrice < 400 || data.barPrice > 1800) {
      console.error(`金条价格超出合理范围: ${data.barPrice} (品牌: ${data.brandName})`);
      return false;
    }
  }

  return true;
}

/**
 * 保存金店价格数据（使用upsert，按日期去重）
 */
export async function saveGoldShopPrices(date: string, prices: GoldShopBrandPrice[]): Promise<boolean> {
  try {
    // 将JSON数组转换为字符串
    const pricesJson = JSON.stringify(prices);

    await prisma.goldShopPrice.upsert({
      where: { date },
      update: {
        prices: pricesJson, // JSON字符串
        collectedAt: new Date(), // Prisma 会自动转换为 UTC
      },
      create: {
        date,
        prices: pricesJson, // JSON字符串
      },
    });

    console.log(`✓ 成功保存 ${prices.length} 条金店价格数据（日期：${date}）`);
    return true;
  } catch (error) {
    console.error('✗ 保存金店价格数据失败:', error);
    return false;
  }
}

/**
 * 获取指定日期的金店价格数据
 */
export async function getGoldShopPricesByDate(date: string): Promise<GoldShopPriceRecord | null> {
  try {
    const data = await prisma.goldShopPrice.findUnique({
      where: { date },
    });

    if (!data) {
      return null;
    }

    // 将JSON字符串解析为数组
    const prices = JSON.parse(data.prices) as GoldShopBrandPrice[];

    return {
      id: data.id,
      date: data.date,
      prices,
      collectedAt: data.collectedAt,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error('获取金店价格失败:', error);
    return null;
  }
}

/**
 * 获取最新日期的金店价格
 */
export async function getLatestGoldShopPrices(): Promise<GoldShopPriceRecord | null> {
  try {
    // 查询最新的采集记录
    const latestRecord = await prisma.goldShopPrice.findFirst({
      orderBy: {
        collectedAt: 'desc',
      },
    });

    if (!latestRecord) {
      return null;
    }

    // 将JSON字符串解析为数组
    const prices = JSON.parse(latestRecord.prices) as GoldShopBrandPrice[];

    return {
      id: latestRecord.id,
      date: latestRecord.date,
      prices,
      collectedAt: latestRecord.collectedAt,
      createdAt: latestRecord.createdAt,
    };
  } catch (error) {
    console.error('获取最新金店价格失败:', error);
    return null;
  }
}

/**
 * 获取指定品牌的历史价格数据（跨日期查询）
 */
export async function getBrandHistory(brandName: string, days: number): Promise<Array<{ date: string; price: GoldShopBrandPrice | null }>> {
  try {
    // 计算时间范围（使用 UTC 时间）
    const now = new Date();
    const startDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - days,
      0, 0, 0
    ));

    const records = await prisma.goldShopPrice.findMany({
      where: {
        collectedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 从每条记录中查找指定品牌的价格
    const result = records.map((record) => {
      // 将JSON字符串解析为数组
      const prices = JSON.parse(record.prices) as GoldShopBrandPrice[];
      const brandPrice = prices.find((p) => p.brandName === brandName);
      return {
        date: record.date,
        price: brandPrice || null,
      };
    });

    return result;
  } catch (error) {
    console.error('获取品牌历史价格失败:', error);
    return [];
  }
}

/**
 * 清理指定天数之前的旧数据
 */
export async function cleanupOldShopPrices(retentionDays: number): Promise<number> {
  try {
    // 使用 UTC 时间计算截止日期
    const now = new Date();
    const cutoffDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - retentionDays,
      0, 0, 0
    ));

    const result = await prisma.goldShopPrice.deleteMany({
      where: {
        collectedAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`✓ 已清理 ${result.count} 条金店价格旧数据（${retentionDays}天前）`);
    return result.count;
  } catch (error) {
    console.error('清理金店价格旧数据失败:', error);
    return 0;
  }
}
