import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Menu, Tree, Button, Card, Tabs, Input, Tooltip, Switch, Dropdown, AutoComplete, List, Typography } from 'antd';
import {
  FolderOpenOutlined, PlusOutlined, UserOutlined, FileOutlined, SettingOutlined, LockOutlined, CloudOutlined, SearchOutlined, BulbOutlined, MoonOutlined,
  DesktopOutlined, KeyOutlined, CodeOutlined, DatabaseOutlined, MailOutlined, FolderOutlined, LinuxOutlined, LinkOutlined, StarOutlined, SafetyOutlined,
  AuditOutlined, HistoryOutlined, EyeOutlined, DeleteOutlined, EditOutlined, DownOutlined, InfoCircleOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import ActiveDirectoryUserSelector from './ActiveDirectoryUserSelector';
import ConnectionViewer from './ConnectionViewer';
import Logo from './Logo';
import AddCredential from './AddCredential';
import QuickAddCredential from './QuickAddCredential';
import { useTheme } from '../contexts/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

// Left menu items
const leftMenuItems = [
  { key: 'connections', icon: <LinkOutlined />, label: 'Connections' },
  { key: 'favorites', icon: <StarOutlined />, label: 'Favorites' },
  { key: 'vault', icon: <SafetyOutlined />, label: 'Credential Vault' },
  { key: 'audit', icon: <AuditOutlined />, label: 'Audit Logs' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
];

// Mock data for different sections
const mockFavorites = [
  { id: 1, name: 'Production DB Server', type: 'Database', icon: <DatabaseOutlined />, lastUsed: '2 hours ago' },
  { id: 2, name: 'Web Server 01', type: 'Web Server', icon: <CloudOutlined />, lastUsed: '1 day ago' },
  { id: 3, name: 'Mail Server', type: 'Mail Server', icon: <MailOutlined />, lastUsed: '3 days ago' },
];

const mockCredentials = [
  { id: 1, name: 'Administrator Account', server: 'DC01', username: 'admin', created: '2025-01-15', icon: <UserOutlined /> },
  { id: 2, name: 'Database SA', server: 'DB01', username: 'sa', created: '2025-01-10', icon: <DatabaseOutlined /> },
  { id: 3, name: 'Web Admin', server: 'WEB01', username: 'webadmin', created: '2025-01-05', icon: <CloudOutlined /> },
];

const mockAuditLogs = [
  { id: 1, action: 'User Login', user: 'john.doe', timestamp: '2025-07-15 09:30:25', status: 'Success', icon: <EyeOutlined /> },
  { id: 2, action: 'Connection Created', user: 'jane.smith', timestamp: '2025-07-15 08:45:12', status: 'Success', icon: <PlusOutlined /> },
  { id: 3, action: 'Credential Modified', user: 'admin', timestamp: '2025-07-15 07:20:45', status: 'Success', icon: <EditOutlined /> },
  { id: 4, action: 'Failed Login Attempt', user: 'unknown', timestamp: '2025-07-15 06:15:33', status: 'Failed', icon: <LockOutlined /> },
];

const mockSettings = [
  { key: 'theme', label: 'Theme Settings', description: 'Configure application theme and appearance', icon: <BulbOutlined /> },
  { key: 'security', label: 'Security Settings', description: 'Manage security policies and authentication', icon: <SafetyOutlined /> },
  { key: 'notifications', label: 'Notifications', description: 'Configure alerts and notifications', icon: <BulbOutlined /> },
  { key: 'backup', label: 'Backup & Recovery', description: 'Configure backup settings and recovery options', icon: <HistoryOutlined /> },
];

/* Static tree data - replaced with dynamic AD servers */

const quickActionsForDropdown = [
  { key: 'new-rdp', icon: <DesktopOutlined />, label: 'New RDP Connection' },
  { key: 'new-ssh', icon: <CodeOutlined />, label: 'New SSH Connection' },
  { key: 'new-vnc', icon: <DesktopOutlined />, label: 'New VNC Connection' },
  { key: 'divider1', type: 'divider' },
  { key: 'import-connections', icon: <FileOutlined />, label: 'Import Connections' },
  { key: 'export-connections', icon: <FileOutlined />, label: 'Export Connections' },
  { key: 'divider2', type: 'divider' },
  { key: 'add-credential', icon: <KeyOutlined />, label: 'Add Credential' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
];

const modernFont = {
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
};

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  // Add CSS animation for pulse effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [stats, setStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    recentConnections: 0,
    savedCredentials: 0,
  });
  const [recentConnections, setRecentConnections] = useState([]);
  const [connectionTabs, setConnectionTabs] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState(null);
  const [tabIdCounter, setTabIdCounter] = useState(1);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarSuggestions, setSidebarSuggestions] = useState([]);
  const [adServers, setAdServers] = useState([]);
  const [organizationUnits, setOrganizationUnits] = useState([]);
  const [selectedLeftMenu, setSelectedLeftMenu] = useState('connections');
  const [showSecondaryPanel, setShowSecondaryPanel] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizeHover, setIsResizeHover] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(['ad-root']);

  // Add state for connections dropdown
  const [connectionsDropdownOpen, setConnectionsDropdownOpen] = useState(false);
  const [securityDropdownOpen, setSecurityDropdownOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  
  // Add credential modal state
  const [showAddCredential, setShowAddCredential] = useState(false);

  // Sidebar width constraints
  const MIN_SIDEBAR_WIDTH = 280;
  const MAX_SIDEBAR_WIDTH = 600;

  // Add cleanup effect for resize event listeners
  useEffect(() => {
    return () => {
      // Cleanup any remaining event listeners on unmount
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAdServers();
    fetchOrganizationUnits();
    
    // Initialize expanded keys when component mounts
    setExpandedKeys(['ad-root']);
  }, []);

  // Elegant dropdown fade-in animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-12px);} to { opacity: 1; transform: translateY(0);} }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const fetchOrganizationUnits = async () => {
    try {
      const response = await fetch('/api/ad/organization-units');
      if (response.ok) {
        const ous = await response.json();
        setOrganizationUnits(ous);
      }
    } catch (error) {
      console.error('Failed to fetch organization units:', error);
    }
  };

  const fetchAdServers = async () => {
    try {
      const response = await fetch('/api/ad/servers');
      if (response.ok) {
        const servers = await response.json();
        setAdServers(servers);
      }
    } catch (error) {
      console.error('Failed to fetch AD servers:', error);
    }
  };

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

  // Tab management functions
  const openConnectionTab = useCallback((server) => {
    // Check for existing tab by both name and host to prevent duplicates
    const existingTab = connectionTabs.find(tab => 
      tab.server.name === server.name || 
      tab.server.host === server.host ||
      (tab.server.name === server.host && tab.server.type === server.type)
    );
    
    if (existingTab) {
      // Switch to existing tab
      setActiveTabKey(existingTab.key);
      return;
    }

    const tabKey = `tab-${tabIdCounter}`;
    const newTab = {
      key: tabKey,
      title: (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            minWidth: '120px',
            maxWidth: '200px',
            padding: '8px 12px',
            fontSize: '13px',
            lineHeight: '1.2',
            background: 'transparent',
            border: 'none'
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Create context menu
            const contextMenu = document.createElement('div');
            contextMenu.className = 'tab-context-menu';
            contextMenu.style.cssText = `
              position: fixed;
              left: ${e.clientX}px;
              top: ${e.clientY}px;
              background: ${theme === 'dark' ? '#1f1f1f' : '#ffffff'};
              border: 1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'};
              border-radius: 6px;
              box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
              padding: 4px 0;
              min-width: 120px;
              z-index: 9999;
              user-select: none;
            `;
            
            const menuItems = [
              { 
                label: 'Reconnect', 
                action: () => {
                  // Find the ConnectionViewer component for this tab and trigger reconnect
                  const connectionViewer = document.querySelector(`[data-tab-id="${tabKey}"]`);
                  if (connectionViewer) {
                    // Dispatch a custom reconnect event to the ConnectionViewer
                    const reconnectEvent = new CustomEvent('reconnect', { 
                      bubbles: true,
                      detail: { tabId: tabKey }
                    });
                    connectionViewer.dispatchEvent(reconnectEvent);
                  }
                }
              },
              { 
                label: 'Close Tab', 
                action: () => closeTab(tabKey) 
              }
            ];
            
            menuItems.forEach(item => {
              if (item.type === 'divider') {
                const divider = document.createElement('div');
                divider.style.cssText = `
                  height: 1px;
                  background: ${theme === 'dark' ? '#434343' : '#f0f0f0'};
                  margin: 4px 0;
                `;
                contextMenu.appendChild(divider);
              } else {
                const menuItem = document.createElement('div');
                menuItem.style.cssText = `
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  cursor: pointer;
                  font-size: 14px;
                  color: ${theme === 'dark' ? '#ffffff' : '#262626'};
                  transition: background 0.2s;
                `;
                menuItem.textContent = item.label;
                menuItem.addEventListener('click', () => {
                  item.action();
                  if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                  }
                });
                menuItem.addEventListener('mouseenter', () => {
                  menuItem.style.background = theme === 'dark' ? '#262626' : '#f0f0f0';
                });
                menuItem.addEventListener('mouseleave', () => {
                  menuItem.style.background = 'transparent';
                });
                contextMenu.appendChild(menuItem);
              }
            });
            
            document.body.appendChild(contextMenu);
            
            // Remove menu on click outside
            const removeMenu = (event) => {
              if (!contextMenu.contains(event.target)) {
                if (document.body.contains(contextMenu)) {
                  document.body.removeChild(contextMenu);
                }
                document.removeEventListener('click', removeMenu);
              }
            };
            
            setTimeout(() => {
              document.addEventListener('click', removeMenu);
            }, 10);
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            <span style={{ 
              fontWeight: 500, 
              fontSize: '13px', 
              color: theme === 'dark' ? '#fff' : '#262626',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              flexGrow: 1,
              marginRight: '8px',
              pointerEvents: 'auto'
            }}>
              {server.name || server.host}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeTab(tabKey);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '12px',
                color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                border: 'none',
                background: 'transparent',
                userSelect: 'none',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme === 'dark' ? '#3a3a3a' : '#f0f0f0';
                e.target.style.color = theme === 'dark' ? '#fff' : '#262626';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = theme === 'dark' ? '#8c8c8c' : '#8c8c8c';
              }}
            >
              ×
            </button>
          </div>
        </div>
      ),
      server: server,
      closable: false
    };

    setConnectionTabs(prev => [...prev, newTab]);
    setActiveTabKey(newTab.key);
    setTabIdCounter(prev => prev + 1);
  }, [connectionTabs, tabIdCounter, theme, closeTab, handleDuplicate]);

  const closeTab = useCallback((targetKey) => {
    // Find the current tab index
    const currentTabIndex = connectionTabs.findIndex(tab => tab.key === targetKey);
    
    // Remove the tab
    const newTabs = connectionTabs.filter(tab => tab.key !== targetKey);
    
    setConnectionTabs(newTabs);
    
    // Handle active tab switching
    if (activeTabKey === targetKey) {
      if (newTabs.length > 0) {
        // If there are remaining tabs, choose the previous one or the first one
        let newActiveIndex;
        if (currentTabIndex > 0) {
          // Go to the previous tab
          newActiveIndex = currentTabIndex - 1;
        } else {
          // If we're closing the first tab, go to the new first tab
          newActiveIndex = 0;
        }
        
        const newActiveTab = newTabs[newActiveIndex];
        setActiveTabKey(newActiveTab?.key);
      } else {
        // No tabs left, go back to main dashboard
        setActiveTabKey(null);
      }
    }
    
    // Clean up any context menus
    const contextMenus = document.querySelectorAll('.tab-context-menu');
    contextMenus.forEach(menu => {
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
    });
  }, [connectionTabs, activeTabKey]);

  const handleTabChange = useCallback((key) => {
    setActiveTabKey(key);
  }, []);

  const handleTabEdit = useCallback((targetKey, action) => {
    if (action === 'remove') {
      closeTab(targetKey);
    }
  }, [closeTab]);

  const handleDuplicate = useCallback((tabId) => {
    const originalTab = connectionTabs.find(tab => tab.key === tabId);
    if (originalTab) {
      const duplicatedServer = { ...originalTab.server, name: `${originalTab.server.name} (Copy)` };
      const newTabKey = `tab-${tabIdCounter}`;
      
      const newTab = {
        key: newTabKey,
        title: (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              minWidth: '120px',
              maxWidth: '200px',
              padding: '8px 12px',
              fontSize: '13px',
              lineHeight: '1.2',
              background: 'transparent',
              border: 'none'
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Create context menu
              const contextMenu = document.createElement('div');
              contextMenu.className = 'tab-context-menu';
              contextMenu.style.cssText = `
                position: fixed;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                background: ${theme === 'dark' ? '#1f1f1f' : '#ffffff'};
                border: 1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'};
                border-radius: 6px;
                box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
                padding: 4px 0;
                min-width: 120px;
                z-index: 9999;
                user-select: none;
              `;
              
              const menuItems = [
                { 
                  label: 'Reconnect', 
                  action: () => {
                    // Find the ConnectionViewer component for this tab and trigger reconnect
                    const connectionViewer = document.querySelector(`[data-tab-id="${newTabKey}"]`);
                    if (connectionViewer) {
                      // Dispatch a custom reconnect event to the ConnectionViewer
                      const reconnectEvent = new CustomEvent('reconnect', { 
                        bubbles: true,
                        detail: { tabId: newTabKey }
                      });
                      connectionViewer.dispatchEvent(reconnectEvent);
                    }
                  }
                },
                { 
                  label: 'Close Tab', 
                  action: () => closeTab(newTabKey) 
                }
              ];
              
              menuItems.forEach(item => {
                if (item.type === 'divider') {
                  const divider = document.createElement('div');
                  divider.style.cssText = `
                    height: 1px;
                    background: ${theme === 'dark' ? '#434343' : '#f0f0f0'};
                    margin: 4px 0;
                  `;
                  contextMenu.appendChild(divider);
                } else {
                  const menuItem = document.createElement('div');
                  menuItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: ${theme === 'dark' ? '#ffffff' : '#262626'};
                    transition: background 0.2s;
                  `;
                  menuItem.textContent = item.label;
                  menuItem.addEventListener('click', () => {
                    item.action();
                    if (document.body.contains(contextMenu)) {
                      document.body.removeChild(contextMenu);
                    }
                  });
                  menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = theme === 'dark' ? '#262626' : '#f0f0f0';
                  });
                  menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                  });
                  contextMenu.appendChild(menuItem);
                }
              });
              
              document.body.appendChild(contextMenu);
              
              // Remove menu on click outside
              const removeMenu = (event) => {
                if (!contextMenu.contains(event.target)) {
                  if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                  }
                  document.removeEventListener('click', removeMenu);
                }
              };
              
              setTimeout(() => {
                document.addEventListener('click', removeMenu);
              }, 10);
            }}
          >
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                overflow: 'hidden',
                pointerEvents: 'none'
              }}
            >
              <span style={{ 
                fontWeight: 500, 
                fontSize: '13px', 
                color: theme === 'dark' ? '#fff' : '#262626',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                flexGrow: 1,
                marginRight: '8px',
                pointerEvents: 'auto'
              }}>
                {duplicatedServer.name || duplicatedServer.host}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeTab(newTabKey);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  userSelect: 'none',
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme === 'dark' ? '#3a3a3a' : '#f0f0f0';
                  e.target.style.color = theme === 'dark' ? '#fff' : '#262626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = theme === 'dark' ? '#8c8c8c' : '#8c8c8c';
                }}
              >
                ×
              </button>
            </div>
          </div>
        ),
        server: duplicatedServer,
        closable: false
      };
      
      setConnectionTabs(prev => [...prev, newTab]);
      setActiveTabKey(newTab.key);
      setTabIdCounter(prev => prev + 1);
    }
  }, [connectionTabs, tabIdCounter, theme, closeTab, openConnectionTab]);

  const handleRename = useCallback((tabId, newName) => {
    setConnectionTabs(prev => 
      prev.map(tab => {
        if (tab.key === tabId) {
          const updatedServer = { ...tab.server, name: newName };
          return {
            ...tab,
            server: updatedServer,
            title: (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  minWidth: '120px',
                  maxWidth: '200px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  lineHeight: '1.2',
                  background: 'transparent',
                  border: 'none'
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Create context menu
                  const contextMenu = document.createElement('div');
                  contextMenu.className = 'tab-context-menu';
                  contextMenu.style.cssText = `
                    position: fixed;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    background: ${theme === 'dark' ? '#1f1f1f' : '#ffffff'};
                    border: 1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'};
                    border-radius: 6px;
                    box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
                    padding: 4px 0;
                    min-width: 120px;
                    z-index: 9999;
                    user-select: none;
                  `;
                  
                  const menuItems = [
                    { 
                      label: 'Reconnect', 
                      action: () => {
                        // Find the ConnectionViewer component for this tab and trigger reconnect
                        const connectionViewer = document.querySelector(`[data-tab-id="${tabId}"]`);
                        if (connectionViewer) {
                          // Dispatch a custom reconnect event to the ConnectionViewer
                          const reconnectEvent = new CustomEvent('reconnect', { 
                            bubbles: true,
                            detail: { tabId: tabId }
                          });
                          connectionViewer.dispatchEvent(reconnectEvent);
                        }
                      }
                    },
                    { 
                      label: 'Close Tab', 
                      action: () => closeTab(tabId) 
                    }
                  ];
                  
                  menuItems.forEach(item => {
                    if (item.type === 'divider') {
                      const divider = document.createElement('div');
                      divider.style.cssText = `
                        height: 1px;
                        background: ${theme === 'dark' ? '#434343' : '#f0f0f0'};
                        margin: 4px 0;
                      `;
                      contextMenu.appendChild(divider);
                    } else {
                      const menuItem = document.createElement('div');
                      menuItem.style.cssText = `
                        display: flex;
                        align-items: center;
                        padding: 8px 12px;
                        cursor: pointer;
                        font-size: 14px;
                        color: ${theme === 'dark' ? '#ffffff' : '#262626'};
                        transition: background 0.2s;
                      `;
                      menuItem.textContent = item.label;
                      menuItem.addEventListener('click', () => {
                        item.action();
                        if (document.body.contains(contextMenu)) {
                          document.body.removeChild(contextMenu);
                        }
                      });
                      menuItem.addEventListener('mouseenter', () => {
                        menuItem.style.background = theme === 'dark' ? '#262626' : '#f0f0f0';
                      });
                      menuItem.addEventListener('mouseleave', () => {
                        menuItem.style.background = 'transparent';
                      });
                      contextMenu.appendChild(menuItem);
                    }
                  });
                  
                  document.body.appendChild(contextMenu);
                  
                  // Remove menu on click outside
                  const removeMenu = (event) => {
                    if (!contextMenu.contains(event.target)) {
                      if (document.body.contains(contextMenu)) {
                        document.body.removeChild(contextMenu);
                      }
                      document.removeEventListener('click', removeMenu);
                    }
                  };
                  
                  setTimeout(() => {
                    document.addEventListener('click', removeMenu);
                  }, 10);
                }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    overflow: 'hidden',
                    pointerEvents: 'none'
                  }}
                >
                  <span style={{ 
                    fontWeight: 500, 
                    fontSize: '13px', 
                    color: theme === 'dark' ? '#fff' : '#262626',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flexGrow: 1,
                    marginRight: '8px',
                    pointerEvents: 'auto'
                  }}>
                    {newName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeTab(tabId);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      border: 'none',
                      background: 'transparent',
                      userSelect: 'none',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = theme === 'dark' ? '#3a3a3a' : '#f0f0f0';
                      e.target.style.color = theme === 'dark' ? '#fff' : '#262626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = theme === 'dark' ? '#8c8c8c' : '#8c8c8c';
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          };
        }
        return tab;
      })
    );
  }, [theme, closeTab, openConnectionTab]);

  // Enhanced sidebar search logic
  const handleSidebarSearch = (value) => {
    setSidebarSearch(value);
    if (!value.trim()) {
      setSidebarSuggestions([]);
      return;
    }
    
    const searchTerm = value.toLowerCase().trim();
    const allConnections = recentConnections.map(c => ({ 
      value: c.name, 
      id: c.id, 
      host: c.host || '',
      type: c.type || ''
    }));
    
    // Enhanced filtering with priority scoring
    const filtered = allConnections.filter(c => {
      const name = c.value.toLowerCase();
      const host = c.host.toLowerCase();
      const type = c.type.toLowerCase();
      
      return name.includes(searchTerm) || 
             host.includes(searchTerm) || 
             type.includes(searchTerm);
    }).sort((a, b) => {
      const aName = a.value.toLowerCase();
      const bName = b.value.toLowerCase();
      const aHost = a.host.toLowerCase();
      const bHost = b.host.toLowerCase();
      
      // Exact matches first
      const aExact = aName === searchTerm || aHost === searchTerm;
      const bExact = bName === searchTerm || bHost === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Starts with matches next
      const aStartsWith = aName.startsWith(searchTerm) || aHost.startsWith(searchTerm);
      const bStartsWith = bName.startsWith(searchTerm) || bHost.startsWith(searchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Alphabetical order for contains matches
      return aName.localeCompare(bName);
    });
    
    setSidebarSuggestions(filtered);
  };
  const handleSidebarSelect = (value) => {
    // Open connection logic here
    alert(`Open connection: ${value}`);
    setSidebarSearch('');
    setSidebarSuggestions([]);
  };

  // Quick Connect logic
  const [quickConnect, setQuickConnect] = useState('');
  const [quickConnectSuggestions, setQuickConnectSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isProcessingQuickConnect, setIsProcessingQuickConnect] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);
  const enterPressedRef = useRef(false);
  const [layoutSearch, setLayoutSearch] = useState('');
  const [filteredTreeData, setFilteredTreeData] = useState([]);
  
  const handleQuickConnect = (e) => {
    if (e.key === 'Enter' && quickConnect.trim()) {
      e.preventDefault();
      e.stopPropagation();
      
      // Mark that Enter was pressed and prevent onSelect from firing
      setEnterPressed(true);
      enterPressedRef.current = true;
      
      const inputValue = quickConnect.trim();
      
      // Prevent multiple executions
      if (isProcessingQuickConnect) {
        return;
      }
      setIsProcessingQuickConnect(true);
      
      let serverToOpen = null;
      
      // If user has selected a suggestion (via arrow keys), use that
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < quickConnectSuggestions.length) {
        serverToOpen = quickConnectSuggestions[selectedSuggestionIndex];
      } else {
        // Check if input exactly matches a suggestion
        const exactMatch = quickConnectSuggestions.find(s => s.name === inputValue);
        if (exactMatch) {
          serverToOpen = exactMatch;
        } else if (quickConnectSuggestions.length > 0) {
          // If no exact match but suggestions exist, use the first one
          serverToOpen = quickConnectSuggestions[0];
        } else {
          // No suggestions, create new connection
          const isIPPattern = /^(\d{1,3}\.){3}\d{1,3}$/.test(inputValue) || 
                             inputValue.includes('.') || 
                             inputValue.includes(':');
          
          serverToOpen = {
            id: `quick-${Date.now()}`,
            name: isIPPattern ? `Quick Connect (${inputValue})` : inputValue,
            type: isIPPattern ? 'RDP' : 'SSH',
            host: inputValue,
            hostname: inputValue,
            port: isIPPattern ? 3389 : 22
          };
        }
      }
      
      // Check if this connection already exists
      const existingTab = connectionTabs.find(tab => 
        tab.server.id === serverToOpen.id ||
        tab.server.host === serverToOpen.host ||
        tab.server.hostname === serverToOpen.hostname ||
        (tab.server.name.includes(serverToOpen.name) && tab.server.type === serverToOpen.type)
      );
      
      if (existingTab) {
        // Show toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #262626;
          animation: slideIn 0.3s ease-out;
        `;
        toast.innerHTML = `
          <span style="color: #1890ff;">ℹ️</span>
          Session already open for ${serverToOpen.name}
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          toast.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          }, 300);
        }, 3000);
        
        // Focus on existing tab
        setActiveTabKey(existingTab.key);
      } else {
        openConnectionTab(serverToOpen);
      }
      
      // Clear input and suggestions
      setQuickConnect('');
      setQuickConnectSuggestions([]);
      setSelectedSuggestionIndex(-1);
      
      // Reset processing flag immediately for Enter key
      setIsProcessingQuickConnect(false);
      
      // Reset enterPressed flag after a longer delay to prevent onSelect
      setTimeout(() => {
        setEnterPressed(false);
        enterPressedRef.current = false;
      }, 500);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < quickConnectSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : quickConnectSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setQuickConnect('');
      setQuickConnectSuggestions([]);
      setSelectedSuggestionIndex(-1);
      setIsProcessingQuickConnect(false);
      setEnterPressed(false);
    }
  };

  const handleQuickConnectChange = (value) => {
    setQuickConnect(value);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
    
    if (!value.trim()) {
      setQuickConnectSuggestions([]);
      return;
    }
    
    // Search through recent connections and organization units
    const suggestions = [];
    
    // Search recent connections
    recentConnections.forEach(conn => {
      if (conn.name.toLowerCase().includes(value.toLowerCase()) || 
          conn.host.toLowerCase().includes(value.toLowerCase())) {
        suggestions.push({
          ...conn,
          matchType: 'recent'
        });
      }
    });
    
    // Search organization units servers
    organizationUnits.forEach(ou => {
      ou.servers?.forEach(server => {
        if (server.name.toLowerCase().includes(value.toLowerCase()) || 
            server.host?.toLowerCase().includes(value.toLowerCase()) ||
            ou.name.toLowerCase().includes(value.toLowerCase())) {
          suggestions.push({
            ...server,
            matchType: 'ou',
            ouName: ou.name
          });
        }
      });
    });
    
    // Add direct IP/hostname suggestion if it looks like a valid address
    const isIPPattern = /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || 
                       value.includes('.') || 
                       value.includes(':');
    
    if (isIPPattern || value.length > 2) {
      suggestions.push({
        id: `direct-${Date.now()}`,
        name: value,
        type: isIPPattern ? 'RDP' : 'SSH',
        host: value,
        matchType: 'direct'
      });
    }
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.name === item.name && t.host === item.host)
    ).slice(0, 8);
    
    setQuickConnectSuggestions(uniqueSuggestions);
  };

  const handleLayoutSearch = (value) => {
    setLayoutSearch(value);
    
    if (!value.trim()) {
      setFilteredTreeData([]);
      return;
    }
    
    // Enhanced search with better matching logic
    const searchTerm = value.toLowerCase().trim();
    const treeData = getTreeData();
    
    const filtered = treeData.map(rootNode => {
      const filteredChildren = [];
      
      rootNode.children?.forEach(child => {
        // Enhanced matching for servers
        const matchingServers = child.children?.filter(server => {
          const serverTitle = server.title.toLowerCase();
          const serverHost = server.server?.host?.toLowerCase() || '';
          const serverType = server.server?.type?.toLowerCase() || '';
          
          // Priority matching: exact match first, then starts with, then contains
          const titleExact = serverTitle === searchTerm;
          const hostExact = serverHost === searchTerm;
          const typeExact = serverType === searchTerm;
          
          const titleStartsWith = serverTitle.startsWith(searchTerm);
          const hostStartsWith = serverHost.startsWith(searchTerm);
          const typeStartsWith = serverType.startsWith(searchTerm);
          
          const titleContains = serverTitle.includes(searchTerm);
          const hostContains = serverHost.includes(searchTerm);
          const typeContains = serverType.includes(searchTerm);
          
          // Return true if any match found, with priority scoring
          return titleExact || hostExact || typeExact || 
                 titleStartsWith || hostStartsWith || typeStartsWith ||
                 titleContains || hostContains || typeContains;
        }).sort((a, b) => {
          // Sort by relevance: exact matches first, then starts with, then contains
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const aHost = a.server?.host?.toLowerCase() || '';
          const bHost = b.server?.host?.toLowerCase() || '';
          
          const aExact = aTitle === searchTerm || aHost === searchTerm;
          const bExact = bTitle === searchTerm || bHost === searchTerm;
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          const aStartsWith = aTitle.startsWith(searchTerm) || aHost.startsWith(searchTerm);
          const bStartsWith = bTitle.startsWith(searchTerm) || bHost.startsWith(searchTerm);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          return aTitle.localeCompare(bTitle);
        });
        
        // Enhanced matching for OU names
        const ouTitle = child.title.toLowerCase();
        const ouExact = ouTitle === searchTerm;
        const ouStartsWith = ouTitle.startsWith(searchTerm);
        const ouContains = ouTitle.includes(searchTerm);
        
        // If OU name matches or contains matching servers, include it
        if (ouExact || ouStartsWith || ouContains || (matchingServers && matchingServers.length > 0)) {
          filteredChildren.push({
            ...child,
            // Show all servers if OU matches exactly or starts with search term
            children: (ouExact || ouStartsWith) ? child.children : matchingServers,
            // Auto-expand nodes that contain matches
            expanded: true
          });
        }
      });
      
      // Sort OUs by relevance
      filteredChildren.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        const aExact = aTitle === searchTerm;
        const bExact = bTitle === searchTerm;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStartsWith = aTitle.startsWith(searchTerm);
        const bStartsWith = bTitle.startsWith(searchTerm);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return aTitle.localeCompare(bTitle);
      });
      
      return {
        ...rootNode,
        children: filteredChildren,
        // Auto-expand root if it has matching children
        expanded: filteredChildren.length > 0
      };
    });
    
    setFilteredTreeData(filtered);
  };

  // Sidebar resizing functions with useCallback for better performance
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth + deltaX;
      
      // Constrain width between minimum and maximum values
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      document.body.style.pointerEvents = 'auto';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
  }, [sidebarWidth]);

  const toggleSidebar = () => {
    setShowSecondaryPanel(!showSecondaryPanel);
  };

  // Theme toggle
  const handleThemeToggle = (checked) => {
    toggleTheme();
  };
  const getTreeData = () => {
    if (!organizationUnits || organizationUnits.length === 0) {
      return [{
        title: 'Active Directory Servers',
        key: 'ad-root',
        icon: <FolderOpenOutlined />,
        children: [{
          title: 'Loading organization units...',
          key: 'loading',
          icon: <DesktopOutlined />,
          disabled: true,
          isLeaf: true
        }]
      }];
    }

    // Helper function to get icon based on OU name
    const getOUIcon = (ouName) => {
      const name = ouName.toLowerCase();
      if (name.includes('domain controller')) return <DesktopOutlined />;
      if (name.includes('web')) return <CloudOutlined />;
      if (name.includes('database')) return <DatabaseOutlined />;
      if (name.includes('mail')) return <MailOutlined />;
      if (name.includes('file')) return <FileOutlined />;
      if (name.includes('linux')) return <CodeOutlined />;
      return <FolderOutlined />;
    };

    // Helper function to get server icon based on type
    const getServerIcon = (serverType) => {
      if (serverType === 'SSH') return <CodeOutlined />;
      if (serverType === 'RDP') return <DesktopOutlined />;
      return <DesktopOutlined />;
    };

    return [{
      title: 'Active Directory Servers',
      key: 'ad-root',
      icon: <FolderOpenOutlined />,
      children: organizationUnits.map(ou => ({
        title: ou.name,
        key: `ou-${ou.name}`,
        icon: getOUIcon(ou.name),
        children: ou.servers?.map(server => ({
          title: server.name,
          key: `server-${server.id}`,
          icon: getServerIcon(server.type),
          server: server,
          isLeaf: true
        })) || []
      }))
    }];
  };

  // Render different panel content based on selected menu
  const renderSecondaryPanelContent = () => {
    switch (selectedLeftMenu) {
      case 'connections':
        return (
          <div style={{ padding: '12px 8px' }}>
            {/* Search Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Search servers and connections..."
                value={layoutSearch}
                onChange={e => handleLayoutSearch(e.target.value)}
                style={{ 
                  width: '100%', 
                  fontSize: '14px',
                  background: theme === 'dark' ? '#2a2a2a' : '#fff',
                  borderColor: theme === 'dark' ? '#404040' : '#d9d9d9',
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderRadius: '8px'
                }}
                prefix={<SearchOutlined style={{ fontSize: '14px' }} />}
                allowClear
                onClear={() => {
                  setLayoutSearch('');
                  setFilteredTreeData([]);
                  setExpandedKeys(['ad-root']); // Reset to default expanded state
                }}
              />
            </div>
            
            <Text strong style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              display: 'block',
              color: theme === 'dark' ? '#fff' : '#333'
            }}>
              Active Directory Servers
            </Text>
            <Tree
              showIcon={true}
              expandedKeys={layoutSearch ? filteredTreeData.flatMap(root => 
                root.children ? [root.key, ...root.children.map(child => child.key)] : [root.key]
              ) : expandedKeys}
              onExpand={(keys) => {
                if (!layoutSearch) {
                  setExpandedKeys(keys);
                }
              }}
              treeData={layoutSearch ? filteredTreeData : getTreeData()}
              style={{ 
                fontSize: 14, 
                paddingLeft: 8,
                paddingRight: 8,
                background: theme === 'dark' ? '#23272f' : '#fff'
              }}
              onSelect={(selectedKeys, info) => {
                if (info.node.server) {
                  handleServerClick(info.node.server);
                }
              }}
              titleRender={(nodeData) => (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3px 0',
                  cursor: nodeData.server ? 'pointer' : 'default',
                  fontWeight: nodeData.isLeaf ? 'normal' : '500',
                  color: nodeData.isLeaf ? (theme === 'dark' ? '#bbb' : '#666') : (theme === 'dark' ? '#fff' : '#333'),
                  fontSize: nodeData.isLeaf ? '13px' : '14px',
                  background: layoutSearch && (
                    nodeData.title.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                    nodeData.server?.host?.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                    nodeData.server?.type?.toLowerCase().includes(layoutSearch.toLowerCase())
                  ) ? (theme === 'dark' ? '#404040' : '#e6f7ff') : 'transparent',
                  borderRadius: '4px',
                  margin: '1px 0'
                }}>
                  <span style={{ marginRight: '6px', fontSize: '14px' }}>{nodeData.icon}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nodeData.title}
                  </span>
                  {nodeData.server && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '11px', 
                      color: theme === 'dark' ? '#888' : '#999',
                      fontWeight: 'normal'
                    }}>
                      ({nodeData.server.type})
                    </span>
                  )}
                </span>
              )}
            />
          </div>
        );
      
      case 'favorites':
        return (
          <div style={{ padding: '12px 8px' }}>
            <Text strong style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              display: 'block',
              color: theme === 'dark' ? '#fff' : '#333'
            }}>
              Favorite Connections
            </Text>
            <List
              size="small"
              dataSource={layoutSearch ? 
                mockFavorites.filter(item => 
                  item.name.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                  item.type.toLowerCase().includes(layoutSearch.toLowerCase())
                ) : mockFavorites
              }
              renderItem={(item) => (
                <List.Item style={{ 
                  padding: '8px 0', 
                  cursor: 'pointer',
                  borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #f0f0f0',
                  background: layoutSearch && item.name.toLowerCase().includes(layoutSearch.toLowerCase()) ? 
                    (theme === 'dark' ? '#404040' : '#e6f7ff') : 'transparent',
                  borderRadius: '4px',
                  margin: '2px 0'
                }} onClick={() => handleServerClick(item)}>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>}
                    title={<span style={{ 
                      fontSize: '14px',
                      color: theme === 'dark' ? '#fff' : '#333'
                    }}>{item.name}</span>}
                    description={<span style={{ 
                      fontSize: '12px', 
                      color: theme === 'dark' ? '#bbb' : '#666'
                    }}>{item.type} • {item.lastUsed}</span>}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      
      case 'vault':
        return (
          <div style={{ padding: '12px 8px' }}>
            <Text strong style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              display: 'block',
              color: theme === 'dark' ? '#fff' : '#333'
            }}>
              Stored Credentials
            </Text>
            
            {/* Quick Add Credential Component */}
            <QuickAddCredential 
              onCredentialSaved={(credentialData) => {
                // You can add logic here to refresh the credentials list
              }}
            />
            
            <List
              size="small"
              dataSource={layoutSearch ? 
                mockCredentials.filter(item => 
                  item.name.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                  item.server.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                  item.username.toLowerCase().includes(layoutSearch.toLowerCase())
                ) : mockCredentials
              }
              renderItem={(item) => (
                <List.Item style={{ 
                  padding: '8px 0', 
                  cursor: 'pointer',
                  borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #f0f0f0',
                  background: layoutSearch && (
                    item.name.toLowerCase().includes(layoutSearch.toLowerCase()) ||
                    item.server.toLowerCase().includes(layoutSearch.toLowerCase())
                  ) ? (theme === 'dark' ? '#404040' : '#e6f7ff') : 'transparent',
                  borderRadius: '4px',
                  margin: '2px 0'
                }} onClick={() => {}}>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>}
                    title={<span style={{ 
                      fontSize: '14px',
                      color: theme === 'dark' ? '#fff' : '#333'
                    }}>{item.name}</span>}
                    description={<span style={{ 
                      fontSize: '12px', 
                      color: theme === 'dark' ? '#bbb' : '#666'
                    }}>{item.server} • {item.username}</span>}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      
      case 'audit':
        return (
          <div style={{ padding: '12px 8px' }}>
            <Text strong style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              display: 'block',
              color: theme === 'dark' ? '#fff' : '#333'
            }}>
              Recent Activity
            </Text>
            <List
              size="small"
              dataSource={mockAuditLogs}
              renderItem={(item) => (
                <List.Item style={{ 
                  padding: '8px 0',
                  borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #f0f0f0'
                }}>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>}
                    title={<span style={{ 
                      fontSize: '14px',
                      color: theme === 'dark' ? '#fff' : '#333'
                    }}>{item.action}</span>}
                    description={<span style={{ 
                      fontSize: '12px', 
                      color: theme === 'dark' ? '#bbb' : '#666'
                    }}>{item.user} • {item.timestamp}</span>}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: item.status === 'Success' ? '#52c41a' : '#ff4d4f',
                    fontWeight: '500'
                  }}>
                    {item.status}
                  </span>
                </List.Item>
              )}
            />
          </div>
        );
      
      case 'settings':
        return (
          <div style={{ padding: '12px 8px' }}>
            <Text strong style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              display: 'block',
              color: theme === 'dark' ? '#fff' : '#333'
            }}>
              Application Settings
            </Text>
            <List
              size="small"
              dataSource={mockSettings}
              renderItem={(item) => (
                <List.Item style={{ 
                  padding: '8px 0', 
                  cursor: 'pointer',
                  borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #f0f0f0'
                }} onClick={() => {}}>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>}
                    title={<span style={{ 
                      fontSize: '14px',
                      color: theme === 'dark' ? '#fff' : '#333'
                    }}>{item.label}</span>}
                    description={<span style={{ 
                      fontSize: '12px', 
                      color: theme === 'dark' ? '#bbb' : '#666'
                    }}>{item.description}</span>}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleServerClick = (server) => {
    openConnectionTab(server);
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
        // Unknown action - no action needed
        break;
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
      case 'new-rdp':
        handleQuickAction('rdp');
        break;
      case 'new-ssh':
        handleQuickAction('ssh');
        break;
      case 'new-vnc':
        handleQuickAction('vnc');
        break;
      case 'import-connections':
        handleQuickAction('import');
        break;
      case 'export-connections':
        alert('Opening Export Connections Dialog...');
        break;
      case 'add-credential':
        alert('Opening Add Credential Dialog...');
        break;
      case 'settings':
        setSelectedLeftMenu('settings');
        break;
      default:
        // Unknown action - no action needed
        break;
    }
  };

  // Modern navbar actions
  const handleNavAction = (key) => {
    switch (key) {
      case 'new-rdp':
        handleQuickAction('rdp');
        break;
      case 'new-ssh':
        handleQuickAction('ssh');
        break;
      case 'new-vnc':
        handleQuickAction('vnc');
        break;
      case 'import-connections':
        handleQuickAction('import');
        break;
      case 'export-connections':
        alert('Opening Export Connections Dialog...');
        break;
      case 'add-credential':
        setShowAddCredential(true);
        break;
      case 'manage-vault':
        setSelectedLeftMenu('vault');
        break;
      case 'audit-logs':
        setSelectedLeftMenu('audit');
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'theme-toggle':
        handleThemeToggle(theme === 'light');
        break;
      case 'about':
        alert('RDMasterX - Professional Remote Connection Manager');
        break;
      case 'settings':
        setSelectedLeftMenu('settings');
        break;
      default:
        // Unknown navbar action - no action needed
        break;
    }
  };

  // Handle credential saved
  const handleCredentialSaved = (credentialData) => {
    // You can add logic here to refresh the credentials list or update the UI
    // For example, if you have a credentials state, you could update it:
    // setCredentials(prev => [...prev, credentialData]);
  };

  return (
    <Layout style={{ 
      height: '100vh', 
      ...modernFont, 
      background: theme === 'dark' ? '#18191a' : '#f5f6fa', 
      padding: 0, 
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Modern Navbar */}
      <div style={{ 
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '45px',
        zIndex: 10000,
        position: 'relative',
        boxShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {/* Left section - Logo and Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo size="medium" />
          </div>
          
          {/* Navigation Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
            {/* Custom Connections Dropdown */}
            <div style={{ position: 'relative' }}>
              <Button
                type="text"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  background: connectionsDropdownOpen ? (theme === 'dark' ? '#23272f' : '#f5f5f5') : 'transparent',
                  boxShadow: connectionsDropdownOpen ? (theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)') : 'none',
                  zIndex: 1201
                }}
                onClick={() => setConnectionsDropdownOpen((open) => !open)}
                onBlur={() => setTimeout(() => setConnectionsDropdownOpen(false), 150)}
              >
                <LinkOutlined style={{ marginRight: '4px', fontSize: '12px' }} />
                Connections
                <DownOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
              </Button>
              {connectionsDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 32,
                    width: 'auto',
                    minWidth: '400px',
                    maxWidth: '500px',
                    background: theme === 'dark' ? '#23272f' : '#fff',
                    boxShadow: theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
                    zIndex: 1200,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    gap: '4px',
                    animation: 'dropdownFadeIn 0.15s ease-out'
                  }}
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                >
                  {/* Compact horizontal menu layout */}
                  {[
                    { key: 'new-rdp', icon: <DesktopOutlined />, label: 'New RDP', description: 'Remote Desktop', action: () => handleNavAction('new-rdp') },
                    { key: 'new-ssh', icon: <CodeOutlined />, label: 'New SSH', description: 'Secure Shell', action: () => handleNavAction('new-ssh') },
                    { key: 'new-vnc', icon: <DesktopOutlined />, label: 'New VNC', description: 'Virtual Network', action: () => handleNavAction('new-vnc') },
                    { key: 'import-connections', icon: <FileOutlined />, label: 'Import', description: 'Import connections', action: () => handleNavAction('import-connections') },
                    { key: 'export-connections', icon: <FileOutlined />, label: 'Export', description: 'Export connections', action: () => handleNavAction('export-connections') },
                  ].map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => { item.action(); setConnectionsDropdownOpen(false); }}
                      style={{
                        flex: 1,
                        minWidth: 70,
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                        background: 'none',
                        textAlign: 'center',
                        userSelect: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : '#f5f6fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2, color: theme === 'dark' ? '#1890ff' : '#1890ff' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 11, color: theme === 'dark' ? '#fff' : '#333', marginBottom: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: theme === 'dark' ? '#bbb' : '#666' }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Security Dropdown */}
            <div style={{ position: 'relative' }}>
              <Button
                type="text"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  background: securityDropdownOpen ? (theme === 'dark' ? '#23272f' : '#f5f5f5') : 'transparent',
                  boxShadow: securityDropdownOpen ? (theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)') : 'none',
                  zIndex: 1201
                }}
                onClick={() => setSecurityDropdownOpen((open) => !open)}
                onBlur={() => setTimeout(() => setSecurityDropdownOpen(false), 150)}
              >
                <SafetyOutlined style={{ marginRight: '4px', fontSize: '12px' }} />
                Security
                <DownOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
              </Button>
              {securityDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 32,
                    width: 'auto',
                    minWidth: '300px',
                    maxWidth: '400px',
                    background: theme === 'dark' ? '#23272f' : '#fff',
                    boxShadow: theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
                    zIndex: 1200,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    gap: '4px',
                    animation: 'dropdownFadeIn 0.15s ease-out'
                  }}
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                >
                  {[
                    { key: 'add-credential', icon: <KeyOutlined />, label: 'Add Credential', description: 'Store credentials', action: () => handleNavAction('add-credential') },
                    { key: 'manage-vault', icon: <SafetyOutlined />, label: 'Manage Vault', description: 'Credential storage', action: () => handleNavAction('manage-vault') },
                    { key: 'audit-logs', icon: <AuditOutlined />, label: 'Audit Logs', description: 'Security monitoring', action: () => handleNavAction('audit-logs') },
                  ].map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => { item.action(); setSecurityDropdownOpen(false); }}
                      style={{
                        flex: 1,
                        minWidth: 85,
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                        background: 'none',
                        textAlign: 'center',
                        userSelect: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : '#f5f6fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2, color: theme === 'dark' ? '#1890ff' : '#1890ff' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 11, color: theme === 'dark' ? '#fff' : '#333', marginBottom: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: theme === 'dark' ? '#bbb' : '#666' }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom View Dropdown */}
            <div style={{ position: 'relative' }}>
              <Button
                type="text"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  background: viewDropdownOpen ? (theme === 'dark' ? '#23272f' : '#f5f5f5') : 'transparent',
                  boxShadow: viewDropdownOpen ? (theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)') : 'none',
                  zIndex: 1201
                }}
                onClick={() => setViewDropdownOpen((open) => !open)}
                onBlur={() => setTimeout(() => setViewDropdownOpen(false), 150)}
              >
                <EyeOutlined style={{ marginRight: '4px', fontSize: '12px' }} />
                View
                <DownOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
              </Button>
              {viewDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 32,
                    width: 'auto',
                    minWidth: '300px',
                    maxWidth: '400px',
                    background: theme === 'dark' ? '#23272f' : '#fff',
                    boxShadow: theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
                    zIndex: 1200,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    gap: '4px',
                    animation: 'dropdownFadeIn 0.15s ease-out'
                  }}
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                >
                  {[
                    { key: 'toggle-sidebar', icon: <FolderOpenOutlined />, label: 'Toggle Sidebar', description: 'Show/hide sidebar', action: () => handleNavAction('toggle-sidebar') },
                    { key: 'theme-toggle', icon: theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />, label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', description: 'Switch theme', action: () => handleNavAction('theme-toggle') },
                  ].map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => { item.action(); setViewDropdownOpen(false); }}
                      style={{
                        flex: 1,
                        minWidth: 85,
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                        background: 'none',
                        textAlign: 'center',
                        userSelect: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : '#f5f6fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2, color: theme === 'dark' ? '#1890ff' : '#1890ff' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 11, color: theme === 'dark' ? '#fff' : '#333', marginBottom: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: theme === 'dark' ? '#bbb' : '#666' }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Help Dropdown */}
            <div style={{ position: 'relative' }}>
              <Button
                type="text"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  background: helpDropdownOpen ? (theme === 'dark' ? '#23272f' : '#f5f5f5') : 'transparent',
                  boxShadow: helpDropdownOpen ? (theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)') : 'none',
                  zIndex: 1201
                }}
                onClick={() => setHelpDropdownOpen((open) => !open)}
                onBlur={() => setTimeout(() => setHelpDropdownOpen(false), 150)}
              >
                <QuestionCircleOutlined style={{ marginRight: '4px', fontSize: '12px' }} />
                Help
                <DownOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
              </Button>
              {helpDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 32,
                    width: 'auto',
                    minWidth: '200px',
                    maxWidth: '280px',
                    background: theme === 'dark' ? '#23272f' : '#fff',
                    boxShadow: theme === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
                    zIndex: 1200,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    gap: '4px',
                    animation: 'dropdownFadeIn 0.15s ease-out'
                  }}
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                >
                  {[
                    { key: 'about', icon: <InfoCircleOutlined />, label: 'About', description: 'Application info', action: () => handleNavAction('about') },
                    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', description: 'App preferences', action: () => handleNavAction('settings') },
                  ].map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => { item.action(); setHelpDropdownOpen(false); }}
                      style={{
                        flex: 1,
                        minWidth: 85,
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                        background: 'none',
                        textAlign: 'center',
                        userSelect: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : '#f5f6fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2, color: theme === 'dark' ? '#1890ff' : '#1890ff' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 11, color: theme === 'dark' ? '#fff' : '#333', marginBottom: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: theme === 'dark' ? '#bbb' : '#666' }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Quick Connect and Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Connect */}
          <AutoComplete
            placeholder="Quick connect..."
            value={quickConnect}
            onChange={handleQuickConnectChange}
            onKeyDown={handleQuickConnect}
            onSelect={(value, option) => {
              // Use a timeout to check if this was triggered by Enter
              setTimeout(() => {
                // If Enter was pressed, don't process this onSelect
                if (enterPressedRef.current || enterPressed) {
                  return;
                }
                
                // Prevent multiple quick connects
                if (isProcessingQuickConnect) {
                  return;
                }
                
                // Set processing flag for mouse clicks
                setIsProcessingQuickConnect(true);
                
                // Find the selected server by name
                const selectedServer = quickConnectSuggestions.find(s => s.name === value);
                if (!selectedServer) {
                  setIsProcessingQuickConnect(false);
                  return;
                }
                
                // Check if tab already exists
                const existingTab = connectionTabs.find(tab => 
                  tab.server.id === selectedServer.id || 
                  tab.server.host === selectedServer.host ||
                  tab.server.hostname === selectedServer.hostname
                );
                
                if (existingTab) {
                  // Show toast and focus existing tab
                  const toast = document.createElement('div');
                  toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #fff;
                    border: 1px solid #d9d9d9;
                    border-radius: 6px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10002;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #262626;
                  `;
                  toast.innerHTML = `
                    <span style="color: #1890ff;">ℹ️</span>
                    Session already open for ${selectedServer.name}
                  `;
                  document.body.appendChild(toast);
                  
                  setTimeout(() => {
                    if (document.body.contains(toast)) {
                      document.body.removeChild(toast);
                    }
                  }, 2000);
                  
                  setActiveTabKey(existingTab.key);
                } else {
                  // Open new tab
                  openConnectionTab(selectedServer);
                }
                
                // Clear input and suggestions
                setQuickConnect('');
                setQuickConnectSuggestions([]);
                setSelectedSuggestionIndex(-1);
                
                // Reset processing flag
                setTimeout(() => {
                  setIsProcessingQuickConnect(false);
                }, 100);
              }, 10); // Small delay to allow Enter key flag to be set
            }}
          options={quickConnectSuggestions.map((suggestion, index) => ({
              value: suggestion.name,
              label: (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: index === selectedSuggestionIndex ? 
                    (theme === 'dark' ? '#404040' : '#f0f0f0') : 'transparent',
                  fontWeight: index === selectedSuggestionIndex ? 600 : 500
                }}>
                  <span>{getConnectionIcon(suggestion.type)}</span>
                  <div>
                    <div style={{ fontWeight: 'inherit' }}>{suggestion.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {suggestion.matchType === 'recent' && 'Recent'} 
                      {suggestion.matchType === 'ou' && suggestion.ouName}
                      {suggestion.matchType === 'direct' && 'Direct Connection'}
                      {suggestion.matchType !== 'direct' && ' • '}
                      {suggestion.host || suggestion.type}
                    </div>
                  </div>
                </div>
              )
            }))}
            style={{ 
              width: 220,
              borderRadius: '6px',
              fontSize: '13px'
            }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            dropdownStyle={{
              background: theme === 'dark' ? '#2a2a2a' : '#fff',
              border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
              borderRadius: '6px',
              zIndex: 10001,
              position: 'absolute',
              boxShadow: theme === 'dark' ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.15)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
            suffixIcon={<LinkOutlined />}
            allowClear
            size="middle"
          />

          {/* Connection Status */}
          {connectionTabs.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              background: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
              borderRadius: '6px',
              border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0'
            }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#52c41a',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ 
                color: theme === 'dark' ? '#fff' : '#333',
                fontSize: '12px',
                fontWeight: 500
              }}>
                {connectionTabs.length} active
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            type="text"
            icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
            onClick={() => handleThemeToggle(theme === 'light')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              color: theme === 'dark' ? '#fff' : '#333',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>
      </div>

      {/* Top Bar - Connection Status */}
      <Header style={{ 
        background: theme === 'dark' ? '#23272f' : '#fff', 
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px', 
        zIndex: 9999,
        position: 'relative',
        height: '36px',
        minHeight: '36px'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {/* Connection Tabs Indicator */}
          {connectionTabs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginRight: '24px' }}>
              <span style={{ color: '#1890ff', fontSize: '14px', fontWeight: 600 }}>
                {connectionTabs.length} connection{connectionTabs.length > 1 ? 's' : ''} open
              </span>
            </div>
          )}
        </div>
      </Header>
      <Layout>
        {/* Left Icon Menu */}
        <Sider width={80} style={{ 
          background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa', 
          borderRight: '1px solid #e0e0e0',
          padding: '12px 0',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {leftMenuItems.map((item) => (
              <Tooltip key={item.key} title={item.label} placement="right">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: selectedLeftMenu === item.key ? '#1890ff' : 'transparent',
                    color: selectedLeftMenu === item.key ? '#fff' : (theme === 'dark' ? '#fff' : '#333'),
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '18px'
                  }}
                  onClick={() => setSelectedLeftMenu(item.key)}
                >
                  {item.icon}
                </div>
              </Tooltip>
            ))}
          </div>
          
          {/* Sidebar Toggle Button */}
          <div style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            justifyContent: 'center',
            paddingBottom: '12px'
          }}>
            <Tooltip title={showSecondaryPanel ? 'Collapse Panel' : 'Expand Panel'} placement="right">
              <Button
                type="text"
                icon={showSecondaryPanel ? <FolderOpenOutlined /> : <FolderOutlined />}
                onClick={toggleSidebar}
                style={{
                  color: theme === 'dark' ? '#fff' : '#333',
                  border: 'none',
                  background: 'transparent'
                }}
              />
            </Tooltip>
          </div>
        </Sider>

        {/* Secondary Panel */}
        {showSecondaryPanel && (
          <div style={{ 
            position: 'relative', 
            display: 'flex',
            width: `${sidebarWidth}px`,
            minWidth: `${sidebarWidth}px`,
            maxWidth: `${sidebarWidth}px`,
            height: 'calc(100vh - 90px)', // Adjust for compact header
            flexShrink: 0
          }}>
            <div style={{ 
              width: '100%',
              background: theme === 'dark' ? '#23272f' : '#fff', 
              boxShadow: theme === 'dark' ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.04)', 
              zIndex: 2,
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRight: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
              transition: isResizing ? 'none' : 'all 0.2s ease-out'
            }}>
              <div style={{ 
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#333',
                minHeight: '100%',
                padding: 0
              }}>
                {renderSecondaryPanelContent()}
              </div>
            </div>
            
            {/* Improved Resize Handle */}
            <div
              style={{
                position: 'absolute',
                right: '-3px',
                top: 0,
                bottom: 0,
                width: '6px',
                background: 'transparent',
                cursor: 'col-resize',
                zIndex: 1000,
                transition: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsResizeHover(true)}
              onMouseLeave={() => setIsResizeHover(false)}
            >
              <div
                className="resize-indicator"
                style={{
                  position: 'absolute',
                  right: '2px',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: isResizing ? '#1890ff' : (theme === 'dark' ? '#404040' : '#e0e0e0'),
                  transition: isResizing ? 'none' : 'all 0.2s ease',
                  opacity: isResizing || isResizeHover ? 1 : 0.5
                }}
              />
              {/* Visual grip dots */}
              <div
                style={{
                  position: 'absolute',
                  right: '0px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '20px',
                  background: `repeating-linear-gradient(
                    to bottom,
                    ${theme === 'dark' ? '#555' : '#ccc'} 0px,
                    ${theme === 'dark' ? '#555' : '#ccc'} 1px,
                    transparent 1px,
                    transparent 3px
                  )`,
                  opacity: isResizing || isResizeHover ? 1 : 0.3,
                  transition: 'opacity 0.2s ease'
                }}
              />
            </div>
          </div>
        )}

        <Content style={{ 
          margin: 0, 
          background: 'transparent', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'auto',
          padding: 0
        }}>
          {/* Windows-sharing-style horizontal layout */}
          <div style={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Stats Section - Horizontal layout */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              width: '100%',
              flexWrap: 'wrap'
            }}>
              <Card style={{ 
                flex: 1,
                minWidth: '200px',
                borderRadius: 12, 
                boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                background: theme === 'dark' ? '#2a2a2a' : '#fff',
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: 28, 
                      fontWeight: 700,
                      color: theme === 'dark' ? '#fff' : '#333',
                      marginBottom: '4px'
                    }}>{stats.totalConnections}</div>
                    <div style={{ 
                      color: theme === 'dark' ? '#bbb' : '#666', 
                      fontSize: 14,
                      fontWeight: 500
                    }}>Total Connections</div>
                  </div>
                  <div style={{ 
                    fontSize: 32, 
                    opacity: 0.7,
                    background: theme === 'dark' ? '#333' : '#f5f5f5',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>🖥️</div>
                </div>
              </Card>
              
              <Card style={{ 
                flex: 1,
                minWidth: '200px',
                borderRadius: 12, 
                boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                background: theme === 'dark' ? '#2a2a2a' : '#fff',
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: 28, 
                      fontWeight: 700,
                      color: theme === 'dark' ? '#fff' : '#333',
                      marginBottom: '4px'
                    }}>{stats.activeConnections}</div>
                    <div style={{ 
                      color: theme === 'dark' ? '#bbb' : '#666', 
                      fontSize: 14,
                      fontWeight: 500
                    }}>Active Sessions</div>
                  </div>
                  <div style={{ 
                    fontSize: 32, 
                    opacity: 0.7,
                    background: theme === 'dark' ? '#333' : '#f5f5f5',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>⚡</div>
                </div>
              </Card>
              
              <Card style={{ 
                flex: 1,
                minWidth: '200px',
                borderRadius: 12, 
                boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                background: theme === 'dark' ? '#2a2a2a' : '#fff',
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: 28, 
                      fontWeight: 700,
                      color: theme === 'dark' ? '#fff' : '#333',
                      marginBottom: '4px'
                    }}>{stats.recentConnections}</div>
                    <div style={{ 
                      color: theme === 'dark' ? '#bbb' : '#666', 
                      fontSize: 14,
                      fontWeight: 500
                    }}>Recent Connections</div>
                  </div>
                  <div style={{ 
                    fontSize: 32, 
                    opacity: 0.7,
                    background: theme === 'dark' ? '#333' : '#f5f5f5',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>🔗</div>
                </div>
              </Card>
              
              <Card style={{ 
                flex: 1,
                minWidth: '200px',
                borderRadius: 12, 
                boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                background: theme === 'dark' ? '#2a2a2a' : '#fff',
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: 28, 
                      fontWeight: 700,
                      color: theme === 'dark' ? '#fff' : '#333',
                      marginBottom: '4px'
                    }}>{stats.savedCredentials}</div>
                    <div style={{ 
                      color: theme === 'dark' ? '#bbb' : '#666', 
                      fontSize: 14,
                      fontWeight: 500
                    }}>Saved Credentials</div>
                  </div>
                  <div style={{ 
                    fontSize: 32, 
                    opacity: 0.7,
                    background: theme === 'dark' ? '#333' : '#f5f5f5',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>🔐</div>
                </div>
              </Card>
            </div>
            
            {/* Quick Actions - Horizontal layout */}
            <div>
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, 
                marginBottom: 20,
                color: theme === 'dark' ? '#fff' : '#333',
                letterSpacing: '-0.5px'
              }}>Quick Actions</h3>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                width: '100%',
                flexWrap: 'wrap'
              }}>
                {quickActions.map((action, index) => (
                  <Card key={index} hoverable style={{ 
                    flex: 1,
                    minWidth: '180px',
                    borderRadius: 12, 
                    boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                    background: theme === 'dark' ? '#2a2a2a' : '#fff',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
                  }}
                  onClick={action.action}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        fontSize: 24,
                        background: theme === 'dark' ? '#333' : '#f5f5f5',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>{action.icon}</div>
                      <div>
                        <div style={{ 
                          fontWeight: 600,
                          fontSize: 15,
                          color: theme === 'dark' ? '#fff' : '#333',
                          marginBottom: '2px'
                        }}>{action.title}</div>
                        <div style={{ 
                          color: theme === 'dark' ? '#bbb' : '#666', 
                          fontSize: 13,
                          fontWeight: 400
                        }}>{action.description}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Recent Connections - Horizontal layout */}
            <div>
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 18, 
                marginBottom: 20,
                color: theme === 'dark' ? '#fff' : '#333',
                letterSpacing: '-0.5px'
              }}>Recent Connections</h3>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                width: '100%',
                flexWrap: 'wrap'
              }}>
                {recentConnections.map((connection) => (
                  <Card key={connection.id} hoverable style={{ 
                    flex: 1,
                    minWidth: '220px',
                    borderRadius: 12, 
                    boxShadow: theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                    background: theme === 'dark' ? '#2a2a2a' : '#fff',
                    border: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e8e8',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1
                      }}>
                        <div style={{ 
                          fontSize: 24,
                          background: theme === 'dark' ? '#333' : '#f5f5f5',
                          padding: '8px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>{getConnectionIcon(connection.type)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: 600,
                            fontSize: 15,
                            color: theme === 'dark' ? '#fff' : '#333',
                            marginBottom: '2px'
                          }}>{connection.name}</div>
                          <div style={{ 
                            color: theme === 'dark' ? '#bbb' : '#666', 
                            fontSize: 13,
                            fontWeight: 400
                          }}>{connection.type} • {connection.host}</div>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Button 
                          type="primary" 
                          size="small" 
                          style={{ 
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 12,
                            height: 28
                          }} 
                          onClick={() => handleConnectToServer(connection)}
                        >
                          Connect
                        </Button>
                        <div style={{ 
                          color: connection.status === 'online' ? '#52c41a' : '#ff4d4f', 
                          fontWeight: 600,
                          fontSize: 10,
                          background: connection.status === 'online' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {connection.status}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Tabs */}
          {connectionTabs.length > 0 && (
            <div style={{ 
              position: 'fixed',
              top: '81px', // Tight to navbar (45px) + header (36px)
              left: `${80 + (showSecondaryPanel ? sidebarWidth : 0)}px`,
              right: '0px',
              bottom: '0px',
              background: theme === 'dark' ? '#2a2a2a' : '#fff',
              border: 'none',
              borderRadius: '0',
              boxShadow: 'none',
              overflow: 'hidden',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Tabs
                type="editable-card"
                activeKey={activeTabKey}
                onChange={handleTabChange}
                onEdit={handleTabEdit}
                hideAdd={true}
                style={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                tabBarStyle={{
                  margin: 0,
                  background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  borderBottom: theme === 'dark' ? '1px solid #404040' : '1px solid #e8e9ea',
                  padding: '0 8px',
                  display: 'flex',
                  flexShrink: 0,
                  color: theme === 'dark' ? '#fff' : '#333',
                  minHeight: '40px',
                  height: '40px'
                }}
                className="clean-tabs"
                items={connectionTabs.map(tab => ({
                  key: tab.key,
                  label: tab.title,
                  children: (
                    <div style={{ 
                      height: '100%',
                      width: '100%',
                      overflow: 'auto',
                      position: 'relative',
                      background: theme === 'dark' ? '#2a2a2a' : '#fff',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <ConnectionViewer 
                        server={tab.server} 
                        tabId={tab.key}
                        onClose={closeTab}
                        onDuplicate={handleDuplicate}
                        onRename={handleRename}
                        availableServers={[...recentConnections, ...organizationUnits.flatMap(ou => ou.servers || [])]}
                      />
                    </div>
                  ),
                  closable: tab.closable
                }))}
              />
            </div>
          )}
        </Content>
      </Layout>
      
      {/* Add Credential Modal */}
      <AddCredential
        visible={showAddCredential}
        onClose={() => setShowAddCredential(false)}
        onCredentialSaved={(credentialData) => {
          // You can add logic here to refresh the credentials list or update the UI
        }}
      />
    </Layout>
  );
};

export default Dashboard;
