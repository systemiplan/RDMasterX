const adService = require('./src/backend/services/activeDirectory');

console.log('Testing activeDirectory service...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AD_MODE:', process.env.AD_MODE);

// Test shouldUseMock method
console.log('Should use mock:', adService.shouldUseMock());

// Test getServers method
adService.getServers().then(servers => {
  console.log('Number of servers:', servers.length);
  console.log('First server:', servers[0]);
}).catch(err => {
  console.error('Error:', err);
});
