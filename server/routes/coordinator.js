import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

router.get('/dashboard-stats', authenticateUserMiddleware, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { collegeId, programId } = await getCoordinatorScope(coordinatorId);

    console.log({ collegeId, programId });
    // Get college details
    const [collegeDetails] = await db.query(
      `
      SELECT 
        c.collegeName,
        c.collegeCode,
        COUNT(DISTINCT p.programID) as totalPrograms,
        COUNT(DISTINCT comp.companyID) as totalCompanies
      FROM colleges c
      LEFT JOIN programs p ON c.collegeID = p.collegeID
      LEFT JOIN trainee t ON p.programID = t.programID
      LEFT JOIN companies comp ON t.companyID = comp.companyID
      WHERE c.collegeID = ?
      GROUP BY c.collegeID
    `,
      [collegeId]
    );

    // Get trainee statistics
    const [traineeStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN remaining_hours > 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN deployment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_trainees
      FROM trainee
      WHERE collegeID = ? AND programID = ?
    `,
      [collegeId, programId]
    );

    // Get company statistics
    const [companyStats] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT t.companyID) as total,
        COUNT(DISTINCT t.companyID ) as new_companies
      FROM trainee t
      WHERE t.collegeID = ? AND t.programID = ?
    `,
      [collegeId, programId]
    );

    console.log({ companyStats });
    // Get DTR statistics
    const [dtrStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM dtrs d
      JOIN trainee t ON d.traineeID = t.traineeID
      WHERE t.collegeID = ? AND t.programID = ? AND d.coordinatorID = ?
    `,
      [collegeId, programId, coordinatorId]
    );

    // Get emergency report statistics
    const [emergencyStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as urgent
      FROM emergency_reports er
      JOIN trainee t ON er.created_by  = t.traineeID
      WHERE t.collegeID = ? AND t.programID = ?
    `,
      [collegeId, programId]
    );

    // Get program distribution
    const [programDistribution] = await db.query(
      `
      SELECT 
        p.programName as name,
        COUNT(t.traineeID) as value
      FROM programs p
      LEFT JOIN trainee t ON p.programID = t.programID
      WHERE p.collegeID = ?
      GROUP BY p.programID
    `,
      [collegeId]
    );

    // Get activity data
    const [activityData] = await db.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as value
      FROM system_logs
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
      [coordinatorId]
    );

    res.json({
      collegeDetails: collegeDetails[0],
      traineeStats: {
        total: traineeStats[0].total,
        active: traineeStats[0].active,
        change: calculatePercentageChange(
          traineeStats[0].total - traineeStats[0].new_trainees,
          traineeStats[0].total
        )
      },
      companyStats: {
        total: companyStats[0].total,
        change: calculatePercentageChange(
          companyStats[0].total - companyStats[0].new_companies,
          companyStats[0].total
        )
      },
      dtrStats: {
        total: dtrStats[0].total,
        pending: dtrStats[0].pending,
        urgent: dtrStats[0].pending > 10 ? dtrStats[0].pending : null
      },
      emergencyStats: {
        total: emergencyStats[0].total,
        urgent: emergencyStats[0].urgent
      },
      programDistribution,
      activityData
    });
  } catch (error) {
    console.error('Error fetching coordinator dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

async function getCoordinatorScope(coordinatorId) {
  const [result] = await db.query(
    'SELECT collegeID, programID FROM coordinators WHERE userID = ?',
    [coordinatorId]
  );
  return {
    collegeId: result[0]?.collegeID,
    programId: result[0]?.programID
  };
}

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

export default router;
