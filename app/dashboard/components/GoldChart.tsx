'use client';

import React, { useEffect, useState } from 'react';
import { Card, Radio, Space } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { GoldPriceData } from '@/types';

interface GoldChartProps {
  refreshTrigger?: number;
}

type TimeView = 'hour' | 'day';

export default function GoldChart({ refreshTrigger }: GoldChartProps) {
  const [view, setView] = useState<TimeView>('hour');
  const [data, setData] = useState<GoldPriceData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gold/history?view=${view}`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        console.error('加载历史数据失败:', result.message);
      }
    } catch (error) {
      console.error('加载历史数据异常:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view, refreshTrigger]);

  const formatXAxis = (tickItem: Date) => {
    const date = new Date(tickItem);
    if (view === 'hour') {
      // 时视图：显示 HH:mm
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      // 天视图：显示 MM-DD HH:00
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,
      });
    }
  };

  const formatTooltip = (value: any, name: any, props: any) => {
    const date = new Date(props.payload.collectedAt);
    return [
      `${date.toLocaleString('zh-CN', { hour12: false })}`,
      `${name}: ${value.toFixed(2)} 元/克`,
    ];
  };

  return (
    <Card
      title="价格走势"
      extra={
        <Radio.Group value={view} onChange={(e) => setView(e.target.value)}>
          <Radio.Button value="hour">时视图（24h）</Radio.Button>
          <Radio.Button value="day">天视图（35天）</Radio.Button>
        </Radio.Group>
      }
      loading={loading}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="collectedAt"
            tickFormatter={formatXAxis}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            label={{ value: '元/克', angle: -90, position: 'insideLeft' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip formatter={formatTooltip} contentStyle={{ fontSize: 12 }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1677ff"
            name="AUTD价格"
            strokeWidth={2}
            dot={view === 'hour' ? false : { r: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
