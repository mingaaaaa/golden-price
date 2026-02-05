import axios from 'axios';
import { prisma } from './db';
import { GoldPriceData } from '@/types';

// 接口配置
const GOLD_API_URL = process.env.GOLD_API_URL || 'https://www.huilvbiao.com/api/gold_indexApi';

/**
 * 获取实时金价
 */
export async function fetchRealtimePrice(): Promise<GoldPriceData | null> {
  try {
    const response = await axios.get(GOLD_API_URL, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const rawData = response.data;
    const priceData = parsePriceData(rawData);

    if (!priceData) {
      throw new Error('数据解析失败');
    }

    // 验证数据
    if (!validatePriceData(priceData)) {
      throw new Error('数据验证失败');
    }

    return priceData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('获取金价失败:', error.message);
      throw error;
    }
    console.error('未知错误:', error);
    throw error;
  }
}

/**
 * 解析接口返回数据
 * 解析格式: var hq_str_gds_AUTD = "1245.40,0,1243.00,...";
 */
function parsePriceData(rawData: string): GoldPriceData | null {
  try {
    // 提取 hq_str_gds_AUTD 的数据
    const match = rawData.match(/var hq_str_gds_AUTD\s*=\s*"([^"]+)"/);
    if (!match) {
      console.error('无法找到AUTD数据');
      return null;
    }

    const fields = match[1].split(',');
    if (fields.length < 13) {
      console.error('数据格式不正确，字段数量不足');
      return null;
    }

    // 解析字段（根据新浪财经API的实际格式）
    const price = parseFloat(fields[0]);      // 最新价
    const buyPrice = parseFloat(fields[1]);   // 买价（买一价）
    const sellPrice = parseFloat(fields[2]);  // 卖价（卖一价）
    const openPrice = parseFloat(fields[3]);  // 今开
    const highPrice = parseFloat(fields[4]);  // 最高
    const lowPrice = parseFloat(fields[5]);   // 最低
    const time = fields[6];                   // 数据更新时间 HH:MM:SS
    const lastClose = parseFloat(fields[7]);  // 昨收
    // fields[8] 结算价（暂不使用）
    const volume = parseInt(fields[9], 10);   // 成交量
    // fields[10][11] 涨跌额、涨跌幅（数据可能不准确，下面重新计算）

    // 计算涨跌额和涨跌幅
    const changeAmount = price - lastClose;
    const changePercent = lastClose > 0 ? (changeAmount / lastClose) * 100 : 0;

    // 构建采集时间（今天的日期 + 接口返回的时间）
    const collectedAt = new Date();
    const [hours, minutes, seconds] = time.split(':');
    collectedAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10), 0);

    return {
      price,
      openPrice,
      highPrice,
      lowPrice,
      buyPrice,
      sellPrice,
      lastClose,
      changePercent: parseFloat(changePercent.toFixed(2)),
      changeAmount: parseFloat(changeAmount.toFixed(2)),
      volume: isNaN(volume) ? undefined : volume,
      time, // API 返回的原始时间字符串
      collectedAt,
    };
  } catch (error) {
    console.error('解析数据失败:', error);
    return null;
  }
}

/**
 * 验证数据有效性
 */
export function validatePriceData(data: GoldPriceData): boolean {
  // 价格范围校验（500-2000元/克）
  if (data.price < 500 || data.price > 2000) {
    console.error(`价格超出合理范围: ${data.price}`);
    return false;
  }

  // 涨跌幅校验（绝对值不超过10%）
  if (Math.abs(data.changePercent) > 10) {
    console.error(`涨跌幅异常: ${data.changePercent}%`);
    return false;
  }

  // 必填字段校验
  if (
    isNaN(data.price) ||
    isNaN(data.openPrice) ||
    isNaN(data.highPrice) ||
    isNaN(data.lowPrice)
  ) {
    console.error('必填字段缺失或无效');
    return false;
  }

  // 逻辑校验：最高价 >= 当前价 >= 最低价
  if (data.highPrice < data.price || data.price < data.lowPrice) {
    console.error('价格逻辑错误');
    return false;
  }

  return true;
}

