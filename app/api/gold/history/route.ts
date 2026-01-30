import { NextRequest, NextResponse } from 'next/server';
import { getHistoryData } from '@/lib/gold-service';
import { ApiResponse, GoldPriceData } from '@/types';

/**
 * GET /api/gold/history?view=hour|day
 * 获取历史数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'hour';

    // 验证参数
    if (view !== 'hour' && view !== 'day') {
      return NextResponse.json<ApiResponse<GoldPriceData[]>>(
        { success: false, message: '参数 view 必须是 hour 或 day' },
        { status: 400 }
      );
    }

    // 计算时间范围
    const endTime = new Date();
    const startTime = new Date();

    if (view === 'hour') {
      // 时视图：近24小时
      startTime.setHours(startTime.getHours() - 24);
    } else {
      // 天视图：近35天
      startTime.setDate(startTime.getDate() - 35);
    }

    // 获取历史数据
    const interval = view === 'hour' ? 'raw' : 'hour';
    const data = await getHistoryData(startTime, endTime, interval);

    return NextResponse.json<ApiResponse<GoldPriceData[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/gold/history 错误:', error);
    return NextResponse.json<ApiResponse<GoldPriceData[]>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
