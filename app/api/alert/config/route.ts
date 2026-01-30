import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponse, AlertConfigData } from '@/types';

/**
 * GET /api/alert/config
 * 获取预警配置
 */
export async function GET() {
  try {
    // 获取预警配置（应该只有一条记录）
    let config = await prisma.alertConfig.findFirst();

    // 如果不存在，创建默认配置
    if (!config) {
      config = await prisma.alertConfig.create({
        data: {
          highPrice: 1250.0,
          lowPrice: 1200.0,
          enabled: true,
        },
      });
    }

    const data: AlertConfigData = {
      id: config.id,
      highPrice: config.highPrice,
      lowPrice: config.lowPrice,
      enabled: config.enabled,
    };

    return NextResponse.json<ApiResponse<AlertConfigData>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/alert/config 错误:', error);
    return NextResponse.json<ApiResponse<AlertConfigData>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/alert/config
 * 更新预警配置
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json<ApiResponse<AlertConfigData>>(
        { success: false, message: 'enabled 字段必填且为布尔值' },
        { status: 400 }
      );
    }

    // 获取现有配置（应该只有一条记录）
    const existingConfig = await prisma.alertConfig.findFirst();

    if (!existingConfig) {
      // 如果不存在，创建新配置
      const config = await prisma.alertConfig.create({
        data: {
          highPrice: body.highPrice ?? null,
          lowPrice: body.lowPrice ?? null,
          enabled: body.enabled,
        },
      });

      const data: AlertConfigData = {
        id: config.id,
        highPrice: config.highPrice,
        lowPrice: config.lowPrice,
        enabled: config.enabled,
      };

      return NextResponse.json<ApiResponse<AlertConfigData>>({
        success: true,
        data,
        message: '预警配置已创建',
      });
    }

    // 更新现有配置
    const config = await prisma.alertConfig.update({
      where: { id: existingConfig.id },
      data: {
        highPrice: body.highPrice !== undefined ? body.highPrice : null,
        lowPrice: body.lowPrice !== undefined ? body.lowPrice : null,
        enabled: body.enabled,
      },
    });

    const data: AlertConfigData = {
      id: config.id,
      highPrice: config.highPrice,
      lowPrice: config.lowPrice,
      enabled: config.enabled,
    };

    return NextResponse.json<ApiResponse<AlertConfigData>>({
      success: true,
      data,
      message: '预警配置已更新',
    });
  } catch (error) {
    console.error('PUT /api/alert/config 错误:', error);
    return NextResponse.json<ApiResponse<AlertConfigData>>(
      {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
