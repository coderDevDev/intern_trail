import express from 'express';
import config from '../config.js';
import multer from 'multer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
let firebaseStorage = config.firebaseStorage;
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload certificate
router.post(
  '/upload',
  authenticateUserMiddleware,
  upload.single('certificate'),
  async (req, res) => {
    try {
      const { studentId, tag } = req.body;
      const file = req.file;
      const uploaderId = req.user.id;
      const uploaderRole = req.user.role;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get student details
      const [students] = await db.query(
        `SELECT t.collegeID, t.programID FROM trainee t WHERE t.userID = ?`,
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const student = students[0];

      // Upload file to Firebase Storage
      const storageRef = ref(
        firebaseStorage,
        `certificates/${studentId}/${Date.now()}_${file.originalname}`
      );

      await uploadBytes(storageRef, file.buffer);
      const fileUrl = await getDownloadURL(storageRef);

      // Save certificate record in database
      const [result] = await db.query(
        `INSERT INTO files 
       (name, file_url, size, tag, folder_id, uploaded_by, uploaded_by_role, college_id, program_id, student_id) 
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
        [
          file.originalname,
          fileUrl,
          file.size,
          tag || 'certificate',
          uploaderId,
          uploaderRole,
          student.collegeID,
          student.programID,
          studentId
        ]
      );

      // Update student record to mark certificate as uploaded
      await db.query(
        `UPDATE trainee SET certificate_uploaded = 1 WHERE userID = ?`,
        [studentId]
      );

      res.status(201).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: {
          id: result.insertId,
          fileUrl
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Failed to upload certificate'
      });
    }
  }
);

// Get certificates for a student
router.get('/:studentId', authenticateUserMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all certificates for this student
    const [certificates] = await db.query(
      `SELECT f.*, u.first_name, u.last_name, u.role 
       FROM files f
       JOIN users u ON f.uploaded_by = u.userID
       WHERE f.student_id = ? AND f.tag = 'certificate'
       ORDER BY f.created_at DESC`,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
});

// Delete certificate
router.delete('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has permission to delete
    const [files] = await db.query(
      `SELECT * FROM files WHERE id = ? AND (uploaded_by = ? OR ? IN (
        SELECT userID FROM coordinators WHERE collegeID = (
          SELECT collegeID FROM trainee WHERE userID = student_id
        )
      ))`,
      [id, userId, userId]
    );

    if (files.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this certificate'
      });
    }

    // Delete the certificate
    await db.query('DELETE FROM files WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate'
    });
  }
});

export default router;
