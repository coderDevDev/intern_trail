import express from 'express';
import config from '../config.js';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import { logSystemActivity } from './system-logs.js';

let db = config.mySqlDriver;
const router = express.Router();

// Get all emergency reports
router.get('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params = [];

    // Base query with DISTINCT to ensure unique reports
    const baseQuery = `
      SELECT DISTINCT er.*, 
             eru.updated_by, 
             eru.updated_by_role, 
             eru.updated_at AS status_updated_at,
             er.company_id,
             er.companyName,
             c.avatar_photo AS company_avatar
      FROM emergency_reports er
      LEFT JOIN (
        SELECT eru1.*
        FROM emergency_report_updates eru1
        WHERE eru1.updated_at = (
          SELECT MAX(eru2.updated_at) 
          FROM emergency_report_updates eru2 
          WHERE eru2.report_id = eru1.report_id
        )
      ) AS eru ON er.id = eru.report_id
      LEFT JOIN companies c ON er.company_id = c.companyID
    `;

    console.log({ userRole, userId });

    if (userRole === 'trainee') {
      // Trainee sees only their own reports
      query = `${baseQuery} WHERE er.created_by = ? ORDER BY er.created_at DESC`;
      params = [userId];
    } else if (userRole === 'hte-supervisor') {
      // Supervisor sees reports related to their company
      query = `
        ${baseQuery}
        WHERE er.company_id = (
          SELECT companyID FROM hte_supervisors WHERE userID = ? 
        )
        ORDER BY er.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'ojt-coordinator') {
      // OJT Coordinator sees reports related to assigned programs/colleges
      query = `
        ${baseQuery}
        WHERE er.created_by IN (
          SELECT t.userID 
          FROM coordinators co
          JOIN trainee t ON (
            t.collegeID = co.collegeID 
            AND t.programID = co.programID
          )
          WHERE co.userID = ?
        )
        ORDER BY er.created_at DESC
      `;
      params = [userId];
    } else {
      // Admin or other roles see all reports
      query = `${baseQuery} ORDER BY er.created_at DESC`;
    }

    console.log('Executing Query:', query);
    console.log('With Params:', params);

    const [reports] = await db.query(query, params);

    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch reports' });
  }
});

// Get a specific emergency report
router.get('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params = [];

    // Base query with company info
    const baseQuery = `
      SELECT er.*, 
             eru.updated_by, 
             eru.updated_by_role, 
             eru.updated_at as status_updated_at,
             er.company_id,
             er.companyName,
             c.avatar_photo as company_avatar
      FROM emergency_reports er
      LEFT JOIN emergency_report_updates eru ON er.id = eru.report_id
      LEFT JOIN companies c ON er.company_id = c.companyID
    `;

    if (userRole === 'trainee') {
      // Students can only see their own reports
      query = `${baseQuery} WHERE er.id = ? AND er.created_by = ?`;
      params = [id, userId];
    } else if (userRole === 'hte-supervisor') {
      // HTE supervisors can see reports from their company
      query = `
        ${baseQuery}
        WHERE er.id = ? AND er.company_id = (
          SELECT companyID FROM hte_supervisors WHERE userID = ?
        )
      `;
      params = [id, userId];
    } else if (userRole === 'ojt-coordinator') {
      // OJT Coordinator sees reports from their students
      query = `
        ${baseQuery}
        WHERE er.id = ? AND er.created_by IN (
          SELECT t.userID 
          FROM coordinators co
          JOIN trainee t ON (
            t.collegeID = co.collegeID 
            AND t.programID = co.programID
          )
          WHERE co.userID = ?
        )
      `;
      params = [id, userId];
    } else {
      // Admin sees all reports
      query = `${baseQuery} WHERE er.id = ?`;
      params = [id];
    }

    const [reports] = await db.query(query, params);

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'Emergency report not found or you do not have permission to view it'
      });
    }

    res.status(200).json({
      success: true,
      data: reports[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency report'
    });
  }
});

// Create a new emergency report
router.post('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const {
      name,
      department,
      location,
      emergency_type,
      severity,
      details,
      company_id,
      companyName
    } = req.body;

    // Insert the emergency report with company info
    const [result] = await db.query(
      `INSERT INTO emergency_reports 
       (name, department, location, emergency_type, severity, details, 
        status, created_by, company_id, companyName) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        name,
        department,
        location,
        emergency_type,
        severity,
        details,
        req.user.id,
        company_id,
        companyName
      ]
    );

    // Log the activity
    await logSystemActivity({
      type: 'info',
      userId: req.user.id,
      action: 'Created emergency report',
      details: `Emergency report created for ${companyName}`
    });

    res.status(201).json({
      success: true,
      message: 'Emergency report created successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create report' });
  }
});

