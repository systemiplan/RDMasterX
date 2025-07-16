// Mock Active Directory Service for Development
class MockActiveDirectoryService {
  constructor() {
    this.mockUsers = [
      {
        username: 'john.doe',
        displayName: 'John Doe',
        email: 'john.doe@iplan.gov.il',
        department: 'IT',
        title: 'System Administrator',
        phone: '+972-3-1234567',
        isActive: true,
        lastLogon: new Date().toISOString(),
        groups: ['Domain Users', 'IT Staff', 'Administrators']
      },
      {
        username: 'jane.smith',
        displayName: 'Jane Smith',
        email: 'jane.smith@iplan.gov.il',
        department: 'HR',
        title: 'HR Manager',
        phone: '+972-3-1234568',
        isActive: true,
        lastLogon: new Date(Date.now() - 86400000).toISOString(),
        groups: ['Domain Users', 'HR Staff']
      },
      {
        username: 'admin',
        displayName: 'Administrator',
        email: 'admin@iplan.gov.il',
        department: 'IT',
        title: 'Domain Administrator',
        phone: '+972-3-1234569',
        isActive: true,
        lastLogon: new Date(Date.now() - 3600000).toISOString(),
        groups: ['Domain Users', 'Domain Admins', 'Enterprise Admins']
      },
      {
        username: 'test.user',
        displayName: 'Test User',
        email: 'test.user@iplan.gov.il',
        department: 'Testing',
        title: 'Test Account',
        phone: '+972-3-1234570',
        isActive: false,
        lastLogon: 'Never',
        groups: ['Domain Users']
      }
    ];

    this.mockGroups = [
      { name: 'Domain Users', displayName: 'Domain Users', description: 'All domain users' },
      { name: 'Domain Admins', displayName: 'Domain Admins', description: 'Domain administrators' },
      { name: 'Enterprise Admins', displayName: 'Enterprise Admins', description: 'Enterprise administrators' },
      { name: 'IT Staff', displayName: 'IT Staff', description: 'IT department staff' },
      { name: 'HR Staff', displayName: 'HR Staff', description: 'HR department staff' },
      { name: 'Administrators', displayName: 'Administrators', description: 'Local administrators' }
    ];

    this.mockHosts = [
      { hostname: 'dc01.iplan.gov.il', ip: '10.0.1.10' },
      { hostname: 'web01.iplan.gov.il', ip: '10.0.1.20' },
      { hostname: 'db01.iplan.gov.il', ip: '10.0.1.30' },
      { hostname: 'mail01.iplan.gov.il', ip: '10.0.1.40' },
      { hostname: 'fileserver.iplan.gov.il', ip: '10.0.1.50' }
    ];

    // Mock servers organized by Organization Units (OUs)
    this.mockOrganizationUnits = [
      {
        name: 'Domain Controllers',
        description: 'Primary and backup domain controllers',
        servers: [
          {
            id: 'srv-001',
            name: 'DC01 - Domain Controller',
            hostname: 'dc01.iplan.gov.il',
            ip: '10.0.1.10',
            type: 'RDP',
            os: 'Windows Server 2022',
            location: 'Main Data Center',
            description: 'Primary Domain Controller',
            port: 3389,
            status: 'online',
            lastSeen: new Date().toISOString()
          }
        ]
      },
      {
        name: 'Web Servers',
        description: 'Web application and IIS servers',
        servers: [
          {
            id: 'srv-002',
            name: 'WEB01 - Web Server',
            hostname: 'web01.iplan.gov.il',
            ip: '10.0.1.20',
            type: 'RDP',
            os: 'Windows Server 2019',
            location: 'Main Data Center',
            description: 'IIS Web Server',
            port: 3389,
            status: 'online',
            lastSeen: new Date(Date.now() - 300000).toISOString()
          }
        ]
      },
      {
        name: 'Database Servers',
        description: 'Database and storage servers',
        servers: [
          {
            id: 'srv-003',
            name: 'DB01 - Database Server',
            hostname: 'db01.iplan.gov.il',
            ip: '10.0.1.30',
            type: 'SSH',
            os: 'Ubuntu Server 20.04',
            location: 'Main Data Center',
            description: 'MySQL Database Server',
            port: 22,
            status: 'online',
            lastSeen: new Date(Date.now() - 600000).toISOString()
          }
        ]
      },
      {
        name: 'Mail Servers',
        description: 'Email and communication servers',
        servers: [
          {
            id: 'srv-004',
            name: 'MAIL01 - Mail Server',
            hostname: 'mail01.iplan.gov.il',
            ip: '10.0.1.40',
            type: 'RDP',
            os: 'Windows Server 2019',
            location: 'Main Data Center',
            description: 'Exchange Mail Server',
            port: 3389,
            status: 'online',
            lastSeen: new Date(Date.now() - 900000).toISOString()
          }
        ]
      },
      {
        name: 'File Servers',
        description: 'Network storage and file servers',
        servers: [
          {
            id: 'srv-005',
            name: 'FS01 - File Server',
            hostname: 'fileserver.iplan.gov.il',
            ip: '10.0.1.50',
            type: 'RDP',
            os: 'Windows Server 2022',
            location: 'Main Data Center',
            description: 'Network File Storage',
            port: 3389,
            status: 'online',
            lastSeen: new Date(Date.now() - 1200000).toISOString()
          }
        ]
      },
      {
        name: 'Linux Servers',
        description: 'Linux and Unix servers',
        servers: [
          {
            id: 'srv-006',
            name: 'LINUX01 - Linux Server',
            hostname: 'linux01.iplan.gov.il',
            ip: '10.0.1.60',
            type: 'SSH',
            os: 'CentOS 8',
            location: 'DR Site',
            description: 'Application Server',
            port: 22,
            status: 'offline',
            lastSeen: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      }
    ];

    // Flatten servers for backward compatibility
    this.mockServers = this.mockOrganizationUnits.reduce((acc, ou) => {
      return acc.concat(ou.servers.map(server => ({
        ...server,
        ou: ou.name,
        ouDescription: ou.description
      })));
    }, []);
  }

  // Mock authentication - always succeeds for demo users
  async authenticateUser(username, password) {
    await this.simulateNetworkDelay();
    
    const user = this.mockUsers.find(u => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // In development, accept any non-empty password
    if (!password || password.trim() === '') {
      throw new Error('Password is required');
    }

    return { 
      success: true, 
      username: username,
      token: `mock-token-${Date.now()}`
    };
  }

  // Mock user info lookup
  async getUserInfo(username) {
    await this.simulateNetworkDelay();
    
    const user = this.mockUsers.find(u => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    return { ...user };
  }

  // Mock user groups
  async getUserGroups(username) {
    await this.simulateNetworkDelay();
    
    const user = this.mockUsers.find(u => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    return user.groups;
  }

  // Mock user search
  async searchUsers(searchTerm) {
    await this.simulateNetworkDelay();
    
    const term = searchTerm.toLowerCase();
    return this.mockUsers.filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.displayName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.department.toLowerCase().includes(term)
    );
  }

  // Mock groups retrieval
  async getGroups() {
    await this.simulateNetworkDelay();
    return [...this.mockGroups];
  }

  // Mock servers retrieval
  async getServers() {
    await this.simulateNetworkDelay();
    return [...this.mockServers];
  }

  // Mock get organization units with servers
  async getOrganizationUnits() {
    await this.simulateNetworkDelay();
    return [...this.mockOrganizationUnits];
  }

  // Mock single server retrieval
  async getServer(serverId) {
    await this.simulateNetworkDelay();
    const server = this.mockServers.find(s => s.id === serverId);
    if (!server) {
      throw new Error('Server not found');
    }
    return { ...server };
  }

  // Mock server search
  async searchServers(searchTerm) {
    await this.simulateNetworkDelay();
    
    const term = searchTerm.toLowerCase();
    return this.mockServers.filter(server => 
      server.name.toLowerCase().includes(term) ||
      server.hostname.toLowerCase().includes(term) ||
      server.ip.includes(term) ||
      server.type.toLowerCase().includes(term) ||
      server.description.toLowerCase().includes(term)
    );
  }

  // Mock hostname resolution
  async resolveHostname(hostname) {
    await this.simulateNetworkDelay();
    
    // Check mock hosts first
    const mockHost = this.mockHosts.find(h => h.hostname === hostname);
    if (mockHost) {
      return {
        hostname: hostname,
        addresses: [mockHost.ip],
        type: 'A',
        source: 'mock-ad'
      };
    }

    // Try system DNS for real hostnames
    try {
      const dns = require('dns');
      const { promisify } = require('util');
      const resolve4 = promisify(dns.resolve4);
      
      const addresses = await resolve4(hostname);
      return {
        hostname: hostname,
        addresses: addresses,
        type: 'A',
        source: 'system'
      };
    } catch (error) {
      // Return mock response for unknown hosts
      return {
        hostname: hostname,
        addresses: [`192.168.1.${Math.floor(Math.random() * 254) + 1}`],
        type: 'A',
        source: 'mock-fallback'
      };
    }
  }

  // Simulate network delay for realistic testing
  async simulateNetworkDelay() {
    const delay = Math.random() * 500 + 100; // 100-600ms delay
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = new MockActiveDirectoryService();
