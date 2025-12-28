const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        // Get notifications for the logged-in user, newest first
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications };