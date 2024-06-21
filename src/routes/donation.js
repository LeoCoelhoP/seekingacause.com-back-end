const router = require('express').Router();
const donationController = require('../controllers/donation');
const catchAsync = require('../utils/catchAsync');

router.post('/new', catchAsync(donationController.createDonation));

module.exports = router;
