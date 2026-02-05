import * as schedule from 'node-schedule';
import { fetchRealtimePrice, savePriceData, getTodayStats, cleanupOldData } from './gold-service';
import { fetchGoldShopPrices, saveGoldShopPrices, validateGoldShopBrandPrice, cleanupOldShopPrices } from './gold-shop-scraper';
import { sendHourlyReport, sendDailyReport, sendAlert, sendErrorAlert, sendShopPriceAlert as sendShopPriceAlertDingTalk } from './dingtalk';
import { prisma } from './db';

// 任务锁（简单的内存锁）
const taskLocks = new Map<string, boolean>();

// 失败计数器（用于异常告警）
const failureCounters = new Map<string, number>();
const MAX_FAILURES = 3;

/**
 * 获取任务锁
 */
function acquireTaskLock(taskName: string): boolean {
  if (taskLocks.has(taskName)) {
    console.warn(`任务 ${taskName} 已在运行，跳过本次执行`);
    return false;
  }
  taskLocks.set(taskName, true);
  return true;
}

/**
 * 释放任务锁
 */
function releaseTaskLock(taskName: string): void {
  taskLocks.delete(taskName);
}

/**
 * 重置失败计数器
 */
function resetFailureCounter(taskName: string): void {
  failureCounters.delete(taskName);
}

/**
 * 增加失败计数并检查是否需要告警
 */
async function incrementFailureAndCheck(taskName: string, error: string): Promise<boolean> {
  const currentCount = (failureCounters.get(taskName) || 0) + 1;
  failureCounters.set(taskName, currentCount);

  console.error(`任务 ${taskName} 失败 (${currentCount}/${MAX_FAILURES}): ${error}`);

  if (currentCount >= MAX_FAILURES) {
    // 针对金店价格采集任务使用专门的告警（包含"黄金"关键词）
    if (taskName === 'collectGoldShopPrices') {
      await sendShopPriceAlertDingTalk(error);
    } else {
      await sendErrorAlert(`${taskName}: ${error}`);
    }
    resetFailureCounter(taskName);
    return true; // 已发送告警
  }

  return false; // 未达到告警阈值
}

/**
 * 任务1：采集金价（每5分钟）
 */
async function collectGoldPrice(): Promise<void> {
  const taskName = 'collectGoldPrice';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始采集金价...`);

    const priceData = await fetchRealtimePrice();

    if (priceData) {
      await savePriceData(priceData);
      resetFailureCounter(taskName);
    } else {
      await incrementFailureAndCheck(taskName, '获取金价数据失败');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务2：发送小时报（每小时整点 8:00-23:00）
 */
async function sendHourlyReportTask(): Promise<void> {
  const taskName = 'sendHourlyReport';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始发送小时报...`);

    const stats = await getTodayStats();

    if (stats) {
      const priceData = {
        price: stats.currentPrice,
        highPrice: stats.highPrice,
        lowPrice: stats.lowPrice,
        changePercent: stats.changePercent,
        changeAmount: stats.changeAmount,
        openPrice: 0, // 占位
        buyPrice: 0, // 占位
        sellPrice: 0, // 占位
        lastClose: 0, // 占位
        time: new Date().toTimeString().slice(0, 8), // HH:MM:SS
        collectedAt: new Date(),
      };

      await sendHourlyReport(priceData);
      resetFailureCounter(taskName);
    } else {
      console.warn('没有今日数据，跳过小时报');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务3：发送日报（每天24:00）
 */
async function sendDailyReportTask(): Promise<void> {
  const taskName = 'sendDailyReport';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始发送日报...`);

    const today = new Date();
    await sendDailyReport(today);
    resetFailureCounter(taskName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务4：检查预警（每5分钟）
 */
async function checkPriceAlertTask(): Promise<void> {
  const taskName = 'checkPriceAlert';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    // 从数据库读取预警配置
    const alertConfig = await prisma.alertConfig.findFirst();

    if (!alertConfig || !alertConfig.enabled) {
      // 预警未启用，跳过
      releaseTaskLock(taskName);
      return;
    }

    // 获取最新价格
    const latestPrice = await prisma.goldPrice.findFirst({
      orderBy: {
        collectedAt: 'desc',
      },
    });

    if (!latestPrice) {
      // 没有数据，跳过
      releaseTaskLock(taskName);
      return;
    }

    const currentPrice = latestPrice.price;
    let shouldAlert = false;
    let alertType: 'high' | 'low' | null = null;

    // 检查高位预警
    if (alertConfig.highPrice !== null && alertConfig.highPrice !== undefined) {
      if (currentPrice >= alertConfig.highPrice) {
        shouldAlert = true;
        alertType = 'high';
      }
    }

    // 检查低位预警
    if (alertConfig.lowPrice !== null && alertConfig.lowPrice !== undefined) {
      if (currentPrice <= alertConfig.lowPrice) {
        shouldAlert = true;
        alertType = 'low';
      }
    }

    if (shouldAlert && alertType) {
      console.log(`触发${alertType === 'high' ? '高位' : '低位'}预警: ${currentPrice}`);
      await sendAlert(currentPrice, alertConfig, alertType);
    }

    resetFailureCounter(taskName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务5：清理旧数据（每天凌晨2:00）
 */
async function cleanupOldDataTask(): Promise<void> {
  const taskName = 'cleanupOldData';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始清理旧数据...`);

    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '35', 10);
    const deletedCount = await cleanupOldData(retentionDays);

    console.log(`已清理 ${deletedCount} 条旧数据`);
    resetFailureCounter(taskName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务6：采集金店价格（每天7:30）
 */
async function collectGoldShopPricesTask(): Promise<void> {
  const taskName = 'collectGoldShopPrices';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始采集金店价格...`);

    const { date, prices } = await fetchGoldShopPrices();

    // 验证所有数据
    const validPrices = prices.filter((price) => {
      const isValid = validateGoldShopBrandPrice(price);
      if (!isValid) {
        console.warn(`数据验证失败，跳过: ${price.brandName}`);
      }
      return isValid;
    });

    if (validPrices.length > 0) {
      await saveGoldShopPrices(date, validPrices);
      resetFailureCounter(taskName);
      console.log(`✓ 金店价格采集完成，共 ${validPrices.length} 家`);
    } else {
      await incrementFailureAndCheck(taskName, '没有有效的价格数据');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

/**
 * 任务7：清理金店价格旧数据（每天凌晨2:05，在主数据清理后执行）
 */
async function cleanupShopPricesTask(): Promise<void> {
  const taskName = 'cleanupShopPrices';

  if (!acquireTaskLock(taskName)) {
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] 开始清理金店价格旧数据...`);

    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '35', 10);
    const deletedCount = await cleanupOldShopPrices(retentionDays);

    console.log(`✓ 已清理 ${deletedCount} 条金店价格旧数据`);
    resetFailureCounter(taskName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await incrementFailureAndCheck(taskName, errorMessage);
  } finally {
    releaseTaskLock(taskName);
  }
}

