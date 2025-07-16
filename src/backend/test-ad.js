require('dotenv').config();
const adService = require('./services/activeDirectory');

async function testActiveDirectory() {
  console.log('Testing Active Directory connection...');
  console.log('Configuration:');
  console.log('- Domain:', process.env.AD_DOMAIN);
  console.log('- Domain Controller:', process.env.AD_DOMAIN_CONTROLLER);
  console.log('- LDAP URL:', process.env.AD_LDAP_URL);
  console.log('- Base DN:', process.env.AD_BASE_DN);
  console.log('');

  try {
    // Test authentication (you'll need to provide test credentials)
    const testUsername = process.env.AD_TEST_USERNAME;
    const testPassword = process.env.AD_TEST_PASSWORD;
    
    if (testUsername && testPassword) {
      console.log('Testing authentication...');
      try {
        const authResult = await adService.authenticateUser(testUsername, testPassword);
        console.log('✓ Authentication successful:', authResult);
      } catch (error) {
        console.log('✗ Authentication failed:', error.message);
      }
    } else {
      console.log('Skipping authentication test (no test credentials provided)');
    }

    // Test user search
    console.log('\nTesting user search...');
    try {
      const users = await adService.searchUsers('admin');
      console.log('✓ User search successful. Found', users.length, 'users');
      if (users.length > 0) {
        console.log('Sample user:', users[0]);
      }
    } catch (error) {
      console.log('✗ User search failed:', error.message);
    }

    // Test groups
    console.log('\nTesting group retrieval...');
    try {
      const groups = await adService.getGroups();
      console.log('✓ Group retrieval successful. Found', groups.length, 'groups');
      if (groups.length > 0) {
        console.log('Sample group:', groups[0]);
      }
    } catch (error) {
      console.log('✗ Group retrieval failed:', error.message);
    }

    // Test DNS resolution
    console.log('\nTesting DNS resolution...');
    try {
      const dnsResult = await adService.resolveHostname('localhost');
      console.log('✓ DNS resolution successful:', dnsResult);
    } catch (error) {
      console.log('✗ DNS resolution failed:', error.message);
    }

  } catch (error) {
    console.error('Overall test failed:', error.message);
  }
}

// Run the test
testActiveDirectory()
  .then(() => {
    console.log('\nActive Directory testing completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
