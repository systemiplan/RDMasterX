import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ConnectionCard = ({ connection, onLaunch, onUpdate, token }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getConnectionIcon = (type) => {
    const icons = {
      rdp: '🖥️',
      ssh: '💻',
      vnc: '📺',
      telnet: '📟',
      web: '🌐'
    };
    return icons[type] || '🔗';
  };

  const getConnectionColor = (type) => {
    const colors = {
      rdp: '#0078d4',
      ssh: '#28a745',
      vnc: '#fd7e14',
      telnet: '#6f42c1',
      web: '#17a2b8'
    };
    return colors[type] || '#6c757d';
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await onLaunch(connection);
    } catch (error) {
      console.error('Launch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/connections/${connection.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${connection.name}"?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/connections/${connection.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          onUpdate();
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="connection-card" style={{ borderLeftColor: getConnectionColor(connection.type) }}>
      <div className="connection-header">
        <div className="connection-title">
          <span className="connection-icon">{getConnectionIcon(connection.type)}</span>
          <div>
            <h3>{connection.name}</h3>
            <span className="connection-type">{connection.type.toUpperCase()}</span>
          </div>
        </div>
        <div className="connection-actions">
          <button
            className={`btn-icon ${connection.is_favorite ? 'favorite' : ''}`}
            onClick={handleToggleFavorite}
            title={connection.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ⭐
          </button>
          <Link
            to={`/connections/${connection.id}/edit`}
            className="btn-icon"
            title="Edit connection"
          >
            ✏️
          </Link>
          <button
            className="btn-icon btn-danger"
            onClick={handleDelete}
            title="Delete connection"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="connection-details">
        <div className="detail-row">
          <strong>Host:</strong> {connection.host}
          {connection.port && <span>:{connection.port}</span>}
        </div>
        
        {connection.username && (
          <div className="detail-row">
            <strong>Username:</strong> {connection.username}
          </div>
        )}

        {connection.password && (
          <div className="detail-row">
            <strong>Password:</strong>
            <span className="password-field">
              {showPassword ? connection.password : '••••••••'}
              <button
                className="btn-icon btn-small"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </span>
          </div>
        )}

        {connection.url && (
          <div className="detail-row">
            <strong>URL:</strong> 
            <a href={connection.url} target="_blank" rel="noopener noreferrer">
              {connection.url}
            </a>
          </div>
        )}

        {connection.description && (
          <div className="detail-row">
            <strong>Description:</strong> {connection.description}
          </div>
        )}

        {connection.group_name && (
          <div className="detail-row">
            <strong>Group:</strong> 
            <span className="group-tag">{connection.group_name}</span>
          </div>
        )}

        {connection.tags && connection.tags.length > 0 && (
          <div className="detail-row">
            <strong>Tags:</strong>
            <div className="tags">
              {connection.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="connection-footer">
        <button
          className="btn btn-primary btn-launch"
          onClick={handleLaunch}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
        
        <div className="connection-meta">
          <small>
            Created: {new Date(connection.created_at).toLocaleDateString()}
          </small>
          {connection.updated_at !== connection.created_at && (
            <small>
              Modified: {new Date(connection.updated_at).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
