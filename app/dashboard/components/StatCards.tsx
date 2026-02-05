'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import styles from './StatCards.module.scss';
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
  time?: string;
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
  time,
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

  const gradientCardUp = 'linear-gradient(135deg, rgba(207, 19, 34, 0.08) 0%, rgba(255, 107, 107, 0.02) 100%)';
  const gradientCardDown = 'linear-gradient(135deg, rgba(63, 134, 0, 0.08) 0%, rgba(115, 209, 61, 0.02) 100%)';

  return (
    <Card
      loading={loading}
      className={styles.card}
    >
      {/* 背景装饰纹理 */}
      <div className={styles.backgroundDecoration} />

      {/* Header - Latest Price */}
      <div className={styles.header}>
        {/* 标题 */}
        <div className={styles.titleBar}>
          {/* 左侧：标题和图标 */}
          <div className={styles.titleLeft}>
            <FundOutlined className={styles.titleIcon} />
            <div className={styles.titleText}>
              黄金实时价格 (AUTD)
            </div>
          </div>

          {/* 右侧：刷新按钮 */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''} ${refreshSuccess ? styles.success : ''}`}
            >
              {refreshSuccess ? (
                <span className={styles.successIcon}>✓</span>
              ) : (
                <ReloadOutlined
                  spin={refreshing}
                  className={`${styles.refreshIcon} ${refreshing ? styles.refreshing : ''}`}
                />
              )}

              <span className={`${styles.refreshText} ${refreshing ? styles.refreshing : ''} ${refreshSuccess ? styles.success : ''}`}>
                {refreshing ? '刷新中...' : refreshSuccess ? '已更新' : '刷新'}
              </span>
            </button>
          )}
        </div>

        {/* 价格显示 */}
        <div className={styles.priceDisplay}>
          <span className={styles.priceSymbol}>¥</span>
          <div className={`${styles.priceValue} ${isAnimating ? styles.animating : ''}`}>
            {price.toFixed(2)}
          </div>
        </div>

        {/* 涨跌幅显示 */}
        <div className={`${styles.changeDisplay} ${isPositive ? styles.up : styles.down}`}>
          <span className={`${styles.changeArrow} ${isPositive ? styles.up : styles.down}`}>
            {isPositive ? '↑' : '↓'}
          </span>
          <span className={`${styles.changeValue} ${isPositive ? styles.up : styles.down}`}>
            {isPositive ? '+' : ''}{changeAmount.toFixed(2)}
          </span>
          <span className={`${styles.changePercent} ${isPositive ? styles.up : styles.down}`}>
            ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* 数据更新时间 */}
        {time && (
          <div className={styles.updateTime}>
            数据更新时间：{new Date().toLocaleDateString('zh-CN')} {time}
          </div>
        )}

        {/* 动画指示器 */}
        {isAnimating && (
          <div className={`${styles.animationIndicator} ${priceDirection === 'up' ? styles.up : styles.down}`} />
        )}
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className={styles.statsGrid}>
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
            valueColor={isPositive ? '#cf1322' : '#3f8600'}
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
            valueColor={isPositive ? '#cf1322' : '#3f8600'}
          />
        </Col>
      </Row>
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
  valueColor?: string;
}

function StatCard({ icon, iconColor, title, value, suffix, gradient, borderColor, valueColor }: StatCardProps) {
  return (
    <div
      className={styles.statCard}
      style={{
        '--card-gradient': gradient,
        border: `1px solid ${borderColor}`,
      } as React.CSSProperties}
    >
      {/* 装饰背景 */}
      <div className={styles.backgroundDecoration} style={{ background: gradient }} />

      {/* 内容区域 */}
      <div className={styles.statCardContent}>
        {/* 图标 */}
        <div
          className="stat-card-icon"
          style={{
            background: `${iconColor}15`,
            color: iconColor,
            boxShadow: `0 2px 8px ${iconColor}30`,
          }}
        >
          {icon}
        </div>

        {/* 标题 */}
        <div className={styles.statCardTitle}>
          {title}
        </div>

        {/* 数值 */}
        <div
          className={styles.statCardValue}
          style={valueColor ? {
            color: valueColor,
            WebkitTextFillColor: valueColor,
            background: 'none'
          } as React.CSSProperties : undefined}
        >
          {value}
        </div>

        {/* 单位（始终占据空间，保持卡片高度一致） */}
        <div className={styles.statCardUnit}>
          {suffix || '\u00A0'}
        </div>
      </div>
    </div>
  );
}
