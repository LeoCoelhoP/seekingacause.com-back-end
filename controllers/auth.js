const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const crypto = require('crypto');

const maailer = require('../services/mailer');
const User = require('../models/User');
const filterObject = require('../utils/filterObject');
const { promisify } = require('util');

function signToken(userId) {
	jwt.sign({ userId }, process.env.JWT_SECRET);
}

async function protect(req, res, next) {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	)
		token = req.headers.authorization.split(' ')[1];
	else if (!req.headers.authorization && req.cookies.jwt)
		token = req.cookies.jwt;
	else
		return req.status(400).json({
			status: 'error',
			message: 'Please, log in to perfom this action.',
		});

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

async function sendOTP(req, res) {
	const { userId } = req;
	const newOTP = otpGenerator.generate(6, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});

	const otpExipreTime = Date.now() + 10 * 60 * 1000; // 10 Minutes;
	const user = await User.findByIdAndUpdate(
		userId,
		{
			otp: newOTP,
			otpExipreTime,
		},
		{ new: true },
	);

	maailer.sendEmailVerificationOTP(user);

	res.status(200).json({
		status: 'success',
		message: 'OTP Sent successfully to your email. Please confirm it.',
	});
}
async function verifyOTP(req, res, next) {
	const { email, otp } = req.body;
	const user = await User.findOne({
		email,
		otpExipreTime: { $gt: Date.now() },
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

	res.status(200).json({
		status: 'success',
		message: 'OTP Verified successfully, welcome!',
		token,
	});
}

async function register(req, res, next) {
	const { email, password, passwordConfirmation, fullName, country } = req.body;

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
			message: 'Both passowrd and password confirmation are required.',
		});
	}

	if (!password === passwordConfirmation) {
		return res.status(400).json({
			status: 'error',
			message:
				'Both passowrd and password confirmation are required to be the same.',
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
		const newUser = await User.create(filteredBody);
		req.user = newUser._id;
		await sendOTP(req, res, next);
		next();
	}
	if (existingUser && existingUser.verified) {
		return res.status(400).json({
			status: 'error',
			message: 'Sorry, this email address has already been taken.',
		});
	}

	if (existingUser && !existingUser.verified) {
		await User.findOneAndUpdate({ email }, filteredBody, {
			new: true,
			validateModifiedOnly: true,
		});

		req.userId = existingUser._id;
		await sendOTP(req, res, next);
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
	if (!user || (await user.correctPassword(password, user.password))) {
		return res.status(400).json({
			status: 'error',
			message: 'Email or password is incorrect',
		});
	}

	const token = signToken(user._id);

	res
		.status(200)
		.json({ status: 'success', message: 'Logged in successfully!', token });
}

async function forgotPassword() {
	// Todo
	const email = req.body.email;

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

	const resetToken = await user.createPasswordResetToken();
	const resetURL = `auth/reset-password/?code=${resetToken}`;
	try {
		// Todo Send Email with reset url

		res.status(200).json({
			status: 'success',
			message: 'Reset passowrd link sent to email address. ',
		});
	} catch (error) {
		user.createPasswordResetToken = undefined;
		user.createPassworExpires = undefined;

		await user.save({ validateBeforeSave: false });

		return res.status(500).json({
			status: 'error',
			message: 'There was an error sending the email. Please try again later.',
		});
	}
}

async function resetPassword() {
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user)
		return res.status(400).json({
			status: 'error',
			message: 'Reset password token is invalid or expired',
		});
	else {
		user.password = req.body.password;
		user.passwordConfirmation = req.body.passwordConfirmation;

		user.createPasswordResetToken = undefined;
		user.createPassworExpires = undefined;

		await user.save();

		const token = signToken(user._id);
		// Todo send email informin password change
		res.status(200).json({
			status: 'success',
			message: 'New password saved successfully, welcome!',
			token,
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
};
