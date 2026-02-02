'use client';

import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, message, Space, Typography, Tooltip } from 'antd';
import {
  WarningOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface AlertSettingsProps {
  onConfigChange?: () => void;
}

export default function AlertSettings({ onConfigChange }: AlertSettingsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 加载预警配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alert/config');
      const result = await response.json();

      if (result.success && result.data) {
        form.setFieldsValue({
          highPrice: result.data.highPrice,
          lowPrice: result.data.lowPrice,
          enabled: result.data.enabled,
        });
      } else {
        message.error('加载预警配置失败');
      }
    } catch (error) {
      console.error('加载预警配置失败:', error);
      message.error('加载预警配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存预警配置
  const saveConfig = async (values: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/alert/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          highPrice: values.highPrice,
          lowPrice: values.lowPrice,
          enabled: values.enabled,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('预警配置已更新');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);

        if (onConfigChange) {
          onConfigChange();
        }
      } else {
        message.error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存预警配置失败:', error);
      message.error('保存预警配置失败');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const gradientCard = 'linear-gradient(135deg, rgba(212, 160, 72, 0.06) 0%, rgba(212, 160, 72, 0.02) 100%)';
  const gradientButton = 'linear-gradient(135deg, #d4a048 0%, #b8863a 100%)';
  const gradientButtonHover = 'linear-gradient(135deg, #e5b558 0%, #d4a048 100%)';

  return (
    <Card
      loading={loading}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(212, 160, 72, 0.2)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(212, 160, 72, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
      styles={{
        body: { padding: '32px' },
        header: {
          background: 'linear-gradient(135deg, rgba(212, 160, 72, 0.08) 0%, rgba(212, 160, 72, 0.02) 100%)',
          borderBottom: '1px solid rgba(212, 160, 72, 0.15)',
          padding: '20px 32px',
        },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BellOutlined
            style={{
              fontSize: 20,
              color: '#d4a048',
              background: 'linear-gradient(135deg, #d4a048 0%, #f5d98a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
          <span
            style={{
              color: '#d4a048',
              fontWeight: 700,
              fontSize: 18,
              fontFamily: '"Playfair Display", serif',
              letterSpacing: '0.5px',
            }}
          >
            预警设置
          </span>
        </div>
      }
    >
      {/* 背景装饰纹理 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 80% 20%, rgba(212, 160, 72, 0.03) 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={saveConfig}
        initialValues={{
          highPrice: 1250,
          lowPrice: 1200,
          enabled: true,
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* 高位预警 */}
        <Form.Item
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WarningOutlined style={{ color: '#cf1322', fontSize: 16 }} />
              <span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 14 }}>
                高位预警
              </span>
              <Tooltip title="当黄金价格达到或高于设定值时，系统将发送钉钉预警通知">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
              </Tooltip>
            </div>
          }
          name="highPrice"
          help={
            <span style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 500 }}>
              当价格达到或高于此值时触发预警（留空表示不启用）
            </span>
          }
        >
          <InputNumber
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              border: '1px solid rgba(207, 19, 34, 0.2)',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="alert-input"
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1250"
            suffix={
              <span
                style={{
                  color: '#cf1322',
                  fontWeight: 600,
                  fontSize: 13,
                  background: 'rgba(207, 19, 34, 0.08)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                元/克
              </span>
            }
          />
        </Form.Item>

        {/* 低位预警 */}
        <Form.Item
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThunderboltOutlined style={{ color: '#3f8600', fontSize: 16 }} />
              <span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 14 }}>
                低位预警
              </span>
              <Tooltip title="当黄金价格达到或低于设定值时，系统将发送钉钉预警通知">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
              </Tooltip>
            </div>
          }
          name="lowPrice"
          help={
            <span style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 500 }}>
              当价格达到或低于此值时触发预警（留空表示不启用）
            </span>
          }
        >
          <InputNumber
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              border: '1px solid rgba(63, 134, 0, 0.2)',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="alert-input"
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1200"
            suffix={
              <span
                style={{
                  color: '#3f8600',
                  fontWeight: 600,
                  fontSize: 13,
                  background: 'rgba(63, 134, 0, 0.08)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                元/克
              </span>
            }
          />
        </Form.Item>

        {/* 启用预警开关 */}
        <Form.Item
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SafetyOutlined style={{ color: '#d4a048', fontSize: 16 }} />
              <span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 14 }}>
                启用预警
              </span>
              <Tooltip title="开启后，系统将根据设定的价格阈值实时监控并发送预警">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
              </Tooltip>
            </div>
          }
          name="enabled"
          valuePropName="checked"
          style={{ marginBottom: 24 }}
        >
          <Switch
            style={{
              background: 'rgba(212, 160, 72, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="alert-switch"
          />
        </Form.Item>

        {/* 保存按钮和提示 */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', flexDirection: 'column' }} size={16}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              block
              icon={!saving && saveSuccess ? <SaveOutlined /> : undefined}
              style={{
                height: 52,
                background: saveSuccess
                  ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                  : gradientButton,
                border: 'none',
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '0.5px',
                boxShadow: saveSuccess
                  ? '0 4px 16px rgba(82, 196, 26, 0.3)'
                  : '0 4px 16px rgba(212, 160, 72, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="alert-save-button"
              onMouseEnter={(e) => {
                if (!saveSuccess) {
                  e.currentTarget.style.background = gradientButtonHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 160, 72, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saveSuccess) {
                  e.currentTarget.style.background = gradientButton;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 160, 72, 0.3)';
                }
              }}
            >
              {saving ? '保存中...' : saveSuccess ? '✓ 保存成功' : '保存设置'}
            </Button>

            <div
              style={{
                padding: '12px 16px',
                background: gradientCard,
                border: '1px solid rgba(212, 160, 72, 0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <InfoCircleOutlined style={{ color: '#d4a048', fontSize: 14, flexShrink: 0 }} />
              <Text style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 500, lineHeight: '1.6' }}>
                所有用户共享此配置，修改后会影响所有人。建议在团队协商后调整阈值。
              </Text>
            </div>
          </Space>
        </Form.Item>
      </Form>

      {/* 样式动画 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        .alert-input:hover,
        .alert-input:focus,
        .alert-input.ant-input-number-focused {
          border-color: rgba(212, 160, 72, 0.4) !important;
          box-shadow: 0 0 0 3px rgba(212, 160, 72, 0.1) !important;
          transform: translateY(-1px);
        }

        .alert-input .ant-input-number-input {
          font-weight: 500 !important;
        }

        /* 开关样式优化 */
        .alert-switch.ant-switch-checked {
          background: linear-gradient(135deg, #d4a048 0%, #b8863a 100%) !important;
        }

        .alert-switch:hover {
          transform: scale(1.05);
        }

        .alert-switch .ant-switch-handle {
          top: 2px;
          width: 18px;
          height: 18px;
        }

        .alert-switch.ant-switch-checked .ant-switch-handle {
          left: calc(100% - 20px);
        }

        /* 按钮波纹效果 */
        .alert-save-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .alert-save-button:active::before {
          width: 300px;
          height: 300px;
        }

        /* 成功状态动画 */
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .alert-save-button .anticon {
          animation: checkmark 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </Card>
  );
}
