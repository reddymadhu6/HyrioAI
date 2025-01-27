const express = require('express');
const { registerCompany, loginCompany ,verifyEmail,sendOTP,verifyOTP} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerCompany);
router.post('/sendOTP', sendOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/login', loginCompany);
router.get('/verify/:token', verifyEmail);


module.exports = router;
