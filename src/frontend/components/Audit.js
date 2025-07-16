import React, { useState, useEffect } from 'react';

const Audit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [filter, dateRange]);

  const loadAuditLogs = () => {
    // Mock audit log data - replace with actual API
    const mockLogs = [
      {
        id: 1,
        timestamp: '2024-01-15T10:30:00Z',
        user: 'admin',
        action: 'CONNECTION_ESTABLISHED',
        details: 'Connected to Production Server (192.168.1.100)',
        severity: 'info',
        ip: '192.168.1.50',
        sessionId: 'sess_abc123'
      },
      {
        id: 2,
        timestamp: '2024-01-15T10:25:00Z',
        user: 'admin',
        action: 'LOGIN_SUCCESS',
        details: 'User logged in successfully',
        severity: 'info',
        ip: '192.168.1.50',
        sessionId: 'sess_abc123'
      },
      {
        id: 3,
        timestamp: '2024-01-15T09:45:00Z',
        user: 'developer',
        action: 'CONNECTION_FAILED',
        details: 'Failed to connect to Development DB (dev.example.com) - Authentication failed',
        severity: 'error',
        ip: '192.168.1.75',
        sessionId: 'sess_def456'
      },
      {
        id: 4,
        timestamp: '2024-01-15T09:30:00Z',
        user: 'admin',
        action: 'CREDENTIAL_CREATED',
        details: 'Created new credential: Database User',
        severity: 'info',
        ip: '192.168.1.50',
        sessionId: 'sess_abc123'
      },
      {
        id: 5,
        timestamp: '2024-01-15T09:15:00Z',
        user: 'developer',
        action: 'LOGIN_FAILED',
        details: 'Login attempt failed - Invalid credentials',
        severity: 'warning',
        ip: '192.168.1.75',
        sessionId: null
      },
      {
        id: 6,
        timestamp: '2024-01-15T08:00:00Z',
        user: 'admin',
        action: 'SETTINGS_CHANGED',
        details: 'Updated security settings - Session timeout changed to 30 minutes',
        severity: 'info',
        ip: '192.168.1.50',
        sessionId: 'sess_abc123'
      }
    ];

    // Filter by severity/action type
    let filtered = mockLogs;
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.severity === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setAuditLogs(filtered);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return '✅';
      case 'LOGIN_FAILED': return '❌';
      case 'CONNECTION_ESTABLISHED': return '🔗';
      case 'CONNECTION_FAILED': return '❌';
      case 'CONNECTION_CLOSED': return '📴';
      case 'CREDENTIAL_CREATED': return '🔑';
      case 'CREDENTIAL_UPDATED': return '✏️';
      case 'CREDENTIAL_DELETED': return '🗑️';
      case 'SETTINGS_CHANGED': return '⚙️';
      case 'BACKUP_CREATED': return '💾';
      case 'EXPORT_DATA': return '📤';
      case 'IMPORT_DATA': return '📥';
      default: return '📝';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'severity-error';
      case 'warning': return 'severity-warning';
      case 'info': return 'severity-info';
      default: return 'severity-info';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const exportLogs = () => {
    const logsJson = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audit-manager">
      <div className="audit-header">
        <div className="header-title">
          <h1 className="dashboard-title">Audit Trail</h1>
          <p className="dashboard-subtitle">
            Monitor and review system activity and security events
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportLogs}>
            <span className="btn-icon">📤</span>
            Export Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <label>Filter by severity:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Audit Logs */}
      <div className="audit-logs">
        <div className="audit-table">
          <div className="table-header">
            <div className="header-cell">Event</div>
            <div className="header-cell">User</div>
            <div className="header-cell">Details</div>
            <div className="header-cell">Time</div>
            <div className="header-cell">IP Address</div>
          </div>
          
          <div className="table-body">
            {auditLogs.map(log => {
              const timestamp = formatTimestamp(log.timestamp);
              return (
                <div key={log.id} className={`audit-row ${getSeverityColor(log.severity)}`}>
                  <div className="audit-cell">
                    <div className="audit-action">
                      <span className="action-icon">{getActionIcon(log.action)}</span>
                      <span className="action-name">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="audit-cell">
                    <span className="user-name">{log.user}</span>
                  </div>
                  <div className="audit-cell">
                    <span className="log-details">{log.details}</span>
                  </div>
                  <div className="audit-cell">
                    <div className="timestamp">
                      <div className="date">{timestamp.date}</div>
                      <div className="time">{timestamp.time}</div>
                    </div>
                  </div>
                  <div className="audit-cell">
                    <span className="ip-address">{log.ip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {auditLogs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No audit logs found</h3>
            <p>No events match your current filter criteria</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="audit-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{auditLogs.length}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-value">
                {auditLogs.filter(log => log.severity === 'error').length}
              </div>
              <div className="stat-label">Errors</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">
                {auditLogs.filter(log => log.severity === 'warning').length}
              </div>
              <div className="stat-label">Warnings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">
                {new Set(auditLogs.map(log => log.user)).size}
              </div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