// Update an emergency report
router.put('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      department,
      dateTime,
      location,
      emergencyType,
      severity,
      details,
      status
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    console.log({ dexx: userRole });

    // Check if user has permission to update
    let canUpdate = false;
    let statusUpdateOnly = false;

    if (userRole === 'trainee') {
      // Students can only update their own reports and cannot change status
      const [reports] = await db.query(
        `SELECT * FROM emergency_reports WHERE id = ? AND created_by = ?`,
        [id, userId]
      );
      canUpdate = reports.length > 0;

      if (canUpdate && status !== reports[0].status) {
        return res.status(403).json({
          success: false,
          message: 'Students cannot change the status of reports'
        });
      }
    } else if (userRole === 'hte-supervisor') {
      // HTE supervisors can update reports from their company
      const [reports] = await db.query(
        `SELECT er.* FROM emergency_reports er
         WHERE er.id = ? AND er.company_id = (
           SELECT companyID FROM hte_supervisors WHERE userID = ?
         )`,
        [id, userId]
      );

      console.log({ reports });
      canUpdate = reports.length > 0;
      statusUpdateOnly = reports[0]?.created_by !== userId;
    } else if (userRole === 'ojt-coordinator') {
      // Coordinators can update reports from their students
      const [reports] = await db.query(
        `SELECT er.* FROM emergency_reports er
         WHERE er.id = ? AND er.created_by IN (
           SELECT t.userID 
           FROM coordinators co
           JOIN trainee t ON (
             t.collegeID = co.collegeID 
             AND t.programID = co.programID
           )
           WHERE co.userID = ?
         )`,
        [id, userId]
      );
      canUpdate = reports.length > 0;
      statusUpdateOnly = reports[0]?.created_by !== userId;
    } else {
      // Admin can update all reports
      canUpdate = true;
      const [reports] = await db.query(
        `SELECT * FROM emergency_reports WHERE id = ?`,
        [id]
      );
      statusUpdateOnly = reports[0]?.created_by !== userId;
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this report'
      });
    }

    // If status update only, only update status
    if (statusUpdateOnly) {
      await db.query(`UPDATE emergency_reports SET status = ? WHERE id = ?`, [
        status,
        id
      ]);
    } else {
      // Full update
      await db.query(
        `UPDATE emergency_reports 
         SET name = ?, department = ?, location = ?, 
             emergency_type = ?, severity = ?, details = ?, 
             status = ?
         WHERE id = ?`,
        [
          name,
          department,
          location,
          emergencyType,
          severity,
          details,
          status,
          id
        ]
      );
    }

    // Log the update
    await logSystemActivity({
      type: 'info',
      userId,
      action: 'Updated emergency report',
      details: `Emergency report ${id} ${
        statusUpdateOnly ? 'status' : ''
      } updated`
    });

    res.status(200).json({
      success: true,
      message: 'Emergency report updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency report'
    });
  }
});

// Update report status
router.put('/:id/status', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify permissions
    let canUpdate = false;
    let query;
    let params = [id, userId];

    if (userRole === 'trainee') {
      // Trainees cannot update status
      return res.status(403).json({
        success: false,
        message: 'Students cannot update report status'
      });
    } else if (userRole === 'hte-supervisor') {
      // HTE supervisors can update status for their company's reports
      query = `
        SELECT er.* FROM emergency_reports er
        WHERE er.id = ? AND er.company_id = (
          SELECT companyID FROM hte_supervisors WHERE userID = ?
        )
      `;
    } else if (userRole === 'ojt-coordinator') {
      // Coordinators can update status for their students' reports
      query = `
        SELECT er.* FROM emergency_reports er
        WHERE er.id = ? AND er.created_by IN (
          SELECT t.userID 
          FROM coordinators co
          JOIN trainee t ON (
            t.collegeID = co.collegeID 
            AND t.programID = co.programID
          )
          WHERE co.userID = ?
        )
      `;
    } else {
      // Admin can update all reports
      query = 'SELECT * FROM emergency_reports WHERE id = ?';
      params = [id];
    }

    const [reports] = await db.query(query, params);
    canUpdate = reports.length > 0;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this report'
      });
    }

    // Update approval flags based on role
    if (userRole === 'hte-supervisor') {
      await db.query(
        'UPDATE emergency_reports SET hte_approval = ? WHERE id = ?',
        [status === 'resolved', id]
      );
    } else if (userRole === 'ojt-coordinator') {
      await db.query(
        'UPDATE emergency_reports SET coordinator_approval = ? WHERE id = ?',
        [status === 'resolved', id]
      );
    }

    // Check if both approvals are needed for resolved status
    if (status === 'resolved') {
      const [report] = await db.query(
        'SELECT hte_approval, coordinator_approval FROM emergency_reports WHERE id = ?',
        [id]
      );

      if (!report[0].hte_approval || !report[0].coordinator_approval) {
        status = 'in-progress'; // Keep as in-progress until both approve
      }
    }

    // Update report status
    await db.query('UPDATE emergency_reports SET status = ? WHERE id = ?', [
      status,
      id
    ]);

    // Record the status update
    await db.query(
      `INSERT INTO emergency_report_updates 
       (report_id, status, updated_by, updated_by_role)
       VALUES (?, ?, ?, ?)`,
      [id, status, userId, userRole]
    );

    // Log the activity
    await logSystemActivity({
      type: 'info',
      userId,
      action: 'Updated report status',
      details: `Emergency report ${id} status updated to ${status}`
    });

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
});

// Delete an emergency report
router.delete('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has permission to delete
    let canDelete = false;

    if (userRole === 'trainee') {
      // Students can only delete their own reports
      const [reports] = await db.query(
        `SELECT * FROM emergency_reports WHERE id = ? AND created_by = ?`,
        [id, userId]
      );

      canDelete = reports.length > 0;
    } else if (userRole === 'hte-supervisor') {
      // HTE supervisors can delete reports from their company
      const [reports] = await db.query(
        `SELECT er.* FROM emergency_reports er
         JOIN trainee t ON er.created_by = t.userID
         WHERE er.id = ? AND t.companyID = (
           SELECT companyID FROM hte_supervisors WHERE userID = ?
         )`,
        [id, userId]
      );

      canDelete = reports.length > 0;
    } else {
      // Coordinators and admins can delete all reports
      canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this report'
      });
    }

    // Delete the report
    await db.query('DELETE FROM emergency_reports WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Emergency report deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency report'
    });
  }
});

export default router;
