import { NextResponse } from 'next/server';
import { fetchGoldShopPrices, saveGoldShopPrices, validateGoldShopBrandPrice } from '@/lib/gold-shop-scraper';
import { ApiResponse } from '@/types';

/**
 * POST /api/gold-shop/collect
 * 手动触发金店价格采集（用于测试或补救）
 */
export async function POST() {
  try {
    console.log(`[${new Date().toISOString()}] 手动触发金店价格采集...`);

    const { date, prices } = await fetchGoldShopPrices();

    // 验证所有数据
    const validPrices = prices.filter(validateGoldShopBrandPrice);

    if (validPrices.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          message: '没有有效的价格数据，请检查网站是否可访问',
        },
        { status: 400 }
      );
    }

    // 保存到数据库
    const saved = await saveGoldShopPrices(date, validPrices);

    if (!saved) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          message: '保存数据失败，请检查数据库连接',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ date: string; count: number }>>(
      {
        success: true,
        data: { date, count: validPrices.length },
        message: `成功采集 ${validPrices.length} 家金店价格（日期：${date}）`,
      }
    );
  } catch (error) {
    console.error('POST /api/gold-shop/collect 错误:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: '采集失败',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
