const router = require('express').Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/register', authController.register, authController.sendOTP);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post(
	'/forgot-password',
	authController.forgotPassword,
	authController.sendOTP,
);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-user', authController.verifyUser);
router.post('/log-out', authController.logOut);

module.exports = router;