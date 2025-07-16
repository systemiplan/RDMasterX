const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Mock database - replace with your actual database
let credentials = [];

// Encryption key - in production, use environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// Encrypt password
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

// Decrypt password
function decryptPassword(encryptedData, iv) {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// POST /api/credentials - Add new credential
router.post('/', async (req, res) => {
  try {
    // Ensure proper JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    const { username, password, description, url } = req.body;

    // No required fields - all fields are optional
    // Basic validation to ensure at least some data is provided
    if (!username && !password && !description && !url) {
      return res.status(400).json({
        error: 'At least one field (username, password, description, or url) must be provided'
      });
    }

    // Additional validation
    // No required fields - all fields are optional
    // Basic validation to ensure at least some data is provided
    if (!username && !password && !description && !url) {
      return res.status(400).json({
        error: 'At least one field (username, password, description, or url) must be provided'
      });
    }

    // Encrypt the password if provided
    let encryptedPassword = null;
    if (password && password.trim().length > 0) {
      encryptedPassword = encryptPassword(password);
    }

    // Create new credential with optional fields
    const newCredential = {
      id: Date.now().toString(),
      username: username ? username.trim() : null,
      password: encryptedPassword,
      description: description ? description.trim() : null,
      url: url ? url.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock database
    credentials.push(newCredential);

    // Return response without the actual password
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
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/credentials - Get all credentials
router.get('/', async (req, res) => {
  try {
    // Return credentials without passwords
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
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/credentials/:id - Get specific credential
router.get('/:id', async (req, res) => {
  try {
    const credential = credentials.find(cred => cred.id === req.params.id);
    
    if (!credential) {
      return res.status(404).json({
        error: 'Credential not found'
      });
    }

    // Return credential without password
    const safeCredential = {
      id: credential.id,
      username: credential.username,
      description: credential.description,
      url: credential.url,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt
    };

    res.json(safeCredential);
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /api/credentials/:id - Update credential
router.put('/:id', async (req, res) => {
  try {
    const { username, password, description, url } = req.body;
    const credentialIndex = credentials.findIndex(cred => cred.id === req.params.id);

    if (credentialIndex === -1) {
      return res.status(404).json({
        error: 'Credential not found'
      });
    }

    // Update credential
    const updatedCredential = {
      ...credentials[credentialIndex],
      username: username || credentials[credentialIndex].username,
      description: description || credentials[credentialIndex].description,
      url: url !== undefined ? url : credentials[credentialIndex].url,
      updatedAt: new Date().toISOString()
    };

    // Update password if provided
    if (password) {
      updatedCredential.password = encryptPassword(password);
    }

    credentials[credentialIndex] = updatedCredential;

    // Return response without password
    const response = {
      id: updatedCredential.id,
      username: updatedCredential.username,
      description: updatedCredential.description,
      url: updatedCredential.url,
      createdAt: updatedCredential.createdAt,
      updatedAt: updatedCredential.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// DELETE /api/credentials/:id - Delete credential
router.delete('/:id', async (req, res) => {
  try {
    const credentialIndex = credentials.findIndex(cred => cred.id === req.params.id);

    if (credentialIndex === -1) {
      return res.status(404).json({
        error: 'Credential not found'
      });
    }

    credentials.splice(credentialIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
