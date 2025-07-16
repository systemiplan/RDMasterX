# OPMO Connect - Active Directory Integration

OPMO Connect now includes comprehensive Active Directory integration for enterprise authentication and hostname resolution.

## Features

- **User Authentication**: Authenticate users against Active Directory
- **User Search**: Search for users in the domain
- **Group Management**: Retrieve user groups and domain groups
- **DNS Resolution**: Resolve hostnames using AD DNS with system DNS fallback
- **User Selection**: Interactive user selector component for credentials
- **Secure Configuration**: Environment-based configuration with validation

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Access to Active Directory domain controller
- Service account with appropriate permissions

### Installation

1. **Run the setup script:**
   ```bash
   # For Windows
   setup.bat
   
   # For Linux/macOS
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Edit `.env` with your Active Directory settings

### Environment Configuration

Required environment variables in `.env`:

```env
# Active Directory Configuration
AD_DOMAIN=your-domain.com
AD_DOMAIN_CONTROLLER=dc.your-domain.com
AD_LDAP_URL=ldap://dc.your-domain.com:389
AD_BASE_DN=DC=your-domain,DC=com
AD_BIND_USER=CN=service-account,CN=Users,DC=your-domain,DC=com
AD_BIND_PASSWORD=service-account-password

# Search Configuration
AD_USER_SEARCH_BASE=CN=Users,DC=your-domain,DC=com
AD_GROUP_SEARCH_BASE=CN=Groups,DC=your-domain,DC=com

# Optional: Test credentials for testing
AD_TEST_USERNAME=testuser
AD_TEST_PASSWORD=testpassword
```

### Testing the Connection

Run the Active Directory test script:

```bash
npm run test-ad
```

This will test:
- Authentication
- User search
- Group retrieval
- DNS resolution

## Usage

### Backend API Endpoints

The Active Directory integration provides the following API endpoints:

#### Authentication
- `POST /api/ad/authenticate` - Authenticate user
- `GET /api/ad/user/:username` - Get user information
- `GET /api/ad/user/:username/groups` - Get user groups

#### User Management
- `GET /api/ad/users/search?q=searchterm` - Search users
- `GET /api/ad/groups` - Get all groups

#### DNS Resolution
- `POST /api/ad/resolve-hostname` - Resolve hostname

### Frontend Components

#### ActiveDirectoryUserSelector
Interactive component for selecting users from Active Directory:

```javascript
import ActiveDirectoryUserSelector from './components/ActiveDirectoryUserSelector';

<ActiveDirectoryUserSelector
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  onUserSelect={(user) => {
    console.log('Selected user:', user);
  }}
/>
```

#### ActiveDirectoryAuth
Authentication component for AD login:

```javascript
import ActiveDirectoryAuth from './components/ActiveDirectoryAuth';

<ActiveDirectoryAuth
  visible={isAuthVisible}
  onClose={() => setIsAuthVisible(false)}
  onAuthSuccess={(authData) => {
    console.log('Authentication successful:', authData);
  }}
/>
```

## Security Considerations

1. **Service Account**: Use a dedicated service account with minimal permissions
2. **TLS/SSL**: Enable TLS for production deployments
3. **Environment Variables**: Never commit credentials to version control
4. **Network Security**: Ensure proper firewall rules for LDAP traffic
5. **Password Policy**: Follow your organization's password policy

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network connectivity to domain controller
   - Verify firewall rules allow LDAP traffic (port 389/636)

2. **Authentication Failures**
   - Verify service account credentials
   - Check service account permissions
   - Ensure account is not locked or expired

3. **User Search Issues**
   - Verify search base DNs are correct
   - Check service account has read permissions
   - Verify LDAP filter syntax

4. **DNS Resolution Problems**
   - Check DNS server settings
   - Verify domain controller DNS configuration
   - Test with system DNS tools first

### Debug Mode

Enable debug logging by setting:
```env
AD_ENABLE_LOGGING=true
LOG_LEVEL=debug
```

### Testing Individual Components

Test specific AD functions:

```javascript
const adService = require('./src/backend/services/activeDirectory');

// Test authentication
const authResult = await adService.authenticateUser('username', 'password');

// Test user search
const users = await adService.searchUsers('john');

// Test DNS resolution
const dnsResult = await adService.resolveHostname('server01');
```

## Development

### Project Structure

```
src/
├── backend/
│   ├── config/
│   │   └── activeDirectory.js      # AD configuration
│   ├── routes/
│   │   └── activeDirectory.js      # API routes
│   ├── services/
│   │   └── activeDirectory.js      # Core AD service
│   └── test-ad.js                  # Test script
└── frontend/
    └── components/
        ├── ActiveDirectoryUserSelector.js
        └── ActiveDirectoryAuth.js
```

### Configuration Management

The configuration is centralized in `src/backend/config/activeDirectory.js`:

- Environment variable validation
- Default values and fallbacks
- Helper functions for DN manipulation
- User account status checking

### Error Handling

The system includes comprehensive error handling:

- Connection timeouts
- Authentication failures
- Search failures
- DNS resolution errors
- Network connectivity issues

## Performance Considerations

1. **Connection Pooling**: Service uses connection pooling for LDAP connections
2. **Caching**: Consider implementing caching for frequently accessed data
3. **Pagination**: User search results are paginated for large directories
4. **Timeouts**: Configurable timeouts prevent hanging connections

## Maintenance

### Regular Tasks

1. **Monitor service account**: Ensure service account remains active
2. **Check logs**: Review application logs for errors
3. **Test connectivity**: Periodically run the test script
4. **Update credentials**: Rotate service account password as needed

### Backup Considerations

- Environment configuration files
- Service account information
- Custom configurations

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review application logs
3. Test with the provided test script
4. Verify Active Directory configuration

## License

This Active Directory integration is part of OPMO Connect and follows the same license terms.
