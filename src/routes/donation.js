const router = require('express').Router();
const donationController = require('../controllers/donation');

router.post('/new', donationController.createDonation);

module.exports = router;
