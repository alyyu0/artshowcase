const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// route: get user by username for privacy-safe profile URLs
router.get('/by-username/:username', userController.getUserByUsername);

router.get('/:user_id', userController.getUserById);
// Add these to your existing userRoutes.js
router.post('/login', userController.login);
router.get('/check-password/:username', userController.checkUserPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/bulk-reset-placeholders', userController.bulkResetPlaceholders);

module.exports = router;
