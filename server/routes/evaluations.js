import express from 'express';
import config from '../config.js';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
const router = express.Router();

// Create a new evaluation
router.post('/create', authenticateUserMiddleware, async (req, res) => {
  try {
    const { studentId, answers, comments, signature, overallRating } = req.body;
    const evaluatorId = req.user.id;

    // console.log({ overallRating });
    // Store the evaluation data
    const [result] = await db.query(
      `INSERT INTO evaluations 
       (student_id, evaluator_id, answers, comments, 
       signature,
       overallRating) 
       VALUES (?, ?, ?, ?, ?,?)`,
      [
        studentId,
        evaluatorId,
        JSON.stringify(answers),
        comments,
        signature,
        overallRating
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Evaluation created successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create evaluation' });
  }
});

// Get evaluation for a student
router.get('/:studentId', authenticateUserMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get the most recent evaluation with student info
    const [evaluations] = await db.query(
      `SELECT e.*, 
              t.student_id,
              p.programName as programName,
              c.collegeName as collegeName,
              u.first_name,
              u.last_name
       FROM evaluations e
       JOIN trainee t ON t.userID = e.student_id
       JOIN programs p ON p.programID = t.programID
       JOIN colleges c ON c.collegeID = t.collegeID
       JOIN users u ON u.userID = e.student_id
       WHERE e.student_id = ? 
       ORDER BY e.evaluation_date DESC 
       LIMIT 1`,
      [studentId]
    );

    if (evaluations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No evaluation found for this student'
      });
    }

    const evaluation = evaluations[0];

    // Parse the JSON answers
    evaluation.answers = JSON.parse(evaluation.answers);

    res.status(200).json({
      success: true,
      data: {
        ...evaluation,
        // Format the student data as expected by EvaluationForm
        student: {
          userID: evaluation.student_id,
          first_name: evaluation.first_name,
          last_name: evaluation.last_name,
          programName: evaluation.programName,
          collegeName: evaluation.collegeName
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation'
    });
  }
});

// Update an evaluation
router.put('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, comments, signature, overallRating } = req.body;
    const evaluatorId = req.user.id;

    // Verify the evaluator owns this evaluation
    const [evaluations] = await db.query(
      `SELECT * FROM evaluations WHERE id = ? 
      `,
      [id, evaluatorId]
    );

    if (evaluations.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this evaluation'
      });
    }

    // Update the evaluation
    await db.query(
      `UPDATE evaluations 
       SET answers = ?, comments = ?, signature = ?, overallRating = ?

       WHERE id = ?`,
      [JSON.stringify(answers), comments, signature, overallRating, id]
    );

    res.status(200).json({
      success: true,
      message: 'Evaluation updated successfully'
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update evaluation' });
  }
});

// Get all evaluations for a student (for the student to view)
router.get(
  '/student/:studentId',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user.id;

      // Check if the user is the student or has permission to view
      if (
        userId != studentId &&
        req.user.role !== 'ojt-coordinator' &&
        req.user.role !== 'hte-supervisor'
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view these evaluations'
        });
      }

      // Get all evaluations for this student
      const [evaluations] = await db.query(
        `SELECT e.*, u.first_name, u.last_name, u.role 
       FROM evaluations e
       JOIN users u ON e.evaluator_id = u.userID
       WHERE e.student_id = ? 
       ORDER BY e.evaluation_date DESC`,
        [studentId]
      );

      // Parse the JSON answers for each evaluation
      const formattedEvaluations = evaluations.map(val => ({
        ...val,
        answers: JSON.parse(eval.answers),
        evaluator_name: `${eval.first_name} ${eval.last_name}`,
        evaluator_role: eval.role
      }));

      res.status(200).json({
        success: true,
        data: formattedEvaluations
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch evaluations' });
    }
  }
);

export default router;
