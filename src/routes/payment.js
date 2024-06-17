const router = require('express').Router();
const paymentsController = require('../controllers/payment');

router.post('/create-paypal-order', paymentsController.createOrder);
router.post('/capture-paypal-order', paymentsController.captueOrder);

module.exports = router;
