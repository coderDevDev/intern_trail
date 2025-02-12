import express from 'express';

import config from '../config.js';

import multer from 'multer';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

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

// Get files based on user role and associations
router.get('/list', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { folder_id, student_id, company_id, tag, view_mode } = req.query;

    let query = '';
    let queryParams = [];

    console.log({ userRole });
    if (view_mode === 'student-files' && student_id) {
      query = `
        (SELECT 
          'folder' as item_type,
          f.id,
          f.name,
          NULL as file_url,
          NULL as size,
          NULL as tag,
          f.created_at,
          f.updated_at,
          f.parent_id as folder_id,
          f.uploaded_by,
          f.uploaded_by_role,
          f.college_id,
          f.program_id,
          f.company_id,
          u.first_name,
          u.last_name
         FROM folders f
         LEFT JOIN users u ON f.uploaded_by = u.userID
         WHERE f.parent_id ${folder_id ? '= ?' : 'IS NULL'}
         AND f.uploaded_by = ?

         )
        UNION ALL
        (SELECT 
          'file' as item_type,
          fl.id,
          fl.name,
          fl.file_url,
          fl.size,
          fl.tag,
          fl.created_at,
          fl.updated_at,
          fl.folder_id,
          fl.uploaded_by,
          fl.uploaded_by_role,
          fl.college_id,
          fl.program_id,
          fl.company_id,
          u.first_name,
          u.last_name
         FROM files fl
         LEFT JOIN users u ON fl.uploaded_by = u.userID
         WHERE fl.folder_id ${folder_id ? '= ?' : 'IS NULL'}
         AND fl.uploaded_by = ?
         
                 AND fl.tag = 'requirement'
         )
        ORDER BY created_at DESC`;
      queryParams = folder_id
        ? [folder_id, student_id, folder_id, student_id]
        : [student_id, student_id];
    } else if (userRole === 'trainee') {
      // Students see files from their coordinator and HTE supervisor
      query = `
        (SELECT 
          'folder' as item_type,
          f.id,
          f.name,
          NULL as file_url,
          NULL as size,
          NULL as tag,
          f.created_at,
          f.updated_at,
          f.parent_id as folder_id,
          f.uploaded_by,
          f.uploaded_by_role,
          f.college_id,
          f.program_id,
          f.company_id,
          u.first_name,
          u.last_name
         FROM folders f
         LEFT JOIN users u ON f.uploaded_by = u.userID
         LEFT JOIN trainee t ON t.userID = ?
         WHERE f.parent_id ${folder_id ? '= ?' : 'IS NULL'}
         AND (
           (f.uploaded_by_role = 'ojt-coordinator' 
            AND f.college_id = t.collegeID
            AND f.program_id = t.programID)
           OR
           (f.uploaded_by_role = 'hte-supervisor' 
            AND f.company_id = (SELECT company_id FROM inter_application WHERE trainee_user_id = ? AND is_confirmed = 1))
         ))
        UNION ALL
        (SELECT 
          'file' as item_type,
          fl.id,
          fl.name,
          fl.file_url,
          fl.size,
          fl.tag,
          fl.created_at,
          fl.updated_at,
          fl.folder_id,
          fl.uploaded_by,
          fl.uploaded_by_role,
          fl.college_id,
          fl.program_id,
          fl.company_id,
          u.first_name,
          u.last_name
         FROM files fl
         LEFT JOIN users u ON fl.uploaded_by = u.userID
         LEFT JOIN trainee t ON t.userID = ?
         WHERE fl.folder_id ${folder_id ? '= ?' : 'IS NULL'}
         AND (
           (fl.uploaded_by_role = 'ojt-coordinator' 
            AND fl.college_id = t.collegeID
            AND fl.program_id = t.programID)
           OR
           (fl.uploaded_by_role = 'hte-supervisor' 
            AND fl.company_id = (SELECT company_id FROM inter_application WHERE trainee_user_id = ? AND is_confirmed = 1))
           OR fl.uploaded_by = ?
         ))
        ORDER BY created_at DESC`;
      queryParams = folder_id
        ? [userId, userId, userId, userId, folder_id, userId, userId]
        : [userId, userId, userId, userId, userId];
    } else if (
      userRole === 'ojt-coordinator' ||
      userRole === 'hte-supervisor'
    ) {
      // Coordinators see their own files and student files from their college/program
      query = `
        (SELECT 
          'folder' as item_type,
          f.id,
          f.name,
          NULL as file_url,
          NULL as size,
          NULL as tag,
          f.created_at,
          f.updated_at,
          f.parent_id as folder_id,
          f.uploaded_by,
          f.uploaded_by_role,
          f.college_id,
          f.program_id,
          f.company_id,
          u.first_name,
          u.last_name
         FROM folders f
         LEFT JOIN users u ON f.uploaded_by = u.userID
         LEFT JOIN coordinators c ON c.userID = ?
         WHERE f.parent_id ${folder_id ? '= ?' : 'IS NULL'}
         AND (f.uploaded_by = ? OR 
              (f.uploaded_by_role = 'trainee' 
               AND f.college_id = c.collegeID 
               AND f.program_id = c.programID)))
        UNION ALL
        (SELECT 
          'file' as item_type,
          fl.id,
          fl.name,
          fl.file_url,
          fl.size,
          fl.tag,
          fl.created_at,
          fl.updated_at,
          fl.folder_id,
          fl.uploaded_by,
          fl.uploaded_by_role,
          fl.college_id,
          fl.program_id,
          fl.company_id,
          u.first_name,
          u.last_name
         FROM files fl
         LEFT JOIN users u ON fl.uploaded_by = u.userID
         LEFT JOIN coordinators c ON c.userID = ?
         WHERE fl.folder_id ${folder_id ? '= ?' : 'IS NULL'}
         AND (fl.uploaded_by = ? OR 
              (fl.uploaded_by_role = 'trainee' 
               AND fl.college_id = c.collegeID 
               AND fl.program_id = c.programID)))
        ORDER BY created_at DESC`;
      queryParams = folder_id
        ? [userId, folder_id, userId, userId, folder_id, userId]
        : [userId, userId, userId, userId];
    }
    // If viewing company MOA files
    if (company_id && tag === 'MOA') {
      query = `
        (SELECT 
          'file' as item_type,
          fl.id,
          fl.name,
          fl.file_url,
          fl.size,
          fl.tag,
          fl.created_at,
          fl.updated_at,
          fl.folder_id,
          fl.uploaded_by,
          fl.uploaded_by_role,
          fl.college_id,
          fl.program_id,
          fl.company_id,
          u.first_name,
          u.last_name
         FROM files fl
         LEFT JOIN users u ON fl.uploaded_by = u.userID
         WHERE fl.company_id = ?
         AND fl.tag = 'MOA'
         ORDER BY fl.created_at DESC)
      `;
      queryParams = [company_id];
    }
    // else if (userRole === 'hte-supervisor') {
    //   // HTE supervisors see their own files and student files from their company
    //   query = `
    //     (SELECT
    //       'folder' as item_type,
    //       f.id,
    //       f.name,
    //       NULL as file_url,
    //       NULL as size,
    //       NULL as tag,
    //       f.created_at,
    //       f.updated_at,
    //       f.parent_id as folder_id,
    //       f.uploaded_by,
    //       f.uploaded_by_role,
    //       f.college_id,
    //       f.program_id,
    //       f.company_id,
    //       u.first_name,
    //       u.last_name
    //      FROM folders f
    //      LEFT JOIN users u ON f.uploaded_by = u.userID
    //      LEFT JOIN hte_supervisors h ON h.userID = ?
    //      WHERE f.parent_id ${folder_id ? '= ?' : 'IS NULL'}
    //      AND (f.uploaded_by = ? OR
    //           (f.uploaded_by_role = 'trainee'
    //            AND EXISTS (
    //              SELECT 1 FROM inter_application ia
    //              WHERE ia.trainee_user_id = f.uploaded_by
    //              AND ia.company_id = h.companyID
    //              AND ia.is_confirmed = 1
    //            ))))
    //     UNION ALL
    //     (SELECT
    //       'file' as item_type,
    //       fl.id,
    //       fl.name,
    //       fl.file_url,
    //       fl.size,
    //       fl.tag,
    //       fl.created_at,
    //       fl.updated_at,
    //       fl.folder_id,
    //       fl.uploaded_by,
    //       fl.uploaded_by_role,
    //       fl.college_id,
    //       fl.program_id,
    //       fl.company_id,
    //       u.first_name,
    //       u.last_name
    //      FROM files fl
    //      LEFT JOIN users u ON fl.uploaded_by = u.userID
    //      LEFT JOIN hte_supervisors h ON h.userID = ?
    //      WHERE fl.folder_id ${folder_id ? '= ?' : 'IS NULL'}
    //      AND (fl.uploaded_by = ? OR
    //           (fl.uploaded_by_role = 'trainee'
    //            AND EXISTS (
    //              SELECT 1 FROM inter_application ia
    //              WHERE ia.trainee_user_id = fl.uploaded_by
    //              AND ia.company_id = h.companyID
    //              AND ia.is_confirmed = 1
    //            ))))
    //     ORDER BY created_at DESC`;
    //   queryParams = folder_id
    //     ? [userId, folder_id, userId, userId, folder_id, userId]
    //     : [userId, userId, userId, userId];
    // }

    const [items] = await db.query(query, queryParams);
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
});

