import express from 'express';
import path from 'path';
import fs from 'fs';

import config from '../config.js';

import multer from 'multer';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import OpenAI from 'openai';

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'interntrailwup@gmail.com', // Replace with your email
    pass: 'oclc xbbw agiq cdvl' // Replace with your email password
  }
});

console.log({ dex: process.env.OPENAI_APIKEY });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY
});

const sendRegistrationEmail = async ({
  email,
  fullName,
  companyName,
  templateKey
}) => {
  // Set the mail options
  const mailOptions = {
    from: 'interntrailwup@gmail.com',
    to: email,
    subject: '',
    html: ''
  };

  // Define the dynamic email template
  const getEmailTemplate = key => {
    if (key === 'APPROVE_OJT_APPLICATION') {
      return {
        subject: '🎉 Congratulations! Your OJT Application Has Been Approved',
        //Improve email content
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Poppins', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
                  color: #333;
                }
                .email-wrapper {
                  max-width: 600px;
                  margin: 40px auto;
                  background: #fff;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                  text-align: center;
                  padding-bottom: 20px;
                }
                .email-header h1 {
                  color: #2d89ff;
                  font-size: 26px;
                }
                .email-content {
                  font-size: 16px;
                  line-height: 1.6;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  background-color: #2d89ff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #777;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1>Welcome to ${companyName}!</h1>
                </div>
                <div class="email-content">
                  <p>Dear ${fullName},</p>
                    <p>Congratulations! 🎉 Your OJT application at ${companyName} has been officially approved.</p>
                    <p>We’re excited to have you on board and look forward to supporting you on this journey. Our team will be in touch soon with the next steps, including your schedule, orientation, and other important details.</p>
                    <p>Welcome to the team—we can’t wait to see you thrive! 🚀</p>
                    </div>
                    <div class="footer">
                    <p>If you have any questions, don't hesitate to reach out to us.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    } else if (key === 'REJECT_OJT_APPLICATION') {
      return {
        subject: '⚠️ OJT Application Status: Rejected',
        //Improve email content
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Poppins', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
                  color: #333;
                }
                .email-wrapper {
                  max-width: 600px;
                  margin: 40px auto;
                  background: #fff;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                  text-align: center;
                  padding-bottom: 20px;
                }
                .email-header h1 {
                  color: #e74c3c;
                  font-size: 26px;
                }
                .email-content {
                  font-size: 16px;
                  line-height: 1.6;
                }
                .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #777;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1>OJT Application Update</h1>
                </div>
                <div class="email-content">
                  <p>Dear ${fullName},</p>
                  <p>Thank you for your interest in joining ${companyName}. We sincerely appreciate the time and effort you put into your application.</p>
                  <p>After careful consideration, we regret to inform you that we are unable to accommodate your application at this time. However, we truly admire your dedication and encourage you to continue pursuing your career goals.</p>
                  <p>We wish you the very best in your future endeavors and hope our paths cross again.</p>
                  <p>Best regards,</p>
                  <p>The ${companyName} Team</p>
                </div>
                <div class="footer">
                  <p>If you have any questions, please don’t hesitate to reach out.</p>
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

router.post(
  '/create',
  upload.fields([
    { name: 'MOA', maxCount: 1 },
    { name: 'avatar_photo', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files;

      // create entry first

      let data = req.body;

      let {
        companyName,
        expertise,
        address,
        contact_phone,
        contact_email,
        list_of_requirements,
        description,
        collegeID,
        programID
      } = data;

      console.log({ list_of_requirements });

      const parsedRequirements = JSON.parse(
        JSON.stringify(list_of_requirements) || '[]'
      );

      const [result] = await db.query(
        `INSERT INTO companies 
        (companyName, 
          expertise,
         address, 
         contact_phone, 
         contact_email,
          list_of_requirements,
          description,
          collegeID,
          programID
          
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyName,
          expertise,
          address,
          contact_phone,
          contact_email,
          parsedRequirements,
          description,
          collegeID,
          programID
        ]
      );

      const companyId = result.insertId;

      console.log('Inserted User ID:', companyId);

      // // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `intern_trail/companies/${companyId}/files/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);

        console.log({ file, downloadURL });
        if (file.fieldname === 'MOA') {
          await db.query(
            `
           UPDATE companies SET
           moa_url = ?

           where companyID   = ?

           `,
            [downloadURL, companyId]
          );
        } else {
          await db.query(
            `
           UPDATE companies SET
           avatar_photo = ?

           where companyID   = ?

           `,
            [downloadURL, companyId]
          );
        }
      }

      res
        .status(200)
        .json({ success: true, message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

router.post(
  '/applyNow',
  authenticateUserMiddleware,
  upload.any(), // Handle multiple files
  async (req, res) => {
    try {
      const files = req.files;
      const user = req.user;
      const userID = user.id;
      const { companyID } = req.body;

      // Check if user has already applied
      const [existingApplication] = await db.query(
        'SELECT * FROM inter_application WHERE trainee_user_id = ? AND company_id = ?',
        [userID, companyID]
      );

      if (existingApplication.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this company'
        });
      }

      // Create application record
      const [result] = await db.query(
        `INSERT INTO inter_application 
          (company_id, trainee_user_id, status, created_at)
         VALUES (?, ?, 'pending', NOW())`,
        [companyID, userID]
      );

      const applicationId = result.insertId;

      // Handle file uploads
      if (files && files.length > 0) {
        for (const file of files) {
          const requirementId = file.fieldname.split('_')[1]; // Get requirement ID from fieldname

          const storageRef = ref(
            firebaseStorage,
            `intern_trail/applications/${applicationId}/${file.originalname}`
          );
          const metadata = { contentType: file.mimetype };

          // Upload to Firebase Storage
          await uploadBytes(storageRef, file.buffer, metadata);
          const downloadURL = await getDownloadURL(storageRef);

          // Store file reference in database
          await db.query(
            `INSERT INTO application_files 
              (application_id, requirement_id, file_url, file_name, uploaded_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [applicationId, requirementId, downloadURL, file.originalname]
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Application submitted successfully!'
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }
);

router.get('/list', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log({ userId, userRole });

    let condition = '';
    let values = [];

    switch (userRole) {
      case 'hte-supervisor':
        const [supervisor] = await db.query(
          `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
          [userId]
        );

        if (supervisor.length > 0) {
          condition = 'WHERE c.companyID = ?';
          values.push(supervisor[0].companyID);
        }
        break;

      case 'ojt-coordinator':
        const [coordinator] = await db.query(
          `SELECT p.collegeID 
           FROM coordinators c
           JOIN programs p ON c.programID = p.programID
           WHERE c.userID = ?`,
          [userId]
        );

        if (coordinator.length > 0) {
          condition = `JOIN programs p ON c.collegeID = p.collegeID 
                       WHERE p.collegeID = ?`;
          values.push(coordinator[0].collegeID);
        }
        break;

      case 'dean':
        const [dean] = await db.query(
          `SELECT collegeID FROM deans WHERE userID = ?`,
          [userId]
        );

        if (dean.length > 0) {
          condition = `JOIN programs p ON c.collegeID = p.collegeID 
                       WHERE p.collegeID = ?`;
          values.push(dean[0].collegeID);
        }
        break;
    }

    const [companies] = await db.query(
      `SELECT 
        c.*,
        COUNT(cf.id) as totalFeedback,
        AVG(cf.rating) as averageRating
      FROM companies c
      LEFT JOIN company_feedback cf ON c.companyID = cf.company_id
      ${condition}
      GROUP BY c.companyID`,
      values
    );

    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
});

router.get('/list/allCompanies/get', async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT 
        c.*,
        COUNT(cf.id) as totalFeedback,
        AVG(cf.rating) as averageRating
      FROM companies c
      LEFT JOIN company_feedback cf ON c.companyID = cf.company_id
      GROUP BY c.companyID`
    );

    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching all companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
});
router.post(
  '/trainees/application/list',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      let loggedInUser = req.user;
      let { id } = loggedInUser;
      let { status } = req.body;

      let [result] = await db.query(
        `
        SELECT * FROM hte_supervisors WHERE userID = ?
        `,
        [id]
      );

      let companyID = result[0].companyID;

      console.log({ companyID });

      let values = [companyID];

      if (status) {
        values.push(status);
      }

      console.log({ values });

      let [result2] = await db.query(
        `
        SELECT 
          ia.*, 
          u.userID, u.first_name, u.last_name, u.email, u.phone, u.proof_identity,
          c.collegeID, c.collegeName, c.collegeCode, 
          p.programID, p.programName, 
          t.remaining_hours
        FROM 
          inter_application AS ia
        INNER JOIN 
          users AS u ON ia.trainee_user_id = u.userID
        INNER JOIN 
          trainee AS t ON t.userID = u.userID
        INNER JOIN 
          colleges AS c ON t.collegeID = c.collegeID
        INNER JOIN 
          programs AS p ON t.programID = p.programID
        WHERE 
          ia.company_id = ?
          ${status ? 'AND ia.status = ?' : 'AND ia.status <> "approved"'}
        GROUP BY 
          u.userID
        `,
        values
      );

      res.status(200).json({ success: true, data: result2 });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch users' });
    }
  }
);

router.put(
  '/trainee/application/:userId',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { companyId, studentId, status } = req.body;

      console.log({ companyId, studentId, status });
      const [result] = await db.query(
        `
        UPDATE inter_application 
         SET 
         status = ? 
         WHERE trainee_user_id  = ?
         AND company_id = ?
         
         `,
        [status, studentId, companyId]
      );

      const [result2] = await db.query(
        `select * from users 
        where userID = ?
        `,
        [userId]
      );

      const [result3] = await db.query(
        `select * from companies 
        where companyID = ?
        `,
        [companyId]
      );

      let { email, first_name, last_name } = result2[0];
      let { companyName } = result3[0];

      let fullName = `${first_name} ${last_name}`;

      const templateKey =
        status === 'Approved'
          ? 'APPROVE_OJT_APPLICATION'
          : 'REJECT_OJT_APPLICATION'; // Example: This could be dynamic based on your logic

      await sendRegistrationEmail({
        email,
        fullName,
        companyName,
        templateKey
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch users' });
    }
  }
);

router.post(
  '/trainee/application/company/join',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { companyId } = req.body;
      let userId = loggedInUser.id;

      // Check if application already exists
      const [existingApplication] = await db.query(
        `SELECT * FROM inter_application 
         WHERE trainee_user_id = ?
          AND company_id = ?
          AND is_confirmed = 1
          `,
        [userId, companyId]
      );

      if (existingApplication.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this company'
        });
      }

      // Create new application
      await db.query(
        `
        
         UPDATE inter_application 
         SET 
         is_confirmed = ?
         WHERE trainee_user_id  = ?
         AND company_id = ?


         
         `,
        [true, userId, companyId]
      );

      await db.query(
        `
        
         UPDATE trainee 
         SET 
         companyID   = ?
         WHERE userID   = ?
 
         
         `,
        [companyId, userId]
      );

      res.status(200).json({
        success: true,
        message: 'Successfully joined the company'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Failed to join company'
      });
    }
  }
);

// Update MOA status - Dean only
router.post('/moa/:id/status', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify user is a dean
    if (req.user.role !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only deans can update MOA status'
      });
    }

    await db.query('UPDATE companies SET moa_status = ? WHERE companyID  = ?', [
      status,
      id
    ]);

    res.status(200).json({
      success: true,
      message: `MOA ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating MOA status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update MOA status'
    });
  }
});

// Update application status - Coordinator only
router.post(
  '/application/:id/status',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Verify user is a coordinator
      if (req.user.role !== 'coordinator') {
        return res.status(403).json({
          success: false,
          message: 'Only coordinators can update application status'
        });
      }

      await db.query('UPDATE inter_application SET status = ? WHERE id = ?', [
        status,
        id
      ]);

      res.status(200).json({
        success: true,
        message: `Application ${status} successfully`
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }
);

// Get student requirements
router.get(
  '/student-requirements',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      let user = req.user;

      let student_id = user.id;

      // Get companies where student is approved
      const [companies] = await db.query(
        `SELECT 
        c.companyID as id,
        c.companyName as name,
        c.list_of_requirements
    
       FROM companies c
       JOIN inter_application ia ON c.companyID = ia.company_id
       WHERE ia.trainee_user_id = ?
       AND ia.status = 'Approved'
       AND ia.is_confirmed = 1`,
        [student_id]
      );

      // Get submitted requirements for each company
      const companiesWithRequirements = await Promise.all(
        companies.map(async company => {
          const requirements = JSON.parse(company.list_of_requirements || '[]');

          // Get submitted files for each requirement
          const [files] = await db.query(
            `SELECT 
            tag,
            created_at as submitted_date
           FROM files
           WHERE uploaded_by = ?
           AND company_id = ?
           AND tag IN (?)`,
            [student_id, company.id, requirements.map(r => r.value)]
          );

          // Map requirements with submission status
          const mappedRequirements = requirements.map(req => ({
            ...req,
            status: files.find(f => f.tag === req.value)
              ? 'completed'
              : 'pending',
            submitted_date: files.find(f => f.tag === req.value)?.submitted_date
          }));

          return {
            ...company,
            requirements: mappedRequirements
          };
        })
      );

      res.status(200).json({
        success: true,
        data: companiesWithRequirements
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requirements'
      });
    }
  }
);

// Get weekly report and feedback
router.get('/weekly-report/:studentId/:weekNumber', async (req, res) => {
  try {
    const { studentId, weekNumber } = req.params;

    // Get weekly feedback with user names
    const [weeklyFeedback] = await db.query(
      `SELECT wf.*, 
        u.first_name, u.middle_initial, u.last_name,
        DATE_FORMAT(wf.date, '%M %d, %Y') as formatted_date
       FROM weekly_feedback wf
       INNER JOIN users u ON wf.user_id = u.userID
       WHERE wf.student_id = ? AND wf.week_number = ?`,
      [studentId, weekNumber]
    );

    console.log({ weeklyFeedback });

    // Get weekly report entries
    const [weeklyReport] = await db.query(
      `SELECT 
      date,
      day,
      report,
      time_in as timeIn,
      time_out as timeOut,
      week_number as weekNumber,
      narrative,
      status
     FROM daily_reports
     WHERE student_id = ?
     AND week_number = ?
     ORDER BY date ASC`,
      [studentId, weekNumber]
    );

    // Format feedback data
    const formattedFeedback = {
      [weekNumber]: weeklyFeedback.map(feedback => ({
        user: feedback.user_id,
        role: feedback.role,
        date: feedback.formatted_date,
        feedback: feedback.feedback,
        fullName: `${feedback.first_name} ${feedback.last_name}`
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        weeklyReport,
        weeklyFeedback: formattedFeedback
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly report'
    });
  }
});

// Create/Update daily report
router.post('/daily-report', authenticateUserMiddleware, async (req, res) => {
  try {
    const { date, report, timeIn, timeOut, weekNumber, narrative } = req.body;
    const studentId = req.user.id;

    // Get day name from date
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Check if report exists
    const [existingReport] = await db.query(
      `SELECT id FROM daily_reports 
       WHERE student_id = ? AND date = ?`,
      [studentId, date]
    );

    if (existingReport.length > 0) {
      // Update existing report
      await db.query(
        `UPDATE daily_reports 
         SET report = ?, 
             time_in = ?, 
             time_out = ?, 
             narrative = ?,
             updated_at = NOW()
         WHERE student_id = ? AND date = ?`,
        [report, timeIn, timeOut, narrative, studentId, date]
      );
    } else {
      // Create new report
      await db.query(
        `INSERT INTO daily_reports 
         (student_id, date, day, report, time_in, time_out, week_number, narrative)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, date, day, report, timeIn, timeOut, weekNumber, narrative]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Daily report saved successfully'
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save daily report' });
  }
});

// Add weekly feedback
router.post(
  '/weekly-feedback',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { studentId, weekNumber, feedback, fromAI } = req.body;
      const userId = req.user.id;
      const userRole = fromAI ? 'AI' : req.user.role;

      // Check if AI feedback already exists for this week
      if (fromAI) {
        const [existingAIFeedback] = await db.query(
          `SELECT id FROM weekly_feedback 
           WHERE student_id = ? 
           AND week_number = ? 
           AND role = 'AI'`,
          [studentId, weekNumber]
        );

        if (existingAIFeedback.length > 0) {
          // Update existing AI feedback
          await db.query(
            `UPDATE weekly_feedback 
             SET feedback = ?, 
                 date = CURDATE()
             WHERE id = ?`,
            [feedback, existingAIFeedback[0].id]
          );
        } else {
          // Insert new AI feedback
          await db.query(
            `INSERT INTO weekly_feedback 
             (student_id, user_id, role, week_number, feedback, date)
             VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [studentId, userId, userRole, weekNumber, feedback]
          );
        }
      } else {
        // Insert new user feedback
        await db.query(
          `INSERT INTO weekly_feedback 
           (student_id, user_id, role, week_number, feedback, date)
           VALUES (?, ?, ?, ?, ?, CURDATE())`,
          [studentId, userId, userRole, weekNumber, feedback]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Feedback added successfully'
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to add feedback' });
    }
  }
);

// Delete daily report
router.delete(
  '/daily-report/:id',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      await db.query(
        `DELETE FROM daily_reports 
       WHERE id = ? AND student_id = ?`,
        [id, studentId]
      );

      res.status(200).json({
        success: true,
        message: 'Daily report deleted successfully'
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to delete daily report' });
    }
  }
);

// Add route for generating AI feedback
router.post(
  '/generate-feedback',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { dailyReports, narrativeReport, weekNumber } = req.body;

      const prompt = `Please analyze the following daily reports and narrative report from an intern:

Daily Reports:
${dailyReports}

Weekly Narrative:
${narrativeReport}

Please provide constructive feedback about their performance, achievements, and areas for improvement.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo'
      });

      const aiFeedback = completion.choices[0].message.content;

      res.status(200).json({
        success: true,
        feedback: aiFeedback
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to generate AI feedback' });
    }
  }
);

// Add update time endpoint
router.put(
  '/daily-report/update-time',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { date, timeIn, timeOut, studentId } = req.body;

      // Check if report exists
      const [existingReport] = await db.query(
        `SELECT id FROM daily_reports 
         WHERE student_id = ? AND date = ?`,
        [studentId, date]
      );

      if (existingReport.length > 0) {
        // Update existing report's time
        await db.query(
          `UPDATE daily_reports 
           SET time_in = ?, 
               time_out = ?, 
               updated_at = NOW()
           WHERE student_id = ? AND date = ?`,
          [timeIn, timeOut, studentId, date]
        );

        res.status(200).json({
          success: true,
          message: 'Time updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update time' });
    }
  }
);

// Update daily report status
router.put(
  '/daily-report/status',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { date, studentId, status } = req.body;

      console.log({ date, studentId, status });
      // Update the status of the daily report
      await db.query(
        `UPDATE daily_reports 
       SET status = ?, updated_at = NOW()
       WHERE student_id = ? AND date = ?`,
        [status, studentId, date]
      );

      res.status(200).json({
        success: true,
        message: `Entry ${status}d successfully`
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update entry status' });
    }
  }
);

// Update company endpoint
router.put(
  '/edit/:id',
  upload.fields([
    { name: 'avatar_photo', maxCount: 1 },
    { name: 'MOA', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        companyName,
        description,
        expertise,
        address,
        contact_phone,
        contact_email,
        list_of_requirements
      } = req.body;

      const parsedRequirements = JSON.parse(
        JSON.stringify(list_of_requirements) || '[]'
      );

      // Check if company exists
      const [companyResult] = await db.query(
        'SELECT * FROM companies WHERE companyID = ?',
        [id]
      );

      if (companyResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Prepare update data
      const updateData = {
        companyName,
        description,
        expertise,
        address,
        contact_phone,
        contact_email,
        list_of_requirements: parsedRequirements
      };

      // Check for file uploads and update paths
      if (req.files['avatar_photo']) {
        const avatarFile = req.files['avatar_photo'][0];
        const avatarStorageRef = ref(
          firebaseStorage,
          `intern_trail/companies/${id}/files/${avatarFile.originalname}`
        );
        const avatarMetadata = { contentType: avatarFile.mimetype };
        await uploadBytes(avatarStorageRef, avatarFile.buffer, avatarMetadata);
        const avatarDownloadURL = await getDownloadURL(avatarStorageRef);
        updateData.avatar_photo = avatarDownloadURL;
      }

      if (req.files['MOA']) {
        const moaFile = req.files['MOA'][0];
        const moaStorageRef = ref(
          firebaseStorage,
          `intern_trail/companies/${id}/files/${moaFile.originalname}`
        );
        const moaMetadata = { contentType: moaFile.mimetype };
        await uploadBytes(moaStorageRef, moaFile.buffer, moaMetadata);
        const moaDownloadURL = await getDownloadURL(moaStorageRef);
        updateData.moa_url = moaDownloadURL;
      }

      // Build the SQL query dynamically
      const updateFields = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => `${key} = ?`)
        .join(', ');

      const updateValues = Object.keys(updateData)
        .filter(key => updateData[key] !== undefined)
        .map(key => updateData[key]);

      // Add the ID to the values array
      updateValues.push(id);

      // Execute the update query
      const [result] = await db.query(
        `UPDATE companies SET ${updateFields} WHERE companyID = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: {
          companyID: id,
          ...updateData
        }
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company',
        error: error.message
      });
    }
  }
);

// Add feedback to a company
router.post('/:id/feedback', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if company exists
    const [companyResult] = await db.query(
      'SELECT * FROM companies WHERE companyID = ?',
      [id]
    );

    if (companyResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user has already provided feedback
    const [existingFeedback] = await db.query(
      'SELECT * FROM company_feedback WHERE company_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingFeedback.length > 0) {
      // Update existing feedback
      await db.query(
        'UPDATE company_feedback SET rating = ?, comment = ?, updated_at = NOW() WHERE company_id = ? AND user_id = ?',
        [rating, comment, id, userId]
      );
    } else {
      // Insert new feedback
      await db.query(
        'INSERT INTO company_feedback (company_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
        [id, userId, rating, comment]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Get all feedback for a company
router.get('/:id/feedback', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get all feedback with user information
    const [feedback] = await db.query(
      `SELECT cf.*, u.first_name, u.last_name, u.proof_identity as avatar
       FROM company_feedback cf
       JOIN users u ON cf.user_id = u.userID
       WHERE cf.company_id = ?
       ORDER BY cf.created_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

router.post(
  '/apply',
  authenticateUserMiddleware,
  upload.array('files'),
  async (req, res) => {
    try {
      const { companyId, requirements } = req.body;
      const userId = req.user.id;
      const files = req.files;

      // Check if user has already applied
      const [existingApplication] = await db.query(
        'SELECT * FROM company_applications WHERE user_id = ? AND company_id = ?',
        [userId, companyId]
      );

      if (existingApplication.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this company'
        });
      }

      // Create application record
      const [result] = await db.query(
        `INSERT INTO company_applications (
        company_id, 
        user_id, 
        requirements,
        status,
        created_at
      ) VALUES (?, ?, ?, 'pending', NOW())`,
        [companyId, userId, requirements]
      );

      // Handle file uploads
      if (files && files.length > 0) {
        for (const file of files) {
          await db.query(
            `INSERT INTO application_files (
            application_id,
            requirement_id,
            file_url,
            file_name,
            uploaded_at
          ) VALUES (?, ?, ?, ?, NOW())`,
            [
              result.insertId,
              file.fieldname.split('_')[1],
              file.path,
              file.originalname
            ]
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }
);

// Get user's applications
router.get(
  '/applications/user',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const [applications] = await db.query(
        `SELECT 
        ia.*,
        c.companyName,
        c.avatar_photo
       FROM inter_application ia
       JOIN companies c ON ia.company_id = c.companyID
       WHERE ia.trainee_user_id = ?`,
        [userId]
      );

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }
);

// Join a company
router.post('/join', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.body;

    // Check if user has already joined a company
    const [existingJoin] = await db.query(
      `SELECT * FROM inter_application 
       WHERE trainee_user_id = ? AND is_confirmed = 1`,
      [userId]
    );

    if (existingJoin.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined a company'
      });
    }

    // Check if application is approved
    const [application] = await db.query(
      `SELECT * FROM inter_application 
       WHERE trainee_user_id = ? AND company_id = ? AND status = 'approved'`,
      [userId, companyId]
    );

    if (application.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application must be approved before joining'
      });
    }

    // Update application to joined status
    await db.query(
      `UPDATE inter_application 
       SET is_confirmed = 1
       WHERE trainee_user_id = ? AND company_id = ?`,
      [userId, companyId]
    );

    res.status(200).json({
      success: true,
      message: 'Successfully joined company'
    });
  } catch (error) {
    console.error('Error joining company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join company'
    });
  }
});

// Get application files
router.get(
  '/application/:id/files',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [files] = await db.query(
        `SELECT * FROM application_files WHERE application_id = ?`,
        [id]
      );

      // Format files by requirement ID
      const formattedFiles = files.reduce((acc, file) => {
        acc[file.requirement_id] = file;
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: formattedFiles
      });
    } catch (error) {
      console.error('Error fetching application files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application files'
      });
    }
  }
);

// Add these new routes to support the tabbed interface

// 1. For the Applications tab - Get all applications regardless of status
router.post(
  '/trainees/applications/all',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { id } = loggedInUser;

      // Get company ID if user is HTE supervisor
      const [supervisor] = await db.query(
        `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
        [id]
      );

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any company'
        });
      }

      const companyID = supervisor[0].companyID;

      // Get all applications for the company
      const [applications] = await db.query(
        `SELECT 
          ia.*, 
          u.userID, u.first_name, u.last_name, u.middle_initial, u.email, u.phone, u.proof_identity,
          u.created_at, u.updated_at,
          c.collegeID, c.collegeName, c.collegeCode, 
          p.programID, p.programName, 
          t.remaining_hours, t.deployment_date
        FROM 
          inter_application AS ia
        INNER JOIN 
          users AS u ON ia.trainee_user_id = u.userID
        INNER JOIN 
          trainee AS t ON t.userID = u.userID
        INNER JOIN 
          colleges AS c ON t.collegeID = c.collegeID
        INNER JOIN 
          programs AS p ON t.programID = p.programID
         WHERE 
          ia.company_id = ? 
     
        GROUP BY 
          u.userID
        ORDER BY ia.created_at DESC`,
        [companyID]
      );

      console.log({ applications });
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching trainee applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trainee applications',
        error: error.message
      });
    }
  }
);

