import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import Sidebar from './Sidebar';

const ConnectionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token, logout } = useContext(AuthContext);
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: 'rdp',
    host: '',
    port: '',
    username: '',
    password: '',
    url: '',
    description: '',
    group_name: '',
    tags: [],
    pre_script: '',
    post_script: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchConnection();
    }
  }, [id, isEdit]);

  const fetchConnection = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/connections/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...data,
          port: data.port || '',
          tags: data.tags || []
        });
      } else {
        setError('Failed to fetch connection');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      type,
      port: getDefaultPort(type)
    }));
  };

  const getDefaultPort = (type) => {
    const defaultPorts = {
      rdp: '3389',
      ssh: '22',
      vnc: '5900',
      telnet: '23',
      web: '80'
    };
    return defaultPorts[type] || '';
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit 
        ? `http://localhost:3001/api/connections/${id}`
        : 'http://localhost:3001/api/connections';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          port: formData.port ? parseInt(formData.port) : null
        }),
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar user={user} onLogout={logout} />
      
      <div className="main-content">
        <header className="dashboard-header">
          <h1>{isEdit ? 'Edit Connection' : 'New Connection'}</h1>
        </header>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="connection-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Connection Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Connection Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  required
                  disabled={loading}
                >
                  <option value="rdp">RDP (Remote Desktop)</option>
                  <option value="ssh">SSH</option>
                  <option value="vnc">VNC</option>
                  <option value="telnet">Telnet</option>
                  <option value="web">Web/HTTP</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="host">
                  {formData.type === 'web' ? 'URL *' : 'Host/IP Address *'}
                </label>
                {formData.type === 'web' ? (
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    required
                    disabled={loading}
                  />
                ) : (
                  <input
                    type="text"
                    id="host"
                    name="host"
                    value={formData.host}
                    onChange={handleInputChange}
                    placeholder="192.168.1.100 or server.domain.com"
                    required
                    disabled={loading}
                  />
                )}
              </div>

              {formData.type !== 'web' && (
                <div className="form-group">
                  <label htmlFor="port">Port</label>
                  <input
                    type="number"
                    id="port"
                    name="port"
                    value={formData.port}
                    onChange={handleInputChange}
                    placeholder={getDefaultPort(formData.type)}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {formData.type !== 'web' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="group_name">Group</label>
                <input
                  type="text"
                  id="group_name"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Production, Development, Servers"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <div className="tag-input">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag and press Enter"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <div className="tags">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pre_script">Pre-connection Script</label>
              <textarea
                id="pre_script"
                name="pre_script"
                value={formData.pre_script}
                onChange={handleInputChange}
                rows="3"
                placeholder="PowerShell or shell commands to run before connection"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="post_script">Post-connection Script</label>
              <textarea
                id="post_script"
                name="post_script"
                value={formData.post_script}
                onChange={handleInputChange}
                rows="3"
                placeholder="PowerShell or shell commands to run after connection"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Connection' : 'Create Connection')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConnectionForm;
