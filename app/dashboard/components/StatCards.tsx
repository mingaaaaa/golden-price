'use client';

import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

interface StatCardsProps {
  highPrice: number;
  lowPrice: number;
  avgPrice: number;
  changePercent: number;
  loading?: boolean;
}

export default function StatCards({
  highPrice,
  lowPrice,
  avgPrice,
  changePercent,
  loading = false,
}: StatCardsProps) {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="今日最高"
            value={highPrice}
            precision={2}
            suffix="元/克"
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="今日最低"
            value={lowPrice}
            precision={2}
            suffix="元/克"
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="今日平均"
            value={avgPrice}
            precision={2}
            suffix="元/克"
            valueStyle={{ color: '#1677ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="今日涨跌幅"
            value={changePercent}
            precision={2}
            suffix="%"
            valueStyle={{
              color: changePercent >= 0 ? '#3f8600' : '#cf1322',
            }}
            prefix={changePercent >= 0 ? '+' : ''}
          />
        </Card>
      </Col>
    </Row>
  );
}