// 存储已调度的任务（用于取消）
const scheduledJobs = new Map<string, schedule.Job>();

/**
 * 初始化所有定时任务
 */
export function initScheduler(): void {
  // 检查是否启用定时任务（兼容 PM2 的布尔值和字符串值）
  const envValue = String(process.env.ENABLE_SCHEDULER);
  const enableScheduler = envValue === 'true' || envValue === '1';

  if (!enableScheduler) {
    console.log('定时任务未启用（ENABLE_SCHEDULER=false）');
    return;
  }

  console.log('初始化定时任务...');

  // 任务1：每5分钟采集金价
  const collectJob = schedule.scheduleJob('*/5 * * * *', collectGoldPrice);
  scheduledJobs.set('collectGoldPrice', collectJob);
  console.log('✓ 已调度：采集金价任务（每5分钟）');

  // 任务2：每小时推送（8:00-23:00）
  const hourlyJob = schedule.scheduleJob('0 8-23 * * *', sendHourlyReportTask);
  scheduledJobs.set('sendHourlyReport', hourlyJob);
  console.log('✓ 已调度：小时报任务（8:00-23:00 每小时）');

  // 任务3：每日日报（24:00）
  const dailyJob = schedule.scheduleJob('0 0 * * *', sendDailyReportTask);
  scheduledJobs.set('sendDailyReport', dailyJob);
  console.log('✓ 已调度：日报任务（每天 24:00）');

  // 任务4：每5分钟检查预警
  const alertJob = schedule.scheduleJob('*/5 * * * *', checkPriceAlertTask);
  scheduledJobs.set('checkPriceAlert', alertJob);
  console.log('✓ 已调度：预警检查任务（每5分钟）');

  // 任务5：每天凌晨2:00清理旧数据
  const cleanupJob = schedule.scheduleJob('0 2 * * *', cleanupOldDataTask);
  scheduledJobs.set('cleanupOldData', cleanupJob);
  console.log('✓ 已调度：数据清理任务（每天 2:00）');

  // 任务6：每天7:30采集金店价格
  const shopPriceJob = schedule.scheduleJob('0 30 7 * * *', collectGoldShopPricesTask);
  scheduledJobs.set('collectGoldShopPrices', shopPriceJob);
  console.log('✓ 已调度：金店价格采集任务（每天 7:30）');

  // 任务7：每天凌晨2:05清理金店价格旧数据
  const cleanupShopJob = schedule.scheduleJob('5 2 * * *', cleanupShopPricesTask);
  scheduledJobs.set('cleanupShopPrices', cleanupShopJob);
  console.log('✓ 已调度：金店价格清理任务（每天 2:05）');

  console.log('所有定时任务已启动！');
}

/**
 * 停止所有定时任务
 */
export function stopScheduler(): void {
  console.log('停止所有定时任务...');

  scheduledJobs.forEach((job, name) => {
    job.cancel();
    console.log(`✓ 已取消：${name}`);
  });

  scheduledJobs.clear();
}

/**
 * 手动触发采集任务（用于测试）
 */
export async function manualCollect(): Promise<void> {
  await collectGoldPrice();
}

/**
 * 手动触发预警检查（用于测试）
 */
export async function manualCheckAlert(): Promise<void> {
  await checkPriceAlertTask();
}

/**
 * 获取定时任务状态
 */
export function getSchedulerStatus(): { running: boolean; jobs: string[] } {
  return {
    running: scheduledJobs.size > 0,
    jobs: Array.from(scheduledJobs.keys()),
  };
}
