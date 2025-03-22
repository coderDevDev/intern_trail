import express from 'express';

import config from '../config.js';

import multer from 'multer';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

let db = config.mySqlDriver;

const router = express.Router();

let firebaseStorage = config.firebaseStorage;

const JWT_SECRET = 'your_secret_key';
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'uploads');
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}_${Date.now()}.xlsx`);
  }
});
const upload = multer({ storage: multer.memoryStorage() });

// Get announcements based on user role and associations
router.get('/list', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = '';
    let queryParams = [];

    console.log({ userRole });
    if (userRole === 'trainee') {
      // Students see announcements based on their college, program, and company
      query = `
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.userID
        WHERE 1=1
        AND (
          -- From coordinator (same college and program)
          (a.created_by_role = 'ojt-coordinator' 
           AND a.college_id = (SELECT collegeID FROM trainee WHERE userID = ?)
           AND a.program_id = (SELECT programID FROM trainee WHERE userID = ?))
          OR
          -- From HTE supervisor (same company)
          (a.created_by_role = 'hte-supervisor' 
           AND a.company_id = (SELECT company_id FROM inter_application WHERE trainee_user_id = ? AND is_confirmed = 1))
          OR
          -- From dean (same college)
          (a.created_by_role = 'dean' 
           AND a.college_id = (SELECT collegeID FROM trainee WHERE userID = ?))
        )
        ORDER BY a.created_at DESC
      `;
      queryParams = [userId, userId, userId, userId];
    } else if (userRole === 'ojt-coordinator') {
      // Coordinators see announcements from their college, program, and dean
      query = `
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.userID
        WHERE (
          -- From same college and program
          (a.college_id = (SELECT collegeID FROM coordinators WHERE userID = ?)
           AND a.program_id = (SELECT programID FROM coordinators WHERE userID = ?))
          OR
          -- From dean of same college
          (a.created_by_role = 'dean' 
           AND a.college_id = (SELECT collegeID FROM coordinators WHERE userID = ?))
        )
        ORDER BY a.created_at DESC
      `;
      queryParams = [userId, userId, userId];
    } else if (userRole === 'hte-supervisor') {
      // HTE supervisors see announcements for their company
      query = `
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.userID
        WHERE a.company_id = (SELECT companyID FROM hte_supervisors WHERE userID = ?)
        ORDER BY a.created_at DESC
      `;
      queryParams = [userId];
    } else if (userRole === 'dean') {
      // Deans see announcements for their college
      query = `
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.userID
        WHERE a.college_id = (SELECT collegeID FROM deans WHERE userID = ?)
        ORDER BY a.created_at DESC
      `;
      queryParams = [userId];
    }

    const [announcements] = await db.query(query, queryParams);

    res.json({
      success: true,
      data: announcements.map(announcement => ({
        ...announcement,
        readonly: announcement.created_by !== userId
      }))
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch announcements' });
  }
});

// Create announcement with role-based logic
router.post(
  '/create',
  authenticateUserMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, description, status } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      let imageUrl = null;
      let collegeId = null;
      let programId = null;
      let companyId = null;

      // Upload image if provided
      if (req.file) {
        const storageRef = ref(
          firebaseStorage,
          `announcements/${Date.now()}_${req.file.originalname}`
        );
        await uploadBytes(storageRef, req.file.buffer);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Get relevant IDs based on user role
      if (userRole === 'ojt-coordinator') {
        const [coordinator] = await db.query(
          'SELECT collegeID, programID FROM coordinators WHERE userID = ?',
          [userId]
        );
        collegeId = coordinator[0].collegeID;
        programId = coordinator[0].programID;
      } else if (userRole === 'hte-supervisor') {
        const [hte] = await db.query(
          'SELECT companyID FROM hte_supervisors WHERE userID = ?',
          [userId]
        );
        companyId = hte[0].companyID;
      } else if (userRole === 'dean') {
        const [dean] = await db.query(
          'SELECT collegeID FROM deans WHERE userID = ?',
          [userId]
        );
        collegeId = dean[0].collegeID;
      }

      // Insert announcement
      const [result] = await db.query(
        `INSERT INTO announcements (
        title, description, status, image_url, created_by, 
        created_by_role, college_id, program_id, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          status,
          imageUrl,
          userId,
          userRole,
          collegeId,
          programId,
          companyId
        ]
      );

      // Send email notifications to relevant students
      let recipientQuery = '';
      let queryParams = [];

      if (userRole === 'ojt-coordinator') {
        recipientQuery = `
        SELECT u.email FROM users u
        INNER JOIN trainee t ON u.userID = t.userID
        WHERE t.collegeID = ? AND t.programID = ?
      `;
        queryParams = [collegeId, programId];
      } else if (userRole === 'hte-supervisor') {
        recipientQuery = `
          SELECT u.email FROM users u
          INNER JOIN inter_application ia ON u.userID = ia.trainee_user_id
          INNER JOIN trainee t ON u.userID = t.userID
          WHERE ia.company_id = ? 
  
        `;
        queryParams = [companyId];
      } else if (userRole === 'dean') {
        recipientQuery = `
        SELECT u.email FROM users u
        INNER JOIN trainee t ON u.userID = t.userID
        WHERE t.collegeID = ?
      `;
        queryParams = [collegeId];
      }

      const [recipients] = await db.query(recipientQuery, queryParams);

      let [createdBy] = await db.query(
        'SELECT first_name, last_name FROM users WHERE userID = ?',
        [req.user.id]
      );

      console.log({ createdBy });
      createdBy = createdBy[0];
      // Send emails in parallel
      await Promise.all(
        recipients.map(recipient =>
          sendAnnouncementEmail(recipient.email, {
            title,
            description,
            senderRole: userRole,
            senderName: createdBy.first_name + ' ' + createdBy.last_name
          })
        )
      );

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to create announcement' });
    }
  }
);

// Helper function to send announcement emails
const sendAnnouncementEmail = async (recipientEmail, announcementData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'interntrailwup@gmail.com',
      pass: 'oclc xbbw agiq cdvl'
    }
  });

  console.log({ announcementData });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `New Announcement: ${announcementData.title}`,
    html: `
      <h2>${announcementData.title}</h2>
      <p>${announcementData.description}</p>
      <p>Posted by: ${announcementData.senderName} (${announcementData.senderRole})</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Update announcement
router.put(
  '/:id',
  authenticateUserMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;
      let imageUrl = null;

      if (req.file) {
        const storageRef = ref(
          firebaseStorage,
          `announcements/${Date.now()}_${req.file.originalname}`
        );
        await uploadBytes(storageRef, req.file.buffer);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updateFields = [];
      const values = [];

      if (title) {
        updateFields.push('title = ?');
        values.push(title);
      }
      if (description) {
        updateFields.push('description = ?');
        values.push(description);
      }
      if (status) {
        updateFields.push('status = ?');
        values.push(status);
      }
      if (imageUrl) {
        updateFields.push('image_url = ?');
        values.push(imageUrl);
      }

      values.push(id);

      await db.query(
        `UPDATE announcements SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      res.status(200).json({
        success: true,
        message: 'Announcement updated successfully'
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update announcement' });
    }
  }
);

// Delete announcement
router.delete('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete announcement' });
  }
});

export default router;
