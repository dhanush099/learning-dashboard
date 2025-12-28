const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getUsers, getUserById, updateUser, deleteUser, updateProfile, changePassword, uploadProfileImage } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Profile routes (accessible to all authenticated users)
router.put('/profile', protect, updateProfile);
router.put('/profile/password', protect, changePassword);
router.put('/profile/image', protect, upload.single('profileImage'), uploadProfileImage);

// Coordinator-only routes
router.get('/', protect, authorize('coordinator'), getUsers);
router.get('/:id', protect, authorize('coordinator'), getUserById);
router.put('/:id', protect, authorize('coordinator'), updateUser);
router.delete('/:id', protect, authorize('coordinator'), deleteUser);

module.exports = router;

