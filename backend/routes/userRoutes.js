const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// route: get user by username for privacy-safe profile URLs
router.get('/by-username/:username', userController.getUserByUsername);

router.get('/:user_id', userController.getUserById);

module.exports = router;
