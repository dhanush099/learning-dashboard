const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'Development' },
    price: { type: Number, required: true, default: 0 }, //0 means free
    thumbnail: { type: String, default: 'https://via.placeholder.com/300?text=Course' },
    coordinator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    educators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);