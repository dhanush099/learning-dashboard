const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    type: { 
        type: String, 
        enum: ['task', 'quiz'], 
        required: true 
    },
    // Only used if type is 'quiz'
    questions: [{
        questionText: String,
        options: [String], // e.g., ["A", "B", "C", "D"]
        correctAnswer: Number // Index of the correct option (0, 1, 2, or 3)
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);