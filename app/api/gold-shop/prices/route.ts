import { NextRequest, NextResponse } from 'next/server';
import { getLatestGoldShopPrices, getGoldShopPricesByDate } from '@/lib/gold-shop-scraper';
import { ApiResponse, GoldShopPriceRecord } from '@/types';

/**
 * GET /api/gold-shop/prices?date=YYYY-MM-DD
 * 获取金店价格数据
 * - 不传date参数：返回最新数据
 * - 传date参数：返回指定日期数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    const data = date ? await getGoldShopPricesByDate(date) : await getLatestGoldShopPrices();

    if (!data) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          message: date ? `未找到 ${date} 的数据` : '暂无数据，请等待定时采集或手动触发',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<GoldShopPriceRecord>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/gold-shop/prices 错误:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
