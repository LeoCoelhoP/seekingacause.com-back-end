const router = require('express').Router();
const userController = require('../controllers/user');
const authController = require('../controllers/auth');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.patch('/like', authController.protect, userController.like);

router.patch(
	'/update-avatar',
	authController.protect,
	upload.single('avatar'),
	userController.updateAvatar,
);

router.patch('/update-me', authController.protect, userController.updateMe);

module.exports = router;
