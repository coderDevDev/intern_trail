import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

// Get dean's scope (college)
async function getDeanScope(deanId) {
  const [deanData] = await db.query(
    `SELECT collegeID FROM deans WHERE userID = ?`,
    [deanId]
  );
  return deanData[0]?.collegeID;
}

router.get('/dashboard-stats', authenticateUserMiddleware, async (req, res) => {
  try {
    const deanId = req.user.id;
    const collegeId = await getDeanScope(deanId);

    // Get college details
    const [collegeDetails] = await db.query(
      `
      SELECT 
        c.collegeName,
        c.collegeCode,
        COUNT(DISTINCT p.programID) as totalPrograms
      FROM colleges c
      LEFT JOIN programs p ON c.collegeID = p.collegeID
      WHERE c.collegeID = ?
      GROUP BY c.collegeID
      `,
      [collegeId]
    );

    // Get trainee statistics
    const [traineeStats] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT t.traineeID) as totalTrainees,
        COUNT(DISTINCT CASE WHEN t.deployment_date IS NOT NULL THEN t.traineeID END) as deployedTrainees,
        COUNT(DISTINCT CASE WHEN t.certificate_uploaded = 1 THEN t.traineeID END) as completedTrainees
      FROM trainee t
      WHERE t.collegeID = ?
      `,
      [collegeId]
    );

    // Get company statistics
    const [companyStats] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT c.companyID) as totalCompanies,
        COUNT(DISTINCT CASE WHEN c.moa_status = 'approved' THEN c.companyID END) as approvedCompanies
      FROM companies c
      JOIN trainee t ON c.companyID = t.companyID
      WHERE t.collegeID = ?
      `,
      [collegeId]
    );

    // Get program statistics with trainee counts
    const [programStats] = await db.query(
      `
      SELECT 
        p.programName,
        COUNT(DISTINCT t.traineeID) as traineeCount,
        COUNT(DISTINCT CASE WHEN t.deployment_date IS NOT NULL THEN t.traineeID END) as deployedCount
      FROM programs p
      LEFT JOIN trainee t ON p.programID = t.programID
      WHERE p.collegeID = ?
      GROUP BY p.programID
      `,
      [collegeId]
    );

    // Get recent announcements
    const [recentAnnouncements] = await db.query(
      `
      SELECT 
        a.title,
        a.description,
        a.status,
        a.created_at,
        u.first_name,
        u.last_name,
        u.role as created_by_role
      FROM announcements a
      JOIN users u ON a.created_by = u.userID
      WHERE a.college_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
      `,
      [collegeId]
    );

    // Get emergency reports statistics
    const [emergencyStats] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical
      FROM emergency_reports er
      JOIN trainee t ON er.created_by = t.traineeID
      WHERE t.collegeID = ?
      `,
      [collegeId]
    );

    res.json({
      success: true,
      data: {
        collegeDetails: collegeDetails[0],
        traineeStats: traineeStats[0],
        companyStats: companyStats[0],
        programStats,
        recentAnnouncements,
        emergencyStats: emergencyStats[0]
      }
    });
  } catch (error) {
    console.error('Error fetching dean dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get trainees under dean's scope
router.get('/trainees', authenticateUserMiddleware, async (req, res) => {
  try {
    const deanId = req.user.id;
    const collegeId = await getDeanScope(deanId);

    const [trainees] = await db.query(
      `
      SELECT 
        t.traineeID,
        t.student_id,
        t.deployment_date,
        t.remaining_hours,
        t.is_verified_by_coordinator,
        t.certificate_uploaded,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.proof_identity as avatar,
        p.programName,
        c.companyName,
        c.address as companyAddress,
        COALESCE(SUM(d.hours_rendered), 0) as total_hours_rendered
      FROM trainee t
      JOIN users u ON t.userID = u.userID
      JOIN programs p ON t.programID = p.programID
      LEFT JOIN companies c ON t.companyID = c.companyID
      LEFT JOIN dtrs d ON t.traineeID = d.traineeID AND d.status = 'approved'
      WHERE t.collegeID = ?
      GROUP BY t.traineeID
      ORDER BY t.deployment_date DESC, u.last_name ASC
      `,
      [collegeId]
    );

    res.json({
      success: true,
      data: trainees
    });
  } catch (error) {
    console.error('Error fetching trainees:', error);
    res.status(500).json({ error: 'Failed to fetch trainees' });
  }
});

export default router;
