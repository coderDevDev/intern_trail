import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

router.get('/dashboard-stats', authenticateUserMiddleware, async (req, res) => {
  try {
    const hteId = req.user.id;
    const companyId = await getHTECompanyId(hteId);

    // Get company details
    const [companyDetails] = await db.query(
      `
      SELECT 
        c.companyName,
        c.address,
        c.contact_email,
        c.contact_phone,
        c.expertise,
        c.description,
        c.avatar_photo,
        c.list_of_requirements,
        COUNT(DISTINCT t.traineeID) as total_trainees
      FROM companies c
      LEFT JOIN trainee t ON c.companyID = t.companyID
      WHERE c.companyID = ?
      GROUP BY c.companyID
    `,
      [companyId]
    );

    console.log({ jhams: companyId });

    // Get intern statistics
    const [internStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN remaining_hours > 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN deployment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_interns
      FROM trainee
      WHERE companyID = ?
    `,
      [companyId]
    );

    // Get DTR statistics
    const [dtrStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM dtrs d
      JOIN trainee t ON d.traineeID = t.traineeID
      WHERE t.companyID = ? AND d.hteID = ?
    `,
      [companyId, hteId]
    );

    // Get requirement completion stats
    const [requirementStats] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT rc.checklistID) as total_requirements,
        COUNT(DISTINCT CASE WHEN rc.updated_at IS NOT NULL THEN rc.checklistID END) as completed_requirements
      FROM requirement_checklist rc
      JOIN trainee t ON rc.traineeID = t.traineeID
      WHERE t.companyID = ? AND rc.hteID = ?
    `,
      [companyId, hteId]
    );

    // Get emergency report statistics
    const [emergencyStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as urgent
      FROM emergency_reports
      WHERE company_id = ? 

    `,
      [companyId]
    );

    // Get weekly progress data
    const [progressData] = await db.query(
      `
      SELECT 
        pr.week,
        COUNT(DISTINCT pr.traineeID) as activeInterns,
        SUM(d.hours_rendered) as hoursCompleted
      FROM progress_report pr
      JOIN dtrs d ON pr.traineeID = d.traineeID
      WHERE pr.hteID = ?
      GROUP BY pr.week
      ORDER BY pr.week
      LIMIT 10
    `,
      [hteId]
    );

    // Get requirement distribution
    const [requirementDistribution] = await db.query(
      `
      SELECT 
        'Completed' as name,
        COUNT(*) as value
      FROM requirement_checklist rc
      JOIN trainee t ON rc.traineeID = t.traineeID
      WHERE t.companyID = ? AND rc.updated_at IS NOT NULL
      UNION ALL
      SELECT 
        'Pending' as name,
        COUNT(*) as value
      FROM requirement_checklist rc
      JOIN trainee t ON rc.traineeID = t.traineeID
      WHERE t.companyID = ? AND rc.updated_at IS NULL
    `,
      [companyId, companyId]
    );

    // Get recent activities
    const [recentActivities] = await db.query(
      `
      SELECT 
        action,
        details,
        created_at as timestamp
      FROM system_logs
      WHERE user_id = ? OR user_role = 'hte-supervisor'
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [hteId]
    );

    res.json({
      companyDetails: companyDetails[0],
      internStats: {
        total: internStats[0].total,
        active: internStats[0].active,
        change: calculatePercentageChange(
          internStats[0].total - internStats[0].new_interns,
          internStats[0].total
        )
      },
      dtrStats: {
        total: dtrStats[0].total,
        pending: dtrStats[0].pending,
        urgent: dtrStats[0].pending > 5 ? dtrStats[0].pending : null
      },
      requirementStats: {
        completed: Math.round(
          (requirementStats[0].completed_requirements /
            requirementStats[0].total_requirements) *
            100
        )
      },
      emergencyStats: {
        total: emergencyStats[0].total,
        urgent: emergencyStats[0].urgent
      },
      progressData,
      requirementDistribution,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching HTE dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

async function getHTECompanyId(hteId) {
  const [result] = await db.query(
    'SELECT companyID FROM hte_supervisors WHERE userID = ?',
    [hteId]
  );
  return result[0]?.companyID;
}

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

export default router;
