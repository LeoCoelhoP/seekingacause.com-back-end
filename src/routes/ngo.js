const router = require('express').Router();
const ngoController = require('../controllers/ngo');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(ngoController.getAllNgos));
router.post('/create', catchAsync(ngoController.createNgo));
router.delete('/delete', catchAsync(ngoController.deleteNgo));
router.patch('/verify', catchAsync(ngoController.verifyNgo));

module.exports = router;
