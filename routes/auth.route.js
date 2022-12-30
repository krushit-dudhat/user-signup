const express = require('express');

const router = express.Router();
const { signup, login, verifyEmail, forgotPassword} = require('../controller/auth/auth.controller');
const { signupValidator, loginValidator } = require('../controller/auth/auth.validator');

router.post('/signup', signupValidator ,signup);
router.post('/login', loginValidator, login);
router.get('/verify-email', verifyEmail);
router.put('/forgot-password', forgotPassword);

module.exports = router;