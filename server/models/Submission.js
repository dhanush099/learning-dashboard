const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { type: String }, // For task submissions
    quizAnswers: [{ // For quiz submissions - array of answer indices
        type: Number
    }],
    score: { type: Number }, // Auto-calculated for quizzes, manual for tasks
    grade: { type: Number }, // Final grade (can be overridden by educator)
    feedback: { type: String },
    status: {
        type: String,
        enum: ['submitted', 'graded'],
        default: 'submitted'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);