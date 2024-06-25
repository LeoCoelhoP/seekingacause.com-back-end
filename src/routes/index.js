const router = require('express').Router();
const authRoute = require('./auth');
const userRoute = require('./user');
const ngoRoute = require('./ngo');
const donationRoute = require('./donation');
const paymentsRoute = require('./payment');

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/ngo', ngoRoute);
router.use('/donation', donationRoute);
router.use('/payment', paymentsRoute);

module.exports = router;
