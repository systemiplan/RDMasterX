import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Sidebar from './Sidebar';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  const { user, token, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '')
        )
      });

      const response = await fetch(`http://localhost:3001/api/audit?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '')
        )
      });

      const response = await fetch(`http://localhost:3001/api/audit/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export logs');
      }
    } catch (error) {
      setError('Export failed');
    }
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: '#28a745',
      LOGOUT: '#6c757d',
      CREATE_CONNECTION: '#007bff',
      UPDATE_CONNECTION: '#ffc107',
      DELETE_CONNECTION: '#dc3545',
      LAUNCH_CONNECTION: '#17a2b8',
      CREATE_USER: '#28a745',
      UPDATE_USER: '#ffc107',
      DELETE_USER: '#dc3545'
    };
    return colors[action] || '#6c757d';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard">
      <Sidebar user={user} onLogout={logout} />
      
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Audit Logs</h1>
          <div className="header-actions">
            {user.role === 'admin' && (
              <>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleExport('csv')}
                >
                  Export CSV
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleExport('json')}
                >
                  Export JSON
                </button>
              </>
            )}
          </div>
        </header>

        <div className="audit-filters">
          <div className="filter-row">
            <div className="form-group">
              <label htmlFor="action">Action</label>
              <select
                id="action"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE_CONNECTION">Create Connection</option>
                <option value="UPDATE_CONNECTION">Update Connection</option>
                <option value="DELETE_CONNECTION">Delete Connection</option>
                <option value="LAUNCH_CONNECTION">Launch Connection</option>
                <option value="CREATE_USER">Create User</option>
                <option value="UPDATE_USER">Update User</option>
                <option value="DELETE_USER">Delete User</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => {
                setFilters({ action: '', user_id: '', start_date: '', end_date: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading audit logs...</div>
        ) : (
          <>
            <div className="audit-table">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Connection</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>{log.username}</td>
                      <td>
                        <span 
                          className="action-badge"
                          style={{ backgroundColor: getActionColor(log.action) }}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{log.connection_name || '-'}</td>
                      <td>{log.details}</td>
                      <td>{log.ip_address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
