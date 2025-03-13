import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';
import config from '../config.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const db = config.mySqlDriver;
const firebaseStorage = config.firebaseStorage;
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Get user profile data
router.get(
  '/user-profile',

  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get base user data
      const [userData] = await db.query(
        `SELECT 
        u.userID,
        u.email,
        u.first_name,
        u.middle_initial,
        u.last_name,
        u.phone,
        u.role,
        u.proof_identity
      FROM users u
      WHERE u.userID = ?`,
        [userId]
      );

      // Get role-specific data
      let roleData = {};
      switch (userRole) {
        case 'ojt-coordinator':
          const [coordinatorData] = await db.query(
            `SELECT 
            c.coordinatorID,
            col.collegeName,
            p.programName
          FROM coordinators c
          JOIN colleges col ON c.collegeID = col.collegeID
          JOIN programs p ON c.programID = p.programID
          WHERE c.userID = ?`,
            [userId]
          );
          roleData = coordinatorData[0];
          break;

        case 'hte-supervisor':
          const [hteData] = await db.query(
            `SELECT 
            h.hteID,
            c.companyName,
            c.address as companyAddress
          FROM hte_supervisors h
          JOIN companies c ON h.companyID = c.companyID
          WHERE h.userID = ?`,
            [userId]
          );
          roleData = hteData[0];
          break;

        // Add other roles as needed
      }

      res.json({
        success: true,
        data: {
          ...userData[0],
          ...roleData
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile data' });
    }
  }
);

// Update user profile
router.put(
  '/update-profile',
  authenticateUserMiddleware,
  upload.fields([{ name: 'profileImage', maxCount: 1 }]),
  async (req, res) => {
    const userId = req.user.id;
    const {
      first_name,
      middle_initial,
      last_name,
      phone,
      current_password,
      new_password
    } = req.body;

    const profileImage = req.files?.profileImage; // Handle optional profileImage upload
    const files = req.files;

    console.log({ files });

    try {
      console.log({ dex: req.body });

      // If no files are uploaded, update the user without the profile image
      if (!profileImage || Object.entries(files).length === 0) {
        console.log('No profile image provided.');

        // Update the user's profile without the profile image
        await db.query(
          `UPDATE users 
           SET first_name = ?, 
               middle_initial = ?, 
               last_name = ?, 
               phone = ?,
               proof_identity = COALESCE(?, proof_identity)  -- Keep previous value if no image
           WHERE userID = ?`,
          [first_name, middle_initial, last_name, phone, null, userId] // Pass null for the proof_identity if no image is provided
        );
      } else {
        // Handle the profile image upload if files are provided
        const file = profileImage[0]; // Assuming only one profile image is uploaded

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `profiles/${userId}-${Date.now()}.${fileExtension}`;

        const fileBuffer = file.buffer;
        const storageRef = ref(
          firebaseStorage,
          `intern_trail/users/${userId}/files/${file.originalname}`
        );

        await uploadBytes(storageRef, fileBuffer, {
          contentType: file.mimetype
        });

        const downloadURL = await getDownloadURL(storageRef);
        const profileImageUrl = downloadURL;

        console.log({ file, profileImageUrl });

        // Update the user's profile with the profile image
        await db.query(
          `UPDATE users 
           SET first_name = ?, 
               middle_initial = ?, 
               last_name = ?, 
               phone = ?,
               proof_identity = COALESCE(?, proof_identity)
           WHERE userID = ?`,
          [
            first_name,
            middle_initial,
            last_name,
            phone,
            profileImageUrl,
            userId
          ]
        );
      }

      // Handle password update if provided
      if (current_password && new_password) {
        const [user] = await db.query(
          'SELECT password FROM users WHERE userID = ?',
          [userId]
        );
        const isPasswordValid = await bcrypt.compare(
          current_password,
          user[0].password
        );

        if (!isPasswordValid) {
          throw new Error('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        console.log({ hashedPassword });
        await db.query('UPDATE users SET password = ? WHERE userID = ?', [
          hashedPassword,
          userId
        ]);
      }

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res
        .status(500)
        .json({ error: error.message || 'Failed to update profile' });
    }
  }
);

export default router;
