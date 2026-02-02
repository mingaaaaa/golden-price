'use client';

import React, { useEffect, useState } from 'react';
import { Card, Radio } from 'antd';
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
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
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
      loading={loading}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      title={
        <span style={{ color: '#d4a048', fontWeight: 600, fontSize: 16 }}>
          价格走势
        </span>
      }
      extra={
        <Radio.Group
          value={view}
          onChange={(e) => setView(e.target.value)}
          style={{ background: '#f5f5f5', borderRadius: 8, padding: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}
        >
          <Radio.Button
            value="hour"
            style={{
              background: view === 'hour' ? '#d4a048' : 'transparent',
              borderColor: view === 'hour' ? '#d4a048' : 'transparent',
              color: view === 'hour' ? '#fff' : '#595959',
            }}
          >
            时视图（24h）
          </Radio.Button>
          <Radio.Button
            value="day"
            style={{
              background: view === 'day' ? '#d4a048' : 'transparent',
              borderColor: view === 'day' ? '#d4a048' : 'transparent',
              color: view === 'day' ? '#fff' : '#595959',
            }}
          >
            天视图（35天）
          </Radio.Button>
        </Radio.Group>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
          <XAxis
            dataKey="collectedAt"
            tickFormatter={formatXAxis}
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="rgba(0, 0, 0, 0.45)"
            style={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: '元/克', angle: -90, position: 'insideLeft', fill: 'rgba(0, 0, 0, 0.45)', style: { fontSize: 12 } }}
            domain={['dataMin - 5', 'dataMax + 5']}
            stroke="rgba(0, 0, 0, 0.45)"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              fontSize: 12,
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(212, 160, 72, 0.3)',
              borderRadius: 8,
              color: '#1a1a1a',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#d4a048"
            name="AUTD价格"
            strokeWidth={2.5}
            dot={view === 'hour' ? false : { r: 2, fill: '#d4a048' }}
            activeDot={{ r: 6, fill: '#d4a048', stroke: '#d4a048', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
