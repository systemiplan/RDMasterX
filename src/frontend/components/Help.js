import React, { useState } from 'react';

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: {
        overview: 'Welcome to RDMasterX, your comprehensive remote connection manager.',
        topics: [
          {
            title: 'First Steps',
            content: 'After installation, create your first connection by clicking the "New Connection" button on the dashboard. Choose your connection type (RDP, SSH, VNC, etc.) and enter the required details.'
          },
          {
            title: 'Quick Actions',
            content: 'Use the quick action cards on the dashboard to rapidly create new connections or access frequently used features.'
          },
          {
            title: 'Navigation',
            content: 'Use the sidebar to navigate between different sections: Dashboard, Connections, Credentials, Settings, Audit, and Help.'
          }
        ]
      }
    },
    {
      id: 'connections',
      title: 'Managing Connections',
      icon: '🔗',
      content: {
        overview: 'Learn how to create, manage, and organize your remote connections.',
        topics: [
          {
            title: 'Creating Connections',
            content: 'Click "New Connection" and fill in the required details: name, connection type, host/IP, port, and credentials. You can also add a description and assign it to a group.'
          },
          {
            title: 'Connection Types',
            content: 'RDMasterX supports RDP (Remote Desktop), SSH (Secure Shell), VNC (Virtual Network Computing), Telnet, and Web connections.'
          },
          {
            title: 'Favorites',
            content: 'Mark frequently used connections as favorites by clicking the star icon. Favorite connections appear prominently on the dashboard.'
          },
          {
            title: 'Groups',
            content: 'Organize connections into groups (e.g., Production, Development, Testing) for better management and easy filtering.'
          }
        ]
      }
    },
    {
      id: 'credentials',
      title: 'Credential Management',
      icon: '🔒',
      content: {
        overview: 'Securely store and manage authentication credentials for your connections.',
        topics: [
          {
            title: 'Adding Credentials',
            content: 'Store usernames, passwords, SSH keys, and certificates in the secure credential vault. All sensitive data is encrypted using AES encryption.'
          },
          {
            title: 'Credential Types',
            content: 'Support for various credential types including passwords, SSH private keys, and X.509 certificates.'
          },
          {
            title: 'Sharing Credentials',
            content: 'Mark credentials as shared to allow other users in your organization to use them for connections.'
          },
          {
            title: 'Security',
            content: 'All credentials are encrypted before storage and can only be decrypted with your master password.'
          }
        ]
      }
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      icon: '⚙️',
      content: {
        overview: 'Customize RDMasterX to fit your workflow and security requirements.',
        topics: [
          {
            title: 'General Settings',
            content: 'Configure startup behavior, notifications, and general application preferences.'
          },
          {
            title: 'Security Settings',
            content: 'Set session timeouts, enable credential encryption, and configure auto-lock behavior for enhanced security.'
          },
          {
            title: 'Connection Settings',
            content: 'Adjust default timeouts, retry attempts, keep-alive intervals, and compression settings for optimal performance.'
          },
          {
            title: 'Appearance',
            content: 'Choose between light and dark themes, adjust font sizes, and enable compact mode for better screen utilization.'
          }
        ]
      }
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: {
        overview: 'Common issues and their solutions.',
        topics: [
          {
            title: 'Connection Failures',
            content: 'Check network connectivity, verify credentials, ensure the target host is accessible, and check firewall settings. Review the audit logs for detailed error messages.'
          },
          {
            title: 'Authentication Issues',
            content: 'Verify usernames and passwords, check if accounts are locked, ensure proper permissions, and validate SSH key formats for key-based authentication.'
          },
          {
            title: 'Performance Issues',
            content: 'Enable compression for slow connections, adjust keep-alive intervals, check network bandwidth, and consider using different connection protocols.'
          },
          {
            title: 'Application Crashes',
            content: 'Check system requirements, update to the latest version, review error logs, and restart the application. Contact support if issues persist.'
          }
        ]
      }
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      icon: '⌨️',
      content: {
        overview: 'Speed up your workflow with these keyboard shortcuts.',
        topics: [
          {
            title: 'General Navigation',
            content: 'Ctrl+1: Dashboard, Ctrl+2: Connections, Ctrl+3: Credentials, Ctrl+4: Settings, Ctrl+H: Help'
          },
          {
            title: 'Connection Management',
            content: 'Ctrl+N: New Connection, Ctrl+E: Edit Selected, Delete: Remove Selected, F5: Refresh List'
          },
          {
            title: 'Search and Filter',
            content: 'Ctrl+F: Focus Search, Ctrl+Shift+F: Advanced Filter, Esc: Clear Search/Filter'
          },
          {
            title: 'Application',
            content: 'Ctrl+Q: Quit Application, Ctrl+,: Open Settings, Ctrl+Shift+L: Lock Application'
          }
        ]
      }
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.topics.some(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentSection = helpSections.find(section => section.id === activeSection);

  return (
    <div className="help-manager">
      <div className="help-header">
        <div className="header-title">
          <h1 className="dashboard-title">Help & Documentation</h1>
          <p className="dashboard-subtitle">
            Find answers and learn how to use RDMasterX effectively
          </p>
        </div>
      </div>

      <div className="help-content">
        {/* Search */}
        <div className="help-search">
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="help-layout">
          {/* Sidebar Navigation */}
          <div className="help-sidebar">
            <nav className="help-nav">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="help-main">
            {currentSection && (
              <div className="help-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <span className="section-icon">{currentSection.icon}</span>
                    {currentSection.title}
                  </h2>
                  <p className="section-overview">{currentSection.content.overview}</p>
                </div>

                <div className="section-content">
                  {currentSection.content.topics.map((topic, index) => (
                    <div key={index} className="help-topic">
                      <h3 className="topic-title">{topic.title}</h3>
                      <p className="topic-content">{topic.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!currentSection && searchTerm && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try adjusting your search terms or browse the help sections.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="quick-help">
        <h3>Quick Help</h3>
        <div className="help-cards">
          <div className="help-card">
            <div className="card-icon">📞</div>
            <div className="card-content">
              <h4>Contact Support</h4>
              <p>Need additional help? Contact our support team.</p>
              <button className="btn btn-primary btn-sm">Get Support</button>
            </div>
          </div>
          
          <div className="help-card">
            <div className="card-icon">📚</div>
            <div className="card-content">
              <h4>User Manual</h4>
              <p>Download the complete user manual PDF.</p>
              <button className="btn btn-secondary btn-sm">Download PDF</button>
            </div>
          </div>
          
          <div className="help-card">
            <div className="card-icon">🎥</div>
            <div className="card-content">
              <h4>Video Tutorials</h4>
              <p>Watch step-by-step video guides.</p>
              <button className="btn btn-secondary btn-sm">Watch Videos</button>
            </div>
          </div>
          
          <div className="help-card">
            <div className="card-icon">💡</div>
            <div className="card-content">
              <h4>Tips & Tricks</h4>
              <p>Discover productivity tips and advanced features.</p>
              <button className="btn btn-secondary btn-sm">Learn More</button>
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="version-info">
        <div className="version-details">
          <h4>Application Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Build:</span>
              <span className="info-value">2024.01.15</span>
            </div>
            <div className="info-item">
              <span className="info-label">Platform:</span>
              <span className="info-value">Windows x64</span>
            </div>
            <div className="info-item">
              <span className="info-label">License:</span>
              <span className="info-value">Enterprise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
