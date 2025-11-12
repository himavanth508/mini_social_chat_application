const express = require('express');
const router = express.Router();
const authController = require('../components/auth');

// POST /api/auth/register
router.post('/register', authController.registerUser);

// POST /api/auth/login
router.post('/login', authController.loginCredentials);

router.post('/google/login', authController.loginGmail);

router.get('/refresh', authController.refreshToken);

router.post('/profile', authController.updateProfile);

router.get('/testing',authController.testing);

module.exports = router;
