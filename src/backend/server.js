const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');
const authRoutes = require('./routes/auth');
const connectionRoutes = require('./routes/connections');
const userRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const activeDirectoryRoutes = require('./routes/activeDirectory');
const credentialsRoutes = require('./routes/credentials');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', authenticateToken, connectionRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);
app.use('/api/ad', activeDirectoryRoutes);
app.use('/api/credentials', credentialsRoutes);

// Mock AD notice
console.log('🔧 Active Directory running in MOCK mode for development');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;
