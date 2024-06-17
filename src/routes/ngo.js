const router = require('express').Router();
const ngoController = require('../controllers/ngo');

router.get('/', ngoController.getAllNgos);
router.post('/create', ngoController.createNgo);
router.delete('/delete', ngoController.deleteNgo);
router.patch('/verify', ngoController.verifyNgo);

module.exports = router;
