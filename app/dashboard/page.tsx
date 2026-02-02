'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space } from 'antd';
import StatCards from './components/StatCards';
import GoldChart from './components/GoldChart';
import GoldShopPrices from './components/GoldShopPrices';
import AlertSettings from './components/AlertSettings';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 加载今日统计数据
  const loadStats = async () => {
    try {
      // 使用实时价格API获取完整数据
      const response = await fetch('/api/gold/realtime');
      const result = await response.json();

      if (result.success && result.data) {
        // 直接使用实时数据
        setStats(result.data);
      } else {
        console.error('加载统计数据失败:', result.message);
      }
    } catch (error) {
      console.error('加载统计数据异常:', error);
    }
  };

  useEffect(() => {
    loadStats();
    // 每30秒刷新一次统计数据
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = () => {
    // 配置更新后刷新数据
    setRefreshTrigger((prev) => prev + 1);
    loadStats();
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      <Header
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          padding: '0 32px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title
            level={3}
            style={{
              margin: 0,
              background: 'linear-gradient(135deg, #d4a048 0%, #b8863a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            黄金价格监控
          </Title>
          <div
            style={{
              marginLeft: 16,
              padding: '4px 12px',
              background: 'rgba(212, 160, 72, 0.1)',
              border: '1px solid rgba(212, 160, 72, 0.3)',
              borderRadius: 20,
              fontSize: 12,
              color: '#d4a048',
            }}
          >
            AUTD 实时
          </div>
        </div>
      </Header>
      <Content style={{ padding: '32px 24px' }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          {/* 统计卡片 */}
          <StatCards
            price={stats?.price || 0}
            highPrice={stats?.highPrice || 0}
            lowPrice={stats?.lowPrice || 0}
            buyPrice={stats?.buyPrice || 0}
            sellPrice={stats?.sellPrice || 0}
            lastClose={stats?.lastClose || 0}
            openPrice={stats?.openPrice || 0}
            changeAmount={stats?.changeAmount || 0}
            changePercent={stats?.changePercent || 0}
          />

          {/* 图表 */}
          <GoldChart refreshTrigger={refreshTrigger} />

          {/* 金店价格表格 */}
          <GoldShopPrices />

          {/* 预警设置 */}
          <AlertSettings onConfigChange={handleConfigChange} />

          {/* 系统信息 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 16,
              padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 12,
                color: '#d4a048',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span style={{ marginRight: 8 }}>ℹ️</span>
              <span>系统说明</span>
            </div>
            <div style={{ color: '#595959', fontSize: 13, lineHeight: '1.8' }}>
              <div style={{ marginBottom: 4 }}>• 数据采集：每5分钟采集一次AUTD黄金价格</div>
              <div style={{ marginBottom: 4 }}>• 推送策略：每小时整点推送（8:00-24:00）+ 价格预警</div>
              <div>• 数据保留：35天自动清理</div>
            </div>
          </div>
        </Space>
      </Content>
    </Layout>
  );
}
