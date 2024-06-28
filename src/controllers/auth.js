const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const mailer = require('../services/mailer');
const User = require('../models/User');
const filterObject = require('../utils/filterObject');
const { promisify } = require('util');
const getFilteredUser = require('../utils/getFilteredUser');
const { updateAvatarUrl } = require('../services/aws');
const {
	authControllerSucesses,
} = require('../configs/messages/en/successMessages');
const {
	authControllerSucessesPT,
} = require('../configs/messages/pt/successMessages');
const {
	authControllerErrors,
} = require('../configs/messages/en/errorMessages');
const {
	authControllerErrorsPT,
} = require('../configs/messages/pt/errorMessages');

function getErrorMessage(errorType, defaultLanguage) {
	return defaultLanguage
		? authControllerErrors[errorType]
		: authControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
	return defaultLanguage
		? authControllerSucesses[successType]
		: authControllerSucessesPT[successType];
}

function signToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET);
}

async function protect(req, res, next) {
	try {
		if (!req.headers.cookie) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('notLoggedIn', req.defaultLanguage),
			});
		}
		const token = req.headers.cookie.replace('jwt=', '');

		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('userNotFound', req.defaultLanguage),
			});
		}

		if (user.changedPasswordAfter(decoded.iat))
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('changedPassword', req.defaultLanguage),
			});

		req.user = user;
		next();
	} catch {
		throw new Error(getErrorMessage('protect', req.defaultLanguage));
	}
}

async function logOut(req, res) {
	try {
		const token = undefined;
		res.cookie('jwt', token, {
			maxAge: 1,
			httpOnly: true,
			secure: true,
		});

		res.status(200).json({
			status: 'success',
			message: getSuccessMessage('logOut', req.defaultLanguage),
			token,
		});
	} catch {
		throw new Error(getErrorMessage('logOut', req.defaultLanguage));
	}
}

async function verifyUser(req, res) {
	try {
		if (!req.headers.cookie) {
			return;
		}

		const token = req.headers.cookie.replace('jwt=', '');
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('userNotFound', req.defaultLanguage),
			});
		}
		const newAvatarUrl = await updateAvatarUrl(user.avatar.imageName);
		const [url, imageName] = newAvatarUrl;
		const newAvatar = { url, imageName };

		await User.findByIdAndUpdate(user._id, { avatar: newAvatar });
		const filteredUser = await getFilteredUser({ email: user.email });
		return res.status(200).json({
			status: 'status',
			message: getSuccessMessage('verifyUser', req.defaultLanguage),
			user: filteredUser,
		});
	} catch (err) {
		console.log(err);
		throw new Error(getErrorMessage('verifyUser', req.defaultLanguage));
	}
}

async function sendOTP(req, res) {
	try {
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

		mailer.sendEmailVerificationOTP(user, newOTP, type, language);

		return res.status(200).json({
			status: 'success',
			message: getSuccessMessage('sendOTP', req.defaultLanguage),
		});
	} catch {
		throw new Error(getErrorMessage('sendOTP', req.defaultLanguage));
	}
}
async function verifyOTP(req, res) {
	try {
		const { email, otp } = req.body;
		const user = await User.findOne({
			email,
			otpExpiryTime: { $gt: Date.now() },
		});

		if (!user || !(await user.correctOTP(otp, user.otp))) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('invalidOTP', req.defaultLanguage),
			});
		}

		user.verified = true;
		user.otp = undefined;

		await user.save({ new: true, validateModifiedOnly: true });

		const token = signToken(user._id);
		const filteredUser = await getFilteredUser({ email: user.email });
		return res
			.status(200)
			.cookie('jwt', token, {
				maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
				httpOnly: true,
				secure: true,
			})
			.json({
				status: 'success',
				message: getSuccessMessage('verifyOTP', req.defaultLanguage),
				user: filteredUser,
			});
	} catch {
		throw new Error(getErrorMessage('verifyOTP', req.defaultLanguage));
	}
}

async function register(req, res, next) {
	try {
		const {
			email,
			password,
			passwordConfirmation,
			fullName,
			country,
			language,
		} = req.body;

		if (!email) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('invalidEmail', req.defaultLanguage),
			});
		}

		if (!fullName || !country) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('nameAndCountryRequired', req.defaultLanguage),
			});
		}

		if (!password || !passwordConfirmation) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('requiredPassword', req.defaultLanguage),
			});
		}

		if (!password === passwordConfirmation) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('samePassword', req.defaultLanguage),
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
				message: getErrorMessage('emailTaken', req.defaultLanguage),
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
	} catch {
		throw new Error(getErrorMessage('register', req.defaultLanguage));
	}
}

async function login(req, res) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage(
					'emailAndPasswordsRequired',
					req.defaultLanguage,
				),
			});
		}

		const user = await User.findOne({ email });
		if (!user || !(await user.correctPassword(password, user.password))) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('incorrectCredentials', req.defaultLanguage),
			});
		}

		const token = await signToken(user._id);
		const filteredUser = await getFilteredUser({ email: user.email });

		res.cookie('jwt', token, {
			maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
			httpOnly: true,
			secure: true,
		});

		res.status(200).json({
			status: 'success',
			message: getSuccessMessage('login', req.defaultLanguage),
			token,
			user: filteredUser,
		});
	} catch {
		throw new Error(getErrorMessage('login', req.defaultLanguage));
	}
}

async function forgotPassword(req, res, next) {
	try {
		const { email, language } = req.body;

		if (!email)
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('invalidEmail', req.defaultLanguage),
			});

		const user = await User.findOne({ email });
		if (!user)
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('noUserWithGivenEmail', req.defaultLanguage),
			});

		try {
			req.type = 'password';
			req.userId = user._id;
			req.language = language;
			next();
		} catch {
			user.otp = undefined;
			user.otpExpiryTime = undefined;

			await user.save({ validateBeforeSave: false });

			return res.status(500).json({
				status: 'error',
				message: getErrorMessage('emailSendingError', req.defaultLanguage),
			});
		}
	} catch {
		throw new Error(getErrorMessage('forgotPassword', req.defaultLanguage));
	}
}

async function resetPassword(req, res) {
	try {
		const { password, passwordConfirmation, email, otp } = req.body;
		if (password !== passwordConfirmation)
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('samePassword', req.defaultLanguage),
			});

		const user = await User.findOne({
			email,
			otpExpiryTime: { $gt: Date.now() },
		});

		if (!user && !user?.correctOTP(otp, user.otp))
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('invalidPasswordToken', req.defaultLanguage),
			});
		else {
			user.password = password;

			user.otp = undefined;
			user.otpExpiryTime = undefined;
			await user.save();

			const token = signToken(user._id);

			const filteredUser = await getFilteredUser({ email: user.email });

			res.cookie('jwt', token, {
				maxAge: 24 * 60 * 60 * 1000 * 21, // 3 Weeks
				httpOnly: true,
				secure: true,
			});

			return res.status(200).json({
				status: 'success',
				message: getSuccessMessage('resetPassword', req.defaultLanguage),
				user: filteredUser,
			});
		}
	} catch {
		throw new Error(getErrorMessage('resetPassword', req.defaultLanguage));
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
