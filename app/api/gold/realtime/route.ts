import { NextRequest, NextResponse } from 'next/server';
import { fetchRealtimePrice, getTodayStats, savePriceData } from '@/lib/gold-service';
import { ApiResponse, GoldPriceData } from '@/types';

/**
 * GET /api/gold/realtime?save=true
 * 获取当前实时金价
 * @param save - 可选参数，为true时保存数据到数据库（默认不保存）
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const shouldSave = searchParams.get('save') === 'true';

    // 获取最新价格
    const priceData = await fetchRealtimePrice();

    if (!priceData) {
      return NextResponse.json<ApiResponse<GoldPriceData>>(
        { success: false, message: '获取金价失败' },
        { status: 500 }
      );
    }

    // 仅当save=true时保存到数据库
    if (shouldSave) {
      await savePriceData(priceData);
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
