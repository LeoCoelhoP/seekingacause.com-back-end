const User = require('../models/User');
const filterObject = require('../utils/filterObject');
const getFilteredUser = require('../utils/getFilteredUser');
const awsService = require('../services/aws');

async function like(req, res) {
	const { ngoArray, user } = req.body;
	console.log(ngoArray);
	console.log(user);
	if (!ngoArray || !user)
		return res.status(400).json({
			status: 'error',
			message: 'Please provide a valid NGO array or a valid user.',
		});

	const updatedUser = await User.findByIdAndUpdate(
		user,
		{ likes: ngoArray },
		{
			new: true,
			validateModifiedOnly: true,
		},
	);
	const filteredUser = await getFilteredUser(updatedUser.email);

	return res.status(200).json({
		status: 'success',
		message: 'Likes successfully updated',
		user: filteredUser,
	});
}

async function updateAvatar(req, res, next) {
	const { user } = req;

	const response = await awsService.updateAvatar(req.file, user?.avatar);
	const [url, imageName] = response;
	user.avatar = {
		url,
		imageName,
	};
	await user.save();

	const filteredUser = await getFilteredUser(user.email);
	res
		.status(200)
		.json({
			status: 'success',
			user: filteredUser,
			message: 'Avatar Successfully Updated!',
		});
}

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

	res.status(200).json({
		status: 'success',
		message: 'Profile updated successfully!',
		data: updatedUser,
	});
}

module.exports = { updateAvatar, updateMe, like };
