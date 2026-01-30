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
    <Card title="预警设置" loading={loading} style={{ marginBottom: 24 }}>
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
          label="高位预警"
          name="highPrice"
          help="当价格达到或高于此值时触发预警（留空表示不启用）"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1250"
            addonAfter="元/克"
          />
        </Form.Item>

        <Form.Item
          label="低位预警"
          name="lowPrice"
          help="当价格达到或低于此值时触发预警（留空表示不启用）"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1200"
            addonAfter="元/克"
          />
        </Form.Item>

        <Form.Item
          label="启用预警"
          name="enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={saving} block>
              保存设置
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ⚠️ 所有用户共享此配置，修改后会影响所有人
            </Text>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
