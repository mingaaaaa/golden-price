import { NextResponse } from 'next/server';
import { fetchRealtimePrice, getTodayStats } from '@/lib/gold-service';
import { ApiResponse, GoldPriceData } from '@/types';

/**
 * GET /api/gold/realtime
 * 获取当前实时金价
 */
export async function GET() {
  try {
    // 获取最新价格
    const priceData = await fetchRealtimePrice();

    if (!priceData) {
      return NextResponse.json<ApiResponse<GoldPriceData>>(
        { success: false, message: '获取金价失败' },
        { status: 500 }
      );
    }

    // 返回数据
    return NextResponse.json<ApiResponse<GoldPriceData>>({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error('GET /api/gold/realtime 错误:', error);
    return NextResponse.json<ApiResponse<GoldPriceData>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
