const express = require('express');
const Database = require('../database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Get audit logs (admin can see all, users can see their own)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, user_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    // Build WHERE clause based on user role and filters
    if (req.user.role !== 'admin') {
      whereClause = 'WHERE al.user_id = ?';
      params.push(req.user.id);
    } else {
      whereClause = 'WHERE 1=1';
    }

    // Add additional filters
    if (action) {
      whereClause += ' AND al.action = ?';
      params.push(action);
    }

    if (user_id && req.user.role === 'admin') {
      whereClause += ' AND al.user_id = ?';
      params.push(user_id);
    }

    if (start_date) {
      whereClause += ' AND al.timestamp >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND al.timestamp <= ?';
      params.push(end_date);
    }

    const query = `
      SELECT 
        al.*,
        u.username,
        c.name as connection_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN connections c ON al.connection_id = c.id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);

    const logs = await db.all(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const totalResult = await db.get(countQuery, countParams);
    const total = totalResult.total;

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit statistics (admin only)
router.get('/stats', requireRole('admin'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (start_date) {
      whereClause += ' AND timestamp >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND timestamp <= ?';
      params.push(end_date);
    }

    // Get action counts
    const actionStats = await db.all(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      ${whereClause}
      GROUP BY action
      ORDER BY count DESC
    `, params);

    // Get user activity
    const userStats = await db.all(`
      SELECT 
        al.user_id,
        u.username,
        COUNT(*) as activity_count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      GROUP BY al.user_id, u.username
      ORDER BY activity_count DESC
      LIMIT 10
    `, params);

    // Get daily activity (last 30 days)
    const dailyActivity = await db.all(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM audit_logs
      WHERE timestamp >= date('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    res.json({
      actionStats,
      userStats,
      dailyActivity
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export audit logs (admin only)
router.get('/export', requireRole('admin'), async (req, res) => {
  try {
    const { format = 'json', start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (start_date) {
      whereClause += ' AND al.timestamp >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND al.timestamp <= ?';
      params.push(end_date);
    }

    const logs = await db.all(`
      SELECT 
        al.*,
        u.username,
        c.name as connection_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN connections c ON al.connection_id = c.id
      ${whereClause}
      ORDER BY al.timestamp DESC
    `, params);

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'ID,Timestamp,Username,Action,Connection,Details,IP Address,User Agent\n';
      const csvRows = logs.map(log => 
        `${log.id},"${log.timestamp}","${log.username || ''}","${log.action}","${log.connection_name || ''}","${log.details || ''}","${log.ip_address || ''}","${log.user_agent || ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvRows);
    } else {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.json`);
      res.json(logs);
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