// 2. For the Active Trainees tab - Get only approved trainees
router.post(
  '/trainees/active',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { id } = loggedInUser;

      // Get company ID if user is HTE supervisor
      const [supervisor] = await db.query(
        `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
        [id]
      );

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any company'
        });
      }

      const companyID = supervisor[0].companyID;

      console.log({ companyID });

      // Get only approved trainees for the company
      const [activeTrainees] = await db.query(
        `SELECT 
          ia.*, 
          u.userID, u.first_name, u.last_name, u.middle_initial, u.email, u.phone, u.proof_identity,
          u.created_at, u.updated_at,
          c.collegeID, c.collegeName, c.collegeCode, 
          p.programID, p.programName, 
          t.traineeID, t.remaining_hours, t.deployment_date
        FROM 
          inter_application AS ia
        INNER JOIN 
          users AS u ON ia.trainee_user_id = u.userID
        INNER JOIN 
          trainee AS t ON t.userID = u.userID
        INNER JOIN 
          colleges AS c ON t.collegeID = c.collegeID
        INNER JOIN 
          programs AS p ON t.programID = p.programID
        WHERE 
          ia.company_id = ? AND ia.status = 'approved' 
          AND ia.is_confirmed = 1
        GROUP BY 
          u.userID
        ORDER BY t.deployment_date DESC`,
        [companyID]
      );

      res.status(200).json({
        success: true,
        data: activeTrainees
      });
    } catch (error) {
      console.error('Error fetching active trainees:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active trainees',
        error: error.message
      });
    }
  }
);

// 3. For the Progress Reports tab - Get trainees with progress data
router.post(
  '/trainees/progress',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { id } = loggedInUser;

      // Get company ID if user is HTE supervisor
      const [supervisor] = await db.query(
        `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
        [id]
      );

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any company'
        });
      }

      const companyID = supervisor[0].companyID;

      // Get trainees with progress data
      const [traineeProgress] = await db.query(
        `SELECT 
          ia.*, 
          u.userID, u.first_name, u.last_name, u.middle_initial, u.email, u.phone, u.proof_identity,
          u.created_at, u.updated_at,
          c.collegeID, c.collegeName, c.collegeCode, 
          p.programID, p.programName, 
          t.traineeID, t.remaining_hours, t.deployment_date,
          (SELECT MAX(created_at) FROM daily_reports WHERE student_id = t.traineeID) as last_update,
          (SELECT COUNT(*) FROM dtrs WHERE traineeID = t.traineeID AND status = 'approved') as hours_completed
        FROM 
          inter_application AS ia
        INNER JOIN 
          users AS u ON ia.trainee_user_id = u.userID
        INNER JOIN 
          trainee AS t ON t.userID = u.userID
        INNER JOIN 
          colleges AS c ON t.collegeID = c.collegeID
        INNER JOIN 
          programs AS p ON t.programID = p.programID
        WHERE 
          ia.company_id = ? AND ia.status = 'approved' AND ia.is_confirmed = 1
        GROUP BY 
          u.userID
        ORDER BY last_update DESC`,
        [companyID]
      );

      res.status(200).json({
        success: true,
        data: traineeProgress
      });
    } catch (error) {
      console.error('Error fetching trainee progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trainee progress',
        error: error.message
      });
    }
  }
);

