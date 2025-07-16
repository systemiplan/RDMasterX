// Active Directory Configuration
const AD_CONFIG = {
  // Domain Controller settings
  domain: process.env.AD_DOMAIN || 'example.com',
  domainController: process.env.AD_DOMAIN_CONTROLLER || 'dc.example.com',
  
  // LDAP Settings
  ldap: {
    url: process.env.AD_LDAP_URL || 'ldap://dc.example.com:389',
    baseDN: process.env.AD_BASE_DN || 'DC=example,DC=com',
    username: process.env.AD_BIND_USER || 'CN=service-account,CN=Users,DC=example,DC=com',
    password: process.env.AD_BIND_PASSWORD || 'service-password'
  },
  
  // Search settings
  search: {
    userSearchBase: process.env.AD_USER_SEARCH_BASE || 'CN=Users,DC=example,DC=com',
    groupSearchBase: process.env.AD_GROUP_SEARCH_BASE || 'CN=Groups,DC=example,DC=com',
    pageSize: parseInt(process.env.AD_SEARCH_PAGE_SIZE) || 100,
    timeLimit: parseInt(process.env.AD_SEARCH_TIME_LIMIT) || 30
  },
  
  // Connection settings
  connection: {
    timeout: parseInt(process.env.AD_CONNECTION_TIMEOUT) || 5000,
    maxRetries: parseInt(process.env.AD_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.AD_RETRY_DELAY) || 1000
  },
  
  // Security settings
  security: {
    requireTLS: process.env.AD_REQUIRE_TLS === 'true',
    allowUnauthorized: process.env.AD_ALLOW_UNAUTHORIZED === 'true',
    enableLogging: process.env.AD_ENABLE_LOGGING === 'true'
  },
  
  // User attributes to fetch
  userAttributes: [
    'sAMAccountName',
    'displayName',
    'givenName',
    'sn',
    'mail',
    'telephoneNumber',
    'department',
    'title',
    'userAccountControl',
    'whenCreated',
    'lastLogon',
    'memberOf'
  ],
  
  // Group attributes to fetch
  groupAttributes: [
    'sAMAccountName',
    'displayName',
    'description',
    'groupType',
    'member',
    'memberOf',
    'whenCreated'
  ]
};

// Environment validation
const validateConfig = () => {
  const errors = [];
  
  if (!AD_CONFIG.domain) {
    errors.push('AD_DOMAIN environment variable is required');
  }
  
  if (!AD_CONFIG.domainController) {
    errors.push('AD_DOMAIN_CONTROLLER environment variable is required');
  }
  
  if (!AD_CONFIG.ldap.baseDN) {
    errors.push('AD_BASE_DN environment variable is required');
  }
  
  if (!AD_CONFIG.ldap.username) {
    errors.push('AD_BIND_USER environment variable is required');
  }
  
  if (!AD_CONFIG.ldap.password) {
    errors.push('AD_BIND_PASSWORD environment variable is required');
  }
  
  if (errors.length > 0) {
    console.error('Active Directory Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  return true;
};

// Helper functions
const getFullDN = (username) => {
  return `${username}@${AD_CONFIG.domain}`;
};

const parseDN = (dn) => {
  const parts = dn.split(',');
  const parsed = {};
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      parsed[key.trim()] = value.trim();
    }
  });
  
  return parsed;
};

const isUserActive = (userAccountControl) => {
  // Check if account is disabled (bit 2)
  const ACCOUNT_DISABLED = 2;
  return !(userAccountControl & ACCOUNT_DISABLED);
};

const formatLastLogon = (lastLogon) => {
  if (!lastLogon || lastLogon === '0') {
    return 'Never';
  }
  
  // Windows FILETIME to JavaScript Date
  const fileTime = BigInt(lastLogon);
  const epoch = BigInt('116444736000000000'); // Jan 1, 1970 in FILETIME
  const ticksPerMillisecond = BigInt('10000');
  
  const milliseconds = Number((fileTime - epoch) / ticksPerMillisecond);
  return new Date(milliseconds).toISOString();
};

module.exports = {
  AD_CONFIG,
  validateConfig,
  getFullDN,
  parseDN,
  isUserActive,
  formatLastLogon
};
