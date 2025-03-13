import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

router.get('/dashboard-stats', authenticateUserMiddleware, async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users
      FROM users
    `);

    // Get company statistics
    const [companyStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_companies
      FROM companies
    `);

    // Get intern statistics
    const [internStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN remaining_hours > 0 THEN 1 ELSE 0 END) as active
      FROM trainee
    `);

    // Get emergency report statistics
    const [emergencyStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_reports
      FROM emergency_reports
    `);

    // Get user distribution
    const [userDistribution] = await db.query(`
      SELECT 
        role as name,
        COUNT(*) as value
      FROM users
      GROUP BY role
    `);

    // Get recent system logs
    const [recentLogs] = await db.query(`
      SELECT 
        action,
        details,
        created_at as timestamp,
        user_role
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Get activity data (last 7 days)
    const [activityData] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as value
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      userStats: {
        total: userStats[0].total,
        change: calculatePercentageChange(
          userStats[0].total - userStats[0].new_users,
          userStats[0].total
        )
      },
      companyStats: {
        total: companyStats[0].total,
        change: calculatePercentageChange(
          companyStats[0].total - companyStats[0].new_companies,
          companyStats[0].total
        )
      },
      internStats: {
        total: internStats[0].total,
        active: internStats[0].active,
        change: calculatePercentageChange(
          internStats[0].total,
          internStats[0].active
        )
      },
      emergencyStats: {
        total: emergencyStats[0].total,
        urgent: emergencyStats[0].urgent,
        change: calculatePercentageChange(
          emergencyStats[0].total - emergencyStats[0].new_reports,
          emergencyStats[0].total
        )
      },
      userDistribution,
      recentLogs,
      activityData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

export default router;
