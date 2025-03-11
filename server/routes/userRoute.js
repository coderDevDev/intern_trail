import express from 'express';

import config from '../config.js';

import multer from 'multer';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import bcrypt from 'bcrypt';
import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

let db = config.mySqlDriver;

const router = express.Router();

let firebaseStorage = config.firebaseStorage;

const JWT_SECRET = config.JWT_TOKEN_SECRET;
console.log({ JWT_SECRET });
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'interntrailwup@gmail.com', // Replace with your email
    pass: 'oclc xbbw agiq cdvl' // Replace with your email password
  }
});

const sendRegistrationEmail = async (email, templateKey) => {
  // Set the mail options
  const mailOptions = {
    from: 'interntrailwup@gmail.com',
    to: email,
    subject: '',
    html: ''
  };

  // Define the dynamic email template
  const getEmailTemplate = key => {
    if (key === 'APPROVE_REGISTRATION') {
      return {
        subject: 'Your Registration Has Been Approved!',
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                }
                .email-wrapper {
                  width: 100%;
                  background-color: #ffffff;
                  margin: 0 auto;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                }
                .email-header {
                  text-align: center;
                  padding-bottom: 20px;
                }
                .email-header h1 {
                  color: #333333;
                  font-size: 24px;
                }
                .email-content {
                  font-size: 16px;
                  color: #555555;
                }
                .button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin-top: 20px;
                  background-color:rgb(72, 124, 187);
                  color:rgb(255, 255, 255);
                  text-decoration: none;
                  border-radius: 5px;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #888888;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1>Welcome to InterTrail!</h1>
                </div>
                <div class="email-content">
                  <p>Dear User,</p>
                  <p>Your registration has been approved successfully. You can now start exploring the features of our platform.</p>
               
                </div>
                <div class="footer">
                  <p>If you did not request this registration, please ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    } else if (key === 'REJECT_REGISTRATION') {
      return {
        subject: 'Your Registration Has Been Rejected',
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                }
                .email-wrapper {
                  width: 100%;
                  background-color: #ffffff;
                  margin: 0 auto;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                }
                .email-header {
                  text-align: center;
                  padding-bottom: 20px;
                }
                .email-header h1 {
                  color: #333333;
                  font-size: 24px;
                }
                .email-content {
                  font-size: 16px;
                  color: #555555;
                }
                .button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin-top: 20px;
                  background-color: #f44336;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 5px;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #888888;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1>Registration Rejected</h1>
                </div>
                <div class="email-content">
                  <p>Dear User,</p>
                  <p>We regret to inform you that your registration has been rejected. If you have any questions, feel free to contact our support team.</p>
                 
                </div>
                <div class="footer">
                  <p>If you did not request this registration, please ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    } else {
      return {
        subject: 'Unknown Template',
        html: `<p>No template found for the key: ${key}</p>`
      };
    }
  };

  // Get the correct template based on the template key
  const template = getEmailTemplate(templateKey);

  // Set the subject and html to the mail options
  mailOptions.subject = template.subject;
  mailOptions.html = template.html;

  // Send the email
  await transporter.sendMail(mailOptions);
};

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
    `SELECT * FROM colleges WHERE collegeCode = '${collegeCode}'

    OR collegeID  = '${collegeCode}'
  
  
  `;

  const findProgramByCodeQuery = programID =>
    `
  
  SELECT * FROM programs WHERE programID = '${programID}'
  
  OR programID  = '${programID}'
  
  
  `;

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

    let hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role, created_at,phone ) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        role,
        created_at,
        phoneNumber
      ]
    );

    const insertedUserID = result.insertId;

    console.log('Inserted User ID:', insertedUserID);

    console.log({ college });
    const [rows] = await db.query(findCollegeByCodeQuery(college));
    const collegeInfo = rows[0];

    console.log({ collegeInfo });

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
    } else if (role === 'dean') {
      await db.query(
        `INSERT INTO deans (userID, collegeID, is_approved_by_admin)   
        VALUES (?, ?, ?)`,
        [insertedUserID, collegeInfo.collegeID, 0]
      );
      console.log('inserted into dean table');
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
          user: 'interntrailwup@gmail.com', // Replace with your email
          pass: 'oclc xbbw agiq cdvl' // Replace with your email password
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
     p.programID, p.programName as progName, p.programID
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

router.put('/trainee/:id', async (req, res) => {
  const { id } = req.params;
  const { is_verified_by_coordinator, remaining_hours } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE trainee 
       SET 
       is_verified_by_coordinator = ?,
       remaining_hours = ?
       WHERE traineeID  = ?`,
      [is_verified_by_coordinator, remaining_hours, id]
    );
    if (result.affectedRows > 0) {
      const [result] = await db.query(
        `select email from users 
        where userID = (select userID from trainee where traineeID = ?)
        `,
        [id]
      );

      let email = result[0].email;

      const templateKey = is_verified_by_coordinator
        ? 'APPROVE_REGISTRATION'
        : 'REJECT_REGISTRATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail(email, templateKey);
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

router.get('/coordinators/list', async (req, res) => {
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
     p.programID, p.programName as progName, p.programID
FROM coordinators t
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

router.put('/coordinator/:id', async (req, res) => {
  const { id } = req.params;
  const { is_approved_by_admin } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE coordinators 
       SET 
       is_approved_by_admin = ? 
       WHERE coordinatorID   = ?`,
      [is_approved_by_admin, id]
    );
    if (result.affectedRows > 0) {
      const [result] = await db.query(
        `select email from users 
        where userID = (select userID from coordinators where coordinatorID  = ?)
        `,
        [id]
      );

      let email = result[0].email;

      console.log({ email });

      const templateKey = is_approved_by_admin
        ? 'APPROVE_REGISTRATION'
        : 'REJECT_REGISTRATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail(email, templateKey);
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

router.put('/deans/:id', async (req, res) => {
  const { id } = req.params;
  const { is_approved_by_admin } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE deans 
       SET 
       is_approved_by_admin = ? 
       WHERE userID   = ?`,
      [is_approved_by_admin, id]
    );

    console.log({ result });
    if (result.affectedRows > 0) {
      console.log('DEx');
      const [result] = await db.query(
        `select email from users 
        where userID = ?
        `,
        [id]
      );

      let email = result[0].email;

      console.log({ email });

      const templateKey = is_approved_by_admin
        ? 'APPROVE_REGISTRATION'
        : 'REJECT_REGISTRATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail(email, templateKey);
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

router.get('/HTE/list', async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT 
        h.hteID,
        h.userID,
        h.companyID,
        h.is_approved_by_admin,
        u.email,
        u.first_name,
        u.middle_initial,
        u.last_name,
        u.phone,
        u.is_verified,
        u.proof_identity,
        u.created_at,
        u.updated_at,
        c.companyName as companyName,
        c.address as companyAddress,
        c.contact_email as companyEmail,
        c.contact_phone as companyPhone
      FROM hte_supervisors h
      INNER JOIN users u ON h.userID = u.userID
      INNER JOIN companies c ON h.companyID = c.companyID
  
      `
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch HTE supervisors' });
  }
});

router.put('/HTE/:id', async (req, res) => {
  const { id } = req.params;
  const { is_approved_by_admin } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE hte_supervisors 
       SET 
       is_approved_by_admin = ? 
       WHERE hteID    = ?`,
      [is_approved_by_admin, id]
    );
    if (result.affectedRows > 0) {
      const [result] = await db.query(
        `select email from users 
        where userID = (select userID from hte_supervisors where hteID   = ?)
        `,
        [id]
      );

      let email = result[0].email;

      console.log({ email });

      const templateKey = is_approved_by_admin
        ? 'APPROVE_REGISTRATION'
        : 'REJECT_REGISTRATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail(email, templateKey);
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

router.get('/deans/list', async (req, res) => {
  try {
    const [users] = await db.query(`
  SELECT t.*, u.userID, u.email,
    u.first_name, u.middle_initial, 
    u.last_name, u.phone, u.is_verified, 
    u.proof_identity, 
    u.role,
     u.last_login_at, u.created_at, 
     u.updated_at, 
     c.collegeID, c.collegeName, c.collegeCode
FROM deans t
INNER JOIN users u ON t.userID = u.userID
INNER JOIN colleges c ON t.collegeID = c.collegeID

      
      `);

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});
router.put('/dean/:id', async (req, res) => {
  const { id } = req.params;
  const { is_approved_by_admin } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE deans 
       SET 
       is_approved_by_admin = ? 
       WHERE deanID     = ?`,
      [is_approved_by_admin, id]
    );
    if (result.affectedRows > 0) {
      const [result] = await db.query(
        `select email from users 
        where userID = (select userID from deans where deanID    = ?)
        `,
        [id]
      );

      let email = result[0].email;

      console.log({ email });

      const templateKey = is_approved_by_admin
        ? 'APPROVE_REGISTRATION'
        : 'REJECT_REGISTRATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail(email, templateKey);
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
export default router;
