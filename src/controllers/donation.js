const Donation = require('../models/Donation');
const Ngo = require('../models/Ngo');
const User = require('../models/User');
const getFilteredUser = require('../utils/getFilteredUser');

async function createDonation(req, res, next) {
	const { user, ngoId, type } = req.body;

	const donation = await new Donation({
		user: user?._id || undefined,
		ngo: ngoId,
		type,
	});

	const userDocument = user && (await User.findById(user._id));
	if (userDocument && userDocument?.donations)
		userDocument.donations = [...userDocument.donations, donation];

	if (!userDocument?.donations && userDocument)
		userDocument.donations = [donation];

	if (userDocument) {
		userDocument.level = userDocument.level + 0.2;
	}

	if (userDocument) await userDocument.save();
	await donation.save();

	const ngo = await Ngo.findByIdAndUpdate(ngoId, {
		$push: { donations: donation },
	});

	const filteredUser = user && (await getFilteredUser(userDocument.email));
	const ngos = await Ngo.find().populate('donations');
	res.status(200).json({
		status: 'Success',
		message: 'Donation made successfully! Thanks for making a difference...',
		user: filteredUser || null,
		ngos,
	});

	return;
}

module.exports = { createDonation };
