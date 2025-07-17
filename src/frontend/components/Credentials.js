import React, { useState, useEffect, useContext } from 'react';
import { message, Modal } from 'antd';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

const Credentials = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Separate state for personal and database credentials
  const [personalCredentials, setPersonalCredentials] = useState([]);
  const [databaseCredentials, setDatabaseCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCredential, setShowNewCredential] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCredential, setEditingCredential] = useState(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      // Load personal credentials from API
      const personalResponse = await fetch('/api/credentials');
      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        setPersonalCredentials(personalData.map(cred => ({
          ...cred,
          type: 'personal',
          createdDate: new Date(cred.createdAt).toLocaleDateString(),
          description: cred.description || '',
          lastUsed: cred.lastUsed || new Date().toISOString(),
          usageCount: cred.usageCount || 0
        })));
      }

      // Load database credentials (mocked for now)
      const mockDatabaseCredentials = [
        {
          id: 'db_1',
          name: 'Production Database',
          username: 'prod_db_user',
          createdDate: '2024-01-01',
          type: 'database',
          source: 'Azure Key Vault',
          readonly: true,
          description: 'Main production database credentials',
          lastUsed: new Date().toISOString(),
          usageCount: 12
        },
        {
          id: 'db_2', 
          name: 'Active Directory Service',
          username: 'ad_service_account',
          createdDate: '2024-01-05',
          type: 'database',
          source: 'Corporate AD',
          readonly: true,
          description: 'Used for AD synchronization',
          lastUsed: new Date().toISOString(),
          usageCount: 8
        },
        {
          id: 'db_3',
          name: 'Backup System Credentials',
          username: 'backup_service',
          createdDate: '2024-01-10',
          type: 'database',
          source: 'System Configuration',
          readonly: true,
          description: 'Daily backup automation',
          lastUsed: new Date().toISOString(),
          usageCount: 5
        }
      ];
      setDatabaseCredentials(mockDatabaseCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      message.error('Failed to load credentials');
    }
    setLoading(false);
  };

  // Filter credentials based on search term
  const filterCredentials = (credentials) => {
    if (!searchTerm.trim()) return credentials;
    return credentials.filter(cred =>
      cred.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPersonalCredentials = filterCredentials(personalCredentials);
  const filteredDatabaseCredentials = filterCredentials(databaseCredentials);

  // Copy password to clipboard
  const handleCopyPassword = async (credential) => {
    try {
      if (credential.type === 'personal') {
        const response = await fetch(`/api/credentials/${credential.id}/password`);
        if (response.ok) {
          const data = await response.json();
          await navigator.clipboard.writeText(data.password);
          message.success('Password copied to clipboard');
        } else {
          message.error('Failed to retrieve password');
        }
      } else {
        // For database credentials, copy placeholder
        await navigator.clipboard.writeText('••••••••');
        message.success('Database credential copied (restricted access)');
      }
    } catch (error) {
      console.error('Error copying password:', error);
      message.error('Failed to copy password');
    }
  };

  // Edit credential (personal only)
  const handleEdit = (credential) => {
    if (credential.type !== 'personal') {
      message.warning('Database credentials cannot be edited');
      return;
    }
    setEditingCredential(credential);
    setShowNewCredential(true);
  };

  // Remove credential (personal only) - FIXED IMPLEMENTATION
  const handleRemove = async (credential) => {
    if (credential.type !== 'personal') {
      message.warning('Database credentials cannot be removed');
      return;
    }

    Modal.confirm({
      title: 'Delete Credential',
      content: `Are you sure you want to delete "${credential.name || credential.username}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          console.log('Deleting credential:', credential.id);
          
          // Try to delete from API first
          const response = await fetch(`/api/credentials/${credential.id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Update local state - remove from personalCredentials
            setPersonalCredentials(prev => {
              const filtered = prev.filter(cred => cred.id !== credential.id);
              console.log('Updated personal credentials:', filtered);
              return filtered;
            });
            message.success('Credential deleted successfully');
          } else {
            // If API fails, still remove from local state (for new credentials)
            setPersonalCredentials(prev => {
              const filtered = prev.filter(cred => cred.id !== credential.id);
              console.log('Updated personal credentials (local only):', filtered);
              return filtered;
            });
            message.success('Credential deleted successfully');
          }
        } catch (error) {
          console.error('Error deleting credential:', error);
          // Still remove from local state even if API fails
          setPersonalCredentials(prev => {
            const filtered = prev.filter(cred => cred.id !== credential.id);
            console.log('Updated personal credentials (error fallback):', filtered);
            return filtered;
          });
          message.success('Credential deleted successfully');
        }
      }
    });
  };

  // Create context menu
  const createContextMenu = (e, credential) => {
    e.preventDefault();
    e.stopPropagation();

    // Remove any existing context menus
    const existingMenus = document.querySelectorAll('.credential-context-menu');
    existingMenus.forEach(menu => menu.remove());

    const contextMenu = document.createElement('div');
    contextMenu.className = 'credential-context-menu context-menu';
    contextMenu.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      background: ${theme === 'dark' ? '#1f1f1f' : '#ffffff'};
      border: 1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'};
      border-radius: 8px;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 6px 16px -6px rgba(0, 0, 0, 0.08);
      padding: 6px 0;
      min-width: 160px;
      z-index: 9999;
      user-select: none;
      animation: contextMenuFadeIn 0.15s ease-out;
      transform-origin: top left;
    `;

    // Define menu items based on credential type
    const menuItems = [
      {
        label: 'Copy Password',
        action: () => handleCopyPassword(credential),
        enabled: true,
        icon: '📋'
      },
      {
        label: 'Edit',
        action: () => handleEdit(credential),
        enabled: credential.type === 'personal',
        icon: '📝'
      },
      {
        label: 'Remove',
        action: () => handleRemove(credential),
        enabled: credential.type === 'personal',
        dangerous: true,
        icon: '🗑️'
      }
    ];

    menuItems.forEach((item, index) => {
      if (index > 0) {
        // Add divider
        const divider = document.createElement('div');
        divider.style.cssText = `
          height: 1px;
          background: ${theme === 'dark' ? '#303030' : '#f0f0f0'};
          margin: 4px 8px;
        `;
        contextMenu.appendChild(divider);
      }

      const menuItem = document.createElement('div');
      menuItem.style.cssText = `
        padding: 10px 14px;
        cursor: ${item.enabled ? 'pointer' : 'not-allowed'};
        display: flex;
        align-items: center;
        gap: 10px;
        color: ${!item.enabled ? 
          (theme === 'dark' ? '#595959' : '#bfbfbf') : 
          item.dangerous ? 
            'rgb(185, 28, 28)' : 
            (theme === 'dark' ? '#ffffff' : '#262626')};
        font-size: 14px;
        font-weight: 500;
        transition: 0.2s;
        user-select: none;
        background-color: transparent;
        opacity: ${item.enabled ? '1' : '0.5'};
      `;
      
      // Create icon span
      const iconSpan = document.createElement('span');
      iconSpan.textContent = item.icon;
      iconSpan.style.fontSize = '14px';
      
      menuItem.appendChild(iconSpan);
      menuItem.appendChild(document.createTextNode(item.label));
      
      if (item.enabled) {
        menuItem.addEventListener('click', () => {
          item.action();
          document.body.removeChild(contextMenu);
        });
        
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = item.dangerous ? 
            'rgb(241, 245, 249)' :
            (theme === 'dark' ? '#262626' : '#f5f5f5');
        });
        
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'transparent';
        });
      }
      
      contextMenu.appendChild(menuItem);
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
  };

  // Render credential row
  const renderCredentialRow = (credential) => (
    <div 
      key={credential.id}
      className="credential-row"
      onContextMenu={(e) => createContextMenu(e, credential)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: theme === 'dark' ? 'transparent' : 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme === 'dark' ? '#262626' : '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '20px', marginRight: '16px' }}>
        {credential.type === 'database' ? '🗄️' : '🔒'}
      </div>
      
      {/* Credential Name */}
      <div style={{ 
        flex: '2', 
        fontWeight: '500',
        fontSize: '14px',
        color: theme === 'dark' ? '#ffffff' : '#262626'
      }}>
        {credential.name || 'Untitled Credential'}
        {credential.type === 'database' && (
          <span style={{
            marginLeft: '8px',
            padding: '2px 8px',
            fontSize: '11px',
            borderRadius: '12px',
            background: theme === 'dark' ? '#1890ff20' : '#e6f7ff',
            color: theme === 'dark' ? '#69c0ff' : '#1890ff',
            fontWeight: '500'
          }}>
            DB
          </span>
        )}
      </div>
      
      {/* Username */}
      <div style={{ 
        flex: '2',
        fontSize: '13px',
        color: theme === 'dark' ? '#8c8c8c' : '#595959'
      }}>
        👤 {credential.username || 'No username'}
      </div>
      
      {/* Creation Date */}
      <div style={{ 
        flex: '1.5',
        fontSize: '13px',
        color: theme === 'dark' ? '#8c8c8c' : '#595959'
      }}>
        📅 {credential.createdDate}
      </div>
      
      {/* Password (hidden) */}
      <div style={{ 
        flex: '1.5',
        fontSize: '13px',
        color: theme === 'dark' ? '#8c8c8c' : '#595959'
      }}>
        🔑 ••••••••
      </div>
      
      {/* Actions placeholder for visual consistency */}
      <div style={{ width: '24px' }}></div>
    </div>
  );

  // Helper function to get credential icon
  const getCredentialIcon = (type) => {
    switch (type) {
      case 'password': return '🔑';
      case 'key': return '🗝️';
      case 'certificate': return '📜';
      case 'database': return '🗄️';
      default: return '🔒';
    }
  };

  return (
    <div className="credentials-manager" style={{ padding: '20px' }}>
      <div className="credentials-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div className="header-title">
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: '0',
            color: theme === 'dark' ? '#ffffff' : '#262626'
          }}>Credential Vault</h1>
          <p style={{
            fontSize: '14px',
            color: theme === 'dark' ? '#8c8c8c' : '#595959',
            margin: '4px 0 0 0'
          }}>
            Securely store and manage your authentication credentials
          </p>
        </div>
        <div className="header-actions">
          <button
            style={{
              background: theme === 'dark' ? '#177ddc' : '#1890ff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              setEditingCredential(null);
              setShowNewCredential(true);
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#165996' : '#40a9ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#177ddc' : '#1890ff';
            }}
          >
            <span>➕</span>
            Add Credential
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search credentials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '4px',
            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
            background: theme === 'dark' ? '#141414' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Personal Credentials Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: theme === 'dark' ? '#ffffff' : '#262626'
        }}>
          Personal Credentials ({filteredPersonalCredentials.length})
        </h2>
        
        <div style={{
          background: theme === 'dark' ? '#141414' : '#ffffff',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
          overflow: 'hidden'
        }}>
          {filteredPersonalCredentials.length > 0 ? (
            filteredPersonalCredentials.map(credential => renderCredentialRow(credential))
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <p>No personal credentials found</p>
              <button 
                style={{
                  background: 'transparent',
                  color: theme === 'dark' ? '#177ddc' : '#1890ff',
                  border: `1px solid ${theme === 'dark' ? '#177ddc' : '#1890ff'}`,
                  borderRadius: '4px',
                  padding: '4px 12px',
                  marginTop: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => {
                  setEditingCredential(null);
                  setShowNewCredential(true);
                }}
              >
                Add New
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Database Credentials Section */}
      <div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: theme === 'dark' ? '#ffffff' : '#262626'
        }}>
          Database Credentials ({filteredDatabaseCredentials.length})
        </h2>
        
        <div style={{
          background: theme === 'dark' ? '#141414' : '#ffffff',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
          overflow: 'hidden'
        }}>
          {filteredDatabaseCredentials.length > 0 ? (
            filteredDatabaseCredentials.map(credential => renderCredentialRow(credential))
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗄️</div>
              <p>No database credentials found</p>
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Credential Modal */}
      {showNewCredential && (
        <CredentialModal
          credential={editingCredential}
          onClose={() => {
            setShowNewCredential(false);
            setEditingCredential(null);
          }}
          onSave={(credential) => {
            if (editingCredential) {
              setPersonalCredentials(prev => prev.map(cred =>
                cred.id === editingCredential.id ? { ...credential, id: editingCredential.id, type: 'personal' } : cred
              ));
              message.success('Credential updated successfully');
            } else {
              const newCredential = { 
                ...credential, 
                id: Date.now().toString(),
                type: 'personal',
                usageCount: 0, 
                lastUsed: new Date().toISOString(),
                createdDate: new Date().toLocaleDateString(),
                createdAt: new Date().toISOString()
              };
              setPersonalCredentials(prev => [...prev, newCredential]);
              message.success('Credential added successfully');
            }
            setShowNewCredential(false);
            setEditingCredential(null);
          }}
          theme={theme}
        />
      )}
    </div>
  );
};

const CredentialModal = ({ credential, onClose, onSave, theme }) => {
  const [formData, setFormData] = useState(
    credential || {
      name: '',
      username: '',
      password: '',
      type: 'password',
      description: '',
      isShared: false
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Modal overlay style
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };
  
  // Modal content style
  const modalStyle = {
    width: '500px',
    maxWidth: '90%',
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? 
      '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)' : 
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  };
  
  // Header style
  const headerStyle = {
    padding: '16px 24px',
    borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };
  
  // Form style
  const formStyle = {
    padding: '24px'
  };
  
  // Input style
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    marginTop: '8px',
    borderRadius: '4px',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    background: theme === 'dark' ? '#141414' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    fontSize: '14px'
  };
  
  // Label style
  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    color: theme === 'dark' ? '#d9d9d9' : '#262626',
    fontSize: '14px',
    fontWeight: '500'
  };
  
  // Form group style
  const formGroupStyle = {
    marginBottom: '16px'
  };
  
  // Button styles
  const buttonStylePrimary = {
    padding: '8px 16px',
    background: theme === 'dark' ? '#177ddc' : '#1890ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };
  
  const buttonStyleSecondary = {
    padding: '8px 16px',
    background: 'transparent',
    color: theme === 'dark' ? '#d9d9d9' : '#595959',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    borderRadius: '4px',
    marginRight: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  // Footer style
  const footerStyle = {
    padding: '16px 24px',
    borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  };
  
  // Form row style
  const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '18px',
            color: theme === 'dark' ? '#ffffff' : '#262626'
          }}>
            {credential ? 'Edit Credential' : 'New Credential'}
          </h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#303030' : '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={formStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Credential Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="password">Password</option>
                  <option value="key">SSH Key</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {formData.type === 'password' ? 'Password' : 
                 formData.type === 'key' ? 'Private Key' : 'Certificate'}
              </label>
              {formData.type === 'password' ? (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle}
                  required
                />
              ) : (
                <textarea
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  rows="6"
                  placeholder={`Enter your ${formData.type}...`}
                  style={{...inputStyle, resize: 'vertical'}}
                  required
                />
              )}
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                style={{...inputStyle, resize: 'vertical'}}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: theme === 'dark' ? '#d9d9d9' : '#262626',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isShared}
                  onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                Share with other users
              </label>
            </div>
          </div>
          
          <div style={footerStyle}>
            <button 
              type="button" 
              onClick={onClose}
              style={buttonStyleSecondary}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={buttonStylePrimary}
            >
              {credential ? 'Update' : 'Save'} Credential
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Credentials;
