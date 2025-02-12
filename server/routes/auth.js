import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

// Replace these with your environment variables or constants
const JWT_SECRET = config.JWT_TOKEN_SECRET;

console.log({ JWT_SECRET });
const REACT_FRONT_END_URL = config.REACT_FRONT_END_URL;

// Helper function for SQL queries
const findUserByEmailQuery = email =>
  `SELECT * FROM users WHERE email = '${email}'`;

const updatePasswordQuery = (email, newPassword) =>
  `UPDATE users SET password = '${newPassword}' WHERE email = '${email}'`;

// Helper function to generate email verification tokens
const generateVerificationToken = email =>
  jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

// SQL Queries

const updateVerificationStatusQuery = email =>
  `UPDATE users SET is_verified = 1 WHERE email = '${email}'`;

/**
 * Login Route
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

    console.log({ user });

    let mappedTable = {
      'ojt-coordinator': {
        table_name: 'coordinators',
        id: 'coordinatorID'
      },
      trainee: {
        table_name: 'trainee',
        id: 'traineeID'
      },
      'hte-supervisor': {
        table_name: 'hte_supervisors',
        id: 'hteID'
      },
      dean: {
        table_name: 'deans',
        id: 'deanID'
      }
    };

    let selectedRole = mappedTable[user.role];

    if (selectedRole && selectedRole.table_name) {
      const [query2] = await db.query(
        `
        SELECT *
        FROM ${selectedRole.table_name}
        WHERE userID = ?
        `,
        [user.userID]
      );

      let is_approved =
        query2[0].is_approved_by_admin || query2[0].is_verified_by_coordinator;

      console.log({ is_approved });
      if (!is_approved || is_approved < 1) {
        return res.status(401).json({
          success: false,
          message: 'Account not verified or approved by the administrator.'
        });
      }
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    if (user.is_verified === 0) {
      return res.status(401).json({
        success: false,
        message: 'Please verify you account first. Check your email to verify.'
      });
    }

    const token = jwt.sign({ id: user.userID, role: user.role }, JWT_SECRET, {
      expiresIn: '1h'
    });

    delete user.password;
    res.json({
      success: true,
      token,
      data: {
        ...user,
        role: user.role,
        userId: user.userID,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Logout Route
 */
router.post('/logout', (req, res) => {
  // Instruct the client to remove the token
  res.json({
    success: true,
    message:
      'Logged out successfully. Please remove your access token from storage.'
  });
});

/**
 * Route to send email verification
 */
router.post('/send-verification-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const [rows] = await db.query(findUserByEmailQuery(email));
    const user = rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: 'User is already verified' });
    }

    // Generate email verification token
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
      subject: 'Email Verification',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${REACT_FRONT_END_URL}/verify-email/${token}">${REACT_FRONT_END_URL}/verify-email/${token}</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: 'Failed to send email' });
      }
      res
        .status(200)
        .json({ success: true, message: 'Verification email sent' });
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Route to verify email
 */
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token

    console.log({ JWT_SECRET });
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const email = decodedToken.email;

    // Check if user exists
    const [rows] = await db.query(findUserByEmailQuery(email));
    const user = rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.is_verified === 1) {
      return res
        .status(200)
        .json({ success: false, message: 'User is already verified' });
    }

    //Update the user's verification status
    await db.query(updateVerificationStatusQuery(email));

    res
      .status(200)
      .json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(400)
        .json({ success: false, message: 'Verification link expired' });
    }

    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Forget Password Route
 */
router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query(findUserByEmailQuery(email));
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email is not registered in our system.'
      });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: '10m'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'interntrailwup@gmail.com', // Replace with your email
        pass: 'oclc xbbw agiq cdvl' // Replace with your email password
      }
    });

    const mailOptions = {
      from: 'interntrailwup@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${REACT_FRONT_END_URL}/reset-password/${token}">${REACT_FRONT_END_URL}/reset-password/${token}</a>
        <p>The link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: 'Failed to send email' });
      }
      res
        .status(200)
        .json({ success: true, message: 'Reset password email sent' });
    });
  } catch (err) {
    console.error('Forget password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Reset Password Route
 */
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const [rows] = await db.query(findUserByEmailQuery(decodedToken.email));
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user does not exist.'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(updatePasswordQuery(user.email, hashedPassword));

    res
      .status(200)
      .json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
