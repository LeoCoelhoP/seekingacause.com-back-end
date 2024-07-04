const User = require('../models/User');

async function getFilteredUser({ email = null, _id }) {
	const query = email ? { email } : { _id };
	try {
		const user = await User.findOne(query, [
			'avatar',
			'fullName',
			'level',
			'likes',
			'donations',
			'country',
		])
			.populate({ path: 'donations' })
			.exec();
		return user;
	} catch (error) {
		console.error('Error fetching user:', error);
	}
}

module.exports = getFilteredUser;
