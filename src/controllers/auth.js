const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const crypto = require('crypto');

const maailer = require('../services/mailer');
const User = require('../models/User');
const filterObject = require('../utils/filterObject');
const { promisify } = require('util');
const getFilteredUser = require('../utils/getFilteredUser');

function signToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET);
}

async function protect(req, res, next) {
	if (!req.headers.cookie) {
		return res.status(400).json({
			status: 'error',
			message: `Please, log in to perfom this action.`,
		});
	}
	const token = req.headers.cookie.replace('jwt=', '');

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const user = await User.findById(decoded.userId);

	if (!user) {
		return res
			.status(400)
			.json({ status: 'error', message: `The user doesn't exist` });
	}

	if (user.changedPasswordAfter(decoded.iat))
		return res.status(400).json({
			status: 'error',
			message: 'You have recently updated your password! Please, log in again.',
		});

	req.user = user;
	next();
}

async function logOut(req, res) {
	const token = undefined;
	res.cookie('jwt', token, {
		maxAge: 1,
		httpOnly: true,
		secure: true,
	});

	res.status(200).json({
		status: 'success',
		message: 'Logged out successfully!',
		token,
	});
}

async function verifyUser(req, res) {
	if (!req.headers.cookie) {
		return;
	}

	const token = req.headers.cookie.replace('jwt=', '');
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const user = await User.findById(decoded.userId);
	if (!user) {
		return res
			.status(400)
			.json({ status: 'error', message: `The user doesn't exist` });
	}
	const filteredUser = await getFilteredUser(user.email);
	return res.status(200).json({
		status: 'status',
		message: 'Welcome back!',
		user: filteredUser,
	});
}

async function sendOTP(req, res) {
	const { userId, type, language } = req;
	const newOTP = otpGenerator.generate(6, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});
	const otpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

	const user = await User.findByIdAndUpdate(userId, {
		otpExpiryTime,
	});
	user.otp = newOTP.toString();

	await user.save({ new: true, validateModifiedOnly: true });

	maailer.sendEmailVerificationOTP(user, newOTP, type, language);

	return res.status(200).json({
		status: 'success',
		message: 'OTP Sent successfully to your email. Please confirm it.',
	});
}
async function verifyOTP(req, res, next) {
	const { email, otp } = req.body;
	const user = await User.findOne({
		email,
		otpExpiryTime: { $gt: Date.now() },
	});

	if (!user) {
		return res.status(400).json({
			status: 'error',
			message: 'Email is invalid or OTP exipred.',
		});
	}
	if (!(await user.correctOTP(otp, user.otp))) {
		return res
			.status(400)
			.json({ status: 'error', message: 'OTP Is incorrect.' });
	}

	user.verified = true;
	user.otp = undefined;

	await user.save({ new: true, validateModifiedOnly: true });

	const token = signToken(user._id);
	const filteredUser = await getFilteredUser(user.email);
	return res
		.status(200)
		.cookie('jwt', token, {
			maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
			httpOnly: true,
			secure: true,
		})
		.json({
			status: 'success',
			message: 'OTP Verified successfully, welcome!',
			user: filteredUser,
		});
}

async function register(req, res, next) {
	const { email, password, passwordConfirmation, fullName, country, language } =
		req.body;

	if (!email) {
		return res.status(400).json({
			status: 'error',
			message: 'Email is required.',
		});
	}

	if (!fullName || !country) {
		return res.status(400).json({
			status: 'error',
			message: 'Both full name and country are required.',
		});
	}

	if (!password || !passwordConfirmation) {
		return res.status(400).json({
			status: 'error',
			message: 'Both password and password confirmation are required.',
		});
	}

	if (!password === passwordConfirmation) {
		return res.status(400).json({
			status: 'error',
			message:
				'Both password and password confirmation are required to be the same.',
		});
	}

	const filteredBody = filterObject(
		req.body,
		'email',
		'password',
		'fullName',
		'country',
	);

	const existingUser = await User.findOne({ email });

	if (!existingUser) {
		const newUser = await new User(filteredBody);
		await newUser.save();

		req.userId = newUser._id;
		req.language = language;
		next();
	}
	if (existingUser && existingUser.verified) {
		return res.status(400).json({
			status: 'error',
			message: 'Sorry, this email address has already been taken.',
		});
	}

	if (existingUser && !existingUser.verified) {
		const newUser = await User.findOneAndUpdate({ email }, filteredBody, {
			new: true,
			validateModifiedOnly: true,
		});
		req.userId = newUser._id;
		req.language = language;
		next();
	}
}

async function login(req, res, next) {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			status: 'error',
			message: 'Both email and password are required.',
		});
	}

	const user = await User.findOne({ email });
	if (!user || !(await user.correctPassword(password, user.password))) {
		return res.status(400).json({
			status: 'error',
			message: 'Email or password is incorrect',
		});
	}

	const token = await signToken(user._id);
	const filteredUser = await getFilteredUser(user.email);

	res.cookie('jwt', token, {
		maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
		httpOnly: true,
		secure: true,
	});

	res.status(200).json({
		status: 'success',
		message: 'Logged in successfully!',
		token,
		user: filteredUser,
	});
}

async function forgotPassword(req, res, next) {
	// Todo
	const { email, language } = req.body;

	if (!email)
		return res.status(400).json({
			status: 'error',
			message: 'Email is required.',
		});

	const user = await User.findOne({ email });
	if (!user)
		return res.status(400).json({
			status: 'error',
			message: 'There is no user with given email address.',
		});

	try {
		req.type = 'password';
		req.userId = user._id;
		req.language = language;
		next();
	} catch (error) {
		user.otp = undefined;
		user.otpExpiryTime = undefined;

		await user.save({ validateBeforeSave: false });

		return res.status(500).json({
			status: 'error',
			message: 'There was an error sending the email. Please try again later.',
		});
	}
}

async function resetPassword(req, res) {
	const { password, passwordConfirmation, email, otp } = req.body;

	const user = await User.findOne({
		email,
		otpExpiryTime: { $gt: Date.now() },
	});

	if (!user && !user?.correctOTP(otp, user.otp))
		return res.status(400).json({
			status: 'error',
			message: 'Reset password token is invalid or expired',
		});
	else {
		user.password = req.body.password;

		user.otp = undefined;
		user.otpExpiryTime = undefined;
		await user.save();

		const token = signToken(user._id);

		const filteredUser = await getFilteredUser(user.email);

		res.cookie('jwt', token, {
			maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
			httpOnly: true,
			secure: true,
		});

		return res.status(200).json({
			status: 'success',
			message: 'New password saved successfully, welcome!',
			user: filteredUser,
		});
	}
}

module.exports = {
	register,
	sendOTP,
	verifyOTP,
	forgotPassword,
	resetPassword,
	login,
	protect,
	verifyUser,
	logOut,
};
