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

/**
 * CRUD Operations for `users`
 */

// Create User
router.post('/create', async (req, res) => {
  let {
    firstName,
    lastName,
    email,
    password,
    role,
    phoneNumber,
    college,
    program,
    studentId,
    company
  } = req.body;

  const created_at = new Date();

  role = role === 'student' ? 'trainee' : role;

  console.log({ role, college, program });

  const findCollegeByCodeQuery = collegeCode =>
    `SELECT * FROM colleges WHERE collegeCode = '${collegeCode}'`;

  const findProgramByCodeQuery = progCode =>
    `SELECT * FROM programs WHERE progCode = '${progCode}'`;

  try {
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, phoneNumber]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }

    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role, created_at,phone ) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role, created_at, phoneNumber]
    );

    const insertedUserID = result.insertId;

    console.log('Inserted User ID:', insertedUserID);

    const [rows] = await db.query(findCollegeByCodeQuery(college));
    const collegeInfo = rows[0];

    const [rows2] = await db.query(findProgramByCodeQuery(program));
    const programInfo = rows2[0];

    if (role === 'ojt-coordinator') {
      console.log({ collegeInfo, programInfo });
      await db.query(
        `INSERT INTO coordinators (userID, collegeID, programID)   
        VALUES (?, ?, ?)`,
        [insertedUserID, collegeInfo.collegeID, programInfo.programID]
      );
      console.log('inserted into coordinators table');
    } else if (role === 'trainee') {
      await db.query(
        `INSERT INTO trainee (userID, collegeID, programID, student_id)   
        VALUES (?, ?, ?, ?)`,
        [
          insertedUserID,
          collegeInfo.collegeID,
          programInfo.programID,
          studentId
        ]
      );
      console.log('inserted into trainee table');
    } else if (role === 'hte-supervisor') {
      await db.query(
        `INSERT INTO hte_supervisors (userID, companyID)   
        VALUES (?, ?)`,
        [insertedUserID, company]
      );
      console.log('inserted into hte-supervisor table');
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { insertedUserID }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Read All Users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Read User by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await db.query('SELECT * FROM users WHERE userID = ?', [id]);
    if (user.length > 0) {
      res.status(200).json({ success: true, user: user[0] });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Update User
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, role } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, role = ? WHERE userID = ?',
      [first_name, last_name, email, password, role, id]
    );
    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: 'User updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE userID = ?', [id]);
    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

router.post(
  '/proof_of_identity/upload-files',
  upload.fields([{ name: 'proofOfIdentity', maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files;
      const userID = req.body.userID;

      // // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `intern_trail/users/${userID}/proof_of_identity/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);

        await db.query(
          `
          UPDATE users SET proof_identity = ?
          where userID  = ? 
         

          `,
          [downloadURL, userID]
        );
      }

      const [rows] = await db.query(
        `
         SELECT * FROM users WHERE userID = ?
       

        `,
        [userID]
      );

      const user = rows[0];

      let { email } = user;

      const generateVerificationToken = email =>
        jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

      const token = generateVerificationToken(email);

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dextermiranda441@gmail.com', // Replace with your email
          pass: 'oczk mljj symm bjgc' // Replace with your email password
        }
      });

      // Email options
      const mailOptions = {
        from: 'interntrailwup@gmail.com',
        to: email,
        subject: 'Verify your acccount',
        html: `
             <h1>Acccount Verification</h1>
            <p>Click the link below to verify your account:</p>
            <a href="${config.REACT_FRONT_END_URL}/verify-email/${token}">${config.REACT_FRONT_END_URL}/verify-email/${token}</a>
            <p>This link will expire in 24 hours.</p>
            
            `
      };

      // Send the email
      await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: 'Failed to send email' });
        }
      });
      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

router.get('/trainees/list', async (req, res) => {
  try {
    const [users] = await db.query(`
  SELECT t.*, u.userID, u.email,
    u.first_name, u.middle_initial, 
    u.last_name, u.phone, u.is_verified, 
    u.proof_identity, 
    u.role,
     u.last_login_at, u.created_at, 
     u.updated_at, 
     c.collegeID, c.collegeName, c.collegeCode, 
     p.programID, p.progName, p.progCode
FROM trainee t
INNER JOIN users u ON t.userID = u.userID
INNER JOIN colleges c ON t.collegeID = c.collegeID
INNER JOIN programs p ON t.programID = p.programID;

      
      `);

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

export default router;