// Upload file
router.post(
  '/upload',
  authenticateUserMiddleware,
  upload.single('file'),
  async (req, res) => {
    try {
      const { tag, folder_id } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      let fileUrl = null;
      let collegeId = null;
      let programId = null;
      let companyId = null;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file uploaded' });
      }

      // Upload file to Firebase Storage
      const storageRef = ref(
        firebaseStorage,
        `files/${Date.now()}_${req.file.originalname}`
      );
      await uploadBytes(storageRef, req.file.buffer);
      fileUrl = await getDownloadURL(storageRef);

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
      }

      // Insert file record with folder_id

      console.log({ tag });
      const [result] = await db.query(
        `INSERT INTO files (
          name, file_url, tag, size, uploaded_by, 
          uploaded_by_role, college_id, program_id, company_id,
          folder_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.file.originalname,
          fileUrl,
          tag,
          req.file.size,
          userId,
          userRole,
          collegeId,
          programId,
          companyId,
          folder_id ? parseInt(folder_id) : null
        ]
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to upload file' });
    }
  }
);

// Delete file
router.delete('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get file details
    const [file] = await db.query(
      'SELECT * FROM files WHERE id = ? AND uploaded_by = ?',
      [id, userId]
    );

    if (!file.length) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found' });
    }

    // Delete from Firebase Storage
    const fileRef = ref(firebaseStorage, file[0].file_url);
    await deleteObject(fileRef);

    // Delete from database
    await db.query('DELETE FROM files WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

// Create folder
router.post('/folder', authenticateUserMiddleware, async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    let collegeId = null;
    let programId = null;
    let companyId = null;

    // Get relevant IDs based on user role (same logic as file upload)
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
    }

    const [result] = await db.query(
      `INSERT INTO folders (
        name, parent_id, uploaded_by, uploaded_by_role,
        college_id, program_id, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        parent_id || null,
        userId,
        userRole,
        collegeId,
        programId,
        companyId
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create folder' });
  }
});

// Get folder details
router.get('/folder/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [folders] = await db.query(
      `SELECT f.*, u.first_name, u.last_name
       FROM folders f
       LEFT JOIN users u ON f.uploaded_by = u.userID
       WHERE f.id = ? AND (
         f.uploaded_by = ? OR
         (f.uploaded_by_role = 'ojt-coordinator' AND f.college_id = (SELECT collegeID FROM trainee WHERE userID = ?)) OR
         (f.uploaded_by_role = 'hte-supervisor' AND f.company_id = (SELECT company_id FROM inter_application WHERE trainee_user_id = ? AND is_confirmed = 1))
       )`,
      [id, userId, userId, userId]
    );

    if (!folders.length) {
      return res
        .status(404)
        .json({ success: false, message: 'Folder not found' });
    }

    res.status(200).json({ success: true, data: folders[0] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch folder details' });
  }
});

export default router;
