const router = require('express').Router();
const authController = require('../controllers/auth');
const phoneNumberController = require('../controllers/phoneNumber');
const catchAsync = require('../utils/catchAsync');

router.patch(
	'/save',
	authController.protect,
	catchAsync(phoneNumberController.savePhoneNumber),
);

router.post('/send-whatsapp-reminder', catchAsync(phoneNumberController.sendReminder))

module.exports = router;
