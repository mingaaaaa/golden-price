'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Spin, Alert as AntAlert, Space, Divider } from 'antd';
import StatCards from './components/StatCards';
import GoldChart from './components/GoldChart';
import AlertSettings from './components/AlertSettings';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 加载今日统计数据
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      // 由于我们没有直接获取统计的API，这里使用实时价格API
      const response = await fetch('/api/gold/realtime');
      const result = await response.json();

      if (result.success && result.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 临时使用实时数据作为统计
        setStats({
          highPrice: result.data.highPrice,
          lowPrice: result.data.lowPrice,
          avgPrice: result.data.price, // 暂时使用当前价格
          changePercent: result.data.changePercent,
        });
      } else {
        console.error('加载统计数据失败:', result.message);
      }
    } catch (error) {
      console.error('加载统计数据异常:', error);
    } finally {
      setStatsLoading(false);
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={3} style={{ margin: '16px 0' }}>
          黄金价格监控
        </Title>
      </Header>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 统计卡片 */}
          <Spin spinning={statsLoading}>
            <StatCards
              highPrice={stats?.highPrice || 0}
              lowPrice={stats?.lowPrice || 0}
              avgPrice={stats?.avgPrice || 0}
              changePercent={stats?.changePercent || 0}
            />
          </Spin>

          {/* 图表 */}
          <GoldChart refreshTrigger={refreshTrigger} />

          {/* 预警设置 */}
          <AlertSettings onConfigChange={handleConfigChange} />

          {/* 系统信息 */}
          <AntAlert
            message="系统说明"
            description={
              <div>
                <p>• 数据采集：每5分钟采集一次AUTD黄金价格</p>
                <p>• 推送策略：每小时整点推送（8:00-24:00）+ 价格预警</p>
                <p>• 数据保留：35天自动清理</p>
                <p>• 定时任务：仅在生产环境启用</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Space>
      </Content>
    </Layout>
  );
}
