const Assignment = require('../models/Assignment');

// @desc    Create a new assignment or quiz
// @route   POST /api/assignments
// @access  Private (Educator/Coordinator)
const createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, dueDate, type, questions } = req.body;

        // Check if user is authorized for this course
        const Course = require('../models/Course');
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check authorization: coordinator or assigned educator
        const isCoordinator = req.user.role === 'coordinator';
        const isAssignedEducator = req.user.role === 'educator' && 
            course.educators.some(edu => edu.toString() === req.user.id);

        if (!isCoordinator && !isAssignedEducator) {
            return res.status(403).json({ 
                message: 'Not authorized to create assignments for this course' 
            });
        }

        // Validate quiz has questions
        if (type === 'quiz') {
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({ 
                    message: 'Quiz must have at least one question' 
                });
            }

            // Validate each question structure
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.questionText || !q.questionText.trim()) {
                    return res.status(400).json({ 
                        message: `Question ${i + 1}: Question text is required` 
                    });
                }
                if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                    return res.status(400).json({ 
                        message: `Question ${i + 1}: Must have exactly 4 options` 
                    });
                }
                if (q.options.some(opt => !opt || !opt.trim())) {
                    return res.status(400).json({ 
                        message: `Question ${i + 1}: All options must be filled` 
                    });
                }
                if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
                    return res.status(400).json({ 
                        message: `Question ${i + 1}: Valid correct answer (0-3) is required` 
                    });
                }
            }
        }

        // Validate due date is not in the past
        if (new Date(dueDate) < new Date()) {
            return res.status(400).json({ 
                message: 'Due date cannot be in the past' 
            });
        }

        const assignment = await Assignment.create({
            course: courseId,
            title,
            description,
            dueDate,
            type,
            questions // Only needed for quizzes
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/:courseId
// @access  Private
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete an assignment
// @route DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        await assignment.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export it
module.exports = { createAssignment, getAssignments, deleteAssignment };