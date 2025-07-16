import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col,
  Tooltip,
  message,
  Collapse
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Panel } = Collapse;
const { Text } = Typography;

const QuickAddCredential = ({ onCredentialSaved }) => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Quick password generator (simplified)
  const generateQuickPassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    let password = '';
    
    // Use cryptographically secure random generation
    const getSecureRandomInt = (max) => {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    };
    
    // Generate 16-character password
    for (let i = 0; i < 16; i++) {
      password += allChars[getSecureRandomInt(allChars.length)];
    }
    
    form.setFieldsValue({ password });
    message.success('Secure 16-character password generated!');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard!');
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    
    try {
      // All fields are optional - just clean up the data
      const credentialData = {
        username: values.username ? values.username.trim() : null,
        password: values.password || null,
        description: values.description ? values.description.trim() : null,
        url: values.url ? values.url.trim() : null,
        createdAt: new Date().toISOString()
      };

      // Check if at least one field is provided
      const hasData = credentialData.username || credentialData.password || 
                     credentialData.description || credentialData.url;
      
      if (!hasData) {
        message.error('Please provide at least one field');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentialData)
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server returned an invalid response');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save credential');
      }

      onCredentialSaved(data);
      form.resetFields();
      setExpanded(false);
      message.success('Credential saved successfully!');
    } catch (err) {
      console.error('Save credential error:', err);
      message.error(err.message || 'Failed to save credential');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setExpanded(false);
  };

  return (
    <Card
      size="small"
      style={{ 
        background: theme === 'dark' ? '#2a2a2a' : '#fafafa',
        border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text strong style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
          Quick Add Credential
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Cancel' : 'Add'}
        </Button>
      </div>

      <Collapse 
        activeKey={expanded ? ['1'] : []} 
        ghost
        onChange={(keys) => setExpanded(keys.length > 0)}
      >
        <Panel key="1" showArrow={false} style={{ padding: 0 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            style={{ marginTop: '16px' }}
          >
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Username"
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Username"
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="small"
                    visibilityToggle={{
                      visible: passwordVisible,
                      onVisibleChange: setPasswordVisible,
                    }}
                    suffix={
                      <Space size={4}>
                        <Tooltip title="Generate Password">
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            size="small"
                            onClick={generateQuickPassword}
                          />
                        </Tooltip>
                        <Tooltip title="Copy Password">
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => copyToClipboard(form.getFieldValue('password') || '')}
                          />
                        </Tooltip>
                      </Space>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input
                prefix={<EditOutlined />}
                placeholder="e.g., Production database admin"
                size="small"
              />
            </Form.Item>

            <Form.Item
              name="url"
              label="URL (Optional)"
              rules={[{ type: 'url', message: 'Enter a valid URL' }]}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://example.com"
                size="small"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="small"
                >
                  Save
                </Button>
                <Button 
                  onClick={handleCancel}
                  size="small"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default QuickAddCredential;
