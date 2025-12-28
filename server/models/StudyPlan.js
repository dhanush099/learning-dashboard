const mongoose = require('mongoose');

const studyPlanSchema = mongoose.Schema({
    // Which course does this plan belong to?
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    week: { type: Number, required: true },
    topic: { type: String, required: true },
    content: { type: String, required: true }, // Description of what to learn
    resources: { type: String } // Links to videos or docs
}, {
    timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);