/**
 * 保存到数据库（带去重）
 */
export async function savePriceData(data: GoldPriceData): Promise<boolean> {
  try {
    await prisma.goldPrice.create({
      data: {
        price: data.price,
        openPrice: data.openPrice,
        highPrice: data.highPrice,
        lowPrice: data.lowPrice,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        lastClose: data.lastClose,
        changePercent: data.changePercent,
        changeAmount: data.changeAmount,
        volume: data.volume,
        time: data.time, // API 返回的原始时间字符串
        collectedAt: data.collectedAt, // 采集日期，数据库的唯一索引
      },
    });

    console.log(`数据已保存: ${data.collectedAt.toISOString()} - ${data.price}`);
    return true;
  } catch (error) {
    // 如果是唯一索引冲突（重复数据），不算错误
    if (error instanceof Error && error.message.includes('Unique')) {
      console.warn('数据已存在，跳过保存');
      return true;
    }
    console.error('保存数据失败:', error);
    return false;
  }
}

/**
 * 获取历史数据
 */
export async function getHistoryData(
  startTime: Date,
  endTime: Date,
  interval: 'raw' | 'hour' = 'raw'
): Promise<GoldPriceData[]> {
  try {
    let data: any[];

    if (interval === 'raw') {
      // 原始数据（每5分钟一个点）
      data = await prisma.goldPrice.findMany({
        where: {
          collectedAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          collectedAt: 'asc',
        },
      });
    } else {
      // 按小时聚合（用于天视图）
      data = await prisma.$queryRaw`
        SELECT
          strftime('%Y-%m-%d %H:00:00', collected_at) as collectedAt,
          AVG(price) as price,
          AVG(openPrice) as openPrice,
          MAX(highPrice) as highPrice,
          MIN(lowPrice) as lowPrice,
          AVG(buyPrice) as buyPrice,
          AVG(sellPrice) as sellPrice,
          AVG(lastClose) as lastClose,
          AVG(changePercent) as changePercent,
          AVG(changeAmount) as changeAmount
        FROM gold_price
        WHERE collected_at >= ${startTime.toISOString()} AND collected_at <= ${endTime.toISOString()}
        GROUP BY strftime('%Y-%m-%d %H', collected_at)
        ORDER BY collected_at ASC
      `;

      // 转换Date对象
      data = data.map((item: any) => ({
        ...item,
        collectedAt: new Date(item.collectedAt),
        price: parseFloat(item.price),
        openPrice: parseFloat(item.openPrice),
        highPrice: parseFloat(item.highPrice),
        lowPrice: parseFloat(item.lowPrice),
        buyPrice: parseFloat(item.buyPrice),
        sellPrice: parseFloat(item.sellPrice),
        lastClose: parseFloat(item.lastClose),
        changePercent: parseFloat(item.changePercent),
        changeAmount: parseFloat(item.changeAmount),
      }));
    }

    return data as GoldPriceData[];
  } catch (error) {
    console.error('获取历史数据失败:', error);
    return [];
  }
}

/**
 * 清理旧数据（超过指定天数）
 */
export async function cleanupOldData(days: number = 35): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.goldPrice.deleteMany({
      where: {
        collectedAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`已清理 ${result.count} 条旧数据（超过 ${days} 天）`);
    return result.count;
  } catch (error) {
    console.error('清理旧数据失败:', error);
    return 0;
  }
}

/**
 * 获取今日统计数据
 */
export async function getTodayStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await prisma.goldPrice.findMany({
      where: {
        collectedAt: {
          gte: today,
        },
      },
      orderBy: {
        collectedAt: 'asc',
      },
    });

    if (data.length === 0) {
      return null;
    }

    const prices = data.map((d) => d.price);
    const highPrice = Math.max(...prices);
    const lowPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const latestData = data[data.length - 1];

    return {
      highPrice,
      lowPrice,
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      changePercent: latestData.changePercent,
      changeAmount: latestData.changeAmount,
      currentPrice: latestData.price,
    };
  } catch (error) {
    console.error('获取今日统计失败:', error);
    return null;
  }
}
