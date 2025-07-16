const ActiveDirectory = require('activedirectory');
const ldap = require('ldapjs');
const dns = require('dns');
const { promisify } = require('util');
const { AD_CONFIG, validateConfig, getFullDN, isUserActive, formatLastLogon } = require('../config/activeDirectory');

// Import mock service for development
const mockAdService = require('./mockActiveDirectory');

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

class ActiveDirectoryService {
  constructor() {
    // Check if we're in mock mode
    this.mockMode = process.env.AD_MODE === 'mock';
    
    if (this.mockMode) {
      console.log('🔧 Active Directory running in MOCK mode for development');
      return;
    }

    // Validate configuration on startup
    if (!validateConfig()) {
      throw new Error('Invalid Active Directory configuration');
    }
    
    this.config = {
      url: AD_CONFIG.ldap.url,
      baseDN: AD_CONFIG.ldap.baseDN,
      username: AD_CONFIG.ldap.username,
      password: AD_CONFIG.ldap.password,
      attributes: {
        user: AD_CONFIG.userAttributes,
        group: AD_CONFIG.groupAttributes
      }
    };
    
    this.ad = new ActiveDirectory(this.config);
  }

  // Check if we should use mock service
  shouldUseMock() {
    return this.mockMode || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  // Authenticate user with Active Directory
  async authenticateUser(username, password) {
    if (this.shouldUseMock()) {
      return mockAdService.authenticateUser(username, password);
    }

    try {
      const fullUsername = getFullDN(username);
      
      return new Promise((resolve, reject) => {
        this.ad.authenticate(fullUsername, password, (err, auth) => {
          if (err) {
            console.error('Authentication error:', err);
            reject(new Error('Authentication failed'));
            return;
          }
          
          if (auth) {
            resolve({ success: true, username: username });
          } else {
            reject(new Error('Invalid credentials'));
          }
        });
      });
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  // Get user information from Active Directory
  async getUserInfo(username) {
    if (this.shouldUseMock()) {
      return mockAdService.getUserInfo(username);
    }

    try {
      return new Promise((resolve, reject) => {
        this.ad.findUser(username, (err, user) => {
          if (err) {
            console.error('User lookup error:', err);
            reject(new Error('User lookup failed'));
            return;
          }
          
          if (!user) {
            reject(new Error('User not found'));
            return;
          }
          
          const userInfo = {
            username: user.sAMAccountName,
            displayName: user.displayName,
            email: user.mail,
            department: user.department,
            title: user.title,
            phone: user.telephoneNumber,
            isActive: isUserActive(user.userAccountControl),
            lastLogon: formatLastLogon(user.lastLogon),
            groups: user.memberOf || []
          };
          
          resolve(userInfo);
        });
      });
    } catch (error) {
      console.error('User info error:', error);
      throw new Error('Failed to get user information');
    }
  }

  // Get user groups
  async getUserGroups(username) {
    if (this.shouldUseMock()) {
      return mockAdService.getUserGroups(username);
    }

    try {
      return new Promise((resolve, reject) => {
        this.ad.getGroupMembershipForUser(username, (err, groups) => {
          if (err) {
            console.error('Group lookup error:', err);
            reject(new Error('Group lookup failed'));
            return;
          }
          
          const groupNames = groups ? groups.map(group => group.cn) : [];
          resolve(groupNames);
        });
      });
    } catch (error) {
      console.error('Group lookup error:', error);
      throw new Error('Failed to get user groups');
    }
  }

  // Search for users
  async searchUsers(searchTerm) {
    if (this.shouldUseMock()) {
      return mockAdService.searchUsers(searchTerm);
    }

    try {
      const filter = `(&(objectCategory=person)(objectClass=user)(|(sAMAccountName=*${searchTerm}*)(displayName=*${searchTerm}*)(mail=*${searchTerm}*)))`;
      
      return new Promise((resolve, reject) => {
        this.ad.findUsers(filter, (err, users) => {
          if (err) {
            console.error('User search error:', err);
            reject(new Error('User search failed'));
            return;
          }
          
          const userList = users ? users.map(user => ({
            username: user.sAMAccountName,
            displayName: user.displayName,
            email: user.mail,
            department: user.department,
            isActive: isUserActive(user.userAccountControl)
          })) : [];
          
          resolve(userList);
        });
      });
    } catch (error) {
      console.error('User search error:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get all groups
  async getGroups() {
    if (this.shouldUseMock()) {
      return mockAdService.getGroups();
    }

    try {
      return new Promise((resolve, reject) => {
        this.ad.findGroups((err, groups) => {
          if (err) {
            console.error('Group search error:', err);
            reject(new Error('Group search failed'));
            return;
          }
          
          const groupList = groups ? groups.map(group => ({
            name: group.cn,
            displayName: group.displayName,
            description: group.description,
            dn: group.dn
          })) : [];
          
          resolve(groupList);
        });
      });
    } catch (error) {
      console.error('Group search error:', error);
      throw new Error('Failed to get groups');
    }
  }

  // Resolve hostname using Active Directory DNS or system DNS
  async resolveHostname(hostname) {
    if (this.shouldUseMock()) {
      return mockAdService.resolveHostname(hostname);
    }

    try {
      // First try to resolve using system DNS
      const result = await this.trySystemDnsResolution(hostname);
      if (result) {
        return result;
      }

      // If system DNS fails, try AD DNS resolution
      return await this.tryAdDnsResolution(hostname);
    } catch (error) {
      console.error('DNS resolution error:', error);
      throw new Error('Failed to resolve hostname');
    }
  }

  // Try system DNS resolution
  async trySystemDnsResolution(hostname) {
    try {
      // Try IPv4 first
      const ipv4Addresses = await resolve4(hostname);
      if (ipv4Addresses && ipv4Addresses.length > 0) {
        return {
          hostname: hostname,
          addresses: ipv4Addresses,
          type: 'A',
          source: 'system'
        };
      }
    } catch (error) {
      // IPv4 failed, try IPv6
      try {
        const ipv6Addresses = await resolve6(hostname);
        if (ipv6Addresses && ipv6Addresses.length > 0) {
          return {
            hostname: hostname,
            addresses: ipv6Addresses,
            type: 'AAAA',
            source: 'system'
          };
        }
      } catch (ipv6Error) {
        // Both failed, return null to try AD resolution
        return null;
      }
    }
    return null;
  }

  // Try Active Directory DNS resolution
  async tryAdDnsResolution(hostname) {
    try {
      const client = ldap.createClient({
        url: AD_CONFIG.ldap.url,
        timeout: AD_CONFIG.connection.timeout
      });

      return new Promise((resolve, reject) => {
        client.bind(AD_CONFIG.ldap.username, AD_CONFIG.ldap.password, (err) => {
          if (err) {
            client.destroy();
            reject(new Error('AD DNS bind failed'));
            return;
          }

          // Search for DNS records in AD
          const searchBase = `DC=DomainDnsZones,${AD_CONFIG.ldap.baseDN}`;
          const filter = `(&(objectClass=dnsNode)(name=${hostname}))`;
          
          client.search(searchBase, { filter, scope: 'sub' }, (err, res) => {
            if (err) {
              client.destroy();
              reject(new Error('AD DNS search failed'));
              return;
            }

            const entries = [];
            res.on('searchEntry', (entry) => {
              entries.push(entry.object);
            });

            res.on('end', () => {
              client.destroy();
              if (entries.length > 0) {
                const dnsRecord = this.parseDnsRecord(entries[0]);
                resolve(dnsRecord);
              } else {
                reject(new Error('Hostname not found in AD DNS'));
              }
            });

            res.on('error', (err) => {
              client.destroy();
              reject(err);
            });
          });
        });
      });
    } catch (error) {
      console.error('AD DNS resolution error:', error);
      throw new Error('AD DNS resolution failed');
    }
  }

  // Parse DNS record from AD
  parseDnsRecord(record) {
    return {
      hostname: record.name,
      addresses: record.dnsRecord ? [record.dnsRecord] : [],
      type: 'A',
      source: 'active-directory'
    };
  }

  // Get servers from Active Directory
  async getServers() {
    if (this.shouldUseMock()) {
      return mockAdService.getServers();
    }

    try {
      // In a real AD environment, this would query computer objects
      // For now, return empty array for production mode
      return [];
    } catch (error) {
      console.error('Server search error:', error);
      throw new Error('Failed to get servers');
    }
  }

  // Get organization units with servers from Active Directory
  async getOrganizationUnits() {
    if (this.shouldUseMock()) {
      return mockAdService.getOrganizationUnits();
    }

    try {
      // In a real AD environment, this would query OUs and computer objects
      // For now, return empty array for production mode
      return [];
    } catch (error) {
      console.error('Organization units search error:', error);
      throw new Error('Failed to get organization units');
    }
  }

  // Get single server from Active Directory
  async getServer(serverId) {
    if (this.shouldUseMock()) {
      return mockAdService.getServer(serverId);
    }

    try {
      // In a real AD environment, this would query specific computer object
      throw new Error('Server not found');
    } catch (error) {
      console.error('Server lookup error:', error);
      throw new Error('Failed to get server');
    }
  }

  // Search servers in Active Directory
  async searchServers(searchTerm) {
    if (this.shouldUseMock()) {
      return mockAdService.searchServers(searchTerm);
    }

    try {
      // In a real AD environment, this would search computer objects
      return [];
    } catch (error) {
      console.error('Server search error:', error);
      throw new Error('Failed to search servers');
    }
  }
}

module.exports = new ActiveDirectoryService();
