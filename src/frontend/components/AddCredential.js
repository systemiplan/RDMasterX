import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Alert, 
  Space, 
  Typography, 
  Divider, 
  Checkbox, 
  InputNumber, 
  Row, 
  Col,
  Tooltip,
  message
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  SafetyOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  LinkOutlined,
  ReloadOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

const AddCredential = ({ 
  visible, 
  onClose, 
  onCredentialSaved,
  title = "Add New Credential" 
}) => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  
  // Password generator settings
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let availableChars = '';
    let password = '';
    
    // Build character set based on selected options
    if (includeUppercase) availableChars += uppercaseChars;
    if (includeLowercase) availableChars += lowercaseChars;
    if (includeNumbers) availableChars += numberChars;
    if (includeSpecialChars) availableChars += specialChars;
    
    if (availableChars === '') {
      message.error('Please select at least one character type for password generation');
      return;
    }
    
    // Use cryptographically secure random number generation
    const getSecureRandomInt = (max) => {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    };
    
    // Ensure at least one character from each selected type
    const guaranteedChars = [];
    if (includeUppercase && passwordLength > 0) {
      guaranteedChars.push(uppercaseChars[getSecureRandomInt(uppercaseChars.length)]);
    }
    if (includeLowercase && passwordLength > guaranteedChars.length) {
      guaranteedChars.push(lowercaseChars[getSecureRandomInt(lowercaseChars.length)]);
    }
    if (includeNumbers && passwordLength > guaranteedChars.length) {
      guaranteedChars.push(numberChars[getSecureRandomInt(numberChars.length)]);
    }
    if (includeSpecialChars && passwordLength > guaranteedChars.length) {
      guaranteedChars.push(specialChars[getSecureRandomInt(specialChars.length)]);
    }
    
    // Fill remaining length with random characters
    const remainingLength = passwordLength - guaranteedChars.length;
    for (let i = 0; i < remainingLength; i++) {
      password += availableChars[getSecureRandomInt(availableChars.length)];
    }
    
    // Combine guaranteed characters with random ones
    const allChars = [...guaranteedChars, ...password.split('')];
    
    // Shuffle using Fisher-Yates algorithm with secure random
    for (let i = allChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }
    
    const finalPassword = allChars.join('');
    setGeneratedPassword(finalPassword);
    form.setFieldsValue({ password: finalPassword });
    message.success('Secure password generated successfully!');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Password copied to clipboard!');
    } catch (err) {
      message.error('Failed to copy password');
    }
  };

  const handleSaveCredential = async (values) => {
    setLoading(true);
    setError(null);

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
        setError('Please provide at least one field (username, password, description, or url)');
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
        // Handle HTML error responses
        const htmlText = await response.text();
        console.error('Non-JSON response:', htmlText);
        throw new Error('Server returned an invalid response. Please check the backend logs.');
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      onCredentialSaved(data);
      form.resetFields();
      setGeneratedPassword('');
      setShowPasswordGenerator(false);
      message.success('Credential saved successfully!');
      onClose();
    } catch (err) {
      console.error('Save credential error:', err);
      setError(err.message || 'Failed to save credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    setGeneratedPassword('');
    setShowPasswordGenerator(false);
    onClose();
  };

  const passwordStrengthMeter = (password) => {
    if (!password) return { strength: 0, text: 'No password', color: '#d9d9d9' };
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength += 1;
    else feedback.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push('uppercase letters');
    
    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push('lowercase letters');
    
    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push('numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push('special characters');
    
    const levels = [
      { text: 'Very Weak', color: '#ff4d4f' },
      { text: 'Weak', color: '#ff7a45' },
      { text: 'Fair', color: '#ffa940' },
      { text: 'Good', color: '#73d13d' },
      { text: 'Strong', color: '#52c41a' }
    ];
    
    return levels[strength] || levels[0];
  };

  const currentPassword = form.getFieldValue('password') || '';
  const strengthInfo = passwordStrengthMeter(currentPassword);

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
      width={560}
      centered
      styles={{
        body: {
          background: theme === 'dark' ? '#1a1a1a' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
          padding: '16px'
        }
      }}
    >
      <div style={{ padding: '8px 0' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '14px' }}>
          Add a new credential to your secure vault. All fields are optional.
        </Text>

        {error && (
          <Alert
            message="Save Failed"
            description={
              <div>
                <p style={{ margin: 0, marginBottom: 8 }}>{error}</p>
                <p style={{ margin: 0, fontSize: '12px', color: theme === 'dark' ? '#bbb' : '#666' }}>
                  Check the console for more details or contact support if the problem persists.
                </p>
              </div>
            }
            type="error"
            showIcon
            style={{ 
              marginBottom: 24,
              border: '1px solid #ff4d4f',
              backgroundColor: theme === 'dark' ? '#2a1517' : '#fff2f0'
            }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveCredential}
          size="middle"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username (Optional)"
                style={{ marginBottom: '16px' }}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password (Optional)"
                style={{ marginBottom: '16px' }}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password or generate"
                  autoComplete="new-password"
                  visibilityToggle={{
                    visible: passwordVisible,
                    onVisibleChange: setPasswordVisible,
                  }}
                  suffix={
                    <Space size={4}>
                      <Tooltip title="Quick Generate (16 chars)">
                        <Button
                          type="text"
                          icon={<ReloadOutlined />}
                          onClick={generatePassword}
                          size="small"
                          style={{ color: '#1890ff' }}
                        />
                      </Tooltip>
                      <Tooltip title="Advanced Generator">
                        <Button
                          type="text"
                          icon={<SettingOutlined />}
                          onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                          size="small"
                        />
                      </Tooltip>
                      {currentPassword && (
                        <Tooltip title="Copy Password">
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(currentPassword)}
                            size="small"
                          />
                        </Tooltip>
                      )}
                    </Space>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description (Optional)"
                style={{ marginBottom: '16px' }}
              >
                <Input
                  prefix={<EditOutlined />}
                  placeholder="e.g., Zabbix monitoring account"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="url"
                label="URL (Optional)"
                style={{ marginBottom: '16px' }}
                rules={[
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input
                  prefix={<LinkOutlined />}
                  placeholder="https://example.com"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Password Strength Indicator */}
          {currentPassword && (
            <div style={{ marginTop: -16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(passwordStrengthMeter(currentPassword).strength || 0) * 20}%`,
                      backgroundColor: strengthInfo.color,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <Text style={{ fontSize: 12, color: strengthInfo.color, minWidth: 60 }}>
                  {strengthInfo.text}
                </Text>
              </div>
            </div>
          )}

          {/* Password Generator */}
          {showPasswordGenerator && (
            <div style={{ 
              marginBottom: 16, 
              padding: 12, 
              border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
              borderRadius: 6,
              background: theme === 'dark' ? '#2a2a2a' : '#f8f9fa'
            }}>
              <Title level={5} style={{ marginBottom: 12, color: theme === 'dark' ? '#fff' : '#333', fontSize: '14px' }}>
                <ReloadOutlined /> Advanced Password Generator
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Length:</Text>
                  <InputNumber
                    min={4}
                    max={50}
                    value={passwordLength}
                    onChange={setPasswordLength}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={generatePassword}
                    style={{ width: '100%', marginTop: 20 }}
                  >
                    Generate Password
                  </Button>
                </Col>
              </Row>

              <Row gutter={[16, 8]} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Checkbox
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                  >
                    Uppercase (A-Z)
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                  >
                    Lowercase (a-z)
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  >
                    Numbers (0-9)
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={includeSpecialChars}
                    onChange={(e) => setIncludeSpecialChars(e.target.checked)}
                  >
                    Special (!@#$%^&*)
                  </Checkbox>
                </Col>
              </Row>

              {generatedPassword && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Generated Password:</Text>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginTop: 4 
                  }}>
                    <Input
                      value={generatedPassword}
                      readOnly
                      style={{ 
                        fontFamily: 'monospace',
                        background: theme === 'dark' ? '#1a1a1a' : '#fff'
                      }}
                    />
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generatedPassword)}
                      tooltip="Copy to clipboard"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
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
                Save Credential
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoCircleOutlined style={{ color: theme === 'dark' ? '#1890ff' : '#1890ff' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            All credentials are encrypted using AES-256 encryption and stored securely in your vault.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default AddCredential;
