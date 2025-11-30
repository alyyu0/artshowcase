
const express = require('express');
const router = express.Router();

// Import the entire controller
const authControllers = require('../controllers/authControllers');

// Use the functions directly
router.post('/register', (req, res) => {
  authControllers.signup(req, res);
});

router.post('/login', (req, res) => {
  authControllers.login(req, res);
});

module.exports = router;
