'use client';

import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, message, Space, Typography } from 'antd';
import { AlertConfigData } from '@/types';

const { Text } = Typography;

interface AlertSettingsProps {
  onConfigChange?: () => void;
}

export default function AlertSettings({ onConfigChange }: AlertSettingsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <Card
      title={
        <span style={{ color: '#d4a048', fontWeight: 600, fontSize: 16 }}>
          预警设置
        </span>
      }
      loading={loading}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={saveConfig}
        initialValues={{
          highPrice: 1250,
          lowPrice: 1200,
          enabled: true,
        }}
      >
        <Form.Item
          label={<span style={{ color: '#1a1a1a', fontWeight: 500 }}>高位预警</span>}
          name="highPrice"
          help={<span style={{ color: '#8c8c8c', fontSize: 12 }}>当价格达到或高于此值时触发预警（留空表示不启用）</span>}
        >
          <InputNumber
            style={{
              width: '100%',
              background: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: 8,
            }}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1250"
            addonAfter={<span style={{ color: '#595959' }}>元/克</span>}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#1a1a1a', fontWeight: 500 }}>低位预警</span>}
          name="lowPrice"
          help={<span style={{ color: '#8c8c8c', fontSize: 12 }}>当价格达到或低于此值时触发预警（留空表示不启用）</span>}
        >
          <InputNumber
            style={{
              width: '100%',
              background: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: 8,
            }}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1200"
            addonAfter={<span style={{ color: '#595959' }}>元/克</span>}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#1a1a1a', fontWeight: 500 }}>启用预警</span>}
          name="enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              block
              style={{
                height: 44,
                background: 'linear-gradient(135deg, #d4a048 0%, #b8863a 100%)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              保存设置
            </Button>
            <Text style={{ fontSize: 12, color: '#d4a048' }}>
              ⚠️ 所有用户共享此配置，修改后会影响所有人
            </Text>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
