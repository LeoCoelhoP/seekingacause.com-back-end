const User = require('../models/User');
async function getFilteredUser(email) {
	const user = await User.findOne({ email }, [
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
	return user;
}

module.exports = getFilteredUser;
