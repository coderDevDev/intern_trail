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
    // Fetch colleges
    let [colleges] = await db.query(`
      SELECT * FROM colleges ORDER BY collegeName ASC
    `);

    // Fetch programs with their respective colleges
    let [programs] = await db.query(`
      SELECT programs.programID, programs.programName, programs.collegeID, colleges.collegeName
      FROM programs
      JOIN colleges ON programs.collegeID = colleges.collegeID
      ORDER BY colleges.collegeName ASC, programs.programName ASC
    `);

    // Structure programs under their respective colleges
    let collegeMap = {};
    colleges.forEach(college => {
      collegeMap[college.collegeID] = { ...college, programs: [] };
    });

    programs.forEach(program => {
      if (collegeMap[program.collegeID]) {
        collegeMap[program.collegeID].programs.push({
          programID: program.programID,
          programName: program.programName
        });
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(collegeMap) // Convert object back to an array
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges and programs'
    });
  }
});

// Unified scope endpoint for all roles
router.get('/user-scope', authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log({ userId, userRole });

    let scopeData = null;

    switch (userRole) {
      case 'ojt-coordinator':
        // Get coordinator's scope
        const [coordinator] = await db.query(
          `SELECT c.*, p.programID, p.programName, col.collegeID, col.collegeName
           FROM coordinators c
           JOIN programs p ON c.programID = p.programID
           JOIN colleges col ON p.collegeID = col.collegeID
           WHERE c.userID = ?`,
          [userId]
        );

        if (coordinator && coordinator.length > 0) {
          scopeData = {
            collegeID: coordinator[0].collegeID,
            collegeName: coordinator[0].collegeName,
            programID: coordinator[0].programID,
            programName: coordinator[0].programName
          };
        }
        break;

      case 'trainee':
        // Get trainee's scope
        const [trainee] = await db.query(
          `SELECT t.*, p.programID, p.programName, c.collegeID, c.collegeName
           FROM trainee t
           JOIN programs p ON t.programID = p.programID
           JOIN colleges c ON p.collegeID = c.collegeID
           WHERE t.userID = ?`,
          [userId]
        );

        if (trainee && trainee.length > 0) {
          scopeData = {
            collegeID: trainee[0].collegeID,
            collegeName: trainee[0].collegeName,
            programID: trainee[0].programID,
            programName: trainee[0].programName
          };
        }
        break;

      case 'dean':
        // Get dean's scope
        const [dean] = await db.query(
          `SELECT d.*, c.collegeID, c.collegeName
           FROM deans d
           JOIN colleges c ON d.collegeID = c.collegeID
           WHERE d.userID = ?`,
          [userId]
        );

        if (dean && dean.length > 0) {
          scopeData = {
            collegeID: dean[0].collegeID,
            collegeName: dean[0].collegeName
          };
        }
        break;

      case 'hte-supervisor':
        // Get supervisor's scope
        const [supervisor] = await db.query(
          `SELECT s.*, c.companyID, c.companyName
           FROM hte_supervisors s
           JOIN companies c ON s.companyID = c.companyID
           WHERE s.userID = ?`,
          [userId]
        );

        if (supervisor && supervisor.length > 0) {
          scopeData = {
            companyID: supervisor[0].companyID,
            companyName: supervisor[0].companyName
          };
        }
        break;
    }

    if (!scopeData) {
      return res.status(404).json({
        success: false,
        message: `${userRole} scope not found`
      });
    }

    res.json({
      success: true,
      data: scopeData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user scope'
    });
  }
});

export default router;
