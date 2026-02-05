'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Spin, Empty, Button, Tooltip, message } from 'antd';
import { ReloadOutlined, CrownOutlined, FireOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { GoldShopPriceRecord, GoldShopBrandPrice } from '@/types';
import styles from './GoldShopPrices.module.scss';

export default function GoldShopPrices() {
  const [data, setData] = useState<GoldShopPriceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collecting, setCollecting] = useState(false);

  // 手动采集金店价格
  const handleCollect = useCallback(async () => {
    setCollecting(true);
    try {
      const response = await fetch('/api/gold-shop/collect', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        message.success(result.message || '采集成功！');
        // 采集成功后重新加载数据
        await loadData(true);
      } else {
        message.error(result.message || '采集失败！');
      }
    } catch (error) {
      console.error('手动采集异常:', error);
      message.error('采集失败，请稍后重试');
    } finally {
      setCollecting(false);
    }
  }, []);

  // 加载金店价格数据
  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/gold-shop/prices');
      const result = await response.json();

      if (result.success && result.data) {
        // 按黄金价从低到高排序
        const sortedPrices = [...result.data.prices].sort((a, b) => a.goldPrice - b.goldPrice);
        setData({ ...result.data, prices: sortedPrices });
      } else {
        console.error('加载金店价格失败:', result.message);
      }
    } catch (error) {
      console.error('加载金店价格异常:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // 每5分钟自动刷新
    const interval = setInterval(() => loadData(true), 300000);
    return () => clearInterval(interval);
  }, [loadData]);

  // 表格列定义
  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 90,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => {
        const isTop3 = index < 3;
        return (
          <div className={styles.rankCell}>
            {isTop3 && <CrownOutlined className={styles.rankIcon} />}
            <span className={`${styles.rankNumber} ${isTop3 ? styles.top3 : ''}`}>
              {index + 1}
            </span>
          </div>
        );
      },
    },
    {
      title: '品牌名称',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 160,
      render: (text: string, record: GoldShopBrandPrice, index: number) => (
        <div className={styles.brandCell}>
          {index < 3 && (
            <Tag color="gold" className={styles.topTag}>
              TOP{index + 1}
            </Tag>
          )}
          <span className={styles.brandName}>{text}</span>
        </div>
      ),
    },
    {
      title: '黄金价',
      dataIndex: 'goldPrice',
      key: 'goldPrice',
      width: 140,
      sorter: (a: GoldShopBrandPrice, b: GoldShopBrandPrice) => a.goldPrice - b.goldPrice,
      defaultSortOrder: 'ascend' as const,
      render: (price: number, record: GoldShopBrandPrice, index: number) => (
        <div className={styles.priceCell}>
          <span className={`${styles.priceValue} ${index < 3 ? styles.top3 : styles.normal}`}>
            ¥{price.toFixed(2)}
          </span>
          <div className={styles.priceUnit}>
            {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: '铂金价',
      dataIndex: 'platinumPrice',
      key: 'platinumPrice',
      width: 120,
      render: (price: number | undefined) => (
        <span
          style={{
            color: price ? '#1a1a1a' : '#bfbfbf',
            fontWeight: price ? 500 : 400,
            fontSize: price ? 15 : 14,
          }}
        >
          {price ? `¥${price.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      title: '金条价',
      dataIndex: 'barPrice',
      key: 'barPrice',
      width: 120,
      render: (price: number | undefined) => (
        <span
          style={{
            color: price ? '#1a1a1a' : '#bfbfbf',
            fontWeight: price ? 500 : 400,
            fontSize: price ? 15 : 14,
          }}
        >
          {price ? `¥${price.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      title: '更新日期',
      dataIndex: 'updateDate',
      key: 'updateDate',
      width: 120,
      render: (date: string) => (
        <span
          style={{
            color: '#595959',
            fontSize: 13,
            fontFamily: 'monospace',
          }}
        >
          {date}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FireOutlined className={styles.headerIcon} />
            <span className={styles.headerTitle}>
              各品牌金店价格
            </span>
          </div>
          <div className={styles.updateTag}>
            每日 7:30 更新
          </div>
        </div>
      }
      loading={loading}
      extra={
        <div className={styles.headerRight}>
          <Tooltip title="手动采集最新金店价格">
            <Button
              icon={<CloudDownloadOutlined spin={collecting} />}
              onClick={handleCollect}
              disabled={collecting}
              className={styles.collectButton}
            >
              {collecting ? '采集中...' : '手动采集'}
            </Button>
          </Tooltip>
          <Tooltip title="刷新显示数据">
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => loadData(true)}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              刷新
            </Button>
          </Tooltip>
        </div>
      }
      className={styles.card}
      styles={{
        body: { padding: '24px' },
        header: {
          background: 'linear-gradient(135deg, rgba(212, 160, 72, 0.08) 0%, rgba(212, 160, 72, 0.02) 100%)',
          borderBottom: '1px solid rgba(212, 160, 72, 0.15)',
          padding: '20px 24px',
        },
      }}
    >
      {data?.prices && data.prices.length > 0 ? (
        <>
          <div className={styles.infoBar}>
            <FireOutlined className={styles.infoIcon} />
            <span className={styles.infoText}>
              共 <strong className={styles.infoHighlight}>{data.prices.length}</strong> 家金店价格数据
              · 数据日期：<strong className={styles.infoHighlight}>{data.date}</strong>
            </span>
          </div>

          <Table
            columns={columns}
            dataSource={data.prices}
            rowKey={(record) => record.brandName}
            pagination={false}
            size="middle"
            className={styles.table}
            rowClassName={(_, index) =>
              index < 3 ? styles.topRankRow : ''
            }
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>
                暂无金店价格数据
              </div>
              <div className={styles.emptyDesc}>
                系统将在每天早上 <strong className={styles.emptyHighlight}>7:30</strong> 自动采集数据<br />
                或点击右上角"刷新"按钮手动触发采集
              </div>
            </div>
          }
        />
      )}
    </Card>
  );
}
