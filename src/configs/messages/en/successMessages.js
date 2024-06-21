const authControllerSucesses = {
	sendOTP: 'OTP Sent successfully to your email. Please confirm it.',
	verifyOTP: 'OTP Verified successfully, welcome!',
	resetPassword: 'New password saved successfully, welcome!',
	login: 'Logged in successfully, welcome!',
	logOut: 'Logged out successfully! Thank you and come again!',
	verifyUser: 'Welcome back!',
};
const donationControllerSuccesses = {
	createDonation:
		'Donated Successfully... Thank you for making a difference in the world!',
};
const ngoControllerSuccesses = {
	verifyNgo: 'Ngo verified successfully.',
	deleteNgo: 'Ngo deleted successfully.',
	createNgo: 'Ngo created successfully, please verify it.',
	getAllNgos: 'Ngos fetched succesfully!',
};
const paymentControllerSuccesses = {
	captureOrder:
		'Donated Successfully! Thank you for making a difference in the world!',
};

const userControllerSuccesses = {
	like: 'Likes successfully updated!',
	updateAvatar: 'Avatar Successfully Updated!',
	updateMe: 'Profile successfully updated!',
};
module.exports = {
	authControllerSucesses,
	donationControllerSuccesses,
	ngoControllerSuccesses,
	paymentControllerSuccesses,
	userControllerSuccesses,
};
