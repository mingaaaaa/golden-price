'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';

interface StatCardsProps {
  price: number;           // 最新价
  highPrice: number;       // 最高价
  lowPrice: number;        // 最低价
  buyPrice: number;        // 买一价
  sellPrice: number;       // 卖一价
  lastClose: number;       // 昨结算
  openPrice: number;       // 开盘价
  changeAmount: number;    // 涨跌额
  changePercent: number;   // 涨跌幅
  loading?: boolean;
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
}: StatCardsProps) {
  const isPositive = changePercent >= 0;

  // 添加价格变化检测逻辑
  const [prevPrice, setPrevPrice] = useState(price);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);

  // 检测价格变化
  useEffect(() => {
    if (price !== prevPrice && prevPrice !== 0) {
      const direction = price > prevPrice ? 'up' : 'down';
      setPriceDirection(direction);
      setPrevPrice(price);

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [price, prevPrice]);

  return (
    <Card
      style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Header - Latest Price */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 0',
          color: '#1a1a1a',
          position: 'relative',
        }}
      >
        <div style={{ fontSize: 14, marginBottom: 8, color: '#595959' }}>
          黄金实时价格 (AUTD)
        </div>

        {/* 价格显示，带颜色过渡动画 */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 12,
            transition: 'color 0.3s ease',
            color: isAnimating
              ? (priceDirection === 'up' ? '#cf1322' : '#3f8600')
              : '#d4a048',
          }}
        >
          {price.toFixed(2)}
        </div>

        <div style={{ fontSize: 14, color: '#595959' }}>元/克</div>

        <div
          style={{
            marginTop: 12,
            fontSize: 18,
            fontWeight: 500,
            color: isPositive ? '#cf1322' : '#3f8600',
            transition: 'color 0.3s ease',
          }}
        >
          {isPositive ? '+' : ''}{changeAmount.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </div>

        {/* 数据更新指示器 */}
        {isAnimating && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: priceDirection === 'up' ? '#cf1322' : '#3f8600',
            animation: 'pulse 0.6s ease-out',
          }} />
        )}
      </div>

      {/* Grid for other metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>最高价</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{highPrice.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>最低价</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{lowPrice.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>开盘价</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{openPrice.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>昨结算</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{lastClose.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>买一价</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{buyPrice.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>卖一价</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{sellPrice.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>涨跌额</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{isPositive ? '+' : ''}{changeAmount.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              color: '#1a1a1a',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fafbfc';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>涨跌幅</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
