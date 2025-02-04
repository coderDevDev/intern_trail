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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dextermiranda441@gmail.com', // Replace with your email
    pass: 'oczk mljj symm bjgc' // Replace with your email password
  }
});

const sendRegistrationEmail = async ({
  email,
  fullName,
  companyName,
  templateKey
}) => {
  // Set the mail options
  const mailOptions = {
    from: 'dextermiranda441@gmail.com',
    to: email,
    subject: '',
    html: ''
  };

  // Define the dynamic email template
  const getEmailTemplate = key => {
    if (key === 'APPROVE_OJT_APPLICATION') {
      return {
        subject: '🎉 Congratulations! Your OJT Application Has Been Approved',
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
                  <p>Dear ${fullName}</p>
                  <p>We’re thrilled to inform you that your OJT application at ${companyName} has been approved! 🎉</p>
                  <p>We can't wait for you to start this journey with us. Our team will reach out with the next steps, including your schedule, orientation, and other essential details.</p>
                  <p>See you soon, and welcome aboard! 🚀</p>
                </div>
                <div class="footer">
                  <p>If you have any questions, feel free to contact us.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    } else if (key === 'REJECT_OJT_APPLICATION') {
      return {
        subject: '⚠️ OJT Application Status: Rejected',
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
                  <p>Thank you for your interest in joining ${companyName}. Unfortunately, after reviewing your application, we regret to inform you that we cannot accommodate you at this time.</p>
                  <p>We appreciate the time and effort you put into your application and encourage you to keep striving toward your career goals. We wish you success in your future endeavors.</p>
                  <p>Best regards,</p>
                  <p>The ${companyName} Team</p>
                </div>
                <div class="footer">
                  <p>If you have any questions, feel free to reach out to us.</p>
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
        description
      } = data;
      if (typeof list_of_requirements === 'string') {
        list_of_requirements = JSON.parse(list_of_requirements); // Convert to array
      }

      const [result] = await db.query(
        `INSERT INTO companies 
        (companyName, 
          expertise,
         address, 
         contact_phone, 
         contact_email,
          list_of_requirements,
          description
          
          )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          companyName,
          expertise,
          address,
          contact_phone,
          contact_email,
          JSON.stringify(list_of_requirements),
          description
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

      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

router.post(
  '/applyNow',
  authenticateUserMiddleware,
  upload.fields([{ name: 'MOA', maxCount: 1 }]),

  async (req, res) => {
    try {
      const files = req.files;

      let user = req.user;

      let userID = user.id;
      let data = req.body;

      console.log({ userID: user });

      let { companyID } = data;

      const [result] = await db.query(
        `INSERT INTO  inter_application 
          (
          company_id,
          trainee_user_id
      
          )
         VALUES (?,?)`,
        [companyID, userID]
      );

      // // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `intern_trail/companies/${companyID}/application/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);

        await db.query(
          `
         UPDATE inter_application SET
         resume_link = ?

         where company_id   = ?

         `,
          [downloadURL, companyID]
        );
      }

      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

router.get('/list', async (req, res) => {
  try {
    let checkIfApplied = req.query.checkIfApplied;

    let result;
    if (checkIfApplied === 'true') {
      [result] = await db.query(`
WITH RankedApplications AS (
    SELECT 
        ia.*,
        ROW_NUMBER() OVER (PARTITION BY ia.company_id ORDER BY ia.date_created DESC) AS rn
    FROM inter_application AS ia
)
SELECT 
    c.*, 
    ia.trainee_user_id, 
    ia.program_id, 
    ia.course_id, 
    ia.status, 
    ia.resume_link, 
    ia.date_created
FROM 
    companies AS c
LEFT JOIN 
    RankedApplications AS ia 
    ON c.companyID = ia.company_id AND ia.rn = 1
ORDER BY 
    c.created_at DESC;

            
            `);
    } else {
      [result] = await db.query(`
        SELECT * from companies
        order by created_at DESC
            
            `);
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
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
       SELECT * from hte_supervisors where userID = ? 

            
            `,
        [id]
      );

      let companyID = result[0].companyID;

      let values = [companyID];

      if (status) {
        values.push(status);
      }

      console.log({ values });

      let [result2] = await db.query(
        `
              SELECT 
              ia.*, 
              u.*,
      c.collegeID, c.collegeName, c.collegeCode, 
     p.programID, p.progName, p.progCode
          FROM 
              inter_application AS ia
          INNER JOIN 
              users AS u ON ia.trainee_user_id = u.userID

    INNER JOIN trainee t ON t.userID = u.userID
    INNER JOIN colleges c ON t.collegeID = c.collegeID
    INNER JOIN programs p ON t.programID = p.programID


          WHERE 
              ia.company_id = ?

              ${
                !!status
                  ? 'AND  ia.status = ? '
                  : `AND  ia.status <> 'Approved'`
              }

             

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
  '/trainee/application/:id',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId, status } = req.body;

      const [result] = await db.query(
        `UPDATE inter_application 
         SET 
         status = ? 
         WHERE trainee_user_id  = ?
         AND company_id = ?
         
         `,
        [status, id, companyId]
      );

      const [result2] = await db.query(
        `select * from users 
        where userID = ?
        `,
        [id]
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

export default router;
