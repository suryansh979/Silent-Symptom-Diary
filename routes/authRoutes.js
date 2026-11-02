const express = require('express');
const router = express.Router();

// Import the controller functions
const { registerUser, loginUser } = require('../controllers/authController');

// Map the routes to their specific functions
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;