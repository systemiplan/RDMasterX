import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Logo size="small" />
          <span className="version-badge">v1.0.0</span>
        </div>
        
        <div className="header-center">
          <div className="connection-status">
            <span className="status-indicator online"></span>
            <span className="status-text">System Online</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="action-btn"
            title="Quick Connect"
          >
            <span className="btn-icon">⚡</span>
          </button>
          
          <button 
            className="action-btn"
            title="Notifications"
          >
            <span className="btn-icon">🔔</span>
            <span className="notification-badge">2</span>
          </button>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {user && (
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="avatar-icon">👤</span>
                <span className="username">{user.username}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-role">{user.role || 'User'}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item">
                    <span className="item-icon">👤</span>
                    Profile
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    Preferences
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">❓</span>
                    Help
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <span className="item-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
