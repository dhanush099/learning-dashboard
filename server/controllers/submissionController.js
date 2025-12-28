const Submission = require('../models/Submission');

const Assignment = require('../models/Assignment');

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private (Learner)
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, content, quizAnswers } = req.body;

        // Check if already submitted
        const alreadySubmitted = await Submission.findOne({ 
            assignment: assignmentId, 
            student: req.user.id 
        });

        if (alreadySubmitted) {
            return res.status(400).json({ message: 'You have already submitted this assignment' });
        }

        // Get assignment to check type
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        let submissionData = {
            assignment: assignmentId,
            student: req.user.id,
            status: 'submitted'
        };

        if (assignment.type === 'quiz') {
            // For quizzes, calculate score automatically
            if (!quizAnswers || !Array.isArray(quizAnswers)) {
                return res.status(400).json({ message: 'Quiz answers are required' });
            }
            // Validate quiz has questions
            if (!assignment.questions || assignment.questions.length === 0) {
                return res.status(400).json({ 
                    message: 'This quiz has no questions. Please contact your educator.' 
                });
            }

            let score = 0;
            const questionsLength = assignment.questions.length;
            
            assignment.questions.forEach((question, index) => {
                if (quizAnswers[index] === question.correctAnswer) {
                    score++;
                }
            });

            const totalQuestions = questionsLength;
            const percentageScore = (score / totalQuestions) * 100;

            submissionData.quizAnswers = quizAnswers;
            submissionData.score = percentageScore;
            submissionData.grade = percentageScore; // Auto-grade quizzes
            submissionData.status = 'graded'; // Auto-graded quizzes are immediately graded
        } else {
            // For tasks, require content
            if (!content) {
                return res.status(400).json({ message: 'Content is required for task submissions' });
            }
            submissionData.content = content;
        }

        const submission = await Submission.create(submissionData);

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Educator/Coordinator)
const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';

        await submission.save();

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for a specific assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Educator)
const getSubmissionsForAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('assignment')
            .populate('student', 'name email');
        
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's submission for an assignment
// @route   GET /api/submissions/assignment/:assignmentId/my-submission
// @access  Private (Learner)
const getMySubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({ 
            assignment: req.params.assignmentId,
            student: req.user.id
        }).populate('assignment');
        
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitAssignment, gradeSubmission, getSubmissionsForAssignment, getSubmissionById, getMySubmission };