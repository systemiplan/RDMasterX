const adService = require('./src/backend/services/activeDirectory');

console.log('Testing activeDirectory service...');

// Test getServers method
adService.getServers().then(servers => {
  console.log('Number of servers:', servers.length);
  console.log('First server:', servers[0]);
}).catch(err => {
  console.error('Error:', err);
});
