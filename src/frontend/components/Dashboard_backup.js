import React, { useState, useEffect } from 'react';
import { Layout, Menu, Tree, Button, Card, Tabs, Input, Tooltip, Switch, Dropdown, AutoComplete, Modal, Radio, Space, Form, InputNumber, Select, Checkbox } from 'antd';
import {
  FolderOpenOutlined, PlusOutlined, UserOutlined, FileOutlined, SettingOutlined, LockOutlined, CloudOutlined, SearchOutlined, BulbOutlined, MoonOutlined,
  DesktopOutlined, CodeOutlined, GlobalOutlined, FolderOutlined, SafetyOutlined, KeyOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

const ribbonMenu = [
  { key: 'file', label: 'File' },
  { key: 'home', label: 'Home' },
  { key: 'edit', label: 'Edit' },
  { key: 'view', label: 'View' },
  { key: 'help', label: 'Help' },
  { key: 'tools', label: 'Tools' }
];

const treeData = [
  {
    title: 'Windjammer SQL',
    key: '0-0',
    icon: <FolderOpenOutlined />,
    children: [
      {
        title: 'Downhill Pro',
        key: '0-0-0',
        icon: <FolderOpenOutlined />,
      },
      // ...more folders and entries
    ],
  },
  // ...more root folders
];

const quickActionsForDropdown = [
  { key: 'new-entry', icon: <PlusOutlined />, label: 'New Entry' },
  { key: 'add-session', icon: <FileOutlined />, label: 'Add Session' },
  { key: 'add-website', icon: <CloudOutlined />, label: 'Add Website' },
  { key: 'add-contact', icon: <UserOutlined />, label: 'Add Contact' },
  { key: 'add-credential', icon: <KeyOutlined />, label: 'Add Credential' },
  { key: 'data-sources', icon: <SettingOutlined />, label: 'Data Sources' },
  { key: 'lock-app', icon: <LockOutlined />, label: 'Lock Application' },
];

const modernFont = {
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    recentConnections: 0,
    savedCredentials: 0,
  });
  const [recentConnections, setRecentConnections] = useState([]);
  const [rdpTabs, setRdpTabs] = useState([
    { key: 'tab-1', title: 'RDP Session 1', content: 'RDP Session Content 1' }
  ]);
  const [activeTabKey, setActiveTabKey] = useState('tab-1');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarSuggestions, setSidebarSuggestions] = useState([]);
  const [theme, setTheme] = useState('light');
  const [isNewEntryModalVisible, setIsNewEntryModalVisible] = useState(false);
  const [selectedConnectionType, setSelectedConnectionType] = useState('RDP');
  const [connectionForm] = Form.useForm();
  const [connectionDetails, setConnectionDetails] = useState({
    name: '',
    host: '',
    port: '',
    username: '',
    password: ''
  });
  const [isNewCredentialModalVisible, setIsNewCredentialModalVisible] = useState(false);
  const [credentialForm] = Form.useForm();
  const [credentialType, setCredentialType] = useState('Password');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalConnections: 25,
        activeConnections: 3,
        recentConnections: 8,
        savedCredentials: 12,
      });

      setRecentConnections([
        {
          id: 1,
          name: 'Production Server',
          type: 'RDP',
          host: '192.168.1.100',
          lastConnected: '2 hours ago',
          status: 'online',
        },
        {
          id: 2,
          name: 'Development DB',
          type: 'SSH',
          host: 'dev.example.com',
          lastConnected: '1 day ago',
          status: 'offline',
        },
        {
          id: 3,
          name: 'Web Server',
          type: 'SSH',
          host: '10.0.1.50',
          lastConnected: '3 hours ago',
          status: 'online',
        },
        {
          id: 4,
          name: 'File Server',
          type: 'VNC',
          host: 'files.company.com',
          lastConnected: '1 week ago',
          status: 'offline',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Tab logic
  const addRdpTab = (title = null, content = null) => {
    const newKey = `tab-${rdpTabs.length + 1}`;
    setRdpTabs([...rdpTabs, { key: newKey, title: title || `Session ${rdpTabs.length + 1}`, content: content || `Session Content ${rdpTabs.length + 1}` }]);
    setActiveTabKey(newKey);
  };
  const removeRdpTab = (targetKey) => {
    let newActiveKey = activeTabKey;
    let lastIndex = -1;
    rdpTabs.forEach((tab, i) => {
      if (tab.key === targetKey) lastIndex = i - 1;
    });
    const newTabs = rdpTabs.filter(tab => tab.key !== targetKey);
    
    if (newTabs.length && newActiveKey === targetKey) {
      newActiveKey = newTabs[lastIndex >= 0 ? lastIndex : 0].key;
    }
    setRdpTabs(newTabs);
    if (newTabs.length > 0) {
      setActiveTabKey(newActiveKey);
    }
  };
  const onTabChange = (key) => setActiveTabKey(key);
  const onTabEdit = (targetKey, action) => {
    if (action === 'add') addRdpTab();
    else if (action === 'remove') removeRdpTab(targetKey);
  };

  // Tab rename logic
  const renameTab = (key, newTitle) => {
    setRdpTabs(tabs => tabs.map(tab => tab.key === key ? { ...tab, title: newTitle } : tab));
  };

  // Sidebar search logic
  const handleSidebarSearch = (value) => {
    setSidebarSearch(value);
    if (!value) {
      setSidebarSuggestions([]);
      return;
    }
    // Simple filter for demo
    const allConnections = recentConnections.map(c => ({ value: c.name, id: c.id }));
    setSidebarSuggestions(allConnections.filter(c => c.value.toLowerCase().includes(value.toLowerCase())));
  };
  const handleSidebarSelect = (value) => {
    // Open connection logic here
    alert(`Open connection: ${value}`);
    setSidebarSearch('');
    setSidebarSuggestions([]);
  };

  // Quick Connect logic
  const [quickConnect, setQuickConnect] = useState('');
  const handleQuickConnect = (e) => {
    if (e.key === 'Enter' && quickConnect.trim()) {
      addRdpTab(quickConnect, `Connecting to ${quickConnect}...`);
      setQuickConnect('');
    }
  };

  // Theme toggle
  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
    document.body.setAttribute('data-theme', checked ? 'dark' : 'light');
  };

  const quickActions = [
    {
      title: 'New RDP Connection',
      description: 'Connect to Windows servers',
      icon: '🖥️',
      action: () => handleQuickAction('rdp'),
    },
    {
      title: 'New SSH Connection',
      description: 'Connect to Linux/Unix servers',
      icon: '⚡',
      action: () => handleQuickAction('ssh'),
    },
    {
      title: 'New VNC Connection',
      description: 'Remote desktop access',
      icon: '🖱️',
      action: () => handleQuickAction('vnc'),
    },
    {
      title: 'Import Connections',
      description: 'Import from file or other tools',
      icon: '📥',
      action: () => handleQuickAction('import'),
    },
  ];

  const handleQuickAction = (action) => {
    // In a real app, this would trigger modals or navigation
    switch (action) {
      case 'rdp':
        alert('Opening RDP Connection Dialog...');
        break;
      case 'ssh':
        alert('Opening SSH Connection Dialog...');
        break;
      case 'vnc':
        alert('Opening VNC Connection Dialog...');
        break;
      case 'import':
        alert('Opening Import Dialog...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleConnectToServer = (connection) => {
    alert(`Connecting to ${connection.name} (${connection.type})...`);
  };

  const getConnectionIcon = (type) => {
    switch (type) {
      case 'RDP': return '🖥️';
      case 'SSH': return '⚡';
      case 'VNC': return '🖱️';
      case 'Telnet': return '📡';
      default: return '🔗';
    }
  };

  const handleDropdownAction = (action) => {
    // Handle dropdown actions
    switch (action.key) {
      case 'new-entry':
        setIsNewEntryModalVisible(true);
        break;
      case 'add-session':
        alert('Opening Add Session Dialog...');
        break;
      case 'add-website':
        alert('Opening Add Website Dialog...');
        break;
      case 'add-contact':
        alert('Opening Add Contact Dialog...');
        break;
      case 'add-credential':
        setIsNewCredentialModalVisible(true);
        break;
      case 'data-sources':
        alert('Opening Data Sources Dialog...');
        break;
      case 'lock-app':
        alert('Locking Application...');
        break;
      default:
        console.log('Unknown action:', action.key);
    }
  };

  const handleNewEntryModalOk = () => {
    connectionForm.validateFields().then((values) => {
      const connectionData = {
        ...values,
        type: selectedConnectionType,
        id: Date.now() // Simple ID generation
      };
      console.log('Creating new connection:', connectionData);
      alert(`Creating new ${selectedConnectionType} connection to ${values.host}:${values.port}`);
      
      // Reset form and close modal
      connectionForm.resetFields();
      setConnectionDetails({
        name: '',
        host: '',
        port: '',
        username: '',
        password: ''
      });
      setIsNewEntryModalVisible(false);
    }).catch((error) => {
      console.error('Form validation failed:', error);
    });
  };

  const handleNewEntryModalCancel = () => {
    connectionForm.resetFields();
    setConnectionDetails({
      name: '',
      host: '',
      port: '',
      username: '',
      password: ''
    });
    setIsNewEntryModalVisible(false);
  };

  const getDefaultPort = (type) => {
    switch (type) {
      case 'RDP': return 3389;
      case 'SSH': return 22;
      case 'Telnet': return 23;
      case 'FTP': return 21;
      case 'SFTP': return 22;
      default: return '';
    }
  };

  const handleConnectionTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedConnectionType(newType);
    
    // Update the port field with default port for selected connection type
    connectionForm.setFieldsValue({
      port: getDefaultPort(newType)
    });
  };

  const connectionTypes = [
    { 
      value: 'RDP', 
      label: 'Remote Desktop Protocol (RDP)', 
      icon: <DesktopOutlined />, 
      description: 'Connect to Windows remote desktop',
      defaultPort: 3389
    },
    { 
      value: 'SSH', 
      label: 'Secure Shell (SSH)', 
      icon: <CodeOutlined />, 
      description: 'Connect to Linux/Unix servers via command line',
      defaultPort: 22
    },
    { 
      value: 'Telnet', 
      label: 'Telnet', 
      icon: <GlobalOutlined />, 
      description: 'Connect to network devices via Telnet protocol',
      defaultPort: 23
    },
    { 
      value: 'FTP', 
      label: 'File Transfer Protocol (FTP)', 
      icon: <FolderOutlined />, 
      description: 'Transfer files to/from servers',
      defaultPort: 21
    },
    { 
      value: 'SFTP', 
      label: 'SSH File Transfer Protocol (SFTP)', 
      icon: <SafetyOutlined />, 
      description: 'Secure file transfer over SSH',
      defaultPort: 22
    },
  ];

  // Credential modal handlers
  const handleNewCredentialModalOk = () => {
    credentialForm.validateFields().then((values) => {
      const credentialData = {
        ...values,
        type: credentialType,
        id: Date.now() // Simple ID generation
      };
      console.log('Creating new credential:', credentialData);
      alert(`Creating new ${credentialType} credential: ${values.credentialName}`);
      
      // Reset form and close modal
      credentialForm.resetFields();
      setIsNewCredentialModalVisible(false);
    }).catch((error) => {
      console.error('Credential form validation failed:', error);
    });
  };

  const handleNewCredentialModalCancel = () => {
    credentialForm.resetFields();
    setIsNewCredentialModalVisible(false);
  };

  const credentialTypes = [
    { value: 'Password', label: 'Password' },
    { value: 'Key', label: 'Key' },
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Token', label: 'Token' }
  ];

  return (
    <Layout style={{ minHeight: '100vh', ...modernFont, background: theme === 'dark' ? '#18191a' : '#f5f6fa' }}>
      {/* Top Bar with Tabs and Quick Connect */}
      <Header style={{ background: theme === 'dark' ? '#23272f' : '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 10 }}>
        <div style={{ flex: 1 }}>
          {rdpTabs.length > 0 ? (
            <Tabs
              type="editable-card"
              activeKey={activeTabKey}
              onChange={onTabChange}
              onEdit={(targetKey, action) => {
                if (action === 'remove') removeRdpTab(targetKey);
              }}
              hideAdd={true}
              items={rdpTabs.map(tab => ({
                key: tab.key,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tooltip title="Double click to rename">
                      <span
                        onDoubleClick={() => {
                          const newTitle = prompt('Rename tab:', tab.title);
                          if (newTitle) renameTab(tab.key, newTitle);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {tab.title}
                      </span>
                    </Tooltip>
                    <Dropdown
                      menu={{
                        items: quickActionsForDropdown,
                        onClick: handleDropdownAction,
                      }}
                      trigger={['click']}
                    >
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        size="small"
                        style={{ 
                          borderRadius: 2,
                          minWidth: 'auto',
                          padding: '0 3px',
                          height: '14px',
                          fontSize: '10px',
                          color: '#666',
                          border: 'none',
                          marginLeft: '4px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                ),
                children: <div>{tab.content}</div>
              }))}
              style={{ marginBottom: 0 }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
              <Dropdown
                menu={{
                  items: quickActionsForDropdown,
                  onClick: handleDropdownAction,
                }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  size="small"
                  style={{ 
                    borderRadius: 4,
                    minWidth: 'auto',
                    padding: '4px 6px',
                    height: '22px',
                    fontSize: '12px',
                    color: '#1890ff',
                    border: '1px solid #d9d9d9'
                  }}
                  title="Add new tab"
                />
              </Dropdown>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Dropdown
            menu={{
              items: quickActionsForDropdown,
              onClick: handleDropdownAction,
            }}
            trigger={['click']}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8 }}
            >
              Actions
            </Button>
          </Dropdown>
          <Input
            placeholder="Quick Connect (server/IP)"
            value={quickConnect}
            onChange={e => setQuickConnect(e.target.value)}
            onKeyDown={handleQuickConnect}
            style={{ width: 220, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={theme === 'light'}
            onChange={handleThemeToggle}
            style={{ marginLeft: 8 }}
          />
        </div>
      </Header>
      <Layout>
        {/* Sidebar Navigation */}
        <Sider width={260} style={{ background: theme === 'dark' ? '#23272f' : '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.04)', padding: '16px 0', zIndex: 2 }}>
          <div style={{ padding: '0 16px 16px 16px' }}>
            <AutoComplete
              value={sidebarSearch}
              options={sidebarSuggestions}
              style={{ width: '100%', marginBottom: 12, borderRadius: 8 }}
              onSelect={handleSidebarSelect}
              onSearch={handleSidebarSearch}
              placeholder="Search connections..."
              allowClear
            />
          </div>
          <Tree
            showIcon
            defaultExpandAll
            treeData={treeData}
            style={{ fontSize: 16 }}
            titleRender={(nodeData) => (
              <Tooltip title={nodeData.title} placement="right">
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: nodeData.selected ? '#e6f7ff' : 'none',
                  fontWeight: nodeData.selected ? 'bold' : 'normal',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                  boxShadow: nodeData.selected ? '0 2px 8px rgba(24,144,255,0.08)' : 'none'
                }}>{nodeData.icon} {nodeData.title}</span>
              </Tooltip>
            )}
          />
        </Sider>
        <Content style={{ margin: '24px', background: 'transparent' }}>
          {/* Responsive grid for stats and quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalConnections}</div>
              <div style={{ color: '#888', fontSize: 16 }}>Total Connections</div>
            </Card>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.activeConnections}</div>
              <div style={{ color: '#888', fontSize: 16 }}>Active Sessions</div>
            </Card>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.recentConnections}</div>
              <div style={{ color: '#888', fontSize: 16 }}>Recent Connections</div>
            </Card>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.savedCredentials}</div>
              <div style={{ color: '#888', fontSize: 16 }}>Saved Credentials</div>
            </Card>
          </div>
          {/* Quick Actions as cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
            {quickActions.map((action, index) => (
              <Card key={index} hoverable style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }} onClick={action.action}>
                <div style={{ fontSize: 32 }}>{action.icon}</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{action.title}</div>
                <div style={{ color: '#888', fontSize: 14 }}>{action.description}</div>
              </Card>
            ))}
          </div>
          {/* Recent Connections as cards */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Recent Connections</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {recentConnections.map((connection) => (
                <Card key={connection.id} hoverable style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 28 }}>{getConnectionIcon(connection.type)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{connection.name}</div>
                      <div style={{ color: '#888', fontSize: 14 }}>{connection.type} • {connection.host}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <Button type="primary" size="small" style={{ borderRadius: 8 }} onClick={() => handleConnectToServer(connection)}>
                      <span style={{ marginRight: 4 }}>🔗</span>Connect
                    </Button>
                    <span style={{ color: connection.status === 'online' ? '#52c41a' : '#f5222d', fontWeight: 600 }}>{connection.status}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Content>
      </Layout>

      {/* New Entry Modal */}
      <Modal
        title="Create New Connection"
        open={isNewEntryModalVisible}
        onOk={handleNewEntryModalOk}
        onCancel={handleNewEntryModalCancel}
        width={600}
        centered
        okText="Create Connection"
        cancelText="Cancel"
        style={{ ...modernFont }}
      >
        <Form
          form={connectionForm}
          layout="vertical"
          initialValues={{
            port: getDefaultPort(selectedConnectionType)
          }}
          style={{ marginTop: '20px' }}
        >
          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
              Select the type of connection you want to create:
            </p>
            <Radio.Group
              value={selectedConnectionType}
              onChange={handleConnectionTypeChange}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {connectionTypes.map((type) => (
                  <Radio key={type.value} value={type.value} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div style={{ fontSize: '20px', color: '#1890ff' }}>
                        {type.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>
                          {type.label}
                        </div>
                        <div style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef' 
          }}>
            <h4 style={{ marginBottom: '16px', color: '#333' }}>
              Connection Details for {selectedConnectionType}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Connection Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a connection name' }]}
              >
                <Input placeholder="e.g., Production Server" />
              </Form.Item>

              <Form.Item
                label="Host/IP Address"
                name="host"
                rules={[{ required: true, message: 'Please enter host or IP address' }]}
              >
                <Input placeholder="e.g., 192.168.1.100 or server.com" />
              </Form.Item>

              <Form.Item
                label="Port"
                name="port"
                rules={[{ required: true, message: 'Please enter port number' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1}
                  max={65535}
                  placeholder={`Default: ${getDefaultPort(selectedConnectionType)}`}
                />
              </Form.Item>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: selectedConnectionType !== 'Telnet', message: 'Please enter username' }]}
              >
                <Input placeholder="Username" />
              </Form.Item>
            </div>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: selectedConnectionType !== 'Telnet', message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            {selectedConnectionType === 'FTP' && (
              <Form.Item
                label="Transfer Mode"
                name="transferMode"
                initialValue="passive"
              >
                <Radio.Group>
                  <Radio value="active">Active</Radio>
                  <Radio value="passive">Passive</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            {(selectedConnectionType === 'SSH' || selectedConnectionType === 'SFTP') && (
              <Form.Item
                label="Authentication Method"
                name="authMethod"
                initialValue="password"
              >
                <Radio.Group>
                  <Radio value="password">Password</Radio>
                  <Radio value="key">Private Key</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          </div>
        </Form>
      </Modal>

      {/* New Credential Modal */}
      <Modal
        title="New Credential"
        open={isNewCredentialModalVisible}
        onOk={handleNewCredentialModalOk}
        onCancel={handleNewCredentialModalCancel}
        width={500}
        centered
        okText="Save Credential"
        cancelText="Cancel"
        style={{ ...modernFont }}
      >
        <Form
          form={credentialForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Credential Name"
            name="credentialName"
            rules={[{ required: true, message: 'Please enter a credential name' }]}
          >
            <Input placeholder="Enter credential name" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Type"
              name="type"
              initialValue="Password"
            >
              <Select
                value={credentialType}
                onChange={setCredentialType}
                options={credentialTypes}
              />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
          </div>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter description (optional)"
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item name="shareWithOthers" valuePropName="checked">
            <Checkbox>Share with other users</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
