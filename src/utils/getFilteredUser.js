const User = require('../models/User');
async function getFilteredUser(email) {
	return await User.findOne({ email }, [
		'avatar',
		'fullName',
		'level',
		'likes',
		'donations',
		'country',
		'phoneNumber',
	])
		.populate({ path: 'donations' })
		.exec();
}

module.exports = getFilteredUser;
