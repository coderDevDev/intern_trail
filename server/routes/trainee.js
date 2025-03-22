import express from 'express';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

import config from '../config.js';

let db = config.mySqlDriver;
const router = express.Router();

// Get trainee details including company info
router.get(
  '/details/:traineeId',

  async (req, res) => {
    try {
      const { traineeId } = req.params;

      console.log({ traineeId });

      const [trainee] = await db.query(
        `
      SELECT 
        t.*,
        u.first_name, u.last_name,
        ia.company_id as companyId,
        c.companyName as companyName
      FROM trainee t
      INNER JOIN users u ON t.userID = u.userID
      INNER JOIN inter_application ia ON t.userID = ia.trainee_user_id
      INNER JOIN companies c ON ia.company_id = c.companyID
      WHERE t.userID = ? 
      AND ia.status = 'approved'
      AND ia.is_confirmed = 1
      LIMIT 1
    `,
        [traineeId]
      );

      if (trainee.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Trainee not foundss'
        });
      }

      res.json({
        success: true,
        data: trainee[0]
      });
    } catch (error) {
      console.error('Error fetching trainee details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trainee details'
      });
    }
  }
);

// Get submitted files for a trainee
router.get('/submitted-files/of/:traineeId', async (req, res) => {
  try {
    const { traineeId } = req.params;

    // get userId from traineeId
    const [trainee] = await db.query(
      `
      SELECT userID FROM trainee WHERE traineeID = ?
      `,
      [traineeId]
    );

    console.log({ trainee });
    if (trainee.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trainee not found'
      });
    }

    const userId = trainee[0].userID;

    const [files] = await db.query(
      `
      SELECT af.*, ia.status as application_status
      FROM application_files af
      INNER JOIN inter_application ia ON af.application_id = ia.id
      WHERE ia.trainee_user_id = ?
      ORDER BY af.uploaded_at DESC
      `,
      [userId]
    );

    console.log({ traineeId });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching submitted files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submitted files'
    });
  }
});

export default router;
