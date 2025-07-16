const express = require('express');
const dns = require('dns');
const adService = require('../services/activeDirectory');

const router = express.Router();

// Authenticate user with AD
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const authResult = await adService.authenticateUser(username, password);
    
    if (authResult.success) {
      // Get user info after successful authentication
      const userInfo = await adService.getUserInfo(username);
      
      // Here you would typically create a JWT token or session
      res.json({
        success: true,
        user: userInfo,
        message: 'Authentication successful',
        token: authResult.token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user information
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userInfo = await adService.getUserInfo(username);
    
    if (userInfo) {
      res.json(userInfo);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ error: 'User lookup failed' });
  }
});

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await adService.searchUsers(q);
    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'User search failed' });
  }
});

// Get user groups
router.get('/user/:username/groups', async (req, res) => {
  try {
    const { username } = req.params;
    const groups = await adService.getUserGroups(username);
    res.json(groups);
  } catch (error) {
    console.error('Groups lookup error:', error);
    res.status(500).json({ error: 'Groups lookup failed' });
  }
});

// Get all groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await adService.getGroups();
    res.json(groups);
  } catch (error) {
    console.error('Groups lookup error:', error);
    res.status(500).json({ error: 'Groups lookup failed' });
  }
});

// Resolve hostname to IP
router.post('/resolve-hostname', async (req, res) => {
  try {
    const { hostname } = req.body;
    
    if (!hostname) {
      return res.status(400).json({ error: 'Hostname is required' });
    }

    // First try AD DNS resolution
    try {
      const ip = await adService.resolveHostname(hostname);
      return res.json({ hostname, ip, source: 'AD' });
    } catch (adError) {
      console.log('AD DNS resolution failed, trying system DNS:', adError.message);
    }

    // Fall back to system DNS
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        console.error('DNS resolution error:', err);
        return res.status(404).json({ error: `Could not resolve hostname: ${hostname}` });
      }
      
      res.json({ 
        hostname, 
        ip: addresses[0], 
        source: 'system' 
      });
    });
  } catch (error) {
    console.error('Hostname resolution error:', error);
    res.status(500).json({ error: 'Hostname resolution failed' });
  }
});

// Get all servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await adService.getServers();
    res.json(servers);
  } catch (error) {
    console.error('Server retrieval error:', error);
    res.status(500).json({ error: 'Server retrieval failed' });
  }
});

// Get organization units with servers
router.get('/organization-units', async (req, res) => {
  try {
    const organizationUnits = await adService.getOrganizationUnits();
    res.json(organizationUnits);
  } catch (error) {
    console.error('Organization units retrieval error:', error);
    res.status(500).json({ error: 'Organization units retrieval failed' });
  }
});

// Get single server
router.get('/servers/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const server = await adService.getServer(serverId);
    res.json(server);
  } catch (error) {
    console.error('Server lookup error:', error);
    res.status(500).json({ error: 'Server lookup failed' });
  }
});

// Get all AD servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await adService.getServers();
    res.json(servers);
  } catch (error) {
    console.error('Server lookup error:', error);
    res.status(500).json({ error: 'Server lookup failed' });
  }
});

// Search servers
router.get('/servers/search/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const servers = await adService.searchServers(searchTerm);
    res.json(servers);
  } catch (error) {
    console.error('Server search error:', error);
    res.status(500).json({ error: 'Server search failed' });
  }
});

module.exports = router;
