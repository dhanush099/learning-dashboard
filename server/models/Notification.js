const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['info', 'alert', 'success'], 
        default: 'info' 
    },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);