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

router.get('/list', async (req, res) => {
  try {
    let [result1] = await db.query(`
      SELECT * FROM colleges
            
        ORDER BY collegeName ASC
     
      `);

    let [result2] = await db.query(`
        SELECT * FROM programs
              
          ORDER BY progName ASC
       
        `);

    console.log({ result1, result2 });

    res.status(200).json({
      success: true,
      data: {
        colleges: result1,
        programs: result2
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

export default router;
