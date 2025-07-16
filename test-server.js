const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Mock database
let credentials = [];

// Encryption for demo
const ENCRYPTION_KEY = 'demo-key-32-characters-long-1234';
const ALGORITHM = 'aes-256-cbc';

function encryptPassword(password) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Credentials endpoints
app.post('/api/credentials', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const { username, password, description, url } = req.body;

    // All fields are optional
    if (!username && !password && !description && !url) {
      return res.status(400).json({
        error: 'At least one field must be provided'
      });
    }

    // Encrypt password if provided
    let encryptedPassword = null;
    if (password && password.trim().length > 0) {
      encryptedPassword = encryptPassword(password);
    }

    const newCredential = {
      id: Date.now().toString(),
      username: username ? username.trim() : null,
      password: encryptedPassword,
      description: description ? description.trim() : null,
      url: url ? url.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    credentials.push(newCredential);

    // Return response without password
    const response = {
      id: newCredential.id,
      username: newCredential.username,
      description: newCredential.description,
      url: newCredential.url,
      createdAt: newCredential.createdAt,
      updatedAt: newCredential.updatedAt
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving credential:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/credentials', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const safeCredentials = credentials.map(cred => ({
      id: cred.id,
      username: cred.username,
      description: cred.description,
      url: cred.url,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt
    }));

    res.json(safeCredentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Credentials API: http://localhost:${PORT}/api/credentials`);
});
