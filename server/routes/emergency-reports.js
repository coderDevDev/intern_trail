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

    // Base query with latest status update
    const baseQuery = `
      SELECT er.*, 
             eru.updated_by, 
             eru.updated_by_role, 
             eru.updated_at as status_updated_at
      FROM emergency_reports er
      LEFT JOIN emergency_report_updates eru ON er.id = eru.report_id
      WHERE eru.id = (
        SELECT id 
        FROM emergency_report_updates 
        WHERE report_id = er.id 
        ORDER BY updated_at DESC 
        LIMIT 1
      )
    `;

    console.log({ userRole });
    if (userRole === 'trainee') {
      query = `${baseQuery} AND er.created_by = ? ORDER BY er.created_at DESC`;
      params = [userId];
    } else if (userRole === 'hte-supervisor') {
      query = `
        ${baseQuery}
        AND er.id IN (
          SELECT er2.id
          FROM emergency_reports er2
          JOIN trainee t ON er2.created_by = t.userID
          WHERE t.companyID = (
            SELECT companyID FROM hte_supervisors WHERE userID = ?
          )
        )
        ORDER BY er.created_at DESC
      `;
      params = [userId];
    } else {
      query = `${baseQuery} ORDER BY er.created_at DESC`;
    }

    const [reports] = await db.query(query, params);
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error(err);
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

    // Students can only see their own reports
    if (userRole === 'trainee') {
      query = `
        SELECT * FROM emergency_reports 
        WHERE id = ? AND created_by = ?
      `;
      params = [id, userId];
    }
    // HTE supervisors can see reports from their company
    else if (userRole === 'hte-supervisor') {
      query = `
        SELECT er.* FROM emergency_reports er
        JOIN trainee t ON er.created_by = t.userID
        WHERE er.id = ? AND t.companyID = (
          SELECT companyID FROM hte_supervisors WHERE userID = ?
        )
      `;
      params = [id, userId];
    }
    // Coordinators and admins can see all reports
    else {
      query = `SELECT * FROM emergency_reports WHERE id = ?`;
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
  const userId = req.user.id;
  try {
    const { name, department, location, emergency_type, severity, details } =
      req.body;

    console.log({ userId });

    try {
      // Insert the new report
      const [result] = await db.query(
        `INSERT INTO emergency_reports 
         (name, department, location, emergency_type, severity, details, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [name, department, location, emergency_type, severity, details, userId]
      );

      // Create initial status update record in emergency_report_updates table
      await db.query(
        `INSERT INTO emergency_report_updates 
         (report_id, status, updated_by, updated_by_role, updated_at)
         VALUES (?, 'pending', ?, ?, NOW())`,
        [result.insertId, userId, req.user.role]
      );

      await logSystemActivity(
        req,
        userId,
        'info',
        'Created emergency report',
        `Emergency report created by ${req.user.first_name} ${req.user.last_name}`
      );

      res.status(201).json({
        success: true,
        message: 'Emergency report created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      throw error;
    }
  } catch (err) {
    await logSystemActivity(
      req,
      userId,
      'error',
      'Failed to create emergency report',
      err.message
    );
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency report'
    });
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

    // Check if user has permission to update
    let canUpdate = false;
    let statusUpdateOnly = false;

    console.log({ userRole });

    if (userRole === 'trainee') {
      // Students can only update their own reports and cannot change status
      const [reports] = await db.query(
        `SELECT * FROM emergency_reports WHERE id = ? AND created_by = ?`,
        [id, userId]
      );

      canUpdate = reports.length > 0;

      // Students cannot update status
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
         JOIN trainee t ON er.created_by = t.userID
         WHERE er.id = ? AND t.companyID = (
           SELECT companyID FROM hte_supervisors WHERE userID = ?
         )`,
        [id, userId]
      );

      canUpdate = reports.length > 0;

      // If not the creator, can only update status
      if (canUpdate && reports[0].created_by !== userId) {
        statusUpdateOnly = true;
      }
    } else {
      // Coordinators and admins can update all reports
      canUpdate = true;

      // If not the creator, can only update status
      const [reports] = await db.query(
        `SELECT * FROM emergency_reports WHERE id = ?`,
        [id]
      );

      if (reports.length > 0 && reports[0].created_by !== userId) {
        statusUpdateOnly = true;
      }
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this report'
      });
    }

    // Update the report
    if (statusUpdateOnly) {
      // Only update status
      await db.query(`UPDATE emergency_reports SET status = ? WHERE id = ?`, [
        status,
        id
      ]);
    } else {
      // Update all fields
      await db.query(
        `UPDATE emergency_reports 
         SET name = ?, department = ?, date_time = ?, location = ?, 
             emergency_type = ?, severity = ?, details = ?, status = ? 
         WHERE id = ?`,
        [
          name,
          department,
          dateTime,
          location,
          emergencyType,
          severity,
          details,
          status,
          id
        ]
      );
    }

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

    console.log({ userRole });
    if (userRole === 'hte-supervisor') {
      const [reports] = await db.query(
        `SELECT er.* FROM emergency_reports er
         JOIN trainee t ON er.created_by = t.userID
         WHERE er.id = ? AND t.companyID = (
           SELECT companyID FROM hte_supervisors WHERE userID = ?
         )`,
        [id, userId]
      );
      canUpdate = reports.length > 0;
    } else if (userRole === 'ojt-coordinator' || userRole === 'admin') {
      canUpdate = true;
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this report'
      });
    }

    try {
      // Update approval flags
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
        `INSERT INTO emergency_report_updates (report_id, status, updated_by, updated_by_role)
         VALUES (?, ?, ?, ?)`,
        [id, status, userId, userRole]
      );

      res.status(200).json({
        success: true,
        message: 'Report status updated successfully'
      });
    } catch (error) {
      throw error;
    }
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
