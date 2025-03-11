import express from 'express';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

import config from '../config.js';

let db = config.mySqlDriver;
const router = express.Router();

// Get system logs with filtering
router.get('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const { type, timeRange, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build the time range condition
    let timeCondition = '';
    switch (timeRange) {
      case '1h':
        timeCondition = 'AND sl.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
        break;
      case '24h':
        timeCondition =
          'AND sl.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
        break;
      case '7d':
        timeCondition = 'AND sl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        timeCondition = 'AND sl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      default:
        timeCondition = '';
    }

    // Build the type condition
    const typeCondition = type && type !== 'all' ? 'AND sl.type = ?' : '';
    const params = type && type !== 'all' ? [type] : [];

    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM system_logs sl
       WHERE 1=1 ${typeCondition} ${timeCondition}`,
      params
    );

    // Get logs with user information
    const [logs] = await db.query(
      `SELECT 
        sl.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.role as user_role
       FROM system_logs sl
       LEFT JOIN users u ON sl.user_id = u.userID
       WHERE 1=1 ${typeCondition} ${timeCondition}
       ORDER BY sl.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get count by type for the dashboard
    const [typeCounts] = await db.query(
      `SELECT 
        type,
        COUNT(*) as count
       FROM system_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY type`
    );

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit)
        },
        summary: {
          typeCounts: typeCounts.reduce((acc, curr) => {
            acc[curr.type] = curr.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs'
    });
  }
});

// Create a logger middleware
export const logSystemActivity = async (req, userId, type, action, details) => {
  try {
    await db.query(
      `INSERT INTO system_logs 
       (type, user_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, userId, action, details, req.ip, req.headers['user-agent']]
    );
  } catch (error) {
    console.error('Error logging system activity:', error);
  }
};

export default router;
