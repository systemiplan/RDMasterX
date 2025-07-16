import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Avatar, Button, Alert, Spin } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const ActiveDirectoryUserSelector = ({ 
  visible, 
  onClose, 
  onUserSelect,
  title = "Select Active Directory User" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ad/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const userData = await response.json();
      setUsers(userData);
    } catch (err) {
      console.error('User search error:', err);
      setError('Failed to search Active Directory users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    searchUsers(value);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleSelectUser = () => {
    if (selectedUser) {
      onUserSelect(selectedUser);
      onClose();
      setSelectedUser(null);
      setSearchTerm('');
      setUsers([]);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedUser(null);
    setSearchTerm('');
    setUsers([]);
    setError(null);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="select" 
          type="primary" 
          onClick={handleSelectUser}
          disabled={!selectedUser}
        >
          Select User
        </Button>
      ]}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search for users by username, display name, or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '100%' }}
          prefix={<SearchOutlined />}
        />
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && users.length > 0 && (
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              onClick={() => handleUserClick(user)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedUser?.username === user.username ? '#e6f7ff' : 'transparent',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '4px',
                border: selectedUser?.username === user.username ? '1px solid #1890ff' : '1px solid transparent'
              }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={user.displayName || user.username}
                description={
                  <div>
                    <div><strong>Username:</strong> {user.username}</div>
                    {user.email && <div><strong>Email:</strong> {user.email}</div>}
                    <div>
                      <strong>Status:</strong> 
                      <span style={{ 
                        color: user.isActive ? '#52c41a' : '#ff4d4f',
                        marginLeft: 4
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {!loading && searchTerm && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          No users found matching "{searchTerm}"
        </div>
      )}

      {!loading && !searchTerm && (
        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          Enter at least 2 characters to search for users
        </div>
      )}
    </Modal>
  );
};

export default ActiveDirectoryUserSelector;
