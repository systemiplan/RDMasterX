import React, { useState, useEffect } from 'react';

const ConnectionManager = () => {
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Mock data for connections
    setConnections([
      {
        id: 1,
        name: 'Production Server',
        type: 'RDP',
        host: '192.168.1.100',
        port: 3389,
        username: 'admin',
        lastConnected: '2 hours ago',
        status: 'online',
        favorite: true,
        group: 'Production',
      },
      {
        id: 2,
        name: 'Development DB',
        type: 'SSH',
        host: 'dev.example.com',
        port: 22,
        username: 'developer',
        lastConnected: '1 day ago',
        status: 'offline',
        favorite: false,
        group: 'Development',
      },
      {
        id: 3,
        name: 'Web Server',
        type: 'SSH',
        host: '10.0.1.50',
        port: 22,
        username: 'webuser',
        lastConnected: '3 hours ago',
        status: 'online',
        favorite: true,
        group: 'Production',
      },
      {
        id: 4,
        name: 'File Server',
        type: 'VNC',
        host: 'files.company.com',
        port: 5900,
        username: 'fileadmin',
        lastConnected: '1 week ago',
        status: 'offline',
        favorite: false,
        group: 'Infrastructure',
      },
      {
        id: 5,
        name: 'Legacy System',
        type: 'Telnet',
        host: '172.16.0.10',
        port: 23,
        username: 'legacy',
        lastConnected: '2 weeks ago',
        status: 'unknown',
        favorite: false,
        group: 'Legacy',
      },
    ]);
  }, []);

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conn.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conn.group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || conn.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getConnectionIcon = (type) => {
    switch (type) {
      case 'RDP': return '🖥️';
      case 'SSH': return '⚡';
      case 'VNC': return '🖱️';
      case 'Telnet': return '📡';
      default: return '🔗';
    }
  };

  const handleConnect = (connection) => {
    alert(`Connecting to ${connection.name} via ${connection.type}...`);
  };

  const handleEdit = (connection) => {
    alert(`Editing ${connection.name}...`);
  };

  const handleDelete = (connection) => {
    if (confirm(`Are you sure you want to delete "${connection.name}"?`)) {
      setConnections(connections.filter(c => c.id !== connection.id));
    }
  };

  const handleFavorite = (connection) => {
    setConnections(connections.map(c => 
      c.id === connection.id ? { ...c, favorite: !c.favorite } : c
    ));
  };

  const connectionTypes = ['all', 'RDP', 'SSH', 'VNC', 'Telnet'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Connection Manager</h1>
        <p className="dashboard-subtitle">
          Manage and organize your remote connections
        </p>
      </div>

      {/* Toolbar */}
      <div className="connection-toolbar">
        <div className="toolbar-left">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">➕</span>
            New Connection
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📥</span>
            Import
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📤</span>
            Export
          </button>
        </div>
        
        <div className="toolbar-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-filter"
          >
            {connectionTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connection Grid */}
      <div className="connections-grid">
        {filteredConnections.map((connection) => (
          <div key={connection.id} className="connection-card">
            <div className="connection-card-header">
              <div className="connection-title">
                <span className="connection-icon">
                  {getConnectionIcon(connection.type)}
                </span>
                <span className="connection-name">{connection.name}</span>
                <button
                  className={`favorite-btn ${connection.favorite ? 'favorited' : ''}`}
                  onClick={() => handleFavorite(connection)}
                >
                  {connection.favorite ? '⭐' : '☆'}
                </button>
              </div>
              <div className={`connection-status status-${connection.status}`}>
                {connection.status}
              </div>
            </div>
            
            <div className="connection-card-body">
              <div className="connection-detail">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{connection.type}</span>
              </div>
              <div className="connection-detail">
                <span className="detail-label">Host:</span>
                <span className="detail-value">{connection.host}:{connection.port}</span>
              </div>
              <div className="connection-detail">
                <span className="detail-label">User:</span>
                <span className="detail-value">{connection.username}</span>
              </div>
              <div className="connection-detail">
                <span className="detail-label">Group:</span>
                <span className="detail-value">{connection.group}</span>
              </div>
              <div className="connection-detail">
                <span className="detail-label">Last Connected:</span>
                <span className="detail-value">{connection.lastConnected}</span>
              </div>
            </div>

            <div className="connection-card-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleConnect(connection)}
              >
                <span className="btn-icon">🔗</span>
                Connect
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleEdit(connection)}
              >
                <span className="btn-icon">✏️</span>
                Edit
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(connection)}
              >
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredConnections.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No connections found</h3>
          <p>Try adjusting your search criteria or create a new connection.</p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Connection</h3>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Connection form will be implemented here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionManager;
