# 🚀 OPMO Connect - Development Mode Guide

## Development Setup (No Real AD Required)

For standalone development, OPMO Connect includes a **mock Active Directory service** that simulates real AD functionality without requiring access to actual domain controllers.

### Quick Start

1. **Copy development environment:**
   ```bash
   copy .env.development .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test mock AD connection:**
   ```bash
   npm run test-ad
   ```

## Mock Active Directory Features

### 🧪 Test Users Available

| Username | Password | Role | Status |
|----------|----------|------|--------|
| `john.doe` | `password` | System Administrator | Active |
| `jane.smith` | `password` | HR Manager | Active |
| `admin` | `admin123` | Domain Administrator | Active |
| `test.user` | `test123` | Test Account | Inactive |

### 🏢 Mock Domain Structure

- **Domain:** `iplan.gov.il`
- **Base DN:** `DC=iplan,DC=gov,DC=il`
- **Groups:** Domain Users, Domain Admins, IT Staff, HR Staff
- **Hosts:** dc01.iplan.gov.il, web01.iplan.gov.il, db01.iplan.gov.il

### 🔧 Mock Services

1. **Authentication:** Always succeeds with valid test credentials
2. **User Search:** Searches mock user database
3. **Group Management:** Returns predefined groups
4. **DNS Resolution:** Resolves mock hostnames + real system DNS
5. **Network Simulation:** Adds realistic delays (100-600ms)

## Development Workflow

### Testing Authentication

```javascript
// Frontend - Test login
const testLogin = async () => {
  const response = await fetch('/api/ad/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'john.doe',
      password: 'password'
    })
  });
  
  const result = await response.json();
  console.log('Auth result:', result);
};
```

### Testing User Search

```javascript
// Frontend - Test user search
const testUserSearch = async () => {
  const response = await fetch('/api/ad/users/search?q=john');
  const users = await response.json();
  console.log('Found users:', users);
};
```

### Testing DNS Resolution

```javascript
// Frontend - Test hostname resolution
const testDNS = async () => {
  const response = await fetch('/api/ad/resolve-hostname', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostname: 'web01.iplan.gov.il' })
  });
  
  const result = await response.json();
  console.log('DNS result:', result);
};
```

## UI Components Testing

### User Selector Component

```javascript
// Test the ActiveDirectoryUserSelector component
const [showUserSelector, setShowUserSelector] = useState(false);

<ActiveDirectoryUserSelector
  visible={showUserSelector}
  onClose={() => setShowUserSelector(false)}
  onUserSelect={(user) => {
    console.log('Selected user:', user);
    // User object contains: username, displayName, email, department, etc.
  }}
/>
```

### Authentication Component

```javascript
// Test the ActiveDirectoryAuth component
const [showAuth, setShowAuth] = useState(false);

<ActiveDirectoryAuth
  visible={showAuth}
  onClose={() => setShowAuth(false)}
  onAuthSuccess={(authData) => {
    console.log('Authenticated:', authData);
    // Store token, redirect, etc.
  }}
/>
```

## Switching Between Mock and Real AD

### Environment Variables

```env
# For development (mock mode)
AD_MODE=mock
NODE_ENV=development

# For production (real AD)
AD_MODE=production
NODE_ENV=production
```

### Configuration Files

- `.env.development` - Mock mode configuration
- `.env.production` - Real AD configuration
- `.env.example` - Template for both modes

## Benefits of Mock Mode

### ✅ Advantages

1. **No Network Dependencies** - Works offline
2. **Fast Development** - No external server delays
3. **Predictable Data** - Known test users and groups
4. **Security** - No real credentials needed
5. **Debugging** - Full control over responses
6. **Testing** - Simulate various scenarios

### 🔄 Realistic Simulation

The mock service includes:
- Network delays (100-600ms)
- Authentication validation
- User status checking (active/inactive)
- Group membership
- DNS resolution with fallback
- Error simulation

## Development Tips

### 1. Testing Error Scenarios

```javascript
// Test with invalid credentials
await mockAdService.authenticateUser('invalid', 'password');
// Throws: "User not found"

// Test with inactive user
await mockAdService.authenticateUser('test.user', 'test123');
// Throws: "Account is disabled"
```

### 2. Custom Mock Data

Edit `src/backend/services/mockActiveDirectory.js` to:
- Add more test users
- Modify group structures
- Add custom hostnames
- Simulate specific scenarios

### 3. Debug Logging

```env
LOG_LEVEL=debug
AD_ENABLE_LOGGING=true
```

### 4. Frontend Development

The mock service provides the same API as the real AD service, so frontend components work identically in both modes.

## Production Deployment

When ready for production:

1. **Update environment:**
   ```env
   AD_MODE=production
   NODE_ENV=production
   ```

2. **Configure real AD settings:**
   ```env
   AD_DOMAIN=your-real-domain.com
   AD_DOMAIN_CONTROLLER=your-dc.domain.com
   AD_LDAP_URL=ldap://your-dc.domain.com:389
   AD_BASE_DN=DC=your-domain,DC=com
   AD_BIND_USER=CN=service-account,CN=Users,DC=your-domain,DC=com
   AD_BIND_PASSWORD=actual-service-password
   ```

3. **Test connection:**
   ```bash
   npm run test-ad
   ```

## Troubleshooting

### Common Issues

1. **Mock service not working:**
   - Check `AD_MODE=mock` in `.env`
   - Verify mock service file exists
   - Check console for error messages

2. **Test users not authenticating:**
   - Verify username/password combinations
   - Check user status (active/inactive)
   - Review mock user data

3. **DNS resolution issues:**
   - Mock hostnames work for `*.iplan.gov.il`
   - Real hostnames use system DNS
   - Check network connectivity for real hosts

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Security Notes

- Mock mode is for development only
- Never use mock credentials in production
- Real AD configuration requires proper security
- Always validate input in production code

This setup allows you to develop and test all Active Directory functionality without needing access to a real domain controller!
