const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userControllers');

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// route: get user by username for privacy-safe profile URLs
router.get('/by-username/:username', userController.getUserByUsername);

router.get('/:user_id', userController.getUserById);
// Add these to your existing userRoutes.js
router.post('/login', userController.login);
router.get('/check-password/:username', userController.checkUserPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/bulk-reset-placeholders', userController.bulkResetPlaceholders);
// Update user profile with optional profile picture upload
router.put('/:user_id', upload.single('profile_picture'), userController.updateUser);

module.exports = router;
