const express = require('express');
const Database = require('../database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Get all users (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, username, email, role, is_active, created_at, last_login FROM users ORDER BY username'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email is already taken by another user
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    await db.run(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'CREATE_USER', `Created user: ${username}`]
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.id
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role, is_active } = req.body;

    // Check if user exists
    const existingUser = await db.get(
      'SELECT username FROM users WHERE id = ?',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow admin to deactivate themselves
    if (userId == req.user.id && is_active === 0) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await db.run(
      'UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [
        username || existingUser.username,
        email || existingUser.email,
        role || existingUser.role,
        is_active !== undefined ? is_active : existingUser.is_active,
        userId
      ]
    );

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'UPDATE_USER', `Updated user: ${username || existingUser.username}`]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow admin to delete themselves
    if (userId == req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await db.get(
      'SELECT username FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's connections first
    await db.run('DELETE FROM connections WHERE user_id = ?', [userId]);
    
    // Delete user
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    // Log audit event
    await db.run(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'DELETE_USER', `Deleted user: ${user.username}`]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
