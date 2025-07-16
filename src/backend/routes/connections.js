const express = require('express');
const Database = require('../database');

const router = express.Router();
const db = new Database();

// Get all connections for current user
router.get('/', async (req, res) => {
  try {
    const connections = await db.all(
      'SELECT * FROM connections WHERE user_id = ? ORDER BY name',
      [req.user.id]
    );

    // Decrypt passwords for display (you might want to limit this)
    const connectionsWithDecryptedPasswords = connections.map(conn => ({
      ...conn,
      password: conn.password_encrypted ? db.decrypt(conn.password_encrypted) : '',
      tags: conn.tags ? JSON.parse(conn.tags) : []
    }));

    res.json(connectionsWithDecryptedPasswords);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get connection by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await db.get(
      'SELECT * FROM connections WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Decrypt password
    if (connection.password_encrypted) {
      connection.password = db.decrypt(connection.password_encrypted);
    }
    
    if (connection.tags) {
      connection.tags = JSON.parse(connection.tags);
    }

    res.json(connection);
  } catch (error) {
    console.error('Get connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new connection
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      host,
      port,
      username,
      password,
      url,
      description,
      group_name,
      tags,
      pre_script,
      post_script
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Encrypt password if provided
    const encryptedPassword = password ? db.encrypt(password) : null;
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    const result = await db.run(
      `INSERT INTO connections (
        user_id, name, type, host, port, username, password_encrypted,
        url, description, group_name, tags, pre_script, post_script
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, name, type, host, port, username, encryptedPassword,
        url, description, group_name, tagsJson, pre_script, post_script
      ]
    );

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, connection_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, result.id, 'CREATE_CONNECTION', `Created connection: ${name}`]
    );

    res.status(201).json({
      message: 'Connection created successfully',
      connectionId: result.id
    });
  } catch (error) {
    console.error('Create connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update connection
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      host,
      port,
      username,
      password,
      url,
      description,
      group_name,
      tags,
      pre_script,
      post_script
    } = req.body;

    const connectionId = req.params.id;

    // Check if connection exists and belongs to user
    const existingConnection = await db.get(
      'SELECT * FROM connections WHERE id = ? AND user_id = ?',
      [connectionId, req.user.id]
    );

    if (!existingConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Encrypt password if provided
    const encryptedPassword = password ? db.encrypt(password) : existingConnection.password_encrypted;
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : existingConnection.tags;

    await db.run(
      `UPDATE connections SET
        name = ?, type = ?, host = ?, port = ?, username = ?, password_encrypted = ?,
        url = ?, description = ?, group_name = ?, tags = ?, pre_script = ?, post_script = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [
        name || existingConnection.name,
        type || existingConnection.type,
        host || existingConnection.host,
        port || existingConnection.port,
        username || existingConnection.username,
        encryptedPassword,
        url || existingConnection.url,
        description || existingConnection.description,
        group_name || existingConnection.group_name,
        tagsJson,
        pre_script || existingConnection.pre_script,
        post_script || existingConnection.post_script,
        connectionId,
        req.user.id
      ]
    );

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, connection_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, connectionId, 'UPDATE_CONNECTION', `Updated connection: ${name || existingConnection.name}`]
    );

    res.json({ message: 'Connection updated successfully' });
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete connection
router.delete('/:id', async (req, res) => {
  try {
    const connectionId = req.params.id;

    // Check if connection exists and belongs to user
    const connection = await db.get(
      'SELECT name FROM connections WHERE id = ? AND user_id = ?',
      [connectionId, req.user.id]
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await db.run(
      'DELETE FROM connections WHERE id = ? AND user_id = ?',
      [connectionId, req.user.id]
    );

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, connection_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, connectionId, 'DELETE_CONNECTION', `Deleted connection: ${connection.name}`]
    );

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const connectionId = req.params.id;

    const connection = await db.get(
      'SELECT is_favorite FROM connections WHERE id = ? AND user_id = ?',
      [connectionId, req.user.id]
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const newFavoriteStatus = connection.is_favorite ? 0 : 1;

    await db.run(
      'UPDATE connections SET is_favorite = ? WHERE id = ? AND user_id = ?',
      [newFavoriteStatus, connectionId, req.user.id]
    );

    res.json({ 
      message: `Connection ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
      is_favorite: newFavoriteStatus
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Launch connection
router.post('/:id/launch', async (req, res) => {
  try {
    const connectionId = req.params.id;

    const connection = await db.get(
      'SELECT * FROM connections WHERE id = ? AND user_id = ?',
      [connectionId, req.user.id]
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, connection_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, connectionId, 'LAUNCH_CONNECTION', `Launched connection: ${connection.name}`]
    );

    res.json({ 
      message: 'Connection launch logged',
      connection: {
        ...connection,
        password: connection.password_encrypted ? db.decrypt(connection.password_encrypted) : null
      }
    });
  } catch (error) {
    console.error('Launch connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
