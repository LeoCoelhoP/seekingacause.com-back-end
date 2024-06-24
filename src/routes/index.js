const router = require('express').Router();
const authRoute = require('./auth');
const userRoute = require('./user');
const ngoRoute = require('./ngo');
const donationRoute = require('./donation');
const paymentsRoute = require('./payment');
const phoneNumberRoute = require('./phoneNumber');

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/ngo', ngoRoute);
router.use('/donation', donationRoute);
router.use('/payment', paymentsRoute);
router.use('/phone-number', phoneNumberRoute);

module.exports = router;
