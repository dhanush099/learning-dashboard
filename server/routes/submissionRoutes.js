const express = require('express');
const router = express.Router();
const { submitAssignment, gradeSubmission, getSubmissionsForAssignment, getSubmissionById, getMySubmission } = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Learner submits
router.post('/', protect, authorize('learner'), submitAssignment);

// Get user's own submission for an assignment
router.get('/assignment/:assignmentId/my-submission', protect, authorize('learner'), getMySubmission);

// Educator views all submissions for an assignment
router.get('/assignment/:assignmentId', protect, authorize('educator', 'coordinator'), getSubmissionsForAssignment);

// Get a single submission by ID
router.get('/:id', protect, getSubmissionById);

// Educator grades a specific submission
router.put('/:id/grade', protect, authorize('educator', 'coordinator'), gradeSubmission);

module.exports = router;