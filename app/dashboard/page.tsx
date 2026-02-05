'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Typography, Space } from 'antd';
import styles from './page.module.scss';
import StatCards from './components/StatCards';
import GoldChart from './components/GoldChart';
import GoldShopPrices from './components/GoldShopPrices';
import AlertSettings from './components/AlertSettings';
import { GoldPriceData } from '@/types';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<GoldPriceData | null>(null);
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
      }
    } catch (error) {
      console.error('加载统计数据异常:', error);
    }
  };

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 定时轮询方法
  const startPolling = (interval: number = 30000) => {
    // 清除之前的定时器
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    // 立即执行一次
    loadStats();
    // 设置定时器
    pollingTimerRef.current = setInterval(() => {
      loadStats();
    }, interval);
    return pollingTimerRef.current;
  };

  // 组件挂载时启动定时轮询
  useEffect(() => {
    // 说是会导致级联渲染，不过在claude协助测试下发现是React 18 Strict Mode导致的渲染两次
    // 异步请求后渲染的逻辑是正常的
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startPolling();
  }, []);

  // 设置预警配置后更新数据
  const handleConfigChange = () => {
    // 配置更新后刷新数据
    setRefreshTrigger((prev) => prev + 1);
    loadStats();
  };

  return (
    <Layout className={styles.dashboard}>
      <Header className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={3} className={styles.title}>
            黄金价格监控
          </Title>
          <div className={styles.tag}>AUTD 实时</div>
        </div>
      </Header>
      <Content className={styles.content}>
        <Space direction="vertical" size={32} className={styles.space}>
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
          {/* <GoldChart refreshTrigger={refreshTrigger} /> */}

          {/* 金店价格表格 */}
          {/* <GoldShopPrices /> */}

          {/* 预警设置 */}
          {/* <AlertSettings onConfigChange={handleConfigChange} /> */}

          {/* 系统信息 */}
          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <span className={styles.infoIcon}>ℹ️</span>
              <span>系统说明</span>
            </div>
            <div className={styles.infoContent}>
              <div>• 数据采集：每5分钟采集一次AUTD黄金价格</div>
              <div>• 推送策略：每小时整点推送（8:00-24:00）+ 价格预警</div>
              <div>• 数据保留：35天自动清理</div>
            </div>
          </div>
        </Space>
      </Content>
    </Layout>
  );
}
