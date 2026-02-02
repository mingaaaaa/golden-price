import { NextRequest, NextResponse } from 'next/server';
import { getBrandHistory } from '@/lib/gold-shop-scraper';
import { ApiResponse } from '@/types';

/**
 * GET /api/gold-shop/history?brand=品牌名&days=7
 * 获取指定品牌的历史价格趋势
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!brand) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          message: '缺少参数 brand，请指定品牌名称',
        },
        { status: 400 }
      );
    }

    if (days < 1 || days > 365) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          message: '参数 days 必须在 1-365 之间',
        },
        { status: 400 }
      );
    }

    const data = await getBrandHistory(brand, days);

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      }
    );
  } catch (error) {
    console.error('GET /api/gold-shop/history 错误:', error);
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
