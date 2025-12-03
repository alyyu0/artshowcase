const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

router.get('/:user_id', userController.getUserById);

module.exports = router;
