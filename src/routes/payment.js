const router = require('express').Router();
const paymentsController = require('../controllers/payment');
const catchAsync = require('../utils/catchAsync');

router.post('/create-paypal-order', catchAsync(paymentsController.createOrder));
router.post(
	'/capture-paypal-order',
	catchAsync(paymentsController.captueOrder),
);

module.exports = router;
