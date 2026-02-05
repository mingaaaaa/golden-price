'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import {
  FundOutlined,
  RiseOutlined,
  FallOutlined,
  DotChartOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

interface StatCardsProps {
  price: number;
  highPrice: number;
  lowPrice: number;
  buyPrice: number;
  sellPrice: number;
  lastClose: number;
  openPrice: number;
  changeAmount: number;
  changePercent: number;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshSuccess?: boolean;
}

export default function StatCards({
  price,
  highPrice,
  lowPrice,
  buyPrice,
  sellPrice,
  lastClose,
  openPrice,
  changeAmount,
  changePercent,
  loading = false,
  onRefresh,
  refreshing = false,
  refreshSuccess = false,
}: StatCardsProps) {
  const isPositive = changePercent >= 0;

  const [prevPrice, setPrevPrice] = useState(price);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);

  // 价格变化检测
  useEffect(() => {
    if (price !== prevPrice && prevPrice !== 0) {
      const direction = price > prevPrice ? 'up' : 'down';
      setPriceDirection(direction);
      setPrevPrice(price);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [price, prevPrice]);

  const gradientGold = 'linear-gradient(135deg, #d4a048 0%, #f5d98a 50%, #d4a048 100%)';
  const gradientCardUp = 'linear-gradient(135deg, rgba(207, 19, 34, 0.08) 0%, rgba(255, 107, 107, 0.02) 100%)';
  const gradientCardDown = 'linear-gradient(135deg, rgba(63, 134, 0, 0.08) 0%, rgba(115, 209, 61, 0.02) 100%)';

  return (
    <Card
      loading={loading}
      style={{
        marginBottom: 32,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(212, 160, 72, 0.2)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(212, 160, 72, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 背景装饰纹理 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 30%, rgba(212, 160, 72, 0.03) 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header - Latest Price */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px 20px 32px',
          background: `linear-gradient(180deg, rgba(212, 160, 72, 0.06) 0%, transparent 100%)`,
        }}
      >
        {/* 标题 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 16,
            position: 'relative',
          }}
        >
          {/* 左侧：标题和图标 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FundOutlined
              style={{
                fontSize: 18,
                color: '#d4a048',
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#595959',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              黄金实时价格 (AUTD)
            </div>
          </div>

          {/* 右侧：刷新按钮 */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: refreshing
                  ? 'linear-gradient(90deg, rgba(212, 160, 72, 0.15) 0%, rgba(245, 217, 138, 0.2) 50%, rgba(212, 160, 72, 0.15) 100%)'
                  : 'rgba(212, 160, 72, 0.08)',
                backgroundSize: '200% 100%',
                border: `1.5px solid ${refreshSuccess ? 'rgba(82, 196, 26, 0.6)' : 'rgba(212, 160, 72, 0.4)'}`,
                borderRadius: 12,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: refreshSuccess
                  ? '0 4px 12px rgba(82, 196, 26, 0.25)'
                  : '0 2px 8px rgba(212, 160, 72, 0.15)',
                opacity: refreshing ? 0.7 : 1,
                animation: refreshing ? 'shimmer 1.5s infinite' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!refreshing && !refreshSuccess) {
                  e.currentTarget.style.background = 'rgba(212, 160, 72, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 160, 72, 0.35)';
                  e.currentTarget.style.borderColor = 'rgba(212, 160, 72, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing && !refreshSuccess) {
                  e.currentTarget.style.background = 'rgba(212, 160, 72, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 160, 72, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(212, 160, 72, 0.4)';
                }
              }}
              onMouseDown={(e) => {
                if (!refreshing && !refreshSuccess) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!refreshing && !refreshSuccess) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                }
              }}
            >
              {refreshSuccess ? (
                <span
                  style={{
                    fontSize: 14,
                    color: '#52c41a',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              ) : (
                <ReloadOutlined
                  spin={refreshing}
                  style={{
                    fontSize: 14,
                    color: refreshing ? '#d4a048' : '#b8863a',
                  }}
                />
              )}

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: refreshing ? '#d4a048' : refreshSuccess ? '#52c41a' : '#b8863a',
                  letterSpacing: '0.3px',
                }}
              >
                {refreshing ? '刷新中...' : refreshSuccess ? '已更新' : '刷新'}
              </span>
            </button>
          )}
        </div>

        {/* 价格显示 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#8c8c8c',
            }}
          >
            ¥
          </span>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1,
              background: gradientGold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 12px rgba(212, 160, 72, 0.3)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {price.toFixed(2)}
          </div>
        </div>

        {/* 涨跌幅显示 */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 24px',
            borderRadius: 16,
            background: isPositive ? gradientCardUp : gradientCardDown,
            border: `1px solid ${isPositive ? 'rgba(207, 19, 34, 0.3)' : 'rgba(63, 134, 0, 0.3)'}`,
            boxShadow: isPositive
              ? '0 4px 16px rgba(207, 19, 34, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 16px rgba(63, 134, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: isPositive ? '#cf1322' : '#3f8600',
            }}
          >
            {isPositive ? '↑' : '↓'}
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: isPositive ? '#cf1322' : '#3f8600',
            }}
          >
            {isPositive ? '+' : ''}{changeAmount.toFixed(2)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: isPositive ? '#cf1322' : '#3f8600',
              opacity: 0.85,
            }}
          >
            ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* 动画指示器 */}
        {isAnimating && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: priceDirection === 'up' ? '#cf1322' : '#3f8600',
              boxShadow: `0 0 12px ${priceDirection === 'up' ? '#cf1322' : '#3f8600'}`,
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ position: 'relative', zIndex: 1 }}>
        {/* 最高价 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<RiseOutlined />}
            iconColor="#cf1322"
            title="最高价"
            value={highPrice.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(207, 19, 34, 0.08) 0%, rgba(207, 19, 34, 0.02) 100%)"
            borderColor="rgba(207, 19, 34, 0.2)"
          />
        </Col>

        {/* 最低价 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<FallOutlined />}
            iconColor="#3f8600"
            title="最低价"
            value={lowPrice.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(63, 134, 0, 0.08) 0%, rgba(63, 134, 0, 0.02) 100%)"
            borderColor="rgba(63, 134, 0, 0.2)"
          />
        </Col>

        {/* 开盘价 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<DotChartOutlined />}
            iconColor="#d4a048"
            title="开盘价"
            value={openPrice.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(212, 160, 72, 0.08) 0%, rgba(212, 160, 72, 0.02) 100%)"
            borderColor="rgba(212, 160, 72, 0.2)"
          />
        </Col>

        {/* 昨结算 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<CalendarOutlined />}
            iconColor="#8c8c8c"
            title="昨结算"
            value={lastClose.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(140, 140, 140, 0.08) 0%, rgba(140, 140, 140, 0.02) 100%)"
            borderColor="rgba(140, 140, 140, 0.2)"
          />
        </Col>

        {/* 买一价 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<ShoppingOutlined />}
            iconColor="#1890ff"
            title="买一价"
            value={buyPrice.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.02) 100%)"
            borderColor="rgba(24, 144, 255, 0.2)"
          />
        </Col>

        {/* 卖一价 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<ShoppingCartOutlined />}
            iconColor="#722ed1"
            title="卖一价"
            value={sellPrice.toFixed(2)}
            suffix="元/克"
            gradient="linear-gradient(135deg, rgba(114, 46, 209, 0.08) 0%, rgba(114, 46, 209, 0.02) 100%)"
            borderColor="rgba(114, 46, 209, 0.2)"
          />
        </Col>

        {/* 涨跌额 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<ThunderboltOutlined />}
            iconColor={isPositive ? '#cf1322' : '#3f8600'}
            title="涨跌额"
            value={`${isPositive ? '+' : ''}${changeAmount.toFixed(2)}`}
            suffix="元/克"
            gradient={isPositive ? gradientCardUp : gradientCardDown}
            borderColor={isPositive ? 'rgba(207, 19, 34, 0.3)' : 'rgba(63, 134, 0, 0.3)'}
          />
        </Col>

        {/* 涨跌幅 */}
        <Col xs={12} sm={8} md={6}>
          <StatCard
            icon={<TrophyOutlined />}
            iconColor={isPositive ? '#cf1322' : '#3f8600'}
            title="涨跌幅"
            value={`${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`}
            suffix=""
            gradient={isPositive ? gradientCardUp : gradientCardDown}
            borderColor={isPositive ? 'rgba(207, 19, 34, 0.3)' : 'rgba(63, 134, 0, 0.3)'}
          />
        </Col>
      </Row>

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .stat-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .stat-card-icon {
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-card-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-card-value {
          background: linear-gradient(135deg, #1a1a1a 0%, #595959 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-card-value {
          transform: scale(1.05);
        }
      `}</style>
    </Card>
  );
}

// Stat Card 子组件
interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  value: string;
  suffix: string;
  gradient: string;
  borderColor: string;
}

function StatCard({ icon, iconColor, title, value, suffix, gradient, borderColor }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '20px 16px',
        textAlign: 'center',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        height: '100%',
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = gradient;
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* 装饰背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradient,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
        }}
        className="stat-card-bg"
      />

      {/* 内容区域 */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 图标 */}
        <div
          className="stat-card-icon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${iconColor}15`,
            marginBottom: 12,
            fontSize: 20,
            color: iconColor,
            boxShadow: `0 2px 8px ${iconColor}30`,
          }}
        >
          {icon}
        </div>

        {/* 标题 */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#8c8c8c',
            marginBottom: 8,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>

        {/* 数值 */}
        <div
          className="stat-card-value"
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {value}
        </div>

        {/* 单位（始终占据空间，保持卡片高度一致） */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#8c8c8c',
            minHeight: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {suffix || '\u00A0'}
        </div>
      </div>
    </div>
  );
}
