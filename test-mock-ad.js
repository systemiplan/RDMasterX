const mockAdService = require('./src/backend/services/mockActiveDirectory');

console.log('Testing mock AD service...');

// Test getServers method
mockAdService.getServers().then(servers => {
  console.log('Number of servers:', servers.length);
  console.log('First server:', servers[0]);
}).catch(err => {
  console.error('Error:', err);
});
