import React from 'react';

const Sidebar = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: '🔗',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: '⭐',
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: '�',
    },
    {
      id: 'vault',
      label: 'Credential Vault',
      icon: '🔐',
    },
    {
      id: 'logs',
      label: 'Audit Logs',
      icon: '📝',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
    },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
