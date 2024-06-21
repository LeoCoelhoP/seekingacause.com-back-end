const router = require('express').Router();
const multer = require('multer');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const catchAsync = require('../utils/catchAsync');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.patch('/like', authController.protect, catchAsync(userController.like));

router.patch(
	'/update-avatar',
	authController.protect,
	upload.single('avatar'),
	catchAsync(userController.updateAvatar),
);

router.patch(
	'/update-me',
	authController.protect,
	catchAsync(userController.updateMe),
);

module.exports = router;
