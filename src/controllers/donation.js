const Donation = require('../models/Donation');
const Ngo = require('../models/Ngo');
const User = require('../models/User');
const getFilteredUser = require('../utils/getFilteredUser');
const {
	donationControllerErrors,
} = require('../configs/messages/en/errorMessages');
const {
	donationControllerSuccesses,
} = require('../configs/messages/en/successMessages');
const {
	donationControllerSuccessesPT,
} = require('../configs/messages/pt/successMessages');
const {
	donationControllerErrorsPT,
} = require('../configs/messages/pt/errorMessages');

function getErrorMessage(errorType, defaultLanguage) {
	return defaultLanguage
		? donationControllerErrors[errorType]
		: donationControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
	return defaultLanguage
		? donationControllerSuccesses[successType]
		: donationControllerSuccessesPT[successType];
}

async function createDonation(req, res, next) {
	try {
		const { user, ngoId, type } = req.body;

		const donation = await new Donation({
			user: user?._id || undefined,
			ngo: ngoId,
			type,
		});
		await donation.save();

		const userDocument = user && (await User.findById(user._id));
		if (userDocument) {
			userDocument.donations = userDocument.donations
				? [...userDocument.donations, donation]
				: [donation];
			userDocument.level += 0.2;
			await userDocument.save();
		}

		await Ngo.findByIdAndUpdate(ngoId, {
			$push: { donations: donation },
		});

		const filteredUser = user && (await getFilteredUser(userDocument.email));
		const ngos = await Ngo.find().populate('donations');
		return res.status(200).json({
			status: 'Success',
			message: getSuccessMessage('createDonation', req.defaultLanguage),
			user: filteredUser || null,
			ngos,
		});
	} catch {
		throw new Error(getErrorMessage('createDonation', req.defaultLanguage));
	}
}

module.exports = { createDonation };
