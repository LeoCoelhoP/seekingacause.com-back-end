const User = require('../models/User');
const filterObject = require('../utils/filterObject');

async function updateMe(req, res, next) {
	const { user } = req;

	const filteredBody = filterObject(
		req.body,
		'avatar',
		'fullName',
		'country',
		'phoneNumber',
	);

	const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
		new: true,
		validateModifiedOnly: true,
	});

	res
		.status(200)
		.json({
			status: 'success',
			message: 'Profile updated successfully!',
			data: updatedUser,
		});
}

module.exports = { updateMe };
