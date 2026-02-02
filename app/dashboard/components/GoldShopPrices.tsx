'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Spin, Empty, Button, Tooltip, message } from 'antd';
import { ReloadOutlined, CrownOutlined, FireOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { GoldShopPriceRecord, GoldShopBrandPrice } from '@/types';

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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            {isTop3 && <CrownOutlined style={{ color: '#d4a048', fontSize: 14 }} />}
            <span
              style={{
                fontWeight: isTop3 ? 700 : 500,
                color: isTop3 ? '#d4a048' : '#8c8c8c',
                fontSize: isTop3 ? 16 : 14,
                fontFamily: isTop3 ? '"Playfair Display", serif' : 'inherit',
              }}
            >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {index < 3 && (
            <Tag
              color="gold"
              style={{
                margin: 0,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                fontSize: 12,
                border: 'none',
                boxShadow: '0 2px 8px rgba(212, 160, 72, 0.3)',
              }}
            >
              TOP{index + 1}
            </Tag>
          )}
          <span
            style={{
              fontWeight: 600,
              color: '#1a1a1a',
              fontSize: 15,
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            {text}
          </span>
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
        <div>
          <span
            style={{
              color: index < 3 ? '#d4a048' : '#cf1322',
              fontWeight: index < 3 ? 700 : 600,
              fontSize: index < 3 ? 17 : 16,
            }}
          >
            ¥{price.toFixed(2)}
          </span>
          <div
            style={{
              fontSize: 11,
              color: '#8c8c8c',
              marginTop: 2,
            }}
          >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FireOutlined style={{ color: '#d4a048', fontSize: 20 }} />
            <span
              style={{
                color: '#d4a048',
                fontWeight: 700,
                fontSize: 18,
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '0.5px',
              }}
            >
              各品牌金店价格
            </span>
          </div>
          <div
            style={{
              padding: '4px 12px',
              background: 'linear-gradient(135deg, rgba(212, 160, 72, 0.15) 0%, rgba(212, 160, 72, 0.05) 100%)',
              border: '1px solid rgba(212, 160, 72, 0.3)',
              borderRadius: 20,
              fontSize: 12,
              color: '#d4a048',
              fontWeight: 500,
            }}
          >
            每日 7:30 更新
          </div>
        </div>
      }
      loading={loading}
      extra={
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="手动采集最新金店价格">
            <Button
              icon={<CloudDownloadOutlined spin={collecting} />}
              onClick={handleCollect}
              disabled={collecting}
              style={{
                borderColor: 'rgba(82, 196, 26, 0.5)',
                color: '#52c41a',
                fontWeight: 500,
              }}
            >
              {collecting ? '采集中...' : '手动采集'}
            </Button>
          </Tooltip>
          <Tooltip title="刷新显示数据">
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                borderColor: 'rgba(212, 160, 72, 0.5)',
                color: '#d4a048',
                fontWeight: 500,
              }}
            >
              刷新
            </Button>
          </Tooltip>
        </div>
      }
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 160, 72, 0.15)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
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
          <div
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(212, 160, 72, 0.1) 0%, rgba(212, 160, 72, 0.03) 100%)',
              border: '1px solid rgba(212, 160, 72, 0.25)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FireOutlined style={{ color: '#d4a048', fontSize: 16 }} />
            <span
              style={{
                color: '#8c8c8c',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              共 <strong style={{ color: '#d4a048' }}>{data.prices.length}</strong> 家金店价格数据
              · 数据日期：<strong style={{ color: '#d4a048' }}>{data.date}</strong>
            </span>
          </div>

          <Table
            columns={columns}
            dataSource={data.prices}
            rowKey={(record) => record.brandName}
            pagination={false}
            size="middle"
            style={{
              background: 'transparent',
            }}
            rowClassName={(_, index) =>
              index < 3 ? 'top-rank-row' : ''
            }
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div
                style={{
                  fontSize: 16,
                  color: '#595959',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                暂无金店价格数据
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#8c8c8c',
                  lineHeight: '1.8',
                }}
              >
                系统将在每天早上 <strong style={{ color: '#d4a048' }}>7:30</strong> 自动采集数据<br />
                或点击右上角"刷新"按钮手动触发采集
              </div>
            </div>
          }
        />
      )}

      <style jsx global>{`
        .top-rank-row {
          background: linear-gradient(
            135deg,
            rgba(212, 160, 72, 0.06) 0%,
            rgba(212, 160, 72, 0.02) 100%
          ) !important;
          transition: all 0.3s ease;
        }
        .top-rank-row:hover {
          background: linear-gradient(
            135deg,
            rgba(212, 160, 72, 0.12) 0%,
            rgba(212, 160, 72, 0.04) 100%
          ) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 160, 72, 0.15);
        }
        .top-rank-row td {
          border-bottom: 1px solid rgba(212, 160, 72, 0.1) !important;
        }

        /* 自定义表格样式 */
        .ant-table-thead > tr > th {
          background: linear-gradient(
            135deg,
            rgba(212, 160, 72, 0.05) 0%,
            rgba(212, 160, 72, 0.02) 100%
          ) !important;
          border-bottom: 2px solid rgba(212, 160, 72, 0.2) !important;
          color: #595959 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 14px 16px !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
          padding: 14px 16px !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: rgba(212, 160, 72, 0.03) !important;
        }

        .ant-pagination-item-active {
          border-color: #d4a048 !important;
          background: linear-gradient(135deg, #d4a048 0%, #b8863a 100%) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
        }

        /* 引入 Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
      `}</style>
    </Card>
  );
}
