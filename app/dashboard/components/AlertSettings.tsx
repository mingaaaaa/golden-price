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
import styles from './AlertSettings.module.scss';

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

  return (
    <Card
      loading={loading}
      className={styles.card}
      styles={{
        body: { padding: '32px' },
        header: {
          background: 'linear-gradient(135deg, rgba(212, 160, 72, 0.08) 0%, rgba(212, 160, 72, 0.02) 100%)',
          borderBottom: '1px solid rgba(212, 160, 72, 0.15)',
          padding: '20px 32px',
        },
      }}
      title={
        <div className={styles.header}>
          <BellOutlined className={styles.headerIcon} />
          <span className={styles.headerTitle}>
            预警设置
          </span>
        </div>
      }
    >
      {/* 背景装饰纹理 */}
      <div className={styles.backgroundDecoration} />

      <Form
        form={form}
        layout="vertical"
        onFinish={saveConfig}
        initialValues={{
          highPrice: 1250,
          lowPrice: 1200,
          enabled: true,
        }}
        className={styles.form}
      >
        {/* 高位预警 */}
        <Form.Item
          label={
            <div className={styles.label}>
              <WarningOutlined className={`${styles.labelIcon} ${styles.labelIconRed}`} />
              <span className={styles.labelText}>
                高位预警
              </span>
              <Tooltip title="当黄金价格达到或高于设定值时，系统将发送钉钉预警通知">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
              </Tooltip>
            </div>
          }
          name="highPrice"
          help={<span className={styles.helpText}>当价格达到或高于此值时触发预警（留空表示不启用）</span>}
        >
          <InputNumber
            className={`${styles.input} alert-input`}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1250"
            suffix={<span className={styles.suffix}>元/克</span>}
          />
        </Form.Item>

        {/* 低位预警 */}
        <Form.Item
          label={
            <div className={styles.label}>
              <ThunderboltOutlined className={`${styles.labelIcon} ${styles.labelIconGreen}`} />
              <span className={styles.labelText}>
                低位预警
              </span>
              <Tooltip title="当黄金价格达到或低于设定值时，系统将发送钉钉预警通知">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13, cursor: 'help' }} />
              </Tooltip>
            </div>
          }
          name="lowPrice"
          help={<span className={styles.helpText}>当价格达到或低于此值时触发预警（留空表示不启用）</span>}
        >
          <InputNumber
            className={`${styles.input} ${styles.low} alert-input`}
            min={0}
            max={10000}
            precision={2}
            placeholder="例如：1200"
            suffix={<span className={`${styles.suffix} ${styles.green}`}>元/克</span>}
          />
        </Form.Item>

        {/* 启用预警开关 */}
        <Form.Item
          label={
            <div className={styles.label}>
              <SafetyOutlined className={`${styles.labelIcon} ${styles.labelIconGold}`} />
              <span className={styles.labelText}>
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
          <Switch className={`${styles.switch} alert-switch`} />
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
              className={`${styles.saveButton} alert-save-button ${saveSuccess ? styles.success : ''}`}
            >
              {saving ? '保存中...' : saveSuccess ? '✓ 保存成功' : '保存设置'}
            </Button>

            <div className={styles.infoCard}>
              <InfoCircleOutlined className={styles.infoCardIcon} />
              <Text className={styles.infoCardText}>
                所有用户共享此配置，修改后会影响所有人。建议在团队协商后调整阈值。
              </Text>
            </div>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
