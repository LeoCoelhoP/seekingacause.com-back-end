const router = require('express').Router();
const ngoController = require('../controllers/ngo');

router.get('/', ngoController.getAllNgos);
router.post('/create', ngoController.createNgo);
router.delete('/delete');
router.patch('/update');
router.patch('/verify');

module.exports = router;
