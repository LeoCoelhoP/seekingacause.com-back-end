const User = require('../models/User');
async function getFilteredUser({ email = null, _id }) {
	if (email) {
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
	if (_id) {
		const user = await User.findById({ _id }, [
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
}

module.exports = getFilteredUser;
