import React, { useState, useEffect } from 'react';

const Credentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [showNewCredential, setShowNewCredential] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredential, setSelectedCredential] = useState(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = () => {
    // Mock data - replace with actual API
    const mockCredentials = [
      {
        id: 1,
        name: 'Production Admin',
        username: 'prod_admin',
        description: 'Production server administrator account',
        type: 'password',
        lastUsed: '2024-01-15T10:30:00Z',
        usageCount: 15,
        isShared: false
      },
      {
        id: 2,
        name: 'Database User',
        username: 'db_user',
        description: 'Database access credentials',
        type: 'password',
        lastUsed: '2024-01-14T15:45:00Z',
        usageCount: 8,
        isShared: true
      },
      {
        id: 3,
        name: 'SSH Key - Dev Server',
        username: 'developer',
        description: 'SSH private key for development server',
        type: 'key',
        lastUsed: '2024-01-15T08:20:00Z',
        usageCount: 32,
        isShared: false
      }
    ];
    setCredentials(mockCredentials);
  };

  const filteredCredentials = credentials.filter(cred =>
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (credential) => {
    setSelectedCredential(credential);
    setShowNewCredential(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      setCredentials(credentials.filter(cred => cred.id !== id));
    }
  };

  const getCredentialIcon = (type) => {
    switch (type) {
      case 'password': return '🔑';
      case 'key': return '🗝️';
      case 'certificate': return '📜';
      default: return '🔒';
    }
  };

  return (
    <div className="credentials-manager">
      <div className="credentials-header">
        <div className="header-title">
          <h1 className="dashboard-title">Credential Vault</h1>
          <p className="dashboard-subtitle">
            Securely store and manage your authentication credentials
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowNewCredential(true)}
          >
            <span className="btn-icon">➕</span>
            Add Credential
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Credentials List */}
      <div className="credentials-list">
        {filteredCredentials.map(credential => (
          <div key={credential.id} className="credential-card">
            <div className="credential-header">
              <div className="credential-icon-info">
                <span className="credential-icon">
                  {getCredentialIcon(credential.type)}
                </span>
                <div className="credential-basic-info">
                  <h3 className="credential-name">{credential.name}</h3>
                  <p className="credential-username">{credential.username}</p>
                </div>
              </div>
              <div className="credential-actions">
                {credential.isShared && (
                  <span className="shared-badge">Shared</span>
                )}
                <div className="action-buttons">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigator.clipboard.writeText('***')}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(credential)}
                    title="Edit credential"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(credential.id)}
                    title="Delete credential"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            
            <div className="credential-body">
              <p className="credential-description">{credential.description}</p>
              <div className="credential-stats">
                <div className="stat-item">
                  <span className="stat-label">Type:</span>
                  <span className="stat-value credential-type">{credential.type}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Used:</span>
                  <span className="stat-value">
                    {new Date(credential.lastUsed).toLocaleDateString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Usage Count:</span>
                  <span className="stat-value">{credential.usageCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>No credentials found</h3>
          <p>Add your first credential to get started</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewCredential(true)}
          >
            Add Credential
          </button>
        </div>
      )}

      {/* New Credential Modal */}
      {showNewCredential && (
        <CredentialModal
          credential={selectedCredential}
          onClose={() => {
            setShowNewCredential(false);
            setSelectedCredential(null);
          }}
          onSave={(credential) => {
            if (selectedCredential) {
              setCredentials(credentials.map(cred =>
                cred.id === selectedCredential.id ? { ...credential, id: selectedCredential.id } : cred
              ));
            } else {
              setCredentials([...credentials, { ...credential, id: Date.now(), usageCount: 0, lastUsed: new Date().toISOString() }]);
            }
            setShowNewCredential(false);
            setSelectedCredential(null);
          }}
        />
      )}
    </div>
  );
};

const CredentialModal = ({ credential, onClose, onSave }) => {
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{credential ? 'Edit Credential' : 'New Credential'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Credential Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="password">Password</option>
                <option value="key">SSH Key</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>
              {formData.type === 'password' ? 'Password' : 
               formData.type === 'key' ? 'Private Key' : 'Certificate'}
            </label>
            {formData.type === 'password' ? (
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            ) : (
              <textarea
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                rows="6"
                placeholder={`Enter your ${formData.type}...`}
                required
              />
            )}
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isShared}
                onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              />
              Share with other users
            </label>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {credential ? 'Update' : 'Save'} Credential
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Credentials;
