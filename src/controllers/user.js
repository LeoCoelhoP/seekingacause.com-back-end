const User = require('../models/User');
const awsService = require('../services/aws');
const filterObject = require('../utils/filterObject');
const getFilteredUser = require('../utils/getFilteredUser');
const {
	userControllerErrors,
} = require('../configs/messages/en/errorMessages');
const {
	userControllerSuccesses,
} = require('../configs/messages/en/successMessages');

const {
	userControllerErrorsPT,
} = require('../configs/messages/pt/errorMessages');
const {
	userControllerSuccessesPT,
} = require('../configs/messages/pt/successMessages');

function getErrorMessage(errorType, defaultLanguage) {
	return defaultLanguage
		? userControllerErrors[errorType]
		: userControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
	return defaultLanguage
		? userControllerSuccesses[successType]
		: userControllerSuccessesPT[successType];
}

async function like(req, res) {
	try {
		const { ngoArray } = req.body;
		const { user } = req;
		if (!ngoArray || !Array.isArray(ngoArray))
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('noNgo', req.defaultLanguage),
			});

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ likes: ngoArray },
			{
				new: true,
				validateModifiedOnly: true,
			},
		);

		const filteredUser = await getFilteredUser({ email: updatedUser.email });

		return res.status(200).json({
			status: 'success',
			message: getSuccessMessage('like', req.defaultLanguage),

			user: filteredUser,
		});
	} catch (err) {
		throw new Error(getErrorMessage('like', req.defaultLanguage));
	}
}

async function updateAvatar(req, res, next) {
	try {
		const { user } = req;

		if (!req.file) {
			return res.status(400).json({
				status: 'error',
				message: getErrorMessage('noImage', req.defaultLanguage),
			});
		}

		const [url, imageName] = await awsService.updateAvatar(
			req.file,
			user?.avatar,
		);

		user.avatar = {
			url,
			imageName,
		};
		await user.save();

		const filteredUser = await getFilteredUser({ email: user.email });
		res.status(200).json({
			status: 'success',
			user: filteredUser,
			message: getSuccessMessage('updateAvatar', req.defaultLanguage),
		});
	} catch {
		throw new Error(getErrorMessage('updateAvatar', req.defaultLanguage));
	}
}

async function updateMe(req, res, next) {
	try {
		const { user } = req;

		const filteredBody = filterObject(
			req.body,
			'fullName',
			'country',
			'phoneNumber',
		);

		await User.findByIdAndUpdate(user._id, filteredBody, {
			new: true,
			validateModifiedOnly: true,
		});

		const filteredUser = await getFilteredUser({ email: user.email });

		res.status(200).json({
			status: 'success',
			message: getSuccessMessage('updateMe', req.defaultLanguage),
			user: filteredUser,
		});
	} catch {
		throw new Error(getErrorMessage('updateMe', req.defaultLanguage));
	}
}

module.exports = { updateAvatar, updateMe, like };
