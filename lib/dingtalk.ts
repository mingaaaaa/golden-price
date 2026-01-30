import axios from 'axios';
import { prisma } from './db';
import { GoldPriceData, AlertConfigData, PushType } from '@/types';

// 钉钉Webhook配置
const DINGTALK_WEBHOOK = process.env.DINGTALK_WEBHOOK || '';
const DINGTALK_SECRET = process.env.DINGTALK_SECRET || '';

/**
 * 发送钉钉消息
 */
async function sendDingTalkMessage(content: string): Promise<boolean> {
  if (!DINGTALK_WEBHOOK) {
    console.error('钉钉Webhook未配置');
    return false;
  }

  try {
    // 构建消息体
    const message = {
      msgtype: 'text',
      text: {
        content: content,
      },
    };

    const response = await axios.post(DINGTALK_WEBHOOK, message, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    if (response.data.errcode === 0) {
      console.log('钉钉消息发送成功');
      return true;
    } else {
      console.error('钉钉消息发送失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('发送钉钉消息异常:', error);
    return false;
  }
}

/**
 * 记录推送日志到数据库
 */
async function logPush(
  type: PushType,
  content: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await prisma.pushLog.create({
      data: {
        type,
        content: content.substring(0, 1000), // 限制内容长度
        success,
        error,
      },
    });
  } catch (err) {
    console.error('记录推送日志失败:', err);
  }
}

/**
 * 发送小时报
 */
export async function sendHourlyReport(priceData: GoldPriceData): Promise<boolean> {
  const content = `【黄金价格小时报】${priceData.collectedAt.getHours()}:00
当前AUTD价格：${priceData.price} 元/克
今日涨跌幅：${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%（${priceData.changeAmount >= 0 ? '+' : ''}${priceData.changeAmount.toFixed(2)}元）
今日最高：${priceData.highPrice} 元/克
今日最低：${priceData.lowPrice} 元/克`;

  const success = await sendDingTalkMessage(content);
  await logPush('hourly', content, success, success ? undefined : '发送失败');

  return success;
}

/**
 * 发送预警
 */
export async function sendAlert(
  currentPrice: number,
  alertConfig: AlertConfigData,
  alertType: 'high' | 'low'
): Promise<boolean> {
  const targetPrice = alertType === 'high' ? alertConfig.highPrice! : alertConfig.lowPrice!;

  const content = `【黄金价格预警】⚠️
AUTD价格${alertType === 'high' ? '突破' : '跌破'}目标价！
当前价格：${currentPrice} 元/克
目标价格：${targetPrice} 元/克
时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`;

  const success = await sendDingTalkMessage(content);
  await logPush('alert', content, success, success ? undefined : '发送失败');

  return success;
}

/**
 * 发送日报
 */
export async function sendDailyReport(date: Date): Promise<boolean> {
  try {
    // 获取当天的所有数据
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);

    const data = await prisma.goldPrice.findMany({
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

    if (data.length === 0) {
      console.warn('没有数据，无法发送日报');
      return false;
    }

    const prices = data.map((d) => d.price);
    const openPrice = data[0].openPrice;
    const closePrice = data[data.length - 1].price;
    const highPrice = Math.max(...prices);
    const lowPrice = Math.min(...prices);
    const changePercent = data[data.length - 1].changePercent;

    const content = `【黄金价格日报 - ${date.toISOString().split('T')[0]}】
AUTD（黄金延期）：
开盘：${openPrice} 元/克
收盘：${closePrice} 元/克
最高：${highPrice} 元/克
最低：${lowPrice} 元/克
涨跌幅：${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

    const success = await sendDingTalkMessage(content);
    await logPush('daily', content, success, success ? undefined : '发送失败');

    return success;
  } catch (error) {
    console.error('发送日报失败:', error);
    await logPush('daily', '日报生成失败', false, String(error));
    return false;
  }
}

/**
 * 发送异常告警
 */
export async function sendErrorAlert(errorMessage: string): Promise<boolean> {
  const content = `【系统异常告警】❌
数据采集连续失败3次
最后一次错误：${errorMessage}
时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`;

  const success = await sendDingTalkMessage(content);
  await logPush('error', content, success, success ? undefined : '发送失败');

  return success;
}

/**
 * 获取推送统计（最近N条）
 */
export async function getPushStats(limit: number = 100) {
  try {
    const logs = await prisma.pushLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const stats = {
      total: logs.length,
      success: logs.filter((l) => l.success).length,
      failed: logs.filter((l) => !l.success).length,
      byType: {} as Record<string, number>,
    };

    // 按类型统计
    logs.forEach((log) => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('获取推送统计失败:', error);
    return null;
  }
}
