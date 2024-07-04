const router = require('express').Router();
const authController = require('../controllers/auth');
const catchAsync = require('../utils/catchAsync');

router.post('/login', catchAsync(authController.login));
router.get('/twitter-login', catchAsync(authController.twitterLogin));
router.post(
	'/twitter-login-final',
	catchAsync(authController.twitterLoginFinal),
);

router.post(
	'/register',
	catchAsync(authController.register),
	catchAsync(authController.sendOTP),
);
router.post('/send-otp', catchAsync(authController.sendOTP));
router.post('/verify-otp', catchAsync(authController.verifyOTP));
router.post(
	'/forgot-password',
	catchAsync(authController.forgotPassword),
	catchAsync(authController.sendOTP),
);
router.post('/reset-password', catchAsync(authController.resetPassword));
router.post('/verify-user', catchAsync(authController.verifyUser));
router.post('/log-out', catchAsync(authController.logOut));

module.exports = router;
