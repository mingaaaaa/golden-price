import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/types';

/**
 * POST /api/alert/check
 * 检查预警（定时任务调用，或手动测试）
 */
export async function POST(request: NextRequest) {
  try {
    // 获取最新价格
    const latestPrice = await prisma.goldPrice.findFirst({
      orderBy: {
        collectedAt: 'desc',
      },
    });

    if (!latestPrice) {
      return NextResponse.json<ApiResponse<{ shouldAlert: boolean }>>({
        success: true,
        data: {
          shouldAlert: false,
        },
        message: '没有价格数据',
      });
    }

    // 获取预警配置
    const alertConfig = await prisma.alertConfig.findFirst();

    if (!alertConfig || !alertConfig.enabled) {
      return NextResponse.json<ApiResponse<{
        shouldAlert: boolean;
        currentPrice: number;
        message: string;
      }>>({
        success: true,
        data: {
          shouldAlert: false,
          currentPrice: latestPrice.price,
          message: '预警未启用',
        },
      });
    }

    const currentPrice = latestPrice.price;
    let shouldAlert = false;
    let alertType: 'high' | 'low' | null = null;
    let message = '';

    // 检查高位预警
    if (alertConfig.highPrice !== null && alertConfig.highPrice !== undefined) {
      if (currentPrice >= alertConfig.highPrice) {
        shouldAlert = true;
        alertType = 'high';
        message = `当前价格 ${currentPrice} 已超过目标价 ${alertConfig.highPrice}`;
      }
    }

    // 检查低位预警
    if (!alertType && alertConfig.lowPrice !== null && alertConfig.lowPrice !== undefined) {
      if (currentPrice <= alertConfig.lowPrice) {
        shouldAlert = true;
        alertType = 'low';
        message = `当前价格 ${currentPrice} 已低于目标价 ${alertConfig.lowPrice}`;
      }
    }

    if (!shouldAlert) {
      message = `当前价格 ${currentPrice} 在正常范围内`;
    }

    return NextResponse.json<ApiResponse<{
      shouldAlert: boolean;
      alertType?: string | null;
      currentPrice: number;
      message: string;
    }>>({
      success: true,
      data: {
        shouldAlert,
        alertType: alertType ?? undefined,
        currentPrice,
        message,
      },
    });
  } catch (error) {
    console.error('POST /api/alert/check 错误:', error);
    return NextResponse.json<ApiResponse<{ shouldAlert: boolean }>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