// 4. Get trainee evaluations
router.post(
  '/trainees/evaluations',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { id } = loggedInUser;
      const { traineeId } = req.body;

      // Get company ID if user is HTE supervisor
      const [supervisor] = await db.query(
        `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
        [id]
      );

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any company'
        });
      }

      const companyID = supervisor[0].companyID;

      // Get evaluations for a specific trainee or all trainees
      let query = `
        SELECT 
          te.*,
          u.first_name, u.last_name, u.email,
          t.remaining_hours
        FROM 
          trainee_evaluations AS te
        INNER JOIN 
          trainee AS t ON te.traineeID = t.traineeID
        INNER JOIN 
          users AS u ON t.userID = u.userID
        INNER JOIN 
          hte_supervisors AS hs ON te.hteID = hs.hteID
        WHERE 
          hs.companyID = ?
      `;

      const queryParams = [companyID];

      if (traineeId) {
        query += ` AND te.traineeID = ?`;
        queryParams.push(traineeId);
      }

      query += ` ORDER BY te.eval_date DESC`;

      const [evaluations] = await db.query(query, queryParams);

      res.status(200).json({
        success: true,
        data: evaluations
      });
    } catch (error) {
      console.error('Error fetching trainee evaluations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trainee evaluations',
        error: error.message
      });
    }
  }
);

// 5. Get trainee certificates
router.post(
  '/trainees/certificates',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { id } = loggedInUser;

      // Get company ID if user is HTE supervisor
      const [supervisor] = await db.query(
        `SELECT companyID FROM hte_supervisors WHERE userID = ?`,
        [id]
      );

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with any company'
        });
      }

      const companyID = supervisor[0].companyID;

      // Get certificates for trainees
      const [certificates] = await db.query(
        `SELECT 
          te.traineeID, te.certificate_url, te.eval_date,
          u.first_name, u.last_name, u.email,
          t.remaining_hours
        FROM 
          trainee_evaluations AS te
        INNER JOIN 
          trainee AS t ON te.traineeID = t.traineeID
        INNER JOIN 
          users AS u ON t.userID = u.userID
        INNER JOIN 
          hte_supervisors AS hs ON te.hteID = hs.hteID
        WHERE 
          hs.companyID = ? AND te.certificate_url IS NOT NULL
        ORDER BY te.eval_date DESC`,
        [companyID]
      );

      res.status(200).json({
        success: true,
        data: certificates
      });
    } catch (error) {
      console.error('Error fetching trainee certificates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trainee certificates',
        error: error.message
      });
    }
  }
);

export default router;
