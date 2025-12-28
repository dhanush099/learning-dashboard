const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, enrollCourse, assignEducator, unassignEducator } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, authorize('coordinator'), createCourse);

router.route('/:id')
    .put(protect, authorize('coordinator'), updateCourse)
    .delete(protect, authorize('coordinator'), deleteCourse);

router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/assign-educator', protect, authorize('coordinator'), assignEducator);
router.post('/:id/unassign-educator', protect, authorize('coordinator'), unassignEducator);

module.exports = router;