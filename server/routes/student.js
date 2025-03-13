import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

router.get('/dashboard-stats', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get trainee details and progress
    const [traineeDetails] = await db.query(
      `
      SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        p.programName,
        c.companyName,
        c.address as companyAddress,
        co.collegeName,
        COALESCE(SUM(d.hours_rendered), 0) as total_hours_rendered
      FROM trainee t
      JOIN users u ON t.userID = u.userID
      JOIN programs p ON t.programID = p.programID
      JOIN colleges co ON t.collegeID = co.collegeID
      LEFT JOIN companies c ON t.companyID = c.companyID
      LEFT JOIN dtrs d ON t.traineeID = d.traineeID AND d.status = 'approved'
      WHERE t.userID = ?
      GROUP BY t.traineeID
      `,
      [userId]
    );

    // Get recent DTRs

    console.log({ traineeDetails });
    const [recentDTRs] = await db.query(
      `
      SELECT 
        date,
        time_in,
        time_out,
        status,
        report
      FROM daily_reports
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 5
      `,
      [traineeDetails[0]?.userID]
    );

    // Get recent announcements
    const [recentAnnouncements] = await db.query(
      `
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.role as created_by_role
      FROM announcements a
      JOIN users u ON a.created_by = u.userID
      WHERE (a.college_id = ? OR a.program_id = ? OR a.company_id = ?)
      ORDER BY a.created_at DESC
      LIMIT 3
      `,
      [
        traineeDetails[0]?.collegeID,
        traineeDetails[0]?.programID,
        traineeDetails[0]?.companyID
      ]
    );

    // Get requirements progress
    const [requirements] = await db.query(
      `
      SELECT 
        r.*,
        f.file_url,
        f.created_at
      FROM requirement_checklist r
      LEFT JOIN files f ON r.traineeID = f.student_id
      WHERE r.traineeID = ?
      `,
      [traineeDetails[0]?.traineeID]
    );

    // Get weekly reports progress
    const [weeklyProgress] = await db.query(
      `
      SELECT 
        pr.*,
        COUNT(DISTINCT df.feedback) as feedback_count
      FROM progress_report pr
      LEFT JOIN weekly_feedback df ON pr.traineeID = df.student_id
      WHERE pr.traineeID = ?
      GROUP BY pr.reportID
      ORDER BY pr.week DESC
      LIMIT 4
      `,
      [traineeDetails[0]?.traineeID]
    );

    res.json({
      success: true,
      data: {
        traineeDetails: traineeDetails[0],
        recentDTRs,
        recentAnnouncements,
        requirements,
        weeklyProgress
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
