const express = require('express');
const router = express.Router();
const { createStudyPlan, getStudyPlan, deleteStudyPlan, updateStudyPlan } = require('../controllers/studyPlanController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create Plan (Educator & Coordinator only)
router.post('/', protect, authorize('educator', 'coordinator'), createStudyPlan);

// Get Plans (Any logged-in user)
router.get('/:courseId', protect, getStudyPlan);

router.delete('/:id', protect, authorize('educator', 'coordinator'), deleteStudyPlan);
router.put('/:id', protect, authorize('educator', 'coordinator'), updateStudyPlan);

module.exports = router;