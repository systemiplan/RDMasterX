import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Space, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ActiveDirectoryAuth = ({ 
  visible, 
  onClose, 
  onAuthSuccess,
  title = "Active Directory Authentication" 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuthentication = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ad/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store authentication token or session information
      if (data.token) {
        localStorage.setItem('adToken', data.token);
      }

      onAuthSuccess(data);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Please enter your Active Directory credentials to access domain services.
        </Text>

        {error && (
          <Alert
            message="Authentication Failed"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAuthentication}
          size="large"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 2, message: 'Username must be at least 2 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your domain username"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 1, message: 'Password is required' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your domain password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SafetyOutlined />}
              >
                Authenticate
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />
        
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
          Your credentials are securely transmitted and not stored locally.
        </Text>
      </div>
    </Modal>
  );
};

export default ActiveDirectoryAuth;
