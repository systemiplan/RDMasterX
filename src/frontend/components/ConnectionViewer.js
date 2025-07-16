import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Row, 
  Col, 
  Progress,
  Tooltip,
  Divider,
  Dropdown,
  Menu,
  Modal,
  Input
} from 'antd';
import { 
  DesktopOutlined, 
  CodeOutlined, 
  DisconnectOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  ReloadOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  MoreOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ConnectionViewer = ({ 
  connection, 
  server, 
  onClose, 
  onFullscreen, 
  onDuplicate,
  onRename,
  tabId,
  availableServers = [] // Add available servers for validation
}) => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  useEffect(() => {
    // Simulate connection process
    if (server || connection) {
      initiateConnection();
    }
  }, [connection, server]);

  // Add event listener for reconnect from context menu
  useEffect(() => {
    const handleReconnectEvent = (event) => {
      if (event.type === 'reconnect') {
        handleReconnect();
      }
    };

    const handleDisconnectEvent = (event) => {
      if (event.type === 'disconnect') {
        // Properly terminate the session before cleanup
        terminateSession();
      }
    };

    const element = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (element) {
      element.addEventListener('reconnect', handleReconnectEvent);
      element.addEventListener('disconnect', handleDisconnectEvent);
      return () => {
        element.removeEventListener('reconnect', handleReconnectEvent);
        element.removeEventListener('disconnect', handleDisconnectEvent);
      };
    }
  }, [tabId]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any ongoing connections when component unmounts
      terminateSession();
    };
  }, []);

  const terminateSession = () => {
    // Terminate the session properly based on connection type
    const connectionType = (server?.type || connection?.type || 'RDP').toUpperCase();
    const serverName = server?.name || connection?.name || 'Unknown Server';
    
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      console.log(`Terminating ${connectionType} session for ${serverName}`);
      
      // Set disconnecting state immediately
      setConnectionStatus('disconnecting');
      
      // For RDP sessions, perform proper cleanup
      if (connectionType === 'RDP') {
        console.log(`Closing RDP connection to ${serverName} (${server?.host || connection?.host})`);
        
        // In a real implementation, you would call the actual RDP disconnect API
        // Example: await rdpClient.disconnect(server.host, server.port)
        // This should:
        // 1. Send logout command to remote desktop
        // 2. Close RDP socket connections
        // 3. Clean up local RDP client resources
        // 4. Clear any cached credentials for this session
        
        // Simulate proper RDP session termination
        setTimeout(() => {
          setConnectionStatus('disconnected');
          setConnectionProgress(0);
          setErrorMessage('');
          console.log(`RDP session to ${serverName} terminated successfully`);
        }, 500);
        
      } else {
        // For other connection types (SSH, VNC, etc.)
        const cleanupTime = connectionType === 'SSH' ? 300 : 400;
        
        setTimeout(() => {
          setConnectionStatus('disconnected');
          setConnectionProgress(0);
          setErrorMessage('');
          console.log(`${connectionType} session to ${serverName} terminated successfully`);
        }, cleanupTime);
      }
    } else {
      // If not connected, just reset state
      setConnectionStatus('disconnected');
      setConnectionProgress(0);
      setErrorMessage('');
      console.log(`${connectionType} session state reset for ${serverName}`);
    }
  };

  const initiateConnection = async () => {
    setConnectionStatus('connecting');
    setConnectionProgress(0);
    setErrorMessage('');

    try {
      // Validate server before connecting
      const serverName = server?.name || connection?.name;
      const serverHost = server?.host || connection?.host;
      
      if (!serverName || !serverHost) {
        throw new Error('Server information is incomplete. Please check your connection settings.');
      }

      // Check if server exists in stored credentials/server list
      const serverToValidate = server || connection;
      let isValidServer = false;
      
      // Check if it's a quick connect (IP address) or a stored server
      if (serverToValidate.id && typeof serverToValidate.id === 'string' && serverToValidate.id.startsWith('quick-')) {
        // For quick connect, just validate IP format
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        isValidServer = ipPattern.test(serverToValidate.host) || 
                        serverToValidate.host.includes('.') ||
                        serverToValidate.host.includes(':');
      } else {
        // For stored servers, check against available servers list
        isValidServer = availableServers.length === 0 || // Allow if no server list provided
                        availableServers.some(s => 
                          s.name === serverToValidate.name || 
                          s.host === serverToValidate.host ||
                          s.hostname === serverToValidate.hostname
                        );
      }
      
      if (!isValidServer) {
        throw new Error(`Server "${serverName}" is not available or does not exist. Please verify the server is in your credentials list.`);
      }

      // Simulate connection steps
      const steps = [
        { message: 'Validating server credentials...', duration: 600 },
        { message: 'Resolving hostname...', duration: 800 },
        { message: 'Establishing connection...', duration: 1200 },
        { message: 'Authenticating...', duration: 1000 },
        { message: 'Loading desktop...', duration: 1500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        // Check if we're still supposed to be connecting (user didn't cancel)
        if (connectionStatus === 'disconnected') {
          return; // Exit early if disconnected
        }
        
        setConnectionProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Final check before setting connected state
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('connected');
        setConnectionProgress(100);
      }
    } catch (error) {
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('error');
        setErrorMessage(error.message || 'Failed to establish connection');
      }
    }
  };

  const handleDisconnect = () => {
    // Properly terminate the session
    terminateSession();
    
    // After termination, close the tab
    setTimeout(() => {
      if (onClose) onClose(tabId);
    }, 600); // Wait for session termination to complete
  };

  const handleReconnect = () => {
    // Clear any existing error state
    setErrorMessage('');
    
    // If currently connected, disconnect first
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      terminateSession();
      
      // Wait for disconnect, then reconnect
      setTimeout(() => {
        initiateConnection();
      }, 700); // Wait for termination to complete
    } else {
      // If not connected, just reconnect
      setTimeout(() => {
        initiateConnection();
      }, 200);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (onFullscreen) onFullscreen(tabId, !isFullscreen);
  };

  const handleDuplicate = () => {
    if (onDuplicate) onDuplicate(tabId);
  };

  const handleRename = () => {
    setNewTabName(server?.name || connection?.name || 'Server');
    setIsRenameModalVisible(true);
  };

  const handleRenameConfirm = () => {
    if (onRename && newTabName.trim()) {
      onRename(tabId, newTabName.trim());
    }
    setIsRenameModalVisible(false);
  };

  const handleRenameCancel = () => {
    setIsRenameModalVisible(false);
  };

  // Context menu for tabs
  const contextMenuItems = [
    {
      key: 'reconnect',
      label: 'Reconnect',
      icon: <ReloadOutlined />,
      onClick: handleReconnect
    },
    {
      key: 'divider1',
      type: 'divider'
    },
    {
      key: 'duplicate',
      label: 'Duplicate Tab',
      icon: <CopyOutlined />,
      onClick: handleDuplicate
    },
    {
      key: 'rename',
      label: 'Rename Tab',
      icon: <EditOutlined />,
      onClick: handleRename
    },
    {
      key: 'divider2',
      type: 'divider'
    },
    {
      key: 'close',
      label: 'Close Tab',
      icon: <CloseOutlined />,
      onClick: handleDisconnect
    }
  ];

  const contextMenu = (
    <Menu items={contextMenuItems} />
  );

  // Settings dropdown menu items
  const settingsMenuItems = [
    {
      key: 'close',
      label: 'Close Tab',
      icon: <CloseOutlined />,
      onClick: () => handleDisconnect()
    },
    {
      key: 'duplicate',
      label: 'Duplicate Tab',
      icon: <CopyOutlined />,
      onClick: handleDuplicate
    },
    {
      key: 'rename',
      label: 'Rename Tab',
      icon: <EditOutlined />,
      onClick: handleRename
    }
  ];

  const renderConnectionView = () => {
    if (connectionStatus === 'connecting') {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: '#f8f9fa',
          padding: '60px 40px'
        }}>
          <Spin size="large" />
          <Title level={2} style={{ marginTop: 32, color: '#1890ff', textAlign: 'center' }}>
            Connecting to {server?.name || connection?.name || 'Server'}
          </Title>
          <Text type="secondary" style={{ marginBottom: 32, fontSize: '18px', textAlign: 'center' }}>
            {server?.hostname || connection?.hostname || 'Unknown'} ({server?.ip || connection?.ip || 'Unknown'})
          </Text>
          <Progress 
            percent={connectionProgress} 
            status="active" 
            strokeColor="#1890ff"
            style={{ width: '100%', maxWidth: '500px' }}
          />
          <Text type="secondary" style={{ marginTop: 16, fontSize: '14px' }}>
            Establishing secure connection...
          </Text>
        </div>
      );
    }

    if (connectionStatus === 'disconnecting') {
      const connectionType = (server?.type || connection?.type || 'RDP').toUpperCase();
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: '#fff7e6',
          padding: '60px 40px'
        }}>
          <Spin size="large" />
          <Title level={2} style={{ marginTop: 32, color: '#fa8c16', textAlign: 'center' }}>
            Disconnecting from {server?.name || connection?.name || 'Server'}
          </Title>
          <Text type="secondary" style={{ marginBottom: 32, fontSize: '18px', textAlign: 'center' }}>
            Terminating {connectionType} session...
          </Text>
          <Progress 
            percent={90} 
            status="active" 
            strokeColor="#fa8c16"
            style={{ width: '100%', maxWidth: '500px' }}
          />
          <Text type="secondary" style={{ marginTop: 16, fontSize: '14px' }}>
            Cleaning up session resources...
          </Text>
        </div>
      );
    }

    if (connectionStatus === 'error') {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: '#fff1f0',
          padding: '60px 40px'
        }}>
          <Alert 
            message="Connection Failed" 
            description={errorMessage || 'Unable to establish connection to the server.'}
            type="error" 
            showIcon 
            style={{ marginBottom: 24, maxWidth: '400px' }}
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleReconnect}
            size="large"
            style={{ borderRadius: '6px' }}
          >
            Retry Connection
          </Button>
        </div>
      );
    }

    if (connectionStatus === 'connected') {
      return (
        <div style={{ 
          height: '100%',
          width: '100%',
          background: '#2d3142',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: 0,
          padding: 0
        }}>
          {/* Windows Taskbar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid #333',
            zIndex: 1
          }}>
            <div style={{
              background: '#0078d4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
              cursor: 'pointer'
            }}>
              ⊞ Start
            </div>
            <div style={{
              color: '#ccc',
              fontSize: '12px',
              marginLeft: 'auto'
            }}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Desktop Area */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #0078d4 0%, #1084d0 100%)',
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}>
            {/* Desktop Icons */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {[
                { name: 'This PC', icon: '💻' },
                { name: 'Recycle Bin', icon: '🗑️' },
                { name: 'Documents', icon: '📁' },
                { name: 'Network', icon: '🌐' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  maxWidth: '64px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '4px'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Connection Status */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#52c41a',
                animation: 'pulse 2s infinite'
              }} />
              Connected
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ 
      height: '100%',
      width: '100%',
      background: '#fff',
      borderRadius: '0',
      overflow: 'hidden',
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      margin: 0,
      padding: 0
    }}
    data-tab-id={tabId}
    >
      {/* Connection Header */}
      <div style={{ 
        padding: '2px 8px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        minHeight: '28px',
        height: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {(connection?.type || server?.type || 'RDP') === 'RDP' ? (
            <DesktopOutlined style={{ 
              marginRight: '8px', 
              color: '#1890ff', 
              fontSize: '16px',
              padding: '4px',
              background: '#e6f7ff',
              borderRadius: '4px'
            }} />
          ) : (connection?.type || server?.type) === 'SSH' ? (
            <CodeOutlined style={{ 
              marginRight: '8px', 
              color: '#52c41a', 
              fontSize: '16px',
              padding: '4px',
              background: '#f6ffed',
              borderRadius: '4px'
            }} />
          ) : (
            <DesktopOutlined style={{ 
              marginRight: '8px', 
              color: '#722ed1', 
              fontSize: '16px',
              padding: '4px',
              background: '#f9f0ff',
              borderRadius: '4px'
            }} />
          )}
          
          {/* Fullscreen button moved to left side */}
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <Button 
              type="text" 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              size="small"
              onClick={handleFullscreen}
              style={{ 
                borderRadius: '4px',
                color: '#8c8c8c',
                background: 'transparent',
                marginRight: '4px',
                padding: '2px 4px'
              }}
            />
          </Tooltip>
        </div>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <Tooltip title="Connection Settings">
            <Dropdown
              menu={{ items: settingsMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                size="small"
                style={{ 
                  borderRadius: '4px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  padding: '2px 4px'
                }}
              />
            </Dropdown>
          </Tooltip>
          <Tooltip title="Reconnect">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              size="small"
              onClick={handleReconnect}
              aria-label="Reconnect"
              title="Reconnect"
              style={{ 
                borderRadius: '4px',
                color: '#8c8c8c',
                background: 'transparent',
                padding: '2px 4px'
              }}
            />
          </Tooltip>
        </div>
      </div>
      
      {/* Connection Content */}
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        position: 'relative',
        minHeight: 0
      }}>
        {renderConnectionView()}
      </div>
      
      {/* Rename Modal */}
      <Modal
        title="Rename Tab"
        open={isRenameModalVisible}
        onOk={handleRenameConfirm}
        onCancel={handleRenameCancel}
        width={400}
        centered
      >
        <Input
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
          placeholder="Enter new tab name"
          onPressEnter={handleRenameConfirm}
        />
      </Modal>
    </div>
  );
};

export default ConnectionViewer;
