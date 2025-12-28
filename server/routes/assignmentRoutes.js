const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, deleteAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create Assignment (Educators only)
router.post('/', protect, authorize('educator', 'coordinator'), createAssignment);

// Get Assignments (Students need to see them too)
router.get('/:courseId', protect, getAssignments);

// Add this line
router.delete('/:id', protect, authorize('educator', 'coordinator'), deleteAssignment);

module.exports = router